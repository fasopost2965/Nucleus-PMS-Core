import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ReportService } from '../services/report.service';
import { ValidationError } from '../utils/errors';

const reportQuerySchema = z.object({
  startDate: z.string().refine(v => !isNaN(Date.parse(v)), { message: "Invalid date format" }),
  endDate: z.string().refine(v => !isNaN(Date.parse(v)), { message: "Invalid date format" })
});

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  getFinancialReportCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = reportQuerySchema.safeParse(req.query);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const csv = await this.reportService.getFinancialReportCsv(new Date(parsed.data.startDate), new Date(parsed.data.endDate));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=financial_report_${parsed.data.startDate}_${parsed.data.endDate}.csv`);
      res.status(200).send(csv);
    } catch (error) { next(error); }
  };

  getOccupancyReportCsv = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = reportQuerySchema.safeParse(req.query);
      if (!parsed.success) throw new ValidationError('Validation échouée', parsed.error.flatten().fieldErrors);
      
      const csv = await this.reportService.getOccupancyReportCsv(new Date(parsed.data.startDate), new Date(parsed.data.endDate));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=occupancy_report_${parsed.data.startDate}_${parsed.data.endDate}.csv`);
      res.status(200).send(csv);
    } catch (error) { next(error); }
  };
}
