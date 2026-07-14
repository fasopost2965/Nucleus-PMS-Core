import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const reportController = new ReportController();

router.use(authenticate);

// --- Reports ---
router.get('/financial/csv', requirePermission('read', 'dashboard'), reportController.getFinancialReportCsv);
router.get('/occupancy/csv', requirePermission('read', 'dashboard'), reportController.getOccupancyReportCsv);

export const reportRoutes = router;
