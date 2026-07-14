import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

router.get('/ready', (req, res) => {
  // TODO: Add database connection check here
  res.status(200).json({ status: 'ok', message: 'API is ready to accept traffic' });
});

router.get('/version', (req, res) => {
  res.status(200).json({ version: '1.0.0' });
});

export const healthRoutes = router;
