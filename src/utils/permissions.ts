/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ALL_PMS_MODULES = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/reception', label: 'Réception' },
  { path: '/rooms', label: 'Chambres' },
  { path: '/reservations', label: 'Réservations' },
  { path: '/guests', label: 'Clients' },
  { path: '/finance', label: 'Finance' },
  { path: '/hrms', label: 'RH Enterprise' },
  { path: '/housekeeping', label: 'Housekeeping' },
  { path: '/maintenance', label: 'Maintenance' },
  { path: '/restaurant', label: 'Restaurant' },
  { path: '/inventory', label: 'Stock' },
  { path: '/reports', label: 'Rapports' },
  { path: '/settings', label: 'Paramètres' },
  { path: '/admin', label: 'Administration' }
];

export const DEFAULT_ROLE_PRIVILEGES: Record<string, string[]> = {
  'Super Administrateur': [
    '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
    '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
  ],
  'Support Technique': [
    '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
    '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
  ],
  'Réceptionniste': [
    '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/restaurant'
  ],
  'Housekeeping': [
    '/dashboard', '/housekeeping', '/maintenance'
  ],
  'Technicien Maintenance': [
    '/dashboard', '/maintenance'
  ],
  'Magasinier / Stock': [
    '/dashboard', '/inventory'
  ]
};

/**
 * Checks if a user has access to a specific PMS module path.
 */
export function hasPermission(email: string, role: string, path: string): boolean {
  // Super Admins and Support always have absolute access
  if (role === 'Super Administrateur' || role === 'Support Technique') {
    return true;
  }

  // Dashboard is accessible to everyone as a baseline
  if (path === '/dashboard') {
    return true;
  }

  // Check if there are custom override privileges in localStorage
  const customPrivilegesRaw = localStorage.getItem(`pms_privileges_${email.toLowerCase().trim()}`);
  if (customPrivilegesRaw) {
    try {
      const customPaths = JSON.parse(customPrivilegesRaw) as string[];
      return customPaths.includes(path);
    } catch (e) {
      console.error('Error parsing custom privileges:', e);
    }
  }

  // Fallback to role-based default privileges
  const defaults = DEFAULT_ROLE_PRIVILEGES[role];
  if (defaults) {
    return defaults.includes(path);
  }

  return false;
}

/**
 * Retrieves the current privileges for a specific user (either custom overrides or role defaults).
 */
export function getUserPrivileges(email: string, role: string): string[] {
  const customPrivilegesRaw = localStorage.getItem(`pms_privileges_${email.toLowerCase().trim()}`);
  if (customPrivilegesRaw) {
    try {
      return JSON.parse(customPrivilegesRaw) as string[];
    } catch (e) {
      console.error('Error parsing custom privileges:', e);
    }
  }

  return DEFAULT_ROLE_PRIVILEGES[role] || ['/dashboard'];
}

/**
 * Saves custom privilege overrides for a specific user.
 */
export function saveUserPrivileges(email: string, paths: string[]): void {
  localStorage.setItem(`pms_privileges_${email.toLowerCase().trim()}`, JSON.stringify(paths));
}

/**
 * Reset/clear custom privileges for a specific user (reverts back to role defaults).
 */
export function resetUserPrivileges(email: string): void {
  localStorage.removeItem(`pms_privileges_${email.toLowerCase().trim()}`);
}
