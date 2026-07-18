import { describe, it, expect } from 'vitest';
import { computeMonthlyPerformance } from './financialReports';

describe('computeMonthlyPerformance', () => {
  it('groups reservations by arrival month and sums revenue/nights/tax', () => {
    const reservations = [
      { arrival_date: '2026-07-05', nights: 3, total_amount: 90000, tax_amount: 4500, status: 'Confirmée' },
      { arrival_date: '2026-07-20', nights: 2, total_amount: 60000, tax_amount: 3000, status: 'En séjour' },
      { arrival_date: '2026-06-10', nights: 1, total_amount: 35000, tax_amount: 1750, status: 'Terminée' }
    ];

    const reports = computeMonthlyPerformance(reservations, 10);

    expect(reports).toHaveLength(2);
    const july = reports.find(r => r.period === '2026-07');
    expect(july).toMatchObject({ revenue: 150000, occupiedNights: 5, taxCollected: 7500 });
  });

  it('excludes cancelled reservations from the aggregation', () => {
    const reservations = [
      { arrival_date: '2026-07-05', nights: 3, total_amount: 90000, tax_amount: 4500, status: 'Annulée' }
    ];

    const reports = computeMonthlyPerformance(reservations, 10);
    expect(reports).toHaveLength(0);
  });

  it('ignores reservations with a missing or malformed arrival date instead of crashing', () => {
    const reservations = [
      { arrival_date: '', nights: 3, total_amount: 90000, tax_amount: 4500, status: 'Confirmée' },
      { arrival_date: 'not-a-date', nights: 1, total_amount: 1000, tax_amount: 50, status: 'Confirmée' }
    ];

    const reports = computeMonthlyPerformance(reservations, 10);
    expect(reports).toHaveLength(0);
  });

  it('computes occupancy rate as occupied nights over total available room-nights in the month', () => {
    // 10 rooms * 31 days in July = 310 available room-nights; 31 occupied -> 10%
    const reservations = [
      { arrival_date: '2026-07-01', nights: 31, total_amount: 100000, tax_amount: 5000, status: 'Confirmée' }
    ];

    const reports = computeMonthlyPerformance(reservations, 10);
    expect(reports[0].occupancyRate).toBe(10);
  });

  it('returns 0% occupancy instead of dividing by zero when there are no rooms', () => {
    const reservations = [
      { arrival_date: '2026-07-01', nights: 5, total_amount: 50000, tax_amount: 2500, status: 'Confirmée' }
    ];

    const reports = computeMonthlyPerformance(reservations, 0);
    expect(reports[0].occupancyRate).toBe(0);
  });

  it('sorts reports from most recent period to oldest', () => {
    const reservations = [
      { arrival_date: '2026-05-01', nights: 1, total_amount: 1000, tax_amount: 50, status: 'Confirmée' },
      { arrival_date: '2026-07-01', nights: 1, total_amount: 1000, tax_amount: 50, status: 'Confirmée' },
      { arrival_date: '2026-06-01', nights: 1, total_amount: 1000, tax_amount: 50, status: 'Confirmée' }
    ];

    const reports = computeMonthlyPerformance(reservations, 10);
    expect(reports.map(r => r.period)).toEqual(['2026-07', '2026-06', '2026-05']);
  });
});
