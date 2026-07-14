import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { OperationsService } from '../services/operations.service';
import { ValidationError } from '../utils/errors';

const updateCleaningStatusSchema = z.object({
  status: z.enum(['DIRTY', 'CLEANING', 'CLEAN', 'INSPECTED'])
});

const createTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  roomId: z.number().positive(),
  assignedTo: z.number().positive().optional()
});

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  assignedTo: z.number().positive().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional()
});

export class OperationsController {
  private operationsService: OperationsService;

  constructor() {
    this.operationsService = new OperationsService();
  }

  updateRoomCleaningStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roomId = parseInt(String(req.params.roomId), 10);
      const parsed = updateCleaningStatusSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const room = await this.operationsService.updateRoomCleaningStatus(roomId, parsed.data.status as any);
      res.json({ success: true, data: room });
    } catch (error) { next(error); }
  };

  getMaintenanceTickets = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tickets = await this.operationsService.getMaintenanceTickets();
      res.json({ success: true, data: tickets });
    } catch (error) { next(error); }
  };

  getMaintenanceTicketById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const ticket = await this.operationsService.getMaintenanceTicketById(id);
      res.json({ success: true, data: ticket });
    } catch (error) { next(error); }
  };

  createMaintenanceTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createTicketSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const ticket = await this.operationsService.createMaintenanceTicket(parsed.data);
      res.status(201).json({ success: true, data: ticket });
    } catch (error) { next(error); }
  };

  updateMaintenanceTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const parsed = updateTicketSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const ticket = await this.operationsService.updateMaintenanceTicket(id, parsed.data);
      res.json({ success: true, data: ticket });
    } catch (error) { next(error); }
  };
}
