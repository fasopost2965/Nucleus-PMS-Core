import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { InventoryService } from '../services/inventory.service';
import { ValidationError } from '../utils/errors';

const createItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().nonnegative().optional(),
  unit: z.string().min(1),
  alertThreshold: z.number().nonnegative().optional(),
  averagePurchasePrice: z.number().nonnegative().optional()
});

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  alertThreshold: z.number().nonnegative().optional(),
  averagePurchasePrice: z.number().nonnegative().optional()
});

const createMovementSchema = z.object({
  itemId: z.number().positive(),
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().positive(),
  reason: z.string().optional()
});

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.inventoryService.getItems();
      res.json({ success: true, data: items });
    } catch (error) { next(error); }
  };

  getItemById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const item = await this.inventoryService.getItemById(id);
      res.json({ success: true, data: item });
    } catch (error) { next(error); }
  };

  createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createItemSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const item = await this.inventoryService.createItem(parsed.data);
      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  };

  updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const parsed = updateItemSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const item = await this.inventoryService.updateItem(id, parsed.data);
      res.json({ success: true, data: item });
    } catch (error) { next(error); }
  };

  getMovements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const movements = await this.inventoryService.getMovements();
      res.json({ success: true, data: movements });
    } catch (error) { next(error); }
  };

  createMovement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createMovementSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const userId = (req as any).user.id; // From auth middleware
      const movement = await this.inventoryService.createMovement({ ...parsed.data, userId });
      res.status(201).json({ success: true, data: movement });
    } catch (error) { next(error); }
  };
}
