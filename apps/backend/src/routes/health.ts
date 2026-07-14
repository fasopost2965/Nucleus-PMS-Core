import { Router } from 'express';

const router = Router();

// Mounted at /health → this handler answers GET /health
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy', timestamp: new Date().toISOString() });
});

router.get('/ready', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is ready to accept traffic' });
});

router.get('/version', (req, res) => {
  res.status(200).json({ version: '1.0.0', env: process.env.NODE_ENV });
});

export const healthRoutes = router;
