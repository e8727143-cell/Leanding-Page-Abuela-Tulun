import { useEffect, useRef } from "react";

/**
 * Detecta si el dispositivo es Móvil o Tablet (excluyendo computadoras de escritorio y laptops).
 * Revisa userAgent, vendor y capacidades táctiles multitáctiles (ej. iPads con desktop Safari).
 */
export function isMobileOrTabletDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const ua = (navigator.userAgent || navigator.vendor || (window as any).opera || "").toLowerCase();

  // Comprobación de User Agent estándar para móviles y tablets
  const mobileRegex = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
  const tabletRegex = /android|ipad|playbook|silk|tablet/i;

  if (mobileRegex.test(ua) || tabletRegex.test(ua)) {
    return true;
  }

  // Detección especial para iPad en iPadOS (donde userAgent reporta Macintosh pero tiene touch screen)
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
    return true;
  }

  // Detección complementaria por pantalla y puntero táctil exclusivo
  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches &&
    !window.matchMedia("(pointer: fine)").matches
  ) {
    return true;
  }

  return false;
}

/**
 * Obtiene o genera un sessionId único y persistente para el visitante.
 * Utiliza crypto.randomUUID() con fallback seguro para navegadores antiguos,
 * y lo almacena en localStorage (o sessionStorage) para que se mantenga si recarga la página.
 */
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "session_init";
  try {
    const STORAGE_KEY = "tg_session_id";
    let sessionId = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!sessionId) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        sessionId = crypto.randomUUID();
      } else {
        sessionId = "sess_" + Date.now() + "_" + Math.random().toString(36).substring(2, 11);
      }
      localStorage.setItem(STORAGE_KEY, sessionId);
      sessionStorage.setItem(STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return "sess_" + Date.now();
  }
}

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
  const isMobileOrTablet = isMobileOrTabletDevice();
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedVisitRef = useRef<boolean>(false);
  const hasSentLeaveRef = useRef<boolean>(false);
  const userNumberRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string>(getOrCreateSessionId());

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
    // Si NO es móvil ni tablet (es PC/Computadora), no enviar notificación ni registrar evento
    if (!isMobileOrTablet) {
      return;
    }

    try {
      // Inyectar automáticamente el sessionId único y marca de dispositivo móvil/tablet
      const fullPayload = {
        sessionId: sessionIdRef.current,
        country: geoDetailsRef.current.country,
        isMobile: true,
        ...payload,
      };

      const body = JSON.stringify(fullPayload);
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
    // Si NO es un móvil ni una tablet (es computadora de escritorio o laptop), descartar por completo
    if (!isMobileOrTablet) {
      return;
    }

    // Evitar envío doble de la visita en la misma pestaña/sesión
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
            sessionId: sessionIdRef.current,
            country,
            isMobile: true,
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
  }, [isMobileOrTablet]);

  const trackCheckoutClick = (buttonLabel?: string) => {
    if (!isMobileOrTablet) return;

    // 1. Mensaje de clic en comprar con tipo click_comprar y sessionId
    sendNotification(
      {
        type: "click_comprar",
        sessionId: sessionIdRef.current,
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
    if (!isMobileOrTablet) return;

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
    if (!isMobileOrTablet) return;

    if (hasEndedVideoRef.current || currentTime >= 78 || currentTime < 0.5) {
      return;
    }

    if (pauseDebounceTimerRef.current) {
      clearTimeout(pauseDebounceTimerRef.current);
    }

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
    if (!isMobileOrTablet) return;

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
    sessionId: sessionIdRef.current,
    isMobileOrTablet,
    trackCheckoutClick,
    trackVideoPlay,
    trackVideoPause,
    trackVideoEnded,
  };
}
