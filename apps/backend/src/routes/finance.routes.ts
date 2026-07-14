import { Router } from 'express';
import { FinanceController } from '../controllers/finance.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const financeController = new FinanceController();

router.use(authenticate);

// --- Folios ---
router.get('/folios', requirePermission('read', 'finance'), financeController.getFolios);
router.get('/folios/:id', requirePermission('read', 'finance'), financeController.getFolioById);
router.post('/folios/:id/items', requirePermission('manage', 'finance'), financeController.addFolioItem);
router.post('/folios/:id/payments', requirePermission('manage', 'finance'), financeController.addPayment);
router.post('/folios/:id/invoice', requirePermission('manage', 'finance'), financeController.generateInvoice);

export const financeRoutes = router;
