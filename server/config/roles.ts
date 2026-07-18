// Role groups used by the RBAC middleware across server/routes/api.ts.
// Kept in one place so route-level access rules stay traceable against
// BRUNCH_BOUAKE_PMS/02_PRODUCT/28_PERMISSIONS_MATRIX.md.

export const ADMIN_ROLES = ['Super Administrateur', 'Directeur'];

// Réception has CRUD on reservations/guests/payments per the permission matrix,
// but no access to the room catalog, HR data or hotel-wide settings.
export const RECEPTION_ROLES = [...ADMIN_ROLES, 'Réceptionniste'];

// Housekeeping: Réception has "Write" (report room status), Housekeeping has
// "CRUD" (owns the cleaning task lifecycle), per the permission matrix.
export const HOUSEKEEPING_ROLES = [...ADMIN_ROLES, 'Réceptionniste', 'Housekeeping'];

// Stocks: only Super Administrateur has "All"; Directeur is Read-only on
// this module per the matrix (unlike most other modules), so it's
// deliberately NOT reused from ADMIN_ROLES here. "Magasinier / Stock" has CRUD.
export const STOCK_WRITE_ROLES = ['Super Administrateur', 'Magasinier / Stock'];

// Fail-closed fallback for user records with no assigned role. Deliberately
// matches no entry in ADMIN_ROLES/RECEPTION_ROLES/DEFAULT_ROLE_PRIVILEGES so
// such an account gets dashboard-only access instead of being silently
// promoted to full admin rights.
export const FALLBACK_ROLE = 'Sans Rôle';

export function resolveRole(user: { role?: string | null }): string {
  return user.role || FALLBACK_ROLE;
}
