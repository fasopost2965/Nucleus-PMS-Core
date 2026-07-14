import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { appConfig, logger } from './config';
import { setupSwagger } from './config/swagger';
import { healthRoutes } from './routes/health';
import { authRoutes } from './routes/auth.routes';
import { settingsRoutes } from './routes/settings.routes';
import { roomRoutes } from './routes/room.routes';
import { guestRoutes } from './routes/guest.routes';
import { reservationRoutes } from './routes/reservation.routes';
import { financeRoutes } from './routes/finance.routes';
import { operationsRoutes } from './routes/operations.routes';
import { restaurantRoutes } from './routes/restaurant.routes';
import { inventoryRoutes } from './routes/inventory.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import { reportRoutes } from './routes/report.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Security Middlewares
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(appConfig.apiPrefix, apiLimiter as any);

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL || 'https://brunchbouake.com' : '*'
}));
app.use(express.json());

// HTTP Logger setup using Morgan & Winston
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Swagger Documentation
setupSwagger(app);

// Routes
app.use('/health', healthRoutes);
app.use(`${appConfig.apiPrefix}/health`, healthRoutes);
app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/settings`, settingsRoutes);
app.use(`${appConfig.apiPrefix}/rooms`, roomRoutes);
app.use(`${appConfig.apiPrefix}/guests`, guestRoutes);
app.use(`${appConfig.apiPrefix}/reservations`, reservationRoutes);
app.use(`${appConfig.apiPrefix}/finance`, financeRoutes);
app.use(`${appConfig.apiPrefix}/operations`, operationsRoutes);
app.use(`${appConfig.apiPrefix}/restaurant`, restaurantRoutes);
app.use(`${appConfig.apiPrefix}/inventory`, inventoryRoutes);
app.use(`${appConfig.apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${appConfig.apiPrefix}/reports`, reportRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
