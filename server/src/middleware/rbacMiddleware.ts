import { type Request, type Response, type NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

const rolePermissions: Record<string, string[]> = {
  Directeur: [
    'dashboard',
    'rooms',
    'reservations',
    'guests',
    'finance',
    'housekeeping',
    'maintenance',
    'restaurant',
    'inventory',
    'reports',
    'settings',
    'admin',
    'hrms'
  ],
  Receptionniste: ['dashboard', 'rooms', 'reservations', 'guests', 'settings'],
  SuperAdministrateur: ['dashboard', 'rooms', 'reservations', 'guests', 'finance', 'housekeeping', 'maintenance', 'restaurant', 'inventory', 'settings', 'hrms'],
};

export function rbacMiddleware(moduleName: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role || 'Receptionniste';
    const permissions = rolePermissions[role] || [];
    if (!permissions.includes(moduleName)) {
      return res.status(403).json({ success: false, error: { message: 'Permission insuffisante pour accéder à cette ressource' } });
    }
    next();
  };
}
