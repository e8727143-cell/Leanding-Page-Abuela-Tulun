import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Inicialización de cliente Supabase con soporte para SUPABASE_SERVICE_ROLE_KEY o SUPABASE_KEY
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Caché de desduplicación en memoria para la función serverless
const recentAlertsMap = new Map<string, number>();

function cleanRecentAlerts() {
  const now = Date.now();
  for (const [key, timestamp] of recentAlertsMap.entries()) {
    if (now - timestamp > 10000) {
      recentAlertsMap.delete(key);
    }
  }
}

// Fallback de estadísticas en disco local (/tmp/) para asegurar métricas si Supabase tiene RLS activo
const STATS_FILE = "/tmp/uy_daily_stats.json";

interface DailyStats {
  date: string;
  visitors: number;
  totalDurationSeconds: number;
  durationSessionsCount: number;
  checkoutClicks: number;
  videoPlays: number;
  countries: Record<string, number>;
  summarySent: boolean;
}

function getUruguayDateStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Montevideo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function loadDailyStats(): DailyStats {
  const today = getUruguayDateStr();
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
      if (data && data.date === today) {
        return data;
      }
    }
  } catch {}

  return {
    date: today,
    visitors: 0,
    totalDurationSeconds: 0,
    durationSessionsCount: 0,
    checkoutClicks: 0,
    videoPlays: 0,
    countries: {},
    summarySent: false,
  };
}

function saveDailyStats(stats: DailyStats) {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch {}
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const {
      sessionId,
      type,
      country,
      text,
      durationSeconds,
      userNumber: providedUserNumber,
      isMobile,
    } = body || {};

    const userAgent = (req.headers["user-agent"] || "").toLowerCase();
    const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
    const tabletRegex = /android|ipad|playbook|silk|tablet/i;
    const isMobileDetected =
      isMobile === true ||
      mobileRegex.test(userAgent) ||
      tabletRegex.test(userAgent) ||
      userAgent.includes("mobile") ||
      userAgent.includes("tablet") ||
      userAgent.includes("instagram");

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Desduplicación rápida en memoria para evitar alertas concurrentes idénticas
    cleanRecentAlerts();
    const dedupKey = `${type}_${sessionId || ""}_${text || ""}`;
    const lastSentTime = recentAlertsMap.get(dedupKey);
    const now = Date.now();

    if (lastSentTime && now - lastSentTime < 2000) {
      return res.status(200).json({ success: true, deduped: true });
    }
    recentAlertsMap.set(dedupKey, now);

    let activeUserNumber: number | null = providedUserNumber || null;

    // ==========================================
    // PERSISTENCIA EN SUPABASE
    // ==========================================
    let supabaseSuccess = false;
    if (supabase && sessionId) {
      try {
        if (type === "visit") {
          // 1. Revisar si ya existe este sessionId en la tabla visitas
          const { data: existingVisit, error: searchError } = await supabase
            .from("visitas")
            .select("id")
            .eq("session_id", sessionId)
            .maybeSingle();

          if (!searchError && !existingVisit) {
            // 2. Insertar nueva fila
            const { error: insertError } = await supabase.from("visitas").insert([
              {
                session_id: sessionId,
                pais: country && country !== "Desconocido" ? country : "Otros",
                entrada: new Date().toISOString(),
              },
            ]);

            if (insertError) {
              console.error("Aviso Supabase (visitas insert):", insertError.message);
            } else {
              supabaseSuccess = true;
            }
          } else if (existingVisit) {
            supabaseSuccess = true;
          }

          // 3. Conteo total de filas para el número real exacto
          const { count, error: countError } = await supabase
            .from("visitas")
            .select("*", { count: "exact", head: true });

          if (!countError && count !== null) {
            activeUserNumber = count;
          }
        } else if (type === "click_comprar" || type === "checkout_click") {
          const { error: updateErr } = await supabase
            .from("visitas")
            .update({ clic_comprar: true })
            .eq("session_id", sessionId);

          if (!updateErr) supabaseSuccess = true;
        } else if (type === "leave") {
          const exitTime = new Date().toISOString();
          const { error: leaveErr } = await supabase
            .from("visitas")
            .update({ salida: exitTime })
            .eq("session_id", sessionId);

          if (!leaveErr) supabaseSuccess = true;
        }
      } catch (dbErr) {
        console.error("Error en operación con Supabase:", dbErr);
      }
    }

    // ==========================================
    // PERSISTENCIA DE RESPALDO (LOCAL CACHE)
    // ==========================================
    const stats = loadDailyStats();
    if (type === "visit") {
      stats.visitors += 1;
      if (activeUserNumber === null || activeUserNumber === 0) {
        activeUserNumber = stats.visitors;
      }
      const validCountry = country && country !== "Desconocido" ? country : "Otros";
      stats.countries[validCountry] = (stats.countries[validCountry] || 0) + 1;
      saveDailyStats(stats);
    } else if (type === "click_comprar" || type === "checkout_click") {
      stats.checkoutClicks += 1;
      saveDailyStats(stats);
    } else if (type === "leave") {
      if (typeof durationSeconds === "number" && durationSeconds > 0) {
        stats.totalDurationSeconds += durationSeconds;
        stats.durationSessionsCount += 1;
        saveDailyStats(stats);
      }
    } else if (type === "video_play") {
      stats.videoPlays += 1;
      saveDailyStats(stats);
    }

    // ==========================================
    // MENSAJES TELEGRAM CORTOS Y LIMPIOS
    // ==========================================
    let formattedMessage = "";

    if (type === "visit") {
      const countryDisplay = country && country !== "Desconocido" ? country : "Desconocido";
      const deviceTag = isMobileDetected ? "📱 Móvil" : "💻 PC";
      formattedMessage = `👁🗨Nuevo visitante (${deviceTag} · País: ${countryDisplay})\nUsuario: ${activeUserNumber || 1}`;
    } else if (type === "click_comprar" || type === "checkout_click") {
      formattedMessage = `Cliente Potencial! Tienes un CLIC EN EL BOTÓN DE COMPRA 💰💵`;
    } else if (type === "leave") {
      const totalSecs = typeof durationSeconds === "number" ? Math.max(1, durationSeconds) : 1;
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      let timeFormatted = "";
      if (mins === 0) {
        timeFormatted = `${secs} segundo${secs !== 1 ? "s" : ""}`;
      } else {
        timeFormatted = `${mins} min ${secs < 10 ? "0" : ""}${secs} seg`;
      }
      formattedMessage = `Visitante salió de la página 🚶‍♂️👏\nTiempo dentro de la página (${timeFormatted})`;
    } else if (type === "video_play") {
      formattedMessage = `Visitante Inició el Vídeo...🎬`;
    } else if (type === "video_pause") {
      formattedMessage = `Visitante Pausó el Vídeo (${text || "00:00"}) ⏸`;
    } else if (type === "video_resume") {
      formattedMessage = `Visitante Continuó el Vídeo (${text || "00:00"}) ▶`;
    } else if (type === "video_ended") {
      formattedMessage = `Vídeo completado con Éxito! ✅🎉`;
    } else {
      formattedMessage = text || "Notificación de actividad";
    }

    let telegramResult: any = null;
    if (botToken && chatId && formattedMessage) {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formattedMessage,
        }),
      });
      telegramResult = await response.json();
    }

    return res.status(200).json({
      success: true,
      userNumber: activeUserNumber,
      supabaseSynced: supabaseSuccess,
      result: telegramResult,
    });
  } catch (err: any) {
    console.error("Error al procesar en Vercel Function:", err);
    return res.status(500).json({ error: err.message });
  }
}
