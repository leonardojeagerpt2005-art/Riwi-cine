export interface Currency {
  code: string; // ej: "USD", "COP"
  symbol: string; // ej: "$"
  rate: number; // cuántas unidades por cada 1 USD (tipo de cambio fijo de referencia)
  decimals: number; // decimales a mostrar
}

// Tipo de cambio de referencia (simulado) por país soportado.
// Panama y Estados Unidos usan el dólar directamente.
const CURRENCIES: Record<string, Currency> = {
  Colombia: { code: "COP", symbol: "$", rate: 4000, decimals: 0 },
  Panama: { code: "USD", symbol: "$", rate: 1, decimals: 2 },
  Panamá: { code: "USD", symbol: "$", rate: 1, decimals: 2 },
  "United States": { code: "USD", symbol: "$", rate: 1, decimals: 2 },
  Mexico: { code: "MXN", symbol: "$", rate: 18, decimals: 2 },
  México: { code: "MXN", symbol: "$", rate: 18, decimals: 2 },
  Argentina: { code: "ARS", symbol: "$", rate: 1000, decimals: 0 },
};

const DEFAULT_CURRENCY: Currency = { code: "USD", symbol: "$", rate: 1, decimals: 2 };

export function getCurrencyForCountry(country: string | null | undefined): Currency {
  if (!country) return DEFAULT_CURRENCY;
  return CURRENCIES[country] ?? DEFAULT_CURRENCY;
}

// Convierte un precio base (en USD) a la moneda del país y lo formatea.
// Ej: formatPrice(12.5, COP) -> "$50,000 COP"
export function formatPrice(usd: number, currency: Currency): string {
  const value = usd * currency.rate;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });
  return `${currency.symbol}${formatted} ${currency.code}`;
}
