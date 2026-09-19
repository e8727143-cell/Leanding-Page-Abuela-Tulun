import { useState, useEffect } from "react";

export interface GeoCurrencyInfo {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currentPriceFormatted: string;
  originalPriceFormatted: string;
  isLocal: boolean;
  paymentNotice: string;
}

export interface CountryConfig {
  countryName: string;
  currencyCode: string;
  currentPriceFormatted: string;
  originalPriceFormatted: string;
  paymentMethods: string;
}

// Catálogo exacto verificado contra el checkout oficial de Hotmart
export const COUNTRY_CURRENCY_MAP: Record<string, CountryConfig> = {
  // AMÉRICA LATINA Y EL CARIBE
  MX: {
    countryName: "México",
    currencyCode: "MXN",
    currentPriceFormatted: "$149.64 MXN", // $129.00 + $20.64 IVA (Hotmart oficial verificado)
    originalPriceFormatted: "$1.047 MXN",
    paymentMethods: "Tarjeta, OXXO, SPEI o PayPal"
  },
  CO: {
    countryName: "Colombia",
    currencyCode: "COP",
    currentPriceFormatted: "$27.400 COP",
    originalPriceFormatted: "$192.000 COP",
    paymentMethods: "Tarjeta, PSE, Nequi, Efecty o Bancolombia"
  },
  AR: {
    countryName: "Argentina",
    currencyCode: "ARS",
    currentPriceFormatted: "$17.700 ARS",
    originalPriceFormatted: "$124.000 ARS",
    paymentMethods: "Tarjeta, Pago Fácil o Rapipago"
  },
  PE: {
    countryName: "Perú",
    currencyCode: "PEN",
    currentPriceFormatted: "S/ 29 PEN",
    originalPriceFormatted: "S/ 205 PEN",
    paymentMethods: "Tarjeta, PagoEfectivo, Yape o Plin"
  },
  DO: {
    countryName: "Rep. Dominicana",
    currencyCode: "DOP",
    currentPriceFormatted: "RD$ 510 DOP",
    originalPriceFormatted: "RD$ 3.583 DOP", // Corregido: Consistente con prefijo oficial RD$
    paymentMethods: "Tarjeta de crédito o débito"
  },
  CL: {
    countryName: "Chile",
    currencyCode: "CLP",
    currentPriceFormatted: "$6.990 CLP", // Moneda local CLP en Hotmart
    originalPriceFormatted: "$48.900 CLP",
    paymentMethods: "Tarjeta, Webpay, Mach o Sencillito"
  },
  UY: {
    countryName: "Uruguay",
    currencyCode: "UYU",
    currentPriceFormatted: "$U 320 UYU", // Moneda local UYU en Hotmart
    originalPriceFormatted: "$U 2.240 UYU",
    paymentMethods: "Tarjeta, Abitab o Redpagos"
  },
  CR: {
    countryName: "Costa Rica",
    currencyCode: "CRC",
    currentPriceFormatted: "₡3.900 CRC", // Moneda local CRC en Hotmart
    originalPriceFormatted: "₡27.300 CRC",
    paymentMethods: "Tarjeta de crédito, débito o SINPE Móvil"
  },
  GT: {
    countryName: "Guatemala",
    currencyCode: "GTQ",
    currentPriceFormatted: "Q58 GTQ", // Moneda local GTQ en Hotmart
    originalPriceFormatted: "Q406 GTQ",
    paymentMethods: "Tarjeta o transferencia local"
  },
  BO: {
    countryName: "Bolivia",
    currencyCode: "BOB",
    currentPriceFormatted: "Bs 50 BOB", // Moneda local BOB en Hotmart
    originalPriceFormatted: "Bs 350 BOB",
    paymentMethods: "Tarjeta o QR local"
  },
  BR: {
    countryName: "Brasil",
    currencyCode: "BRL",
    currentPriceFormatted: "R$ 39,90 BRL", // Moneda local BRL en Hotmart
    originalPriceFormatted: "R$ 279 BRL",
    paymentMethods: "Pix, Cartão de crédito ou Boleto"
  },
  EC: {
    countryName: "Ecuador",
    currencyCode: "USD",
    currentPriceFormatted: "$7 USD", // Ecuador tiene economía dolarizada oficial
    originalPriceFormatted: "$49 USD",
    paymentMethods: "Tarjeta de crédito, débito o PayPal"
  },
  PA: {
    countryName: "Panamá",
    currencyCode: "USD",
    currentPriceFormatted: "$7 USD", // Moneda oficial de pasarela internacional Hotmart
    originalPriceFormatted: "$49 USD",
    paymentMethods: "Tarjeta de crédito, débito, Clave o PayPal"
  },
  SV: {
    countryName: "El Salvador",
    currencyCode: "USD",
    currentPriceFormatted: "$7 USD", // Dolarizado oficial
    originalPriceFormatted: "$49 USD",
    paymentMethods: "Tarjeta de crédito, débito o PayPal"
  },
  PY: {
    countryName: "Paraguay",
    currencyCode: "PYG",
    currentPriceFormatted: "Gs. 54.000 PYG",
    originalPriceFormatted: "Gs. 378.000 PYG",
    paymentMethods: "Tarjeta de crédito o débito"
  },
  HN: {
    countryName: "Honduras",
    currencyCode: "HNL",
    currentPriceFormatted: "L 175 HNL",
    originalPriceFormatted: "L 1.225 HNL",
    paymentMethods: "Tarjeta de crédito o débito"
  },
  NI: {
    countryName: "Nicaragua",
    currencyCode: "NIO",
    currentPriceFormatted: "C$ 260 NIO",
    originalPriceFormatted: "C$ 1.820 NIO",
    paymentMethods: "Tarjeta de crédito o débito"
  },
  PR: {
    countryName: "Puerto Rico",
    currencyCode: "USD",
    currentPriceFormatted: "$7.80 USD", // Dólar + IVU local
    originalPriceFormatted: "$54.60 USD",
    paymentMethods: "Tarjeta de crédito, débito o ATH Móvil"
  },
  VE: {
    countryName: "Venezuela",
    currencyCode: "USD",
    currentPriceFormatted: "$7 USD",
    originalPriceFormatted: "$49 USD",
    paymentMethods: "Tarjeta internacional o PayPal"
  },

  // EUROPA (ZONA EURO Y REINO UNIDO)
  ES: {
    countryName: "España",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €", // Hotmart oficial verificado: 6,73 € + 0,27 € IVA = 7,00 €
    originalPriceFormatted: "49,00 €",
    paymentMethods: "Tarjeta, Bizum o PayPal"
  },
  PT: {
    countryName: "Portugal",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €", // Moneda legal en Portugal
    originalPriceFormatted: "49,00 €",
    paymentMethods: "Cartão de crédito, Multibanco ou PayPal"
  },
  IT: {
    countryName: "Italia",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €",
    originalPriceFormatted: "49,00 €",
    paymentMethods: "Carta di credito o PayPal"
  },
  FR: {
    countryName: "Francia",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €",
    originalPriceFormatted: "49,00 €",
    paymentMethods: "Carte bancaire ou PayPal"
  },
  DE: {
    countryName: "Alemania",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €",
    originalPriceFormatted: "49,00 €",
    paymentMethods: "Kreditkarte, Klarna oder PayPal"
  },
  NL: {
    countryName: "Países Bajos",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €",
    originalPriceFormatted: "49,00 €",
    paymentMethods: "iDEAL, Creditcard of PayPal"
  },
  BE: {
    countryName: "Bélgica",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €",
    originalPriceFormatted: "49,00 €",
    paymentMethods: "Bancontact, Carte ou PayPal"
  },
  AT: {
    countryName: "Austria",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €",
    originalPriceFormatted: "49,00 €",
    paymentMethods: "Kreditkarte oder PayPal"
  },
  IE: {
    countryName: "Irlanda",
    currencyCode: "EUR",
    currentPriceFormatted: "7,00 €",
    originalPriceFormatted: "49,00 €",
    paymentMethods: "Card or PayPal"
  },
  CH: {
    countryName: "Suiza",
    currencyCode: "CHF",
    currentPriceFormatted: "6.90 CHF",
    originalPriceFormatted: "48.30 CHF",
    paymentMethods: "Kreditkarte, Twint oder PayPal"
  },
  GB: {
    countryName: "Reino Unido",
    currencyCode: "GBP",
    currentPriceFormatted: "£6.00 GBP",
    originalPriceFormatted: "£42.00 GBP",
    paymentMethods: "Credit or Debit Card, PayPal"
  },
  SE: {
    countryName: "Suecia",
    currencyCode: "SEK",
    currentPriceFormatted: "75 SEK",
    originalPriceFormatted: "525 SEK",
    paymentMethods: "Kort eller PayPal"
  },
  NO: {
    countryName: "Noruega",
    currencyCode: "NOK",
    currentPriceFormatted: "75 NOK",
    originalPriceFormatted: "525 NOK",
    paymentMethods: "Kort eller PayPal"
  },
  DK: {
    countryName: "Dinamarca",
    currencyCode: "DKK",
    currentPriceFormatted: "52 DKK",
    originalPriceFormatted: "364 DKK",
    paymentMethods: "Kort eller PayPal"
  },
  PL: {
    countryName: "Polonia",
    currencyCode: "PLN",
    currentPriceFormatted: "30 PLN",
    originalPriceFormatted: "210 PLN",
    paymentMethods: "Karta lub PayPal"
  },

  // NORTEAMÉRICA Y OCEANÍA
  US: {
    countryName: "Estados Unidos",
    currencyCode: "USD",
    currentPriceFormatted: "$7.49 USD", // $7.00 + ~7% Sales Tax promedio de EE.UU.
    originalPriceFormatted: "$52.40 USD",
    paymentMethods: "Credit card, Debit or PayPal"
  },
  CA: {
    countryName: "Canadá",
    currencyCode: "CAD",
    currentPriceFormatted: "$9.90 CAD",
    originalPriceFormatted: "$69.30 CAD",
    paymentMethods: "Credit card, Debit or PayPal"
  },
  AU: {
    countryName: "Australia",
    currencyCode: "AUD",
    currentPriceFormatted: "$10.90 AUD",
    originalPriceFormatted: "$76.30 AUD",
    paymentMethods: "Credit card or PayPal"
  },
  NZ: {
    countryName: "Nueva Zelanda",
    currencyCode: "NZD",
    currentPriceFormatted: "$11.50 NZD",
    originalPriceFormatted: "$80.50 NZD",
    paymentMethods: "Credit card or PayPal"
  }
};

const DEFAULT_CURRENCY: GeoCurrencyInfo = {
  countryCode: "US",
  countryName: "Internacional",
  currencyCode: "USD",
  currentPriceFormatted: "$7 USD",
  originalPriceFormatted: "$49 USD",
  isLocal: false,
  paymentNotice: "Pagas de forma 100% segura con tarjeta o PayPal"
};

// Permite simulación instantánea mediante ?country=ES o ?country=CL o ?pais=portugal
export function getCountryFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const country = params.get("country") || params.get("pais") || params.get("geo");
    if (country) {
      const normalized = country.trim().toUpperCase();
      if (COUNTRY_CURRENCY_MAP[normalized]) return normalized;
      
      const lower = country.trim().toLowerCase();
      if (lower.includes("españa") || lower.includes("spain")) return "ES";
      if (lower.includes("portugal")) return "PT";
      if (lower.includes("chile")) return "CL";
      if (lower.includes("uruguay")) return "UY";
      if (lower.includes("costa rica")) return "CR";
      if (lower.includes("guatemala")) return "GT";
      if (lower.includes("bolivia")) return "BO";
      if (lower.includes("brasil") || lower.includes("brazil")) return "BR";
      if (lower.includes("mexico") || lower.includes("méxico")) return "MX";
      if (lower.includes("colombia")) return "CO";
      if (lower.includes("argentina")) return "AR";
      if (lower.includes("peru") || lower.includes("perú")) return "PE";
      if (lower.includes("dominicana")) return "DO";
      if (lower.includes("ecuador")) return "EC";
      if (lower.includes("panama") || lower.includes("panamá")) return "PA";
      if (lower.includes("estados unidos") || lower.includes("usa")) return "US";
      if (lower.includes("italia") || lower.includes("italy")) return "IT";
      if (lower.includes("francia") || lower.includes("france")) return "FR";
      if (lower.includes("alemania") || lower.includes("germany")) return "DE";
      if (lower.includes("reino unido") || lower.includes("uk")) return "GB";
      if (lower.includes("canada") || lower.includes("canadá")) return "CA";
    }
  } catch {}
  return null;
}

export function detectCountryFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    if (tz.includes("madrid") || tz.includes("canary") || tz.includes("ceuta")) return "ES";
    if (tz.includes("lisbon") || tz.includes("madeira") || tz.includes("azores")) return "PT";
    if (tz.includes("santiago")) return "CL";
    if (tz.includes("montevideo")) return "UY";
    if (tz.includes("costa_rica")) return "CR";
    if (tz.includes("guatemala")) return "GT";
    if (tz.includes("la_paz")) return "BO";
    if (tz.includes("sao_paulo") || tz.includes("rio") || tz.includes("brasilia") || tz.includes("fortaleza") || tz.includes("manaus")) return "BR";
    if (tz.includes("bogota")) return "CO";
    if (tz.includes("lima")) return "PE";
    if (tz.includes("buenos_aires") || tz.includes("cordoba") || tz.includes("mendoza") || tz.includes("rosario") || tz.includes("salta")) return "AR";
    if (tz.includes("guayaquil") || tz.includes("quito") || tz.includes("galapagos")) return "EC";
    if (tz.includes("mexico") || tz.includes("cancun") || tz.includes("monterrey") || tz.includes("tijuana") || tz.includes("hermosillo") || tz.includes("chihuahua")) return "MX";
    if (tz.includes("santo_domingo")) return "DO";
    if (tz.includes("panama")) return "PA";
    if (tz.includes("el_salvador")) return "SV";
    if (tz.includes("asuncion")) return "PY";
    if (tz.includes("tegucigalpa")) return "HN";
    if (tz.includes("managua")) return "NI";
    if (tz.includes("caracas")) return "VE";
    if (tz.includes("rome")) return "IT";
    if (tz.includes("paris")) return "FR";
    if (tz.includes("berlin")) return "DE";
    if (tz.includes("amsterdam")) return "NL";
    if (tz.includes("brussels")) return "BE";
    if (tz.includes("vienna")) return "AT";
    if (tz.includes("dublin")) return "IE";
    if (tz.includes("zurich")) return "CH";
    if (tz.includes("london")) return "GB";
    if (tz.includes("stockholm")) return "SE";
    if (tz.includes("oslo")) return "NO";
    if (tz.includes("copenhagen")) return "DK";
    if (tz.includes("warsaw")) return "PL";
    if (tz.includes("toronto") || tz.includes("vancouver") || tz.includes("montreal")) return "CA";
    if (tz.includes("sydney") || tz.includes("melbourne") || tz.includes("brisbane")) return "AU";
    if (tz.includes("auckland")) return "NZ";
  } catch {}
  return null;
}

export function useGeoCurrency(): GeoCurrencyInfo {
  const [geoInfo, setGeoInfo] = useState<GeoCurrencyInfo>(() => {
    // 1. Verificación inmediata de parámetro de URL (?country=ES, ?country=CL, etc.)
    const urlCountry = getCountryFromUrl();
    if (urlCountry && COUNTRY_CURRENCY_MAP[urlCountry]) {
      const item = COUNTRY_CURRENCY_MAP[urlCountry];
      return {
        countryCode: urlCountry,
        countryName: item.countryName,
        currencyCode: item.currencyCode,
        currentPriceFormatted: item.currentPriceFormatted,
        originalPriceFormatted: item.originalPriceFormatted,
        isLocal: item.currencyCode !== "USD" || urlCountry === "EC" || urlCountry === "PA" || urlCountry === "SV",
        paymentNotice: `Pagas en ${item.countryName} (${item.paymentMethods})`
      };
    }

    // 2. Comprobación preliminar por huso horario
    const tzCountry = detectCountryFromTimezone();
    if (tzCountry && COUNTRY_CURRENCY_MAP[tzCountry]) {
      const item = COUNTRY_CURRENCY_MAP[tzCountry];
      return {
        countryCode: tzCountry,
        countryName: item.countryName,
        currencyCode: item.currencyCode,
        currentPriceFormatted: item.currentPriceFormatted,
        originalPriceFormatted: item.originalPriceFormatted,
        isLocal: item.currencyCode !== "USD" || tzCountry === "EC" || tzCountry === "PA" || tzCountry === "SV",
        paymentNotice: `Pagas en ${item.countryName} (${item.paymentMethods})`
      };
    }

    return DEFAULT_CURRENCY;
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function detectLocation() {
      const urlCountry = getCountryFromUrl();
      let resolvedCountryCode = urlCountry || "";

      if (!resolvedCountryCode) {
        // Fuente 1: Nuestro servidor Express /api/geo
        try {
          const srvRes = await fetch("/api/geo", { signal: controller.signal });
          if (srvRes.ok) {
            const srvData = await srvRes.json();
            if (srvData && srvData.countryCode) {
              resolvedCountryCode = srvData.countryCode.toUpperCase();
            }
          }
        } catch {}

        // Fuente 2: GeoJS.io (Servicio abierto de alta disponibilidad sin rate limits)
        if (!resolvedCountryCode) {
          try {
            const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json", { signal: controller.signal });
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData && geoData.country_code) {
                resolvedCountryCode = geoData.country_code.toUpperCase();
              }
            }
          } catch {}
        }

        // Fuente 3: ipwho.is
        if (!resolvedCountryCode) {
          try {
            const whoRes = await fetch("https://ipwho.is/", { signal: controller.signal });
            if (whoRes.ok) {
              const whoData = await whoRes.json();
              if (whoData && whoData.success !== false && whoData.country_code) {
                resolvedCountryCode = whoData.country_code.toUpperCase();
              }
            }
          } catch {}
        }

        // Fuente 4: Fallback a zona horaria
        if (!resolvedCountryCode) {
          resolvedCountryCode = detectCountryFromTimezone() || "US";
        }
      }

      if (!isMounted) return;

      const item = COUNTRY_CURRENCY_MAP[resolvedCountryCode];
      if (item) {
        setGeoInfo({
          countryCode: resolvedCountryCode,
          countryName: item.countryName,
          currencyCode: item.currencyCode,
          currentPriceFormatted: item.currentPriceFormatted,
          originalPriceFormatted: item.originalPriceFormatted,
          isLocal: item.currencyCode !== "USD" || resolvedCountryCode === "EC" || resolvedCountryCode === "PA" || resolvedCountryCode === "SV",
          paymentNotice: `Pagas en tu país (${item.paymentMethods})`
        });
      } else {
        // País internacional no mapeado
        let dynCountryName = resolvedCountryCode;
        try {
          const whoisRes = await fetch("https://ipwho.is/", { signal: controller.signal });
          if (whoisRes.ok) {
            const wData = await whoisRes.json();
            if (wData && wData.country) {
              dynCountryName = wData.country;
            }
          }
        } catch {}

        if (isMounted) {
          setGeoInfo({
            countryCode: resolvedCountryCode,
            countryName: dynCountryName,
            currencyCode: "USD",
            currentPriceFormatted: "$7 USD",
            originalPriceFormatted: "$49 USD",
            isLocal: false,
            paymentNotice: `Pagas en ${dynCountryName} de forma 100% segura con tarjeta o PayPal`
          });
        }
      }
    }

    detectLocation();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return geoInfo;
}
