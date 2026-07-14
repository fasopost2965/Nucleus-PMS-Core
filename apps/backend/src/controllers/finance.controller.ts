import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { FinanceService } from '../services/finance.service';
import { ValidationError } from '../utils/errors';

const addFolioItemSchema = z.object({
  description: z.string().min(1),
  amount: z.number().positive(),
  quantity: z.number().min(1).optional()
});

const addPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(['CASH', 'MOBILE_MONEY', 'CREDIT_CARD']),
  reference: z.string().optional()
});

export class FinanceController {
  private financeService: FinanceService;

  constructor() {
    this.financeService = new FinanceService();
  }

  getFolios = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const folios = await this.financeService.getFolios();
      res.json({ success: true, data: folios });
    } catch (error) { next(error); }
  };

  getFolioById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = parseInt(String(req.params.id), 10);
      const folio = await this.financeService.getFolioById(id);
      res.json({ success: true, data: folio });
    } catch (error) { next(error); }
  };

  addFolioItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const folioId = parseInt(String(req.params.id), 10);
      const parsed = addFolioItemSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const item = await this.financeService.addFolioItem({ folioId, ...parsed.data });
      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  };

  addPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const folioId = parseInt(String(req.params.id), 10);
      const parsed = addPaymentSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const payment = await this.financeService.addPayment({ folioId, ...parsed.data });
      res.status(201).json({ success: true, data: payment });
    } catch (error) { next(error); }
  };

  generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const folioId = parseInt(String(req.params.id), 10);
      const invoice = await this.financeService.generateInvoice(folioId);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) { next(error); }
  };
}
