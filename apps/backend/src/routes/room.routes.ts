import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const roomController = new RoomController();

// Appliquer l'authentification sur toutes les routes
router.use(authenticate);

// --- Categories ---
router.get('/categories', requirePermission('read', 'rooms'), roomController.getCategories);
router.post('/categories', requirePermission('manage', 'rooms'), roomController.createCategory);
router.put('/categories/:id', requirePermission('manage', 'rooms'), roomController.updateCategory);
router.delete('/categories/:id', requirePermission('manage', 'rooms'), roomController.deleteCategory);

// --- Rooms ---
router.get('/', requirePermission('read', 'rooms'), roomController.getRooms);
router.post('/', requirePermission('manage', 'rooms'), roomController.createRoom);
router.put('/:id', requirePermission('manage', 'rooms'), roomController.updateRoom);
router.delete('/:id', requirePermission('manage', 'rooms'), roomController.deleteRoom);

export const roomRoutes = router;
