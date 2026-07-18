import { describe, it, expect } from 'vitest';
import {
  hasOverlappingReservation,
  computeNights,
  computeReservationPricing,
  ROOM_BLOCKING_STATUSES,
  HOTEL_TAX_RATE
} from './reservationPricing';

describe('computeNights', () => {
  it('computes whole nights between two dates', () => {
    expect(computeNights(new Date('2026-08-01'), new Date('2026-08-04'))).toBe(3);
  });

  it('computes a single night stay', () => {
    expect(computeNights(new Date('2026-08-01'), new Date('2026-08-02'))).toBe(1);
  });
});

describe('computeReservationPricing', () => {
  it('computes subtotal, tax and total from the room base price and nights (no client override)', () => {
    const result = computeReservationPricing({ basePrice: 35000, nights: 3 });
    const expectedSubtotal = 35000 * 3;
    const expectedTax = Math.round(expectedSubtotal * HOTEL_TAX_RATE);

    expect(result.room_rate).toBe(35000);
    expect(result.nights).toBe(3);
    expect(result.tax_amount).toBe(expectedTax);
    expect(result.total_amount).toBe(expectedSubtotal + expectedTax);
    expect(result.balance).toBe(result.total_amount);
  });

  it('falls back to the default rate when the room has no usable base price', () => {
    const result = computeReservationPricing({ basePrice: 0, nights: 2 });
    expect(result.room_rate).toBe(35000);
  });

  it('applies a discount before computing tax and total', () => {
    const result = computeReservationPricing({ basePrice: 10000, nights: 2, discount: 5000 });
    // subtotal = 20000, discount = 5000 -> taxable base = 15000
    expect(result.discount).toBe(5000);
    expect(result.tax_amount).toBe(Math.round(15000 * HOTEL_TAX_RATE));
    expect(result.total_amount).toBe(15000 + result.tax_amount);
  });

  it('clamps a discount larger than the subtotal instead of trusting the client', () => {
    const result = computeReservationPricing({ basePrice: 10000, nights: 1, discount: 999999 });
    expect(result.discount).toBe(10000); // clamped to subtotal
    expect(result.total_amount).toBe(0);
  });

  it('rejects a negative discount from the client', () => {
    const result = computeReservationPricing({ basePrice: 10000, nights: 1, discount: -500 });
    expect(result.discount).toBe(0);
  });

  it('clamps a deposit larger than the total instead of producing a negative balance', () => {
    const result = computeReservationPricing({ basePrice: 10000, nights: 1, deposit: 999999 });
    expect(result.deposit).toBe(result.total_amount);
    expect(result.balance).toBe(0);
  });

  it('rejects a negative deposit from the client', () => {
    const result = computeReservationPricing({ basePrice: 10000, nights: 1, deposit: -100 });
    expect(result.deposit).toBe(0);
  });
});

describe('hasOverlappingReservation', () => {
  const existing = [
    { room_id: 'room-1', status: 'Confirmée', arrival_date: '2026-08-10', departure_date: '2026-08-15' },
    { room_id: 'room-2', status: 'Terminée', arrival_date: '2026-08-10', departure_date: '2026-08-15' }
  ];

  it('detects a fully overlapping stay on the same room', () => {
    expect(
      hasOverlappingReservation(existing, 'room-1', new Date('2026-08-12'), new Date('2026-08-13'))
    ).toBe(true);
  });

  it('detects a partial overlap (new stay starts before, ends inside)', () => {
    expect(
      hasOverlappingReservation(existing, 'room-1', new Date('2026-08-08'), new Date('2026-08-11'))
    ).toBe(true);
  });

  it('allows a back-to-back stay starting exactly on the existing checkout date', () => {
    expect(
      hasOverlappingReservation(existing, 'room-1', new Date('2026-08-15'), new Date('2026-08-18'))
    ).toBe(false);
  });

  it('ignores a different room entirely', () => {
    expect(
      hasOverlappingReservation(existing, 'room-3', new Date('2026-08-12'), new Date('2026-08-13'))
    ).toBe(false);
  });

  it('ignores reservations in a non-blocking status (e.g. cancelled/checked-out)', () => {
    expect(
      hasOverlappingReservation(existing, 'room-2', new Date('2026-08-12'), new Date('2026-08-13'))
    ).toBe(false);
  });

  it('exposes exactly the two statuses that block a room', () => {
    expect(ROOM_BLOCKING_STATUSES).toEqual(['Confirmée', 'En séjour']);
  });
});
