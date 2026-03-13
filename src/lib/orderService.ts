/**
 * src/lib/orderService.ts
 *
 * Reglas de negocio de la tienda: envío, stock, estados.
 * Centraliza valores que antes estaban hardcodeados en múltiples componentes.
 */

// ── Envío ─────────────────────────────────────────────────────────────────────

/**
 * Reglas de envío, en pesos mexicanos (MXN).
 * Fuente de verdad única: antes dispersa en Checkout.tsx:140, Checkout.tsx:328
 * y ProductoDetalle.tsx:311.
 */
export const SHIPPING_RULES = {
  /** Monto mínimo de compra para obtener envío gratis */
  FREE_THRESHOLD: 500,
  /** Costo de envío estándar cuando no aplica la promoción */
  BASE_COST: 99,
} as const;

/**
 * Calcula el costo de envío para un subtotal dado.
 * @returns 0 si aplica envío gratis, o el costo base si no.
 */
export function calculateShipping(subtotal: number): number {
  return subtotal >= SHIPPING_RULES.FREE_THRESHOLD ? 0 : SHIPPING_RULES.BASE_COST;
}

// ── Stock ─────────────────────────────────────────────────────────────────────

/**
 * Stock mínimo para que un producto se considere "en stock".
 * Antes: `stock > 0` hardcodeado en ProductoDetalle.tsx:109.
 */
export const MIN_STOCK_THRESHOLD = 1;

/**
 * Verifica si una variante está disponible para compra.
 */
export function isInStock(stock: number): boolean {
  return stock >= MIN_STOCK_THRESHOLD;
}

// ── Estados de orden ──────────────────────────────────────────────────────────

/**
 * Estados posibles de una orden.
 * Antes: string literal `'pending'` en Checkout.tsx:58.
 * Deben coincidir con los valores aceptados por la columna `orders.status` en Supabase.
 */
export const ORDER_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
