import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";

// Inicialización de cliente Supabase usando variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Caché de desduplicación en memoria para evitar mensajes dobles en Telegram
const recentAlertsMap = new Map<string, number>();

function cleanRecentAlerts() {
  const now = Date.now();
  for (const [key, timestamp] of recentAlertsMap.entries()) {
    if (now - timestamp > 10000) {
      recentAlertsMap.delete(key);
    }
  }
}

// Estadísticas del día con persistencia y zona horaria de Uruguay (America/Montevideo)
const STATS_FILE = "/tmp/uy_daily_stats.json";

export interface DailyStats {
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
  return new Intl.DateTimeFormat("es-UY", {
    timeZone: "America/Montevideo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getUruguayTimeStr(): string {
  return new Date().toLocaleTimeString("es-UY", {
    timeZone: "America/Montevideo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getUruguayClock(): { hours: number; minutes: number; dateStr: string } {
  const now = new Date();
  const dateStr = getUruguayDateStr();
  const timeParts = new Intl.DateTimeFormat("es-UY", {
    timeZone: "America/Montevideo",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);

  const hours = parseInt(timeParts.find((p) => p.type === "hour")?.value || "0", 10);
  const minutes = parseInt(timeParts.find((p) => p.type === "minute")?.value || "0", 10);

  return { hours, minutes, dateStr };
}

let inMemoryStats: DailyStats = {
  date: getUruguayDateStr(),
  visitors: 0,
  totalDurationSeconds: 0,
  durationSessionsCount: 0,
  checkoutClicks: 0,
  videoPlays: 0,
  countries: {},
  summarySent: false,
};

export function loadDailyStats(): DailyStats {
  const today = getUruguayDateStr();
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, "utf-8"));
      if (data && data.date === today) {
        inMemoryStats = data;
        return inMemoryStats;
      }
    }
  } catch {}

  // Si cambió el día o no existe el archivo, reiniciamos a 0
  if (inMemoryStats.date !== today) {
    inMemoryStats = {
      date: today,
      visitors: 0,
      totalDurationSeconds: 0,
      durationSessionsCount: 0,
      checkoutClicks: 0,
      videoPlays: 0,
      countries: {},
      summarySent: false,
    };
    saveDailyStats();
  }

  return inMemoryStats;
}

export function saveDailyStats() {
  try {
    fs.writeFileSync(STATS_FILE, JSON.stringify(inMemoryStats, null, 2), "utf-8");
  } catch {}
}

export function formatDailySummaryMessage(stats: DailyStats): string {
  const avgSecs =
    stats.durationSessionsCount > 0
      ? Math.round(stats.totalDurationSeconds / stats.durationSessionsCount)
      : 0;
  const mins = Math.floor(avgSecs / 60);
  const secs = avgSecs % 60;
  const avgTimeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs} segundos`;

  // Calcular país más recurrente
  let topCountry = "Sin datos";
  let topCount = 0;
  for (const [country, count] of Object.entries(stats.countries || {})) {
    if (count > topCount) {
      topCount = count;
      topCountry = country;
    }
  }

  const topCountryStr = topCount > 0 ? `${topCountry} (${topCount} visitas)` : "Ninguno registrado";

  return (
    `📊 *REPORTE DIARIO DE VISITAS Y VENTAS*\n` +
    `🗓️ *Fecha:* ${stats.date} (Corte 23:59 Hora Uruguay)\n\n` +
    `👥 *Total de usuarios que entraron:* ${stats.visitors}\n` +
    `⏱️ *Tiempo promedio en la página:* ${avgTimeStr}\n` +
    `🛒 *Clics en botón de compra:* ${stats.checkoutClicks}\n` +
    `▶️ *Reproducciones del video:* ${stats.videoPlays}\n` +
    `🌎 *País que más visitó la web:* ${topCountryStr}\n\n` +
    `🔄 _El contador se reinicia a cero a las 00:00 para el nuevo día._`
  );
}

export async function sendDailySummaryTelegram(): Promise<boolean> {
  const stats = loadDailyStats();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  const message = formatDailySummaryMessage(stats);
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const res = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
    const json = await res.json();
    if (json.ok) {
      stats.summarySent = true;
      saveDailyStats();
      return true;
    }
    return false;
  } catch (err) {
    console.error("Error enviando reporte diario a Telegram:", err);
    return false;
  }
}

// Comprobador en segundo plano a las 23:59 hora Uruguay
setInterval(() => {
  const { hours, minutes, dateStr } = getUruguayClock();
  const stats = loadDailyStats();

  if (hours === 23 && minutes === 59 && !stats.summarySent) {
    sendDailySummaryTelegram();
  } else if (hours === 0 && minutes === 0 && stats.date !== dateStr) {
    loadDailyStats(); // Se reinicia para el nuevo día
  }
}, 30000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Endpoint seguro de geolocalización sin límites de tasa
  app.get("/api/geo", async (req, res) => {
    try {
      const forwarded = req.headers["x-forwarded-for"];
      const realIp = req.headers["x-real-ip"];
      const cfConnectingIp = req.headers["cf-connecting-ip"];
      
      let clientIp = "";
      if (typeof cfConnectingIp === "string" && cfConnectingIp.trim()) {
        clientIp = cfConnectingIp.trim();
      } else if (typeof realIp === "string" && realIp.trim()) {
        clientIp = realIp.trim();
      } else if (typeof forwarded === "string" && forwarded.trim()) {
        clientIp = forwarded.split(",")[0].trim();
      } else {
        clientIp = req.socket.remoteAddress || "";
      }

      // Limpiar prefijo IPv6 si viene como ::ffff:1.2.3.4
      if (clientIp.startsWith("::ffff:")) {
        clientIp = clientIp.substring(7);
      }

      const isPrivate = !clientIp || 
        clientIp.startsWith("127.") || 
        clientIp === "::1" || 
        clientIp.startsWith("10.") || 
        clientIp.startsWith("192.168.") || 
        clientIp.startsWith("172.16.") || 
        clientIp.startsWith("172.17.") || 
        clientIp.startsWith("172.18.") || 
        clientIp.startsWith("172.19.") || 
        clientIp.startsWith("172.20.") || 
        clientIp.startsWith("172.21.") || 
        clientIp.startsWith("172.22.") || 
        clientIp.startsWith("172.23.") || 
        clientIp.startsWith("172.24.") || 
        clientIp.startsWith("172.25.") || 
        clientIp.startsWith("172.26.") || 
        clientIp.startsWith("172.27.") || 
        clientIp.startsWith("172.28.") || 
        clientIp.startsWith("172.29.") || 
        clientIp.startsWith("172.30.") || 
        clientIp.startsWith("172.31.");

      const ipParam = isPrivate ? "" : `/${clientIp}`;

      // 1. Probar geojs.io (alta velocidad y estabilidad)
      try {
        const geoRes = await fetch(`https://get.geojs.io/v1/ip/geo${ipParam ? ipParam + ".json" : ".json"}`, { signal: AbortSignal.timeout(3500) });
        if (geoRes.ok) {
          const data = await geoRes.json();
          if (data && data.country_code) {
            return res.json({
              countryCode: data.country_code.toUpperCase(),
              countryName: data.country || "",
              city: data.city || "",
              ip: data.ip || clientIp
            });
          }
        }
      } catch {}

      // 2. Probar ip-api.com
      if (!isPrivate) {
        try {
          const ipApiRes = await fetch(`http://ip-api.com/json/${clientIp}`, { signal: AbortSignal.timeout(3500) });
          if (ipApiRes.ok) {
            const data = await ipApiRes.json();
            if (data && data.status === "success" && data.countryCode) {
              return res.json({
                countryCode: data.countryCode.toUpperCase(),
                countryName: data.country || "",
                city: data.city || "",
                ip: clientIp
              });
            }
          }
        } catch {}
      }

      // 3. Probar ipwho.is
      try {
        const ipRes = await fetch(`https://ipwho.is${ipParam}`, { signal: AbortSignal.timeout(3500) });
        if (ipRes.ok) {
          const data = await ipRes.json();
          if (data && data.success !== false && data.country_code) {
            return res.json({
              countryCode: data.country_code.toUpperCase(),
              countryName: data.country || "",
              city: data.city || "",
              ip: data.ip || clientIp
            });
          }
        }
      } catch {}

      return res.json({ countryCode: null });
    } catch {
      return res.json({ countryCode: null });
    }
  });

  // Endpoint seguro para notificaciones de Telegram y persistencia en Supabase
  app.post("/api/telegram-notify", async (req, res) => {
    try {
      const {
        sessionId,
        type,
        country,
        text,
        durationSeconds,
        userNumber: providedUserNumber,
        isMobile,
      } = req.body;

      // Doble filtro: verificar User-Agent en el servidor para asegurar que es móvil o tablet
      const userAgent = (req.headers["user-agent"] || "").toLowerCase();
      const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
      const tabletRegex = /android|ipad|playbook|silk|tablet/i;
      const isMobileUA = mobileRegex.test(userAgent) || tabletRegex.test(userAgent);

      // Si no viene marcado como móvil desde el frontend y tampoco tiene UA de móvil/tablet, descartar (PC de escritorio)
      if (isMobile === false || (!isMobile && !isMobileUA && !userAgent.includes("mobile") && !userAgent.includes("tablet"))) {
        return res.json({ success: true, ignored: true, reason: "desktop_device_ignored" });
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      // Desduplicación rápida en memoria para evitar llamadas concurrentes idénticas
      cleanRecentAlerts();
      const dedupKey = `${type}_${sessionId || ""}_${text || ""}`;
      const lastSentTime = recentAlertsMap.get(dedupKey);
      const now = Date.now();

      if (lastSentTime && now - lastSentTime < 2000) {
        return res.json({ success: true, deduped: true });
      }
      recentAlertsMap.set(dedupKey, now);

      let activeUserNumber: number | null = providedUserNumber || null;

      // ==========================================
      // INTEGRACIÓN CON BASE DE DATOS SUPABASE
      // ==========================================
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
              // 2. Si NO existe, insertar nueva fila
              await supabase.from("visitas").insert([
                {
                  session_id: sessionId,
                  pais: country && country !== "Desconocido" ? country : "Otros",
                  entrada: new Date().toISOString(),
                },
              ]);
            }

            // 3. Conteo total de filas en la tabla visitas para el número real exacto
            const { count, error: countError } = await supabase
              .from("visitas")
              .select("*", { count: "exact", head: true });

            if (!countError && count !== null) {
              activeUserNumber = count;
            }
          } else if (type === "click_comprar" || type === "checkout_click") {
            // Actualizar columna clic_comprar a true
            await supabase
              .from("visitas")
              .update({ clic_comprar: true })
              .eq("session_id", sessionId);
          } else if (type === "leave") {
            // Actualizar columna salida con la fecha/hora actual
            const exitTime = new Date().toISOString();
            await supabase
              .from("visitas")
              .update({ salida: exitTime })
              .eq("session_id", sessionId);
          }
        } catch (dbErr) {
          console.error("Error en operación con Supabase:", dbErr);
        }
      }

      // Si Supabase no está configurado o falló, fallback a estadísticas en memoria/disco local
      if (activeUserNumber === null) {
        const stats = loadDailyStats();
        if (type === "visit") {
          stats.visitors += 1;
          activeUserNumber = stats.visitors;
          const validCountry = country && country !== "Desconocido" ? country : "Otros";
          stats.countries[validCountry] = (stats.countries[validCountry] || 0) + 1;
          saveDailyStats();
        } else if (type === "leave") {
          if (typeof durationSeconds === "number" && durationSeconds > 0) {
            stats.totalDurationSeconds += durationSeconds;
            stats.durationSessionsCount += 1;
            saveDailyStats();
          }
        } else if (type === "click_comprar" || type === "checkout_click") {
          stats.checkoutClicks += 1;
          saveDailyStats();
        } else if (type === "video_play") {
          stats.videoPlays += 1;
          saveDailyStats();
        }
      }

      // Formatear mensaje para Telegram
      let formattedMessage = "";

      if (type === "visit") {
        const countryDisplay = country && country !== "Desconocido" ? country : "Desconocido";
        formattedMessage = `👁🗨Nuevo visitante (País: ${countryDisplay})\nUsuario: ${activeUserNumber || 1}`;
      } else if (type === "video_play") {
        formattedMessage = `Visitante Inició el Vídeo...🎬`;
      } else if (type === "video_pause") {
        formattedMessage = `Visitante Pausó el Vídeo (${text || "00:00"}) ⏸`;
      } else if (type === "video_resume") {
        formattedMessage = `Visitante Continuó el Vídeo (${text || "00:00"}) ▶`;
      } else if (type === "video_ended") {
        formattedMessage = `Vídeo completado con Éxito! ✅🎉`;
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
      } else {
        formattedMessage = text || "Notificación de actividad";
      }

      // Enviar notificación a Telegram si los tokens están configurados
      let telegramResult: any = null;
      if (botToken && chatId) {
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

      return res.json({
        success: true,
        userNumber: activeUserNumber,
        result: telegramResult,
      });
    } catch (err: any) {
      console.error("Error al procesar notificación en Telegram/Supabase:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Endpoint para Vercel Cron: Reporte Diario 23:59 Hora Uruguay (Montevideo)
  app.get("/api/cron-report", async (req, res) => {
    try {
      // 1. Verificación de seguridad de Vercel Crons
      const authHeader = req.headers.authorization;
      const cronSecret = process.env.CRON_SECRET;
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ error: "No autorizado. Token de Vercel Cron inválido." });
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      // 2. Calcular rango de tiempo para el día actual en Uruguay (UTC-3)
      // Obtenemos la fecha en formato YYYY-MM-DD en America/Montevideo
      const now = new Date();
      const uyDateParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Montevideo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now); // "YYYY-MM-DD"

      // 00:00:00 y 23:59:59 en Uruguay (UTC-3 equivale a +03:00 en formato ISO UTC)
      const startOfDayUY = new Date(`${uyDateParts}T00:00:00-03:00`).toISOString();
      const endOfDayUY = new Date(`${uyDateParts}T23:59:59.999-03:00`).toISOString();

      let totalUsuarios = 0;
      let topPaises: { pais: string; count: number }[] = [];
      let tiempoPromedioFormatted = "0 seg";
      let totalClicsComprar = 0;

      if (supabase) {
        // Consultar visitas registradas dentro del día de Uruguay
        const { data: rows, error: fetchError } = await supabase
          .from("visitas")
          .select("id, session_id, pais, entrada, salida, clic_comprar")
          .gte("entrada", startOfDayUY)
          .lte("entrada", endOfDayUY);

        if (fetchError) {
          console.error("Error al consultar Supabase para el reporte cron:", fetchError);
        } else if (rows) {
          totalUsuarios = rows.length;

          // a) Top países
          const paisesMap: Record<string, number> = {};
          let totalDurationSec = 0;
          let sessionsWithDuration = 0;

          rows.forEach((row) => {
            const p = row.pais && row.pais !== "Desconocido" ? row.pais : "Otros";
            paisesMap[p] = (paisesMap[p] || 0) + 1;

            if (row.clic_comprar) {
              totalClicsComprar += 1;
            }

            if (row.entrada && row.salida) {
              const diffMs = new Date(row.salida).getTime() - new Date(row.entrada).getTime();
              if (diffMs > 0) {
                totalDurationSec += Math.round(diffMs / 1000);
                sessionsWithDuration += 1;
              }
            }
          });

          topPaises = Object.entries(paisesMap)
            .map(([pais, count]) => ({ pais, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

          if (sessionsWithDuration > 0) {
            const avgSec = Math.round(totalDurationSec / sessionsWithDuration);
            const m = Math.floor(avgSec / 60);
            const s = avgSec % 60;
            tiempoPromedioFormatted = m > 0 ? `${m}m ${s}s` : `${s}s`;
          }
        }
      } else {
        // Fallback a estadísticas locales si Supabase no está conectado
        const stats = loadDailyStats();
        totalUsuarios = stats.visitors;
        totalClicsComprar = stats.checkoutClicks;
        topPaises = Object.entries(stats.countries)
          .map(([pais, count]) => ({ pais, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        if (stats.durationSessionsCount > 0) {
          const avg = Math.round(stats.totalDurationSeconds / stats.durationSessionsCount);
          const m = Math.floor(avg / 60);
          const s = avg % 60;
          tiempoPromedioFormatted = m > 0 ? `${m}m ${s}s` : `${s}s`;
        }
      }

      // b) Formatear lista del Top 3 Países
      const flagsMap: Record<string, string> = {
        Uruguay: "🇺🇾",
        Argentina: "🇦🇷",
        España: "🇪🇸",
        México: "🇲🇽",
        Chile: "🇨🇱",
        Colombia: "🇨🇴",
        Perú: "🇵🇪",
        Ecuador: "🇪🇨",
        Paraguay: "🇵🇾",
        Bolivia: "🇧🇴",
        EstadosUnidos: "🇺🇸",
      };

      const topPaisesStr =
        topPaises.length > 0
          ? topPaises
              .map(
                (item, idx) =>
                  `   ${idx + 1}. ${flagsMap[item.pais] || "📍"} ${item.pais}: ${item.count} visita${item.count > 1 ? "s" : ""}`
              )
              .join("\n")
          : "   Sin datos registrados";

      const tasaConversion =
        totalUsuarios > 0
          ? ((totalClicsComprar / totalUsuarios) * 100).toFixed(1)
          : "0.0";

      // 4. Formatear mensaje limpio, profesional y elegante para Telegram
      const reportMessage =
        `📊 *REPORTE DIARIO DE RENDIMIENTO*\n` +
        `📅 *Fecha:* ${uyDateParts} (23:59 Hora Uruguay)\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `👥 *Total de Visitantes Únicos:* ${totalUsuarios}\n\n` +
        `🌎 *Top Países con Más Visitas:*\n${topPaisesStr}\n\n` +
        `⏱ *Tiempo Promedio en la Página:* ${tiempoPromedioFormatted}\n\n` +
        `💰 *Intenciones de Compra (Clics):* ${totalClicsComprar} (${tasaConversion}%)\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🚀 _Datos sincronizados directamente desde Supabase_`;

      // 5. Enviar a Telegram
      let tgSent = false;
      if (botToken && chatId) {
        const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: reportMessage,
            parse_mode: "Markdown",
          }),
        });
        const tgJson = await tgRes.json();
        tgSent = tgJson.ok;
      }

      return res.json({
        success: true,
        telegramSent: tgSent,
        date: uyDateParts,
        metrics: {
          totalUsuarios,
          topPaises,
          tiempoPromedio: tiempoPromedioFormatted,
          totalClicsComprar,
        },
      });
    } catch (err: any) {
      console.error("Error al generar cron-report:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Endpoint para disparar o consultar el reporte diario (usado también por Vercel Cron)
  app.all("/api/daily-summary", async (req, res) => {
    try {
      const stats = loadDailyStats();
      const sendNow = req.query.sendNow === "true" || req.method === "POST";

      if (sendNow) {
        const sent = await sendDailySummaryTelegram();
        return res.json({ success: sent, stats });
      }

      return res.json({ status: "ok", stats });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // En desarrollo usamos Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
