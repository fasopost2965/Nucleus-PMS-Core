import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/routes/api';
import { errorHandler } from './server/middlewares/errorHandler';
import { startBackupScheduler } from './server/config/scheduler';

async function startServer() {
  const app = express();
  const PORT = 3000;

  const PROD_ORIGIN = process.env.APP_URL || 'https://pms.brunchbouake.com';
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [PROD_ORIGIN]
    : [PROD_ORIGIN, 'http://localhost:3000', 'http://localhost:5173'];

  // 1. Core Parsers & Middlewares
  app.use(helmet());
  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message: 'Trop de tentatives de connexion. Réessayez plus tard.', code: 'TOO_MANY_REQUESTS' }
    }
  });
  app.use('/api/auth/login', loginLimiter);

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging requests
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.path}`);
    next();
  });

  // 2. Register API Router first
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api-status', (req, res) => {
    res.json({ success: true, status: 'Nucleus PMS API running', timestamp: new Date().toISOString() });
  });

  // 3. Vite middleware for development vs Static files for production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Server] Running in DEVELOPMENT mode. Mounting Vite Middleware.');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Server] Running in PRODUCTION mode. Serving static assets.');
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files with proper cache-busting and caching strategies
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else {
          // Dynamic logos or non-hashed public resources should be validated but can be cached temporarily
          if (filePath.includes('/logo') || filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.svg')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          } else {
            // Version-hashed compiled assets can be safely cached immutably
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        }
      }
    }));
    
    // Catch-all to support React Router single page navigation
    app.get('*', (req, res) => {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 4. Centralized Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Success! Nucleus PMS Core running on http://0.0.0.0:${PORT}`);
    // Start automated 24h backup scheduler
    startBackupScheduler();
  });
}

startServer().catch(err => {
  console.error('[Server] Critical startup failure:', err);
});
