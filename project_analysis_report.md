# Informe de Auditoría y Análisis del Proyecto BIOCEBS

Este documento detalla el análisis de viabilidad, responsabilidades y riesgos para el desarrollo de la Plataforma Web Integral de BIOCEBS, basado en los requerimientos estipulados.

## 1. Análisis de Viabilidad y Alcance

### Integración del Backoffice y Plataforma Académica (LMS)
Para lograr la centralización de operaciones y la plataforma académica, se requieren los siguientes componentes técnicos críticos:

*   **Infraestructura de Video Streaming:** Los videos de los cursos no deben alojarse directamente en el servidor web para evitar saturación y costos elevados de ancho de banda. Se recomienda una integración con servicios como **Vimeo Pro**, **AWS S3 + CloudFront** o **Mux** para un streaming seguro y optimizado.
*   **Gestión de Estado y Progreso:** Es necesario una base de datos relacional robusta (como PostgreSQL a través de Supabase) para rastrear granularmente el progreso de cada estudiante (porcentaje de video visto, cuestionarios completados).
*   **Generación de Certificados:** Se requiere un microservicio o función serverless (Edge Function) que genere PDFs dinámicamente con librerías como `pdf-lib` o `react-pdf`, incrustando un código QR único que enlace a una URL de validación pública para prevenir fraudes.

### Desafíos de Integración (Facturación y Pagos)
*   **Facturación (SAT - México):** La "Integración con sistema de facturación mexicana" es un desafío técnico significativo. No es viable desarrollar un motor de facturación desde cero.
    *   *Solución:* Integración vía API con un PAC (Proveedor Autorizado de Certificación) como Facturama o Fáctura.com. Esto implica costos por timbre fiscal que deben contemplarse.
*   **Pasarelas de Pago:** La integración de PayPal, Stripe o Mercado Pago requiere un manejo estricto de webhooks para actualizar el estado de los pedidos y el acceso a los cursos en tiempo real ("Inmediatamente después del pago").
    *   *Riesgo:* La conciliación de pagos manuales (transferencias) puede generar fricción; se recomienda automatizarla mediante referencias bancarias (SPEI con API) o mantenerla como proceso manual con carga de comprobante.

## 2. Matriz de Responsabilidades (RACI)

| Tarea / Entregable | Responsable (Desarrollador) | Responsable (BIOCEBS/Cliente) |
| :--- | :--- | :--- |
| **Infraestructura** | Configuración de hosting, dominio, SSL y base de datos (Supabase). | Pago de servicios de hosting, dominio y servicios de terceros (Vimeo, Correos). |
| **Diseño y UX** | Diseño de interfaz responsive, experiencia de usuario y maquetación (UI Kit). | Probación de diseños, entrega de manual de marca (logos, fuentes, colores). |
| **Contenido Web** | Implementación de textos e imágenes en el sitio. | **Redacción de todos los textos** (ES/EN), entrega de fotografías y videos editados. |
| **Traducciones** | Implementación técnica del sistema multilingüe (i18n). | **Entrega de las traducciones** completas (inglés) de todo el contenido. |
| **E-commerce** | Configuración de pasarelas, carrito y checkout. | Creación de cuentas (Stripe/PayPal), datos bancarios y lista de precios/productos. |
| **Sitio Académico** | Desarrollo del LMS, lógica de progreso y certificados. | Estructura curricular, videos de cursos, materiales PDF y preguntas de examen. |
| **Legal** | Colocación de enlaces y popups de consentimiento. | Redacción legal de "Términos y Condiciones", "Aviso de Privacidad" y "Políticas de Envío". |
| **Facturación** | Conexión técnica con la API del proveedor de facturación. | Contratación del servicio de timbrado (PAC) y entrega de credenciales API (CSD). |

## 3. Requerimientos de Insumos (Inmediato)

Para evitar bloqueos en el desarrollo del **Módulo B (Académico)** y la **Tienda en Línea**, se requiere solicitar de inmediato:

1.  **Credenciales de Pasarelas de Pago:** Accesos a cuentas de desarrollador de Stripe, PayPal o MercadoPago para pruebas de sandbox.
2.  **Estructura del Primer Curso Piloto:**
    *   Temario completo.
    *   Al menos un módulo de videos de prueba (para calibrar el player).
    *   Ejemplo de cuestionario/evaluación.
    *   Recurso descargable (PDF) de ejemplo.
3.  **Credenciales de API de Facturación:** Definir con qué proveedor (PAC) se trabajará para leer su documentación técnica.
4.  **Lista de Productos (E-commerce):** Excel con: Nombre, Descripción, Precio, Stock inicial e Imágenes en alta resolución.
5.  **Definición de Tarifas de Envío:** Reglas de negocio para costos de envío (fijo, por peso, gratis arriba de X monto).

## 4. Auditoría de Riesgos y Omisiones

Tras revisar la propuesta y los requerimientos, se identifican las siguientes áreas de riesgo o costos ocultos no explícitos:

*   **Costos Recurrentes de APIs:** ¿Está el cliente consciente de que la facturación automática y el hosting de video (Vimeo/AWS) generan costos mensuales adicionales al hosting web?
*   **Traducción de Contenidos:** El requisito "Multilingüe (EN/ES)" suele subestimarse. Si el cliente no entrega los textos en inglés a tiempo, el lanzamiento en ese idioma se bloqueará. ¿Quién hará la traducción? ¿Se usará traducción automática (calidad baja) o profesional?
*   **Migración de Datos:** No se menciona si existe una base de datos previa de alumnos o clientes que deba importarse. Si existe, la limpieza y migración de esos datos es una tarea compleja no cotizada.
*   **Soporte a Usuarios Finales:** La propuesta incluye "Soporte técnico", pero esto debe limitarse a errores del sistema (bugs). No debe incluir soporte a alumnos que "no saben entrar" o "olvidaron su contraseña", lo cual es responsabilidad operativa de BIOCEBS.
*   **App Móvil (Escalabilidad):** Se menciona "Posibilidad de escalar a app móvil". Para garantizar esto, el Backend debe construirse estrictamente como una API RESTful o GraphQL documentada, separada del Frontend web.
