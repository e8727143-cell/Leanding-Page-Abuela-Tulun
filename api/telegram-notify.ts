import fs from "fs";

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

// Estadísticas del día con persistencia y zona horaria de Uruguay (America/Montevideo)
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

  const fresh: DailyStats = {
    date: today,
    visitors: 0,
    totalDurationSeconds: 0,
    durationSessionsCount: 0,
    checkoutClicks: 0,
    videoPlays: 0,
    countries: {},
    summarySent: false,
  };
  saveDailyStats(fresh);
  return fresh;
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
    const { text, type, country, city, durationSeconds, ip, userNumber: providedUserNumber } = body || {};

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(200).json({
        status: "pending_config",
        message: "Variables de entorno TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configuradas en Vercel."
      });
    }

    // Prevención estricta de duplicados
    cleanRecentAlerts();
    const dedupKey = `${type}_${country || ""}_${city || ""}_${text || ""}_${providedUserNumber || ""}`;
    const lastSentTime = recentAlertsMap.get(dedupKey);
    const now = Date.now();

    if (lastSentTime && now - lastSentTime < 5000) {
      return res.status(200).json({ success: true, deduped: true });
    }
    recentAlertsMap.set(dedupKey, now);

    // Cargar y actualizar estadísticas diarias
    const stats = loadDailyStats();
    let activeUserNumber = providedUserNumber;

    if (type === "visit") {
      stats.visitors += 1;
      activeUserNumber = stats.visitors;

      const validCountry = country && country !== "Desconocido" ? country : "Otros";
      stats.countries[validCountry] = (stats.countries[validCountry] || 0) + 1;
      saveDailyStats(stats);
    } else if (type === "leave") {
      if (typeof durationSeconds === "number" && durationSeconds > 0) {
        stats.totalDurationSeconds += durationSeconds;
        stats.durationSessionsCount += 1;
        saveDailyStats(stats);
      }
    } else if (type === "checkout_click") {
      stats.checkoutClicks += 1;
      saveDailyStats(stats);
    } else if (type === "video_play") {
      stats.videoPlays += 1;
      saveDailyStats(stats);
    }

    const userTag = activeUserNumber ? `(Usuario ${activeUserNumber} del día)` : "";
    const uyTime = getUruguayTimeStr();
    let formattedMessage = type ? "" : text;

    if (!formattedMessage) {
      if (type === "visit") {
        formattedMessage = `🔔 *¡Nueva Visita en tu Web!*\n` +
          `👤 *Usuario ${activeUserNumber} del día*\n\n` +
          `📍 *Ubicación:* ${city ? city + ", " : ""}${country || "Desconocido"}\n` +
          `🌐 *IP:* \`${ip || "Oculta"}\`\n` +
          `🕒 *Hora:* ${uyTime} (Hora Uruguay)\n` +
          `📱 *Dispositivo:* ${req.headers["user-agent"]?.includes("Mobi") ? "📱 Celular" : "💻 Computadora"}`;
      } else if (type === "video_play") {
        formattedMessage = `▶️ *Reproducción de Video Iniciada* ${userTag}\n\n` +
          `📍 *Ubicación:* ${city ? city + ", " : ""}${country || "Desconocido"}\n` +
          `🎬 El usuario comenzó a ver la presentación de la Abuela Tulun.\n` +
          `🕒 *Hora:* ${uyTime} (Hora Uruguay)`;
      } else if (type === "video_pause") {
        formattedMessage = `⏸️ *Video Pausado* ${userTag}\n\n` +
          `📍 *Ubicación:* ${country || "Desconocido"}\n` +
          `⏱️ *Momento del video:* ${text || "En pausa"}\n` +
          `🕒 *Hora:* ${uyTime} (Hora Uruguay)`;
      } else if (type === "video_ended") {
        formattedMessage = `🎉 *¡Video Visto Completo (100%)!* ${userTag}\n\n` +
          `📍 *Ubicación:* ${city ? city + ", " : ""}${country || "Desconocido"}\n` +
          `🎬 El usuario terminó de mirar todo el video de la Abuela Tulun.\n` +
          `🕒 *Hora:* ${uyTime} (Hora Uruguay)`;
      } else if (type === "checkout_click") {
        formattedMessage = `🔥 *¡INTENCIÓN DE COMPRA!* ${userTag}\n\n` +
          `🛒 Un usuario de *${country || "tu página"}* acaba de hacer clic en el botón de Hotmart.\n` +
          `📍 *Detalle:* ${text || "Botón de Checkout"}\n` +
          `🕒 *Hora:* ${uyTime} (Hora Uruguay)`;
      } else if (type === "leave") {
        const mins = Math.floor((durationSeconds || 0) / 60);
        const secs = (durationSeconds || 0) % 60;
        const timeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs} segundos`;
        
        formattedMessage = `🚪 *Visita Finalizada* ${userTag}\n\n` +
          `📍 *País:* ${country || "Desconocido"}\n` +
          `⏱️ *Tiempo total en la página:* ${timeFormatted}`;
      }
    }

    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: formattedMessage,
        parse_mode: "Markdown"
      })
    });

    const result = await response.json();
    return res.status(200).json({ success: result.ok, userNumber: activeUserNumber, result });
  } catch (err: any) {
    console.error("Error al procesar en Vercel Function:", err);
    return res.status(500).json({ error: err.message });
  }
}
