import cors from 'cors';
import express from 'express';
import path from 'path';
import { config } from './config';
import authRouter from './routes/auth';
import roomsRouter from './routes/rooms';
import guestsRouter from './routes/guests';
import reservationsRouter from './routes/reservations';
import hrmsRouter from './routes/hrms';
import financeRouter from './routes/finance';
import housekeepingRouter from './routes/housekeeping';
import maintenanceRouter from './routes/maintenance';
import inventoryRouter from './routes/inventory';
import settingsRouter from './routes/settings';
import dashboardRouter from './routes/dashboard';
import { authMiddleware } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', authMiddleware, dashboardRouter);
app.use('/api/rooms', authMiddleware, roomsRouter);
app.use('/api/guests', authMiddleware, guestsRouter);
app.use('/api/reservations', authMiddleware, reservationsRouter);
app.use('/api/finance', authMiddleware, financeRouter);
app.use('/api/housekeeping', authMiddleware, housekeepingRouter);
app.use('/api/maintenance', authMiddleware, maintenanceRouter);
app.use('/api/inventory', authMiddleware, inventoryRouter);
app.use('/api/settings', authMiddleware, settingsRouter);
app.use('/api/hrms', authMiddleware, hrmsRouter);

if (config.nodeEnv === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Backend démarré sur http://localhost:${config.port}`);
});
