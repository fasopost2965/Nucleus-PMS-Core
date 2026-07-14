import { Router } from 'express';
import { OperationsController } from '../controllers/operations.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const operationsController = new OperationsController();

router.use(authenticate);

// --- Housekeeping ---
router.put('/rooms/:roomId/cleaning-status', requirePermission('manage', 'rooms'), operationsController.updateRoomCleaningStatus);

// --- Maintenance ---
router.get('/maintenance/tickets', requirePermission('read', 'maintenance'), operationsController.getMaintenanceTickets);
router.get('/maintenance/tickets/:id', requirePermission('read', 'maintenance'), operationsController.getMaintenanceTicketById);
router.post('/maintenance/tickets', requirePermission('manage', 'maintenance'), operationsController.createMaintenanceTicket);
router.put('/maintenance/tickets/:id', requirePermission('manage', 'maintenance'), operationsController.updateMaintenanceTicket);

export const operationsRoutes = router;
