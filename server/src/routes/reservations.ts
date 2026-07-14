import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const reservations = await query(
      `SELECT r.*, g.first_name AS guest_first_name, g.last_name AS guest_last_name, rm.room_number
       FROM reservations r
       LEFT JOIN guests g ON r.guest_id = g.id
       LEFT JOIN rooms rm ON r.room_id = rm.id
       ORDER BY r.arrival_date DESC`
    );
    res.json({ success: true, reservations });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      guestId,
      roomId,
      source,
      checkInDate,
      checkOutDate,
      adults = 1,
      children = 0,
      nights,
      discount = 0,
      deposit = 0,
      notes
    } = req.body;

    const reservationNumber = `RES-${Date.now()}`;
    const computedNights = nights ?? Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)));

    const room = await query(`SELECT price_per_night FROM rooms WHERE id = ?`, [roomId]);
    const roomRate = Array.isArray(room) && room.length ? room[0].price_per_night : 0;
    const subtotal = roomRate * computedNights;
    const taxAmount = Math.round(subtotal * 0.05);
    const totalAmount = subtotal - Number(discount) + taxAmount;
    const balance = totalAmount - Number(deposit);

    const result = await query(
      `INSERT INTO reservations (reservation_number, guest_id, room_id, booking_source_id, status, arrival_date, departure_date, adults, children, nights, room_rate, discount, tax_amount, total_amount, deposit, balance, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reservationNumber,
        guestId,
        roomId,
        source,
        'Confirmée',
        checkInDate,
        checkOutDate,
        adults,
        children,
        computedNights,
        roomRate,
        Number(discount),
        taxAmount,
        totalAmount,
        Number(deposit),
        balance,
        notes || null
      ]
    );

    await query(`UPDATE rooms SET current_status = ? WHERE id = ?`, ['Réservée', roomId]);

    const [reservation] = await query(
      `SELECT r.*, g.first_name AS guest_first_name, g.last_name AS guest_last_name, rm.room_number
       FROM reservations r
       LEFT JOIN guests g ON r.guest_id = g.id
       LEFT JOIN rooms rm ON r.room_id = rm.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, reservation });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/check-in', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reservation = await query(`SELECT * FROM reservations WHERE id = ?`, [id]);
    if (!Array.isArray(reservation) || reservation.length === 0) {
      return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
    }

    await query(`UPDATE reservations SET status = 'En séjour' WHERE id = ?`, [id]);
    await query(`UPDATE rooms SET current_status = ? WHERE id = ?`, ['Occupée', reservation[0].room_id]);

    res.json({ success: true, message: 'Check-in enregistré avec succès', roomStatus: 'Occupée', reservationStatus: 'En séjour' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/check-out', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reservation = await query(`SELECT * FROM reservations WHERE id = ?`, [id]);
    if (!Array.isArray(reservation) || reservation.length === 0) {
      return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
    }

    await query(`UPDATE reservations SET status = 'Terminée' WHERE id = ?`, [id]);
    await query(`UPDATE rooms SET current_status = ? WHERE id = ?`, ['Disponible', reservation[0].room_id]);

    res.json({ success: true, message: 'Check-out enregistré avec succès', roomStatus: 'Disponible', reservationStatus: 'Terminée' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reservation = await query(`SELECT * FROM reservations WHERE id = ?`, [id]);
    if (!Array.isArray(reservation) || reservation.length === 0) {
      return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
    }

    await query(`UPDATE reservations SET status = 'Annulée' WHERE id = ?`, [id]);
    await query(`UPDATE rooms SET current_status = ? WHERE id = ?`, ['Disponible', reservation[0].room_id]);

    res.json({ success: true, message: 'Réservation annulée.', reservationStatus: 'Annulée' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const reservation = await query(`SELECT * FROM reservations WHERE id = ?`, [id]);
    if (!Array.isArray(reservation) || reservation.length === 0) {
      return res.status(404).json({ success: false, error: 'Réservation introuvable.' });
    }

    await query(`DELETE FROM reservations WHERE id = ?`, [id]);
    await query(`UPDATE rooms SET current_status = ? WHERE id = ?`, ['Disponible', reservation[0].room_id]);

    res.json({ success: true, message: 'Réservation supprimée.' });
  } catch (error) {
    next(error);
  }
});

export default router;
