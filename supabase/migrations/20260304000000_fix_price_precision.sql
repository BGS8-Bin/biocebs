-- ============================================================
-- Migración: Fijar precisión de columnas de precio a NUMERIC(10,2)
-- ============================================================
-- Problema: Las tablas de tienda usan NUMERIC sin precisión,
-- lo que permite valores con más de 2 decimales.
-- courses.price ya usa DECIMAL(10,2) correctamente.
--
-- Esta migración estandariza todas las columnas de precio
-- a NUMERIC(10,2), consistente con la tabla courses.
--
-- NOTA: Probar en staging primero. Si existen valores con más de
-- 2 decimales en la DB, PostgreSQL los redondeará automáticamente.
-- ============================================================

-- products.base_price
ALTER TABLE public.products
  ALTER COLUMN base_price TYPE NUMERIC(10,2);

-- product_variants.price
ALTER TABLE public.product_variants
  ALTER COLUMN price TYPE NUMERIC(10,2);

-- orders.total
ALTER TABLE public.orders
  ALTER COLUMN total TYPE NUMERIC(10,2);

-- order_items.unit_price y total_price
ALTER TABLE public.order_items
  ALTER COLUMN unit_price TYPE NUMERIC(10,2),
  ALTER COLUMN total_price TYPE NUMERIC(10,2);

-- Verificación: Insertar un valor con más de 2 decimales debería
-- almacenarse redondeado a 2 decimales.
-- Ejemplo manual de verificación (ejecutar y revisar el resultado):
-- INSERT INTO public.products (name, slug, base_price)
--   VALUES ('Test', 'test-precision', 99.9999);
-- SELECT base_price FROM public.products WHERE slug = 'test-precision';
-- Resultado esperado: 100.00
-- DELETE FROM public.products WHERE slug = 'test-precision';
