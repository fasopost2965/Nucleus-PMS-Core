import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '../utils/errors';
import { authConfig } from '../config';

// Extension de l'interface Request d'Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
        permissions: string[];
      };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token manquant ou invalide');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, authConfig.jwtSecret) as Express.Request['user'];
      req.user = decoded;
      next();
    } catch (err) {
      throw new AuthenticationError('Token expiré ou invalide');
    }
  } catch (error) {
    next(error);
  }
};
