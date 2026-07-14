import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GuestService } from '../services/guest.service';
import { ValidationError } from '../utils/errors';

const createGuestSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Format email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  nationality: z.string().optional(),
  identityDocument: z.string().optional(),
  preferences: z.string().optional(),
});

const updateGuestSchema = createGuestSchema.partial();

export class GuestController {
  private guestService: GuestService;

  constructor() {
    this.guestService = new GuestService();
  }

  getGuests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guests = await this.guestService.getGuests();
      res.json({ success: true, data: guests });
    } catch (error) { next(error); }
  };

  getGuestById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const guest = await this.guestService.getGuestById(id);
      res.json({ success: true, data: guest });
    } catch (error) { next(error); }
  };

  createGuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createGuestSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const guest = await this.guestService.createGuest(parsed.data);
      res.status(201).json({ success: true, data: guest });
    } catch (error) { next(error); }
  };

  updateGuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const parsed = updateGuestSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const guest = await this.guestService.updateGuest(id, parsed.data);
      res.json({ success: true, data: guest });
    } catch (error) { next(error); }
  };

  deleteGuest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      await this.guestService.deleteGuest(id, req.user!.id);
      res.status(204).send();
    } catch (error) { next(error); }
  };
}
