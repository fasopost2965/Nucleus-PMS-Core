import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(`[API Error] : ${err.message || err}`);
  
  // Standardized error payload
  const status = err.status || 500;
  const message = err.message || 'Une erreur interne est survenue sur le serveur';
  
  res.status(status).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_SERVER_ERROR',
      details: err.details || null
    }
  });
}
