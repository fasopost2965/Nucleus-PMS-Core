import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SettingsService } from '../services/settings.service';
import { ValidationError } from '../utils/errors';

const updateSettingsSchema = z.object({
  currency: z.string().min(3).max(3).optional(),
  timezone: z.string().min(1).optional(),
  vatRate: z.number().min(0).max(100).optional(),
  tourismTaxRate: z.number().min(0).optional(),
  invoicePrefix: z.string().min(1).max(10).optional(),
});

export class SettingsController {
  private settingsService: SettingsService;

  constructor() {
    this.settingsService = new SettingsService();
  }

  getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await this.settingsService.getSettings();
      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = updateSettingsSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        throw new ValidationError('Validation échouée', parseResult.error.flatten().fieldErrors);
      }

      const updatedSettings = await this.settingsService.updateSettings(parseResult.data);
      
      res.status(200).json({
        success: true,
        data: updatedSettings,
      });
    } catch (error) {
      next(error);
    }
  };
}
