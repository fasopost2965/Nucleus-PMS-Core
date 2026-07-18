// Pure pricing/overlap logic for reservation creation, extracted out of
// server/routes/api.ts so the trust-boundary fix (never let the client
// dictate total_amount/balance/status) is unit-testable without touching
// the database layer. Mirrors the simulated formula used client-side in
// src/pages/Reservations.tsx (subtotal = rate * nights, 5% hotel tax).

export const ROOM_BLOCKING_STATUSES = ['Confirmée', 'En séjour'];
export const HOTEL_TAX_RATE = 0.05;

export interface ExistingReservationLike {
  room_id: string;
  status: string;
  arrival_date: string;
  departure_date: string;
}

/**
 * True if `roomId` already has an active (blocking) reservation whose stay
 * overlaps [arrivalDate, departureDate).
 */
export function hasOverlappingReservation(
  existing: ExistingReservationLike[],
  roomId: string,
  arrivalDate: Date,
  departureDate: Date
): boolean {
  return existing.some((r) => {
    if (r.room_id !== roomId || !ROOM_BLOCKING_STATUSES.includes(r.status)) return false;
    const existingArr = new Date(r.arrival_date);
    const existingDep = new Date(r.departure_date);
    return arrivalDate < existingDep && departureDate > existingArr;
  });
}

export function computeNights(arrivalDate: Date, departureDate: Date): number {
  return Math.round((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));
}

export interface ReservationPricingInput {
  basePrice: number;
  nights: number;
  discount?: number;
  deposit?: number;
}

export interface ReservationPricingResult {
  nights: number;
  room_rate: number;
  discount: number;
  tax_amount: number;
  total_amount: number;
  deposit: number;
  balance: number;
}

/**
 * Computes the full price breakdown from trusted server-side inputs only
 * (the room's catalog price and the stay length). `discount`/`deposit` are
 * operator-entered amounts and are clamped so they can never push the
 * total/balance negative or exceed what was actually charged.
 */
export function computeReservationPricing(input: ReservationPricingInput): ReservationPricingResult {
  const rate = Number(input.basePrice) || 35000;
  const nights = input.nights;
  const subtotal = rate * nights;
  const safeDiscount = Math.max(0, Math.min(Number(input.discount) || 0, subtotal));
  const taxAmount = Math.round((subtotal - safeDiscount) * HOTEL_TAX_RATE);
  const totalAmount = subtotal - safeDiscount + taxAmount;
  const safeDeposit = Math.max(0, Math.min(Number(input.deposit) || 0, totalAmount));

  return {
    nights,
    room_rate: rate,
    discount: safeDiscount,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    deposit: safeDeposit,
    balance: totalAmount - safeDeposit
  };
}
