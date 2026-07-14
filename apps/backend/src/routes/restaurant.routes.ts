import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const restaurantController = new RestaurantController();

router.use(authenticate);

// --- Menu Items ---
router.get('/items', requirePermission('read', 'restaurant'), restaurantController.getItems);
router.post('/items', requirePermission('manage', 'restaurant'), restaurantController.createItem);

// --- Orders ---
router.get('/orders', requirePermission('read', 'restaurant'), restaurantController.getOrders);
router.get('/orders/:id', requirePermission('read', 'restaurant'), restaurantController.getOrderById);
router.post('/orders', requirePermission('manage', 'restaurant'), restaurantController.createOrder);

export const restaurantRoutes = router;
