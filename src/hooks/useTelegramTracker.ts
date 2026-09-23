import { useEffect, useRef } from "react";

/**
 * Formatea el tiempo del vídeo a MM:SS asegurando un máximo de 01:19 (79 segundos).
 * Ejemplo: 30s -> "00:30", 70s -> "01:10"
 */
function formatVideoTime(seconds: number): string {
  const total = Math.min(Math.max(0, Math.round(seconds)), 79);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function useTelegramTracker(countryName: string) {
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedVisitRef = useRef<boolean>(false);
  const hasSentLeaveRef = useRef<boolean>(false);
  const userNumberRef = useRef<number | null>(null);

  // Estados de seguimiento del vídeo principal (duración 01:19)
  const hasStartedVideoRef = useRef<boolean>(false);
  const isVideoPausedRef = useRef<boolean>(false);
  const hasEndedVideoRef = useRef<boolean>(false);
  const pauseDebounceTimerRef = useRef<any>(null);

  const geoDetailsRef = useRef<{ country: string }>({
    country: countryName && countryName !== "Internacional" ? countryName : "Desconocido",
  });

  useEffect(() => {
    if (countryName && countryName !== "Internacional") {
      geoDetailsRef.current.country = countryName;
    }
  }, [countryName]);

  const sendNotification = async (payload: any, keepalive: boolean = false) => {
    try {
      const body = JSON.stringify(payload);
      if (keepalive && typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon("/api/telegram-notify", blob);
      } else {
        await fetch("/api/telegram-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive,
        });
      }
    } catch {
      // Ignorar errores silenciosamente
    }
  };

  useEffect(() => {
    // Evitar envío doble en la misma pestaña/sesión
    const alreadyTracked = sessionStorage.getItem("tg_visit_sent");
    const savedUserNumber = sessionStorage.getItem("tg_user_number");
    if (savedUserNumber) {
      userNumberRef.current = parseInt(savedUserNumber, 10);
    }

    if (hasTrackedVisitRef.current || alreadyTracked) return;
    hasTrackedVisitRef.current = true;
    sessionStorage.setItem("tg_visit_sent", "true");
    startTimeRef.current = Date.now();

    async function sendVisitNotification() {
      let country = geoDetailsRef.current.country;

      // Obtener país detectado
      try {
        const srvRes = await fetch("/api/geo");
        if (srvRes.ok) {
          const data = await srvRes.json();
          if (data && data.countryName) {
            country = data.countryName;
            geoDetailsRef.current.country = country;
          }
        }
      } catch {
        try {
          const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
          if (geoRes.ok) {
            const data2 = await geoRes.json();
            if (data2 && data2.country) {
              country = data2.country;
              geoDetailsRef.current.country = country;
            }
          }
        } catch {}
      }

      try {
        const notifyRes = await fetch("/api/telegram-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "visit",
            country,
          }),
        });

        if (notifyRes.ok) {
          const data = await notifyRes.json();
          if (data && data.userNumber) {
            userNumberRef.current = data.userNumber;
            sessionStorage.setItem("tg_user_number", data.userNumber.toString());
          }
        }
      } catch {}
    }

    sendVisitNotification();

    // Rastrear salida al cerrar pestaña o salir del navegador
    const handleLeave = () => {
      if (hasSentLeaveRef.current) return;
      hasSentLeaveRef.current = true;

      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

      sendNotification(
        {
          type: "leave",
          durationSeconds,
          country: geoDetailsRef.current.country,
          userNumber: userNumberRef.current,
        },
        true
      );
    };

    window.addEventListener("pagehide", handleLeave);
    window.addEventListener("beforeunload", handleLeave);

    return () => {
      window.removeEventListener("pagehide", handleLeave);
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, []);

  const trackCheckoutClick = (buttonLabel?: string) => {
    // 1. Mensaje exacto de clic en botón de compra
    sendNotification(
      {
        type: "checkout_click",
        country: geoDetailsRef.current.country,
        userNumber: userNumberRef.current,
        text: buttonLabel,
      },
      true
    );

    // 2. Notificación de salida de página por clic en comprar (si aún no se ha enviado salida)
    if (!hasSentLeaveRef.current) {
      hasSentLeaveRef.current = true;
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      sendNotification(
        {
          type: "leave",
          durationSeconds,
          country: geoDetailsRef.current.country,
          userNumber: userNumberRef.current,
        },
        true
      );
    }
  };

  const trackVideoPlay = (currentTime: number = 0) => {
    // Si había un temporizador de pausa pendiente, cancelarlo de inmediato
    if (pauseDebounceTimerRef.current) {
      clearTimeout(pauseDebounceTimerRef.current);
      pauseDebounceTimerRef.current = null;
    }

    if (hasEndedVideoRef.current) {
      hasEndedVideoRef.current = false;
    }

    if (!hasStartedVideoRef.current) {
      // Primer play del visitante
      hasStartedVideoRef.current = true;
      isVideoPausedRef.current = false;
      sendNotification({
        type: "video_play",
        userNumber: userNumberRef.current,
      });
    } else if (isVideoPausedRef.current) {
      // El visitante quitó la pausa y continuó el vídeo
      isVideoPausedRef.current = false;
      const timeStr = formatVideoTime(currentTime);
      sendNotification({
        type: "video_resume",
        text: timeStr,
        userNumber: userNumberRef.current,
      });
    }
  };

  const trackVideoPause = (currentTime: number = 0) => {
    // Si el video ya terminó o está en los últimos segundos (>= 78s), no contar como pausa
    if (hasEndedVideoRef.current || currentTime >= 78 || currentTime < 0.5) {
      return;
    }

    if (pauseDebounceTimerRef.current) {
      clearTimeout(pauseDebounceTimerRef.current);
    }

    // Debounce de 450ms para evitar spam al adelantar/retroceder
    pauseDebounceTimerRef.current = setTimeout(() => {
      if (hasEndedVideoRef.current) return;
      isVideoPausedRef.current = true;
      const timeStr = formatVideoTime(currentTime);
      sendNotification({
        type: "video_pause",
        text: timeStr,
        userNumber: userNumberRef.current,
      });
    }, 450);
  };

  const trackVideoEnded = () => {
    if (pauseDebounceTimerRef.current) {
      clearTimeout(pauseDebounceTimerRef.current);
      pauseDebounceTimerRef.current = null;
    }
    isVideoPausedRef.current = false;

    if (!hasEndedVideoRef.current) {
      hasEndedVideoRef.current = true;
      sendNotification({
        type: "video_ended",
        userNumber: userNumberRef.current,
      });
    }
  };

  return {
    trackCheckoutClick,
    trackVideoPlay,
    trackVideoPause,
    trackVideoEnded,
  };
}
