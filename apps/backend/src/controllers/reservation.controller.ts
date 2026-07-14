import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ReservationService } from '../services/reservation.service';
import { ValidationError } from '../utils/errors';

const createReservationSchema = z.object({
  guestId: z.number().positive(),
  roomId: z.number().positive(),
  checkInDate: z.string().refine(v => !isNaN(Date.parse(v)), { message: "Invalid date format" }),
  checkOutDate: z.string().refine(v => !isNaN(Date.parse(v)), { message: "Invalid date format" }),
  adults: z.number().min(1).optional(),
  children: z.number().min(0).optional(),
  status: z.enum(['PENDING', 'CONFIRMED']).optional()
}).refine(data => new Date(data.checkInDate) < new Date(data.checkOutDate), {
  message: "La date de départ doit être après la date d'arrivée",
  path: ["checkOutDate"]
});

export class ReservationController {
  private reservationService: ReservationService;

  constructor() {
    this.reservationService = new ReservationService();
  }

  getReservations = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reservations = await this.reservationService.getReservations();
      res.json({ success: true, data: reservations });
    } catch (error) { next(error); }
  };

  getReservationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const reservation = await this.reservationService.getReservationById(id);
      res.json({ success: true, data: reservation });
    } catch (error) { next(error); }
  };

  createReservation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createReservationSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const reservation = await this.reservationService.createReservation(parsed.data);
      res.status(201).json({ success: true, data: reservation });
    } catch (error) { next(error); }
  };

  checkIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const reservation = await this.reservationService.checkIn(id);
      res.json({ success: true, data: reservation });
    } catch (error) { next(error); }
  };

  checkOut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const reservation = await this.reservationService.checkOut(id);
      res.json({ success: true, data: reservation });
    } catch (error) { next(error); }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const reservation = await this.reservationService.cancelReservation(id);
      res.json({ success: true, data: reservation });
    } catch (error) { next(error); }
  };
}
