import { useEffect, useRef } from "react";

export function useTelegramTracker(countryName: string) {
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedVisitRef = useRef<boolean>(false);
  const clickedCheckoutRef = useRef<boolean>(false);
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
    if (hasTrackedVisitRef.current) return;
    hasTrackedVisitRef.current = true;
    startTimeRef.current = Date.now();

    async function sendVisitNotification() {
      try {
        // Obtenemos ciudad/país de forma segura vía HTTPS
        let city = "";
        let country = geoDetailsRef.current.country;
        let ip = "";

        try {
          const res = await fetch("https://ipapi.co/json/");
          if (res.ok) {
            const data = await res.json();
            city = data.city || "";
            country = data.country_name || country;
            ip = data.ip || "";
            geoDetailsRef.current = { country, city, ip };
          }
        } catch {
          // Fallback a la información que ya tenemos
        }

        await fetch("/api/telegram-notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "visit",
            country,
            city,
            ip
          })
        });
      } catch {
        // Silencioso para el usuario
      }
    }

    sendVisitNotification();

    // Rastrear salida de la página (robusto para celular y PC)
    const handleLeave = () => {
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (durationSeconds < 2) return; // Ignorar rebotes instantáneos de < 2s

      const payload = JSON.stringify({
        type: "leave",
        country: geoDetailsRef.current.country,
        city: geoDetailsRef.current.city,
        durationSeconds,
        hasClickedCheckout: clickedCheckoutRef.current
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
          text: buttonLabel
        }),
        keepalive: true
      });
    } catch {
      // ignore
    }
  };

  return { trackCheckoutClick };
}
