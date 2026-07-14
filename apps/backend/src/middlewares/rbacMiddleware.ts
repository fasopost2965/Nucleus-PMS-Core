import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';

/**
 * Vérifie si l'utilisateur possède la permission requise.
 * 
 * @param action - L'action souhaitée (ex: 'read', 'manage', 'create')
 * @param subject - Le sujet concerné (ex: 'reservations', 'settings', 'all')
 */
export const requirePermission = (action: string, subject: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AuthorizationError('Utilisateur non authentifié dans le contexte');
      }

      const { permissions } = req.user;

      // Un utilisateur avec 'manage:all' a accès à tout
      const hasSuperAdminAccess = permissions.includes('manage:all');
      if (hasSuperAdminAccess) {
        return next();
      }

      // Vérifier la permission exacte
      const requiredPermission = `${action}:${subject}`;
      const hasPermission = permissions.includes(requiredPermission);

      // S'il ne possède pas la permission exacte, mais a le droit "manage:subject"
      // ex: s'il veut 'read:reservations' et possède 'manage:reservations', c'est autorisé.
      const hasManageSubject = permissions.includes(`manage:${subject}`);

      if (!hasPermission && !hasManageSubject) {
        throw new AuthorizationError(`Vous n'avez pas la permission '${action}' sur '${subject}'`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
