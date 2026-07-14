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
      numberOfGuests,
      notes
    } = req.body;

    const reservationNumber = `RES-${Date.now()}`;
    const nights = Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)));

    const room = await query(`SELECT base_price FROM rooms WHERE id = ?`, [roomId]);
    const roomRate = Array.isArray(room) && room.length ? room[0].base_price : 0;
    const totalAmount = roomRate * nights;

    const result = await query(
      `INSERT INTO reservations (reservation_number, guest_id, room_id, booking_source_id, status, arrival_date, departure_date, adults, children, nights, room_rate, total_amount, balance, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reservationNumber,
        guestId,
        roomId,
        source,
        'Confirmée',
        checkInDate,
        checkOutDate,
        numberOfGuests,
        0,
        nights,
        roomRate,
        totalAmount,
        totalAmount,
        notes || null
      ]
    );

    res.status(201).json({ success: true, reservationId: result.insertId, status: 'confirmed' });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/check-in', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await query(`UPDATE reservations SET status = 'En séjour' WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Check-in enregistré avec succès', roomStatus: 'occupied', reservationStatus: 'checked_in' });
  } catch (error) {
    next(error);
  }
});

export default router;
