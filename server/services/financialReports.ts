// Pure aggregation logic for the "Performances Financières" tab of
// Reports.tsx, extracted so it's unit-testable without a database. This is
// a deliberate simplification: reservations are grouped by their arrival
// month, not tracked night-by-night across month boundaries — a true
// occupancy calendar (a stay spanning two months split proportionally)
// would be a much larger feature. Good enough for a monthly performance
// overview, not a precise night-audit ledger.

export interface ReservationForReport {
  arrival_date: string;
  nights: number;
  total_amount: number;
  tax_amount: number;
  status: string;
}

export interface MonthlyPerformanceReport {
  period: string; // 'YYYY-MM'
  revenue: number;
  occupiedNights: number;
  occupancyRate: number; // 0-100, rounded
  taxCollected: number;
}

const EXCLUDED_STATUSES = ['Annulée'];

export function computeMonthlyPerformance(
  reservations: ReservationForReport[],
  totalRooms: number
): MonthlyPerformanceReport[] {
  const byMonth = new Map<string, { revenue: number; nights: number; tax: number }>();

  for (const r of reservations) {
    if (EXCLUDED_STATUSES.includes(r.status)) continue;
    const period = (r.arrival_date || '').slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(period)) continue;

    const entry = byMonth.get(period) || { revenue: 0, nights: 0, tax: 0 };
    entry.revenue += Number(r.total_amount) || 0;
    entry.nights += Number(r.nights) || 0;
    entry.tax += Number(r.tax_amount) || 0;
    byMonth.set(period, entry);
  }

  const reports: MonthlyPerformanceReport[] = [];
  for (const [period, data] of byMonth) {
    const [year, month] = period.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const availableRoomNights = totalRooms * daysInMonth;
    const occupancyRate = availableRoomNights > 0 ? Math.round((data.nights / availableRoomNights) * 100) : 0;

    reports.push({
      period,
      revenue: data.revenue,
      occupiedNights: data.nights,
      occupancyRate,
      taxCollected: data.tax
    });
  }

  return reports.sort((a, b) => b.period.localeCompare(a.period));
}
