import { useEffect, useRef } from "react";

export function useTelegramTracker(countryName: string) {
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedVisitRef = useRef<boolean>(false);
  const hasSentLeaveRef = useRef<boolean>(false);
  const clickedCheckoutRef = useRef<boolean>(false);
  const hasPlayedVideoOnceRef = useRef<boolean>(false);
  const lastPauseTimeoutRef = useRef<any>(null);
  const userNumberRef = useRef<number | null>(null);

  const geoDetailsRef = useRef<{ country: string; city: string; ip: string }>({
    country: countryName || "Desconocido",
    city: "",
    ip: ""
  });

  // Actualizar país si cambia la geolocalización
  useEffect(() => {
    if (countryName && countryName !== "Internacional") {
      geoDetailsRef.current.country = countryName;
    }
  }, [countryName]);

  useEffect(() => {
    // Evitar envío doble en la misma sesión/pestaña
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
      try {
        let city = "";
        let country = geoDetailsRef.current.country;
        let ip = "";

        try {
          const srvRes = await fetch("/api/geo");
          if (srvRes.ok) {
            const data = await srvRes.json();
            if (data && data.countryName) {
              city = data.city || "";
              country = data.countryName || country;
              ip = data.ip || "";
              geoDetailsRef.current = { country, city, ip };
            }
          }
        } catch {
          try {
            const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
            if (geoRes.ok) {
              const data2 = await geoRes.json();
              city = data2.city || "";
              country = data2.country || country;
              ip = data2.ip || "";
              geoDetailsRef.current = { country, city, ip };
            }
          } catch {
            // Fallback a los datos actuales
          }
        }

        const notifyRes = await fetch("/api/telegram-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "visit",
            country,
            city,
            ip
          })
        });

        if (notifyRes.ok) {
          const data = await notifyRes.json();
          if (data && data.userNumber) {
            userNumberRef.current = data.userNumber;
            sessionStorage.setItem("tg_user_number", data.userNumber.toString());
          }
        }
      } catch {
        // Silencioso
      }
    }

    sendVisitNotification();

    // Rastrear salida garantizando que solo se dispare UNA vez
    const handleLeave = () => {
      if (hasSentLeaveRef.current) return;
      hasSentLeaveRef.current = true;

      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (durationSeconds < 2) return; // Ignorar rebotes de menos de 2 segundos

      const payload = JSON.stringify({
        type: "leave",
        country: geoDetailsRef.current.country,
        city: geoDetailsRef.current.city,
        durationSeconds,
        hasClickedCheckout: clickedCheckoutRef.current,
        userNumber: userNumberRef.current
      });

      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/telegram-notify", blob);
        } else {
          fetch("/api/telegram-notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true
          });
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener("pagehide", handleLeave);
    window.addEventListener("beforeunload", handleLeave);

    return () => {
      window.removeEventListener("pagehide", handleLeave);
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, []);

  const trackCheckoutClick = (buttonLabel: string) => {
    clickedCheckoutRef.current = true;
    try {
      fetch("/api/telegram-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "checkout_click",
          country: geoDetailsRef.current.country,
          city: geoDetailsRef.current.city,
          text: buttonLabel,
          userNumber: userNumberRef.current
        }),
        keepalive: true
      });
    } catch {
      // ignore
    }
  };

  const trackVideoPlay = () => {
    // Si ya le dio play recientemente, evitamos spam
    if (hasPlayedVideoOnceRef.current) return;
    hasPlayedVideoOnceRef.current = true;

    try {
      fetch("/api/telegram-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video_play",
          country: geoDetailsRef.current.country,
          city: geoDetailsRef.current.city,
          userNumber: userNumberRef.current
        })
      });
    } catch {
      // ignore
    }
  };

  const trackVideoPause = (currentTimeSeconds: number) => {
    // Si pausó al final o al inicio (0 seg), lo ignoramos
    if (currentTimeSeconds < 1) return;

    if (lastPauseTimeoutRef.current) {
      clearTimeout(lastPauseTimeoutRef.current);
    }

    // Debounce de 1.5s para no disparar si solo está adelantando o retrocediendo
    lastPauseTimeoutRef.current = setTimeout(() => {
      const mins = Math.floor(currentTimeSeconds / 60);
      const secs = Math.floor(currentTimeSeconds % 60);
      const timeStr = `${mins}:${secs < 10 ? "0" : ""}${secs} min`;

      try {
        fetch("/api/telegram-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "video_pause",
            country: geoDetailsRef.current.country,
            city: geoDetailsRef.current.city,
            text: timeStr,
            userNumber: userNumberRef.current
          })
        });
      } catch {
        // ignore
      }
    }, 1500);
  };

  const trackVideoEnded = () => {
    try {
      fetch("/api/telegram-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video_ended",
          country: geoDetailsRef.current.country,
          city: geoDetailsRef.current.city,
          userNumber: userNumberRef.current
        })
      });
    } catch {
      // ignore
    }
  };

  return {
    trackCheckoutClick,
    trackVideoPlay,
    trackVideoPause,
    trackVideoEnded
  };
}
