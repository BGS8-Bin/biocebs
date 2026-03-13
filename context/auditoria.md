Rol:
Arquitecto de software senior + auditor de calidad. Especialista en e-commerce/plataformas educativas, React/TypeScript, Supabase (PostgreSQL + RLS) y arquitectura por features (frontend screaming architecture, backend hexagonal).

Objetivo General:
Auditar la arquitectura del proyecto BIOCEBS Hub (frontend React + Supabase) y producir un plan de refactor incremental para hacerlo escalable, sin reescribir todo.

Contexto del Proyecto:
Plataforma multi-módulo (tienda, academia, eventos, admin). Stack real confirmado:
- Frontend: React + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Supabase (PostgreSQL con RLS, sin Express propio)
- Auth: Supabase Auth con roles personalizados vía tabla user_roles
- Estado de carrito: Context API en src/hooks/useCart.tsx
- Moneda: Context API en src/hooks/useCurrency.tsx

Estructura actual confirmada (src/):
  hooks/          → useCart.tsx, useCurrency.tsx, useLanguage.tsx, use-mobile.tsx
  components/     → tienda/, academia/, admin/, layout/, ui/ (shadcn)
  pages/          → Checkout.tsx, ProductoDetalle.tsx, PedidoConfirmado.tsx, Tienda.tsx,
                    Eventos.tsx, Index.tsx, academia/, admin/
  lib/            → auth.tsx
  integrations/   → supabase/client.ts, supabase/types.ts

Problemas detectados con evidencia real (usar como base de auditoría):

HARDCODEOS CONFIRMADOS:
1. Lógica de envío en Checkout.tsx línea 148:
   `const shipping = totalPrice >= 500 ? 0 : 99;`
   → Umbral $500 y costo $99 hardcodeados directamente en JSX.

2. Formateo de precios inconsistente en 4 lugares distintos, usando 2 métodos diferentes:
   a) useCurrency.tsx (línea 47): `new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`
   b) CartDrawer.tsx (líneas 92, 104): `price.toLocaleString('es-MX')` — sin control de decimales
   c) Checkout.tsx (líneas 276, 311, 322, 330, 345): `price.toLocaleString('es-MX')` — misma inconsistencia
   d) ProductoDetalle.tsx (línea 209): `currentPrice.toLocaleString('es-MX')` — mismo patrón
   e) PedidoConfirmado.tsx (línea 63): `order.total.toLocaleString('es-MX')` — sin decimales fijos
   f) ProductosAdmin.tsx (línea 452): `new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })`
   → El hook useCurrency.formatPrice() existe pero NO se usa en Checkout, CartDrawer ni ProductoDetalle.

3. Tasas de conversión de moneda hardcodeadas en useCurrency.tsx:
   `USD: { rate: 0.058 }` y `EUR: { rate: 0.054 }` — sin fuente externa, sin fecha de referencia.

4. Precios de eventos como strings en Eventos.tsx: `price: '$800 MXN'`, `price: '$500 MXN'`, `price: 'Gratuito'`
   → No son números, no son formateables, no son filtrables.

5. Precios de productos demo en Index.tsx: `price: '$600.00 MXN'` (string hardcodeado, no viene de Supabase).

6. Roles duplicados definidos en 3 lugares:
   - lib/auth.tsx: objeto con labels de roles (superadmin, admin...)
   - pages/admin/Usuarios.tsx: objeto con estilos CSS por rol (líneas 84-95)
   - pages/admin/Usuarios.tsx: array de roles disponibles (líneas 99-100)
   - supabase/migrations: ENUM app_role definido en DB

7. Inconsistencia en tipos de precio en DB:
   - courses.price → DECIMAL(10,2) [migración 20251209]
   - products.base_price, product_variants.price, orders.total → NUMERIC sin precisión [migración 20251217]

HIPÓTESIS (sin confirmar aún, indicar cómo verificar):
- Stock mínimo para "en stock" probablemente hardcodeado como > 0 en ProductoDetalle.tsx
- Regla de envío gratis ($500) podría repetirse en futuras páginas (actualmente solo en Checkout.tsx)

Límites (obligatorios):
- No proponer reescritura total.
- Priorizar cambios incrementales y de bajo riesgo.
- Toda recomendación debe incluir: archivo(s) específico(s), ruta exacta, y razón.
- Distinguir claramente: UI/formateo vs lógica de negocio vs persistencia.
- Si falta evidencia, marcar como "hipótesis" y decir cómo confirmarla (ej: `grep -rn "toLocaleString" src/`).

Tareas:

1) HARDCODEOS: Lista concreta (ya tienes evidencia arriba), expándela si encuentras más.
   Busca especialmente: estados de orden ('pending', 'completed'), stock mínimo, URLs base, IDs fijos.

2) IMPACTO "2 DECIMALES": Si queremos garantizar exactamente 2 decimales en toda la app, lista:
   - Cada archivo y línea que debe cambiar (usa la evidencia de arriba como punto de partida)
   - La capa a la que pertenece (UI formateo / cálculo / persistencia DB)
   - La solución propuesta para cada caso
   - El riesgo de no arreglar cada punto

3) ARQUITECTURA OBJETIVO: Propón estructura por feature para este proyecto específico.
   Features identificados: tienda (carrito, productos, checkout, órdenes), academia (cursos, lecciones, inscripciones), eventos, admin, shared (auth, ui, money).
   Para cada feature indica: carpetas ui/, services/, models/, hooks/, validators/ o equivalentes.
   Muestra árbol de carpetas concreto.

4) PLAN INCREMENTAL (5-8 pasos):
   Paso 0 ya identificado: extraer formateo de precios a un único módulo `src/lib/money.ts`
   con funciones: formatCurrency(amount, locale?), roundToDecimals(amount, decimals?).
   Continuar desde ahí.
   Cada paso debe incluir: archivos/rutas específicas, riesgo, y cómo verificar (test/checklist manual).

5) REGLAS DE NEGOCIO CRÍTICAS: Lista las que deben centralizarse.
   Empezar por: umbrales de envío, formato de moneda, roles, estados de orden, stock.

Checklist de salida:
- [ ] Lista de hardcodeos con archivo:línea específica
- [ ] Mapa de impacto "2 decimales" por capa con archivo:línea
- [ ] Árbol de carpetas objetivo por feature
- [ ] Plan incremental con verificación por paso
- [ ] Módulo src/lib/money.ts propuesto con API completa

Formato de respuesta esperado:
1) Hallazgos (Hardcodeos / Duplicación / Inconsistencias de tipos en DB)
2) Impacto "2 decimales" (por capa: UI → cálculo → persistencia)
3) Arquitectura objetivo (árbol de carpetas con justificación)
4) Plan incremental (pasos numerados con archivos, riesgo y verificación)
5) Módulo money.ts propuesto + lista de archivos a migrar