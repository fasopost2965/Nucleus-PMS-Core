import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const inventoryController = new InventoryController();

router.use(authenticate);

// --- Items ---
router.get('/items', requirePermission('read', 'inventory'), inventoryController.getItems);
router.get('/items/:id', requirePermission('read', 'inventory'), inventoryController.getItemById);
router.post('/items', requirePermission('manage', 'inventory'), inventoryController.createItem);
router.put('/items/:id', requirePermission('manage', 'inventory'), inventoryController.updateItem);

// --- Movements ---
router.get('/movements', requirePermission('read', 'inventory'), inventoryController.getMovements);
router.post('/movements', requirePermission('manage', 'inventory'), inventoryController.createMovement);

export const inventoryRoutes = router;
