import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  };
}
