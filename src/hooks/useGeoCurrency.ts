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

// Factor de conversión estimado de Hotmart / dLocal (Tasa interbancaria + ~5% spread)
const HOTMART_SPREAD = 1.0526;

// Tasas de impuestos locales que Hotmart / pasarelas aplican en checkout o resumen bancario
export const COUNTRY_TAX_RATES: Record<string, number> = {
  UY: 0.22, // Uruguay 22% IVA
  CO: 0.19, // Colombia 19% IVA
  MX: 0.16, // México 16% IVA
  CL: 0.19, // Chile 19% IVA
  PE: 0.18, // Perú 18% IGV
  AR: 0.59, // Argentina ~59% (21% IVA + 30% Ganancias + IIBB)
  ES: 0.21, // España 21% IVA
  IT: 0.22, // Italia 22% IVA
  PT: 0.23, // Portugal 23% IVA
  GB: 0.20, // Reino Unido 20% VAT
  US: 0.07, // Estados Unidos ~7% Sales Tax promedio
  CR: 0.13, // Costa Rica 13% IVA
  DO: 0.18, // Rep. Dominicana 18% ITBIS
  GT: 0.12, // Guatemala 12% IVA
};

function formatLocalPrice(currency: string, amount: number, countryCode?: string): string {
  if (currency === "USD") {
    if (countryCode === "US") return "$7.49 USD";
    return "$7 USD";
  }
  if (currency === "EUR") return (amount).toFixed(2).replace(".", ",") + " €";
  if (currency === "GBP") return "£" + (amount).toFixed(2) + " GBP";
  if (currency === "UYU") return "$ " + Math.round(amount) + " UYU";
  if (currency === "PEN") return "S/ " + Math.round(amount) + " PEN";
  if (currency === "MXN") return "$" + Math.round(amount) + " MXN";
  if (currency === "COP") {
    const rounded = Math.round(amount / 100) * 100;
    return "$" + rounded.toLocaleString("es-CO") + " COP";
  }
  if (currency === "CLP") {
    const rounded = Math.round(amount / 10) * 10;
    return "$" + rounded.toLocaleString("es-CL") + " CLP";
  }
  if (currency === "ARS") {
    const rounded = Math.round(amount / 50) * 50;
    return "$" + rounded.toLocaleString("es-AR") + " ARS";
  }
  if (currency === "GTQ") return "Q" + Math.round(amount) + " GTQ";
  if (currency === "BOB") return "Bs " + Math.round(amount) + " BOB";
  if (currency === "CRC") return "₡" + Math.round(amount / 10) * 10 + " CRC";
  if (currency === "DOP") return "RD$ " + Math.round(amount / 10) * 10 + " DOP";
  return "$" + Math.round(amount) + " " + currency;
}

function formatOriginalPrice(currency: string, amount: number, countryCode?: string): string {
  const origAmount = amount * 7; // Ratio 49 USD vs 7 USD (7x)
  if (currency === "USD") {
    if (countryCode === "US") return "$52.40 USD";
    return "$49.00 USD";
  }
  if (currency === "EUR") return (origAmount).toFixed(2).replace(".", ",") + " €";
  if (currency === "GBP") return "£" + (origAmount).toFixed(2) + " GBP";
  if (currency === "UYU") return "$ " + Math.round(origAmount) + " UYU";
  if (currency === "PEN") return "S/ " + Math.round(origAmount) + " PEN";
  if (currency === "MXN") return "$" + Math.round(origAmount) + " MXN";
  if (currency === "COP") {
    const rounded = Math.round(origAmount / 1000) * 1000;
    return "$" + rounded.toLocaleString("es-CO") + " COP";
  }
  if (currency === "CLP") {
    const rounded = Math.round(origAmount / 100) * 100;
    return "$" + rounded.toLocaleString("es-CL") + " CLP";
  }
  if (currency === "ARS") {
    const rounded = Math.round(origAmount / 500) * 500;
    return "$" + rounded.toLocaleString("es-AR") + " ARS";
  }
  return "$" + Math.round(origAmount) + " " + currency;
}

const COUNTRY_CURRENCY_MAP: Record<
  string,
  {
    countryName: string;
    currencyCode: string;
    currentPriceFormatted: string;
    originalPriceFormatted: string;
    paymentMethods: string;
  }
> = {
  UY: {
    countryName: "Uruguay",
    currencyCode: "UYU",
    currentPriceFormatted: "$ 362 UYU", // 297 + 22% IVA
    originalPriceFormatted: "$ 2.500 UYU",
    paymentMethods: "Tarjeta, Abitab o Redpagos"
  },
  MX: {
    countryName: "México",
    currencyCode: "MXN",
    currentPriceFormatted: "$168 MXN", // 145 + 16% IVA
    originalPriceFormatted: "$1.150 MXN",
    paymentMethods: "Tarjeta, OXXO, SPEI o PayPal"
  },
  CO: {
    countryName: "Colombia",
    currencyCode: "COP",
    currentPriceFormatted: "$35.500 COP", // 29.800 + 19% IVA
    originalPriceFormatted: "$244.000 COP",
    paymentMethods: "Tarjeta, PSE, Nequi, Efecty o Bancolombia"
  },
  PE: {
    countryName: "Perú",
    currencyCode: "PEN",
    currentPriceFormatted: "S/ 32 PEN", // 27 + 18% IGV
    originalPriceFormatted: "S/ 218 PEN",
    paymentMethods: "Tarjeta, PagoEfectivo o Yape"
  },
  CL: {
    countryName: "Chile",
    currencyCode: "CLP",
    currentPriceFormatted: "$8.300 CLP", // 6.990 + 19% IVA
    originalPriceFormatted: "$58.000 CLP",
    paymentMethods: "Tarjeta, Webpay o Sencillito"
  },
  ES: {
    countryName: "España",
    currencyCode: "EUR",
    currentPriceFormatted: "7,99 €", // 6,60 + 21% IVA
    originalPriceFormatted: "55,60 €",
    paymentMethods: "Tarjeta, Bizum o PayPal"
  },
  IT: {
    countryName: "Italia",
    currencyCode: "EUR",
    currentPriceFormatted: "8,05 €", // 6,60 + 22% IVA
    originalPriceFormatted: "56,00 €",
    paymentMethods: "Carta di credito o PayPal"
  },
  PT: {
    countryName: "Portugal",
    currencyCode: "EUR",
    currentPriceFormatted: "8,12 €", // 6,60 + 23% IVA
    originalPriceFormatted: "56,50 €",
    paymentMethods: "Cartão de crédito, Multibanco ou PayPal"
  },
  GB: {
    countryName: "Reino Unido",
    currencyCode: "GBP",
    currentPriceFormatted: "£6.90 GBP", // ~5.75 + 20% VAT
    originalPriceFormatted: "£48.00 GBP",
    paymentMethods: "Card or PayPal"
  },
  AR: {
    countryName: "Argentina",
    currencyCode: "ARS",
    currentPriceFormatted: "$14.600 ARS", // 9.200 + ~59% recargos
    originalPriceFormatted: "$102.000 ARS",
    paymentMethods: "Tarjeta, Pago Fácil o Rapipago"
  },
  GT: {
    countryName: "Guatemala",
    currencyCode: "GTQ",
    currentPriceFormatted: "Q63 GTQ", // 56 + 12% IVA
    originalPriceFormatted: "Q435 GTQ",
    paymentMethods: "Tarjeta o transferencia local"
  },
  CR: {
    countryName: "Costa Rica",
    currencyCode: "CRC",
    currentPriceFormatted: "₡4.180 CRC", // 3.700 + 13% IVA
    originalPriceFormatted: "₡29.000 CRC",
    paymentMethods: "Tarjeta local o internacional"
  },
  DO: {
    countryName: "Rep. Dominicana",
    currencyCode: "DOP",
    currentPriceFormatted: "RD$ 508 DOP", // 430 + 18% ITBIS
    originalPriceFormatted: "RD$ 3.500 DOP",
    paymentMethods: "Tarjeta de débito o crédito"
  },
  BO: {
    countryName: "Bolivia",
    currencyCode: "BOB",
    currentPriceFormatted: "Bs 50 BOB",
    originalPriceFormatted: "Bs 350 BOB",
    paymentMethods: "Tarjeta o QR local"
  },
  EC: {
    countryName: "Ecuador",
    currencyCode: "USD",
    currentPriceFormatted: "$7 USD",
    originalPriceFormatted: "$49 USD",
    paymentMethods: "Tarjeta de crédito o débito"
  },
  PA: {
    countryName: "Panamá",
    currencyCode: "USD",
    currentPriceFormatted: "$7 USD",
    originalPriceFormatted: "$49 USD",
    paymentMethods: "Tarjeta de crédito o débito"
  },
  SV: {
    countryName: "El Salvador",
    currencyCode: "USD",
    currentPriceFormatted: "$7 USD",
    originalPriceFormatted: "$49 USD",
    paymentMethods: "Tarjeta de crédito o débito"
  },
  US: {
    countryName: "Estados Unidos",
    currencyCode: "USD",
    currentPriceFormatted: "$7.49 USD", // 7.00 + ~7% avg sales tax
    originalPriceFormatted: "$52.40 USD",
    paymentMethods: "Credit card, Debit or PayPal"
  }
};

const DEFAULT_CURRENCY = {
  countryCode: "US",
  countryName: "Internacional",
  currencyCode: "USD",
  currentPriceFormatted: "$7 USD",
  originalPriceFormatted: "$49 USD",
  isLocal: false,
  paymentMethods: "Tarjeta o PayPal",
  paymentNotice: "Pago 100% seguro con tarjeta o PayPal"
};

function detectCountryFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
    if (tz.includes("montevideo")) return "UY";
    if (tz.includes("bogota")) return "CO";
    if (tz.includes("mexico") || tz.includes("cancun") || tz.includes("monterrey") || tz.includes("tijuana")) return "MX";
    if (tz.includes("lima")) return "PE";
    if (tz.includes("santiago")) return "CL";
    if (tz.includes("buenos_aires") || tz.includes("cordoba")) return "AR";
    if (tz.includes("madrid") || tz.includes("canary")) return "ES";
    if (tz.includes("rome")) return "IT";
    if (tz.includes("lisbon")) return "PT";
    if (tz.includes("london")) return "GB";
    if (tz.includes("guatemala")) return "GT";
    if (tz.includes("costa_rica")) return "CR";
    if (tz.includes("santo_domingo")) return "DO";
    if (tz.includes("la_paz")) return "BO";
    if (tz.includes("guayaquil")) return "EC";
    if (tz.includes("panama")) return "PA";
    if (tz.includes("el_salvador")) return "SV";
  } catch {
    // ignore
  }
  return null;
}

export function useGeoCurrency(): GeoCurrencyInfo {
  const [geoInfo, setGeoInfo] = useState<GeoCurrencyInfo>(() => {
    const tzCountry = detectCountryFromTimezone();
    if (tzCountry && COUNTRY_CURRENCY_MAP[tzCountry]) {
      const item = COUNTRY_CURRENCY_MAP[tzCountry];
      return {
        countryCode: tzCountry,
        countryName: item.countryName,
        currencyCode: item.currencyCode,
        currentPriceFormatted: item.currentPriceFormatted,
        originalPriceFormatted: item.originalPriceFormatted,
        isLocal: item.currencyCode !== "USD",
        paymentNotice: `Pagas en tu moneda local (${item.paymentMethods})`
      };
    }
    return DEFAULT_CURRENCY;
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function initializeGeoAndLiveRates() {
      let resolvedCountryCode = geoInfo.countryCode;

      // 1. Detect user country via IP
      try {
        const res = await fetch("https://api.country.is", { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          if (data.country) {
            resolvedCountryCode = data.country.toUpperCase();
          }
        }
      } catch {
        try {
          const res2 = await fetch("https://ipapi.co/json/", { signal: controller.signal });
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2.country_code) {
              resolvedCountryCode = data2.country_code.toUpperCase();
            }
          }
        } catch {
          // fallback to timezone
        }
      }

      if (!isMounted) return;

      const item = COUNTRY_CURRENCY_MAP[resolvedCountryCode] || DEFAULT_CURRENCY;
      const currency = item.currencyCode;

      // Base snapshot
      let updatedCurrentPrice = item.currentPriceFormatted;
      let updatedOriginalPrice = item.originalPriceFormatted;

      // 2. Fetch LIVE daily exchange rates to calculate today's exact conversion
      if (currency !== "USD") {
        try {
          const rateRes = await fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal });
          if (rateRes.ok) {
            const rateData = await rateRes.json();
            const rawRate = rateData.rates?.[currency];
            if (rawRate && typeof rawRate === "number") {
              const taxRate = COUNTRY_TAX_RATES[resolvedCountryCode] ?? (currency === "EUR" ? 0.21 : 0);
              const liveCalculatedAmount = rawRate * 7 * HOTMART_SPREAD * (1 + taxRate);
              updatedCurrentPrice = formatLocalPrice(currency, liveCalculatedAmount, resolvedCountryCode);
              updatedOriginalPrice = formatOriginalPrice(currency, liveCalculatedAmount, resolvedCountryCode);
            }
          }
        } catch {
          // If offline or blocked, preserves calibrated static rates
        }
      } else if (resolvedCountryCode === "US") {
        updatedCurrentPrice = "$7.49 USD";
        updatedOriginalPrice = "$52.40 USD";
      }

      if (isMounted) {
        setGeoInfo({
          countryCode: resolvedCountryCode,
          countryName: item.countryName,
          currencyCode: currency,
          currentPriceFormatted: updatedCurrentPrice,
          originalPriceFormatted: updatedOriginalPrice,
          isLocal: currency !== "USD",
          paymentNotice: `Pagas en tu moneda local (${item.paymentMethods})`
        });
      }
    }

    initializeGeoAndLiveRates();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return geoInfo;
}
