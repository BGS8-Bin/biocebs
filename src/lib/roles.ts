/**
 * src/lib/roles.ts
 *
 * Fuente de verdad para roles de usuario.
 * Antes estaban duplicados en tres lugares:
 *  - src/pages/admin/Usuarios.tsx (lines 68–86)
 *  - src/lib/auth.tsx (tipo AppRole)
 *  - supabase/migrations (ENUM app_role en DB)
 */

import type { Database } from '@/integrations/supabase/types';

export type AppRole = Database['public']['Enums']['app_role'];

// ── Datos de roles ────────────────────────────────────────────────────────────

/**
 * Todos los roles disponibles en la plataforma.
 * Debe coincidir con el ENUM `app_role` de la base de datos.
 */
export const ALL_ROLES: AppRole[] = [
  'superadmin',
  'admin',
  'colaborador',
  'instructor',
  'alumno',
  'cliente_tienda',
];

/**
 * Etiquetas legibles para cada rol.
 */
export const ROLE_LABELS: Record<AppRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Administrador',
  colaborador: 'Colaborador',
  instructor: 'Instructor',
  alumno: 'Alumno',
  cliente_tienda: 'Cliente Tienda',
};

/**
 * Clases CSS de Tailwind para cada rol (usado en badges).
 */
export const ROLE_COLORS: Record<AppRole, string> = {
  superadmin: 'bg-destructive/10 text-destructive border-destructive/30',
  admin: 'bg-primary/10 text-primary border-primary/30',
  colaborador: 'bg-secondary/10 text-secondary border-secondary/30',
  instructor: 'bg-accent/10 text-accent border-accent/30',
  alumno: 'bg-success/10 text-success border-success/30',
  cliente_tienda: 'bg-warning/10 text-warning border-warning/30',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Roles que tienen permisos de administración.
 */
export const ADMIN_ROLES: AppRole[] = ['admin', 'superadmin'];

/**
 * Verifica si un role es de tipo admin.
 */
export function isAdminRole(role: AppRole): boolean {
  return ADMIN_ROLES.includes(role);
}
