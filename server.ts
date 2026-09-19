import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

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

  // Endpoint seguro para notificaciones de Telegram
  app.post("/api/telegram-notify", async (req, res) => {
    try {
      const { text, type, country, city, durationSeconds, ip, userNumber: providedUserNumber } = req.body;

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
        return res.json({
          status: "pending_config",
          message: "Telegram bot token o chat ID no configurados aún.",
        });
      }

      // Prevención estricta de mensajes duplicados
      cleanRecentAlerts();
      const dedupKey = `${type}_${country || ""}_${city || ""}_${text || ""}_${providedUserNumber || ""}`;
      const lastSentTime = recentAlertsMap.get(dedupKey);
      const now = Date.now();

      if (lastSentTime && now - lastSentTime < 5000) {
        return res.json({ success: true, deduped: true });
      }
      recentAlertsMap.set(dedupKey, now);

      // Cargar estadísticas del día
      const stats = loadDailyStats();
      let activeUserNumber = providedUserNumber;

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
      } else if (type === "checkout_click") {
        stats.checkoutClicks += 1;
        saveDailyStats();
      } else if (type === "video_play") {
        stats.videoPlays += 1;
        saveDailyStats();
      }

      const userTag = activeUserNumber ? `(Usuario ${activeUserNumber} del día)` : "";
      const uyTime = getUruguayTimeStr();
      let formattedMessage = type ? "" : text;

      if (!formattedMessage) {
        if (type === "visit") {
          formattedMessage =
            `🔔 *¡Nueva Visita en tu Web!*\n` +
            `👤 *Usuario ${activeUserNumber} del día*\n\n` +
            `📍 *Ubicación:* ${city ? city + ", " : ""}${country || "Desconocido"}\n` +
            `🌐 *IP:* \`${ip || "Oculta"}\`\n` +
            `🕒 *Hora:* ${uyTime} (Hora Uruguay)\n` +
            `📱 *Dispositivo:* ${req.headers["user-agent"]?.includes("Mobi") ? "📱 Celular" : "💻 Computadora"}`;
        } else if (type === "video_play") {
          formattedMessage =
            `▶️ *Reproducción de Video Iniciada* ${userTag}\n\n` +
            `📍 *Ubicación:* ${city ? city + ", " : ""}${country || "Desconocido"}\n` +
            `🎬 El usuario comenzó a ver la presentación de la Abuela Tulun.\n` +
            `🕒 *Hora:* ${uyTime} (Hora Uruguay)`;
        } else if (type === "video_pause") {
          formattedMessage =
            `⏸️ *Video Pausado* ${userTag}\n\n` +
            `📍 *Ubicación:* ${country || "Desconocido"}\n` +
            `⏱️ *Momento del video:* ${text || "En pausa"}\n` +
            `🕒 *Hora:* ${uyTime} (Hora Uruguay)`;
        } else if (type === "video_ended") {
          formattedMessage =
            `🎉 *¡Video Visto Completo (100%)!* ${userTag}\n\n` +
            `📍 *Ubicación:* ${city ? city + ", " : ""}${country || "Desconocido"}\n` +
            `🎬 El usuario terminó de mirar todo el video de la Abuela Tulun.\n` +
            `🕒 *Hora:* ${uyTime} (Hora Uruguay)`;
        } else if (type === "checkout_click") {
          formattedMessage =
            `🔥 *¡INTENCIÓN DE COMPRA!* ${userTag}\n\n` +
            `🛒 Un usuario de *${country || "tu página"}* acaba de hacer clic en el botón de Hotmart.\n` +
            `📍 *Detalle:* ${text || "Botón de Checkout"}\n` +
            `🕒 *Hora:* ${uyTime} (Hora Uruguay)`;
        } else if (type === "leave") {
          const mins = Math.floor((durationSeconds || 0) / 60);
          const secs = (durationSeconds || 0) % 60;
          const timeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs} segundos`;

          formattedMessage =
            `🚪 *Visita Finalizada* ${userTag}\n\n` +
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
          parse_mode: "Markdown",
        }),
      });

      const result = await response.json();
      return res.json({ success: result.ok, userNumber: activeUserNumber, result });
    } catch (err: any) {
      console.error("Error al enviar alerta a Telegram:", err);
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
