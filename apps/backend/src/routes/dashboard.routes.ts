import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const dashboardController = new DashboardController();

router.use(authenticate);

// --- Dashboard ---
router.get('/', requirePermission('read', 'dashboard'), dashboardController.getDashboard);

export const dashboardRoutes = router;
