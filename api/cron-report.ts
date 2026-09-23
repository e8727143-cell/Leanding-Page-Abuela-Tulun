import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

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
    const now = new Date();
    const uyDateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Montevideo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now); // "YYYY-MM-DD"

    const startOfDayUY = new Date(`${uyDateParts}T00:00:00-03:00`).toISOString();
    const endOfDayUY = new Date(`${uyDateParts}T23:59:59.999-03:00`).toISOString();

    let totalUsuarios = 0;
    let topPaises: { pais: string; count: number }[] = [];
    let tiempoPromedioFormatted = "0 seg";
    let totalClicsComprar = 0;

    if (supabase) {
      const { data: rows, error: fetchError } = await supabase
        .from("visitas")
        .select("id, session_id, pais, entrada, salida, clic_comprar")
        .gte("entrada", startOfDayUY)
        .lte("entrada", endOfDayUY);

      if (fetchError) {
        console.error("Error al consultar Supabase:", fetchError);
      } else if (rows) {
        totalUsuarios = rows.length;

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
    }

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

    const reportMessage =
      `📊 *REPORTE DIARIO DE RENDIMIENTO*\n` +
      `📅 *Fecha:* ${uyDateParts} (23:59 Hora Uruguay)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `👥 *Total de Visitantes Únicos (Móvil/Tablet):* ${totalUsuarios}\n\n` +
      `🌎 *Top Países con Más Visitas:*\n${topPaisesStr}\n\n` +
      `⏱ *Tiempo Promedio en la Página:* ${tiempoPromedioFormatted}\n\n` +
      `💰 *Intenciones de Compra (Clics):* ${totalClicsComprar} (${tasaConversion}%)\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🚀 _Datos sincronizados directamente desde Supabase_`;

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

    return res.status(200).json({
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
    console.error("Error al generar cron-report en Vercel Function:", err);
    return res.status(500).json({ error: err.message });
  }
}
