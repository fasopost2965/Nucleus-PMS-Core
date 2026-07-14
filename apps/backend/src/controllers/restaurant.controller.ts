import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RestaurantService } from '../services/restaurant.service';
import { ValidationError } from '../utils/errors';

const createItemSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  isAvailable: z.boolean().optional()
});

const createOrderSchema = z.object({
  folioId: z.number().positive().optional(),
  status: z.enum(['PENDING', 'PREPARING', 'SERVED', 'PAID', 'BILLED_TO_ROOM']).optional(),
  items: z.array(
    z.object({
      itemId: z.number().positive(),
      quantity: z.number().positive()
    })
  ).min(1)
});

export class RestaurantController {
  private restaurantService: RestaurantService;

  constructor() {
    this.restaurantService = new RestaurantService();
  }

  getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.restaurantService.getItems();
      res.json({ success: true, data: items });
    } catch (error) { next(error); }
  };

  createItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createItemSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const item = await this.restaurantService.createItem(parsed.data);
      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  };

  getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orders = await this.restaurantService.getOrders();
      res.json({ success: true, data: orders });
    } catch (error) { next(error); }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const order = await this.restaurantService.getOrderById(id);
      res.json({ success: true, data: order });
    } catch (error) { next(error); }
  };

  createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createOrderSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const order = await this.restaurantService.createOrder(parsed.data);
      res.status(201).json({ success: true, data: order });
    } catch (error) { next(error); }
  };
}
