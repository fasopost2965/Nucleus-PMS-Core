import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RoomService } from '../services/room.service';
import { ValidationError } from '../utils/errors';
import { RoomStatus } from '@prisma/client';

const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  basePrice: z.number().min(0),
  capacity: z.number().min(1)
});

const updateCategorySchema = createCategorySchema.partial();

const createRoomSchema = z.object({
  number: z.string().min(1),
  floor: z.string().optional(),
  categoryId: z.number().positive(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE']).optional()
});

const updateRoomSchema = createRoomSchema.partial();

export class RoomController {
  private roomService: RoomService;

  constructor() {
    this.roomService = new RoomService();
  }

  // --- Categories ---
  getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await this.roomService.getCategories();
      res.json({ success: true, data: categories });
    } catch (error) { next(error); }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createCategorySchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const category = await this.roomService.createCategory(parsed.data);
      res.status(201).json({ success: true, data: category });
    } catch (error) { next(error); }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const parsed = updateCategorySchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const category = await this.roomService.updateCategory(id, parsed.data);
      res.json({ success: true, data: category });
    } catch (error) { next(error); }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      await this.roomService.deleteCategory(id, req.user!.id);
      res.status(204).send();
    } catch (error) { next(error); }
  };

  // --- Rooms ---
  getRooms = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rooms = await this.roomService.getRooms();
      res.json({ success: true, data: rooms });
    } catch (error) { next(error); }
  };

  createRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createRoomSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const room = await this.roomService.createRoom(parsed.data);
      res.status(201).json({ success: true, data: room });
    } catch (error) { next(error); }
  };

  updateRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const parsed = updateRoomSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const room = await this.roomService.updateRoom(id, parsed.data);
      res.json({ success: true, data: room });
    } catch (error) { next(error); }
  };

  deleteRoom = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      await this.roomService.deleteRoom(id, req.user!.id);
      res.status(204).send();
    } catch (error) { next(error); }
  };
}
