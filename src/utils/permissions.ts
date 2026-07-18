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
 *
 * Note: this only drives client-side UI (menu visibility, route redirects).
 * It must never be treated as a security boundary — the backend re-checks
 * every write with its own role middleware (see server/routes/api.ts).
 * Privileges are intentionally NOT read from localStorage: that value is
 * fully attacker-controlled from the browser console and was previously
 * used as an unauthenticated privilege-escalation vector.
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

  const defaults = DEFAULT_ROLE_PRIVILEGES[role];
  if (defaults) {
    return defaults.includes(path);
  }

  return false;
}

/**
 * Retrieves the default privileges for a given role.
 */
export function getUserPrivileges(email: string, role: string): string[] {
  return DEFAULT_ROLE_PRIVILEGES[role] || ['/dashboard'];
}
