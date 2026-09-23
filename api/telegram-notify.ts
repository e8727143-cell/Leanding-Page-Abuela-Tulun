import { createClient } from "@supabase/supabase-js";

// Inicialización de cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Caché de desduplicación en memoria para la función de Vercel
const recentAlertsMap = new Map<string, number>();

function cleanRecentAlerts() {
  const now = Date.now();
  for (const [key, timestamp] of recentAlertsMap.entries()) {
    if (now - timestamp > 10000) {
      recentAlertsMap.delete(key);
    }
  }
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

    // 1. FILTRO ESTRICTO: Solo permitir dispositivos Móviles o Tablets (nada de PCs/computadoras)
    const userAgent = (req.headers["user-agent"] || "").toLowerCase();
    const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
    const tabletRegex = /android|ipad|playbook|silk|tablet/i;
    const isMobileUA = mobileRegex.test(userAgent) || tabletRegex.test(userAgent);

    if (
      isMobile === false ||
      (!isMobile && !isMobileUA && !userAgent.includes("mobile") && !userAgent.includes("tablet"))
    ) {
      return res.status(200).json({ success: true, ignored: true, reason: "desktop_device_ignored" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Desduplicación rápida en memoria
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
    if (supabase && sessionId) {
      try {
        if (type === "visit") {
          // Revisar si ya existe este sessionId en la tabla visitas
          const { data: existingVisit, error: searchError } = await supabase
            .from("visitas")
            .select("id")
            .eq("session_id", sessionId)
            .maybeSingle();

          if (!searchError && !existingVisit) {
            // Insertar nueva fila
            await supabase.from("visitas").insert([
              {
                session_id: sessionId,
                pais: country && country !== "Desconocido" ? country : "Otros",
                entrada: new Date().toISOString(),
              },
            ]);
          }

          // Conteo total de filas para el número real exacto
          const { count, error: countError } = await supabase
            .from("visitas")
            .select("*", { count: "exact", head: true });

          if (!countError && count !== null) {
            activeUserNumber = count;
          }
        } else if (type === "click_comprar" || type === "checkout_click") {
          await supabase
            .from("visitas")
            .update({ clic_comprar: true })
            .eq("session_id", sessionId);
        } else if (type === "leave") {
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

    // ==========================================
    // MENSAJES TELEGRAM CORTOS Y LIMPIOS
    // ==========================================
    let formattedMessage = "";

    if (type === "visit") {
      const countryDisplay = country && country !== "Desconocido" ? country : "Desconocido";
      formattedMessage = `👁🗨Nuevo visitante (País: ${countryDisplay})\nUsuario: ${activeUserNumber || 1}`;
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
      result: telegramResult,
    });
  } catch (err: any) {
    console.error("Error al procesar en Vercel Function:", err);
    return res.status(500).json({ error: err.message });
  }
}
