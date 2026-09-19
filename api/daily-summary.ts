import fs from "fs";

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

function formatDailySummaryMessage(stats: DailyStats): string {
  const avgSecs =
    stats.durationSessionsCount > 0
      ? Math.round(stats.totalDurationSeconds / stats.durationSessionsCount)
      : 0;
  const mins = Math.floor(avgSecs / 60);
  const secs = avgSecs % 60;
  const avgTimeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs} segundos`;

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

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const stats = loadDailyStats();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(200).json({
        status: "pending_config",
        message: "Variables de entorno de Telegram no configuradas."
      });
    }

    const message = formatDailySummaryMessage(stats);
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    });

    const result = await response.json();
    return res.status(200).json({ success: result.ok, stats, result });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
