import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Endpoint seguro para notificaciones de Telegram
  app.post("/api/telegram-notify", async (req, res) => {
    try {
      const { text, type, country, city, durationSeconds, ip } = req.body;

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
        // Si aún no se han configurado las claves, respondemos sin romper la página
        return res.json({
          status: "pending_config",
          message: "Telegram bot token o chat ID no configurados aún."
        });
      }

      let formattedMessage = text;

      // Si no viene texto personalizado, armamos el mensaje según el tipo de evento
      if (!formattedMessage) {
        if (type === "visit") {
          formattedMessage = `🔔 *¡Nueva Visita en tu Web!*\n\n` +
            `📍 *Ubicación:* ${city ? city + ", " : ""}${country || "Desconocido"}\n` +
            `🌐 *IP:* \`${ip || "Oculta"}\`\n` +
            `🕒 *Hora:* ${new Date().toLocaleTimeString("es-ES")}\n` +
            `📱 *Dispositivo:* ${req.headers["user-agent"]?.includes("Mobi") ? "📱 Celular" : "💻 Computadora"}`;
        } else if (type === "checkout_click") {
          formattedMessage = `🔥 *¡INTENCIÓN DE COMPRA!*\n\n` +
            `🛒 Un usuario de *${country || "tu página"}* acaba de hacer clic en el botón de Hotmart.\n` +
            `📍 *Detalle:* ${text || "Botón de Checkout"}\n` +
            `🕒 *Hora:* ${new Date().toLocaleTimeString("es-ES")}`;
        } else if (type === "leave") {
          const mins = Math.floor((durationSeconds || 0) / 60);
          const secs = (durationSeconds || 0) % 60;
          const timeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs} segundos`;
          
          formattedMessage = `🚪 *Visita Finalizada*\n\n` +
            `📍 *País:* ${country || "Desconocido"}\n` +
            `⏱️ *Tiempo en la página:* ${timeFormatted}`;
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
      return res.json({ success: result.ok, result });
    } catch (err: any) {
      console.error("Error al enviar alerta a Telegram:", err);
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
