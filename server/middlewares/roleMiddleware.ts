import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Accès refusé. Rôle insuffisant pour cette opération.',
          code: 'FORBIDDEN'
        }
      });
    }
    next();
  };
}
