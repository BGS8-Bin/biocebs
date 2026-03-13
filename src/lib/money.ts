/**
 * src/lib/money.ts
 *
 * Fuente de verdad para todo el formateo y cálculo de dinero en BIOCEBS Hub.
 *
 * Reglas:
 * - Siempre 2 decimales en UI.
 * - Siempre roundToDecimals() antes de persistir.
 * - Nunca .toLocaleString() sin opciones.
 * - Nunca Math.round() directo sobre precios; usar roundToDecimals().
 */

// ── Constantes ────────────────────────────────────────────────────────────────

export const CURRENCY_LOCALE_MAP: Record<string, string> = {
  MXN: 'es-MX',
  USD: 'en-US',
  EUR: 'es-ES',
};

export const DEFAULT_LOCALE = 'es-MX';
export const DEFAULT_CURRENCY = 'MXN';
export const DECIMAL_PLACES = 2;

// ── Redondeo ──────────────────────────────────────────────────────────────────

/**
 * Redondea a n decimales usando multiplicación entera para evitar
 * floating-point drift (ej. 0.1 + 0.2 = 0.30000000000000004).
 *
 * @example roundToDecimals(199.999) → 200.00
 */
export function roundToDecimals(amount: number, decimals = DECIMAL_PLACES): number {
  const factor = 10 ** decimals;
  return Math.round(amount * factor) / factor;
}

// ── Formateo ──────────────────────────────────────────────────────────────────

/**
 * Formatea un número como moneda con símbolo y exactamente 2 decimales.
 * Usa el locale correcto para cada moneda por defecto.
 *
 * @example formatCurrency(1200)        → "$1,200.00 MXN"  (locale es-MX)
 * @example formatCurrency(1200, 'USD') → "$1,200.00"       (locale en-US)
 * @example formatCurrency(1200, 'EUR') → "1.200,00 €"      (locale es-ES)
 */
export function formatCurrency(
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale?: string,
): string {
  const resolvedLocale = locale ?? CURRENCY_LOCALE_MAP[currency] ?? DEFAULT_LOCALE;
  return new Intl.NumberFormat(resolvedLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: DECIMAL_PLACES,
    maximumFractionDigits: DECIMAL_PLACES,
  }).format(amount);
}

/**
 * Formatea un número SIN símbolo de moneda ni código.
 * Útil para inputs controlados y tablas de admin.
 *
 * @example formatAmount(1200.5) → "1,200.50"
 */
export function formatAmount(
  amount: number,
  locale = DEFAULT_LOCALE,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: DECIMAL_PLACES,
    maximumFractionDigits: DECIMAL_PLACES,
  }).format(amount);
}

// ── Conversión ────────────────────────────────────────────────────────────────

/**
 * Convierte un monto de MXN a otra moneda usando una tasa relativa.
 * La tasa debe venir de una fuente externa; se acepta como parámetro
 * para no hardcodearla aquí.
 */
export function convertCurrency(
  amountInBase: number,
  rateToTarget: number,
): number {
  return roundToDecimals(amountInBase * rateToTarget);
}

/**
 * Convierte y formatea en un solo paso.
 *
 * @example formatConverted(1000, 'USD', 0.058) → "$58.00"
 */
export function formatConverted(
  amountInMXN: number,
  targetCurrency: string,
  rate: number,
): string {
  const converted = convertCurrency(amountInMXN, rate);
  return formatCurrency(converted, targetCurrency);
}

// ── Parsing ───────────────────────────────────────────────────────────────────

/**
 * Parsea un string de precio a number para inputs controlados.
 * Elimina caracteres no numéricos y aplica redondeo a 2 decimales.
 * Retorna 0 si el input no es válido.
 *
 * @example parsePrice("$1,200.50 MXN") → 1200.50
 */
export function parsePrice(value: string): number {
  const clean = value.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : roundToDecimals(parsed);
}
