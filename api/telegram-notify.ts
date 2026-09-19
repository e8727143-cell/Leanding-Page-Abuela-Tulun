export default async function handler(req: any, res: any) {
  // Configuración de cabeceras CORS
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
    const { text, type, country, city, durationSeconds, ip } = body || {};

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(200).json({
        status: "pending_config",
        message: "Variables de entorno TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configuradas en Vercel."
      });
    }

    let formattedMessage = text;

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
    return res.status(200).json({ success: result.ok, result });
  } catch (err: any) {
    console.error("Error al procesar en Vercel Function:", err);
    return res.status(500).json({ error: err.message });
  }
}
