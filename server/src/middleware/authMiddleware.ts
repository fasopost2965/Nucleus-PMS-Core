import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { message: 'Token JWT manquant ou invalide' } });
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string; email: string; role: string };
    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { message: 'Token JWT expiré ou invalide' } });
  }
}
