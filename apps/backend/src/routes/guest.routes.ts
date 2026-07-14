import { Router } from 'express';
import { GuestController } from '../controllers/guest.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const guestController = new GuestController();

// Appliquer l'authentification sur toutes les routes
router.use(authenticate);

// --- Guests ---
router.get('/', requirePermission('read', 'guests'), guestController.getGuests);
router.get('/:id', requirePermission('read', 'guests'), guestController.getGuestById);
router.post('/', requirePermission('manage', 'guests'), guestController.createGuest);
router.put('/:id', requirePermission('manage', 'guests'), guestController.updateGuest);
router.delete('/:id', requirePermission('manage', 'guests'), guestController.deleteGuest);

export const guestRoutes = router;
