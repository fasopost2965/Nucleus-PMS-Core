import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../config';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Erreur connue de type AppError
  if (err instanceof AppError) {
    logger.warn(`[${err.code}] ${err.message}`, { 
      path: req.path, 
      method: req.method,
      details: err.details 
    });

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || null,
      },
    });
  }

  // Erreur inattendue
  logger.error(`[UNHANDLED_ERROR] ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Une erreur interne est survenue',
      details: null,
    },
  });
};
