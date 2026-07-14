import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authenticate } from '../middlewares/authMiddleware';
import { requirePermission } from '../middlewares/rbacMiddleware';

const router = Router();
const reservationController = new ReservationController();

router.use(authenticate);

router.get('/', requirePermission('read', 'reservations'), reservationController.getReservations);
router.get('/:id', requirePermission('read', 'reservations'), reservationController.getReservationById);
router.post('/', requirePermission('manage', 'reservations'), reservationController.createReservation);
router.post('/:id/check-in', requirePermission('manage', 'reservations'), reservationController.checkIn);
router.post('/:id/check-out', requirePermission('manage', 'reservations'), reservationController.checkOut);
router.post('/:id/cancel', requirePermission('manage', 'reservations'), reservationController.cancel);

export const reservationRoutes = router;
