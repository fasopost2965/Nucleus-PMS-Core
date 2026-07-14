import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/tickets', async (req, res, next) => {
  try {
    const tickets = await query(`SELECT mt.*, r.room_number FROM maintenance_tickets mt LEFT JOIN rooms r ON mt.room_id = r.id ORDER BY mt.created_at DESC`);
    res.json({ success: true, tickets });
  } catch (error) {
    next(error);
  }
});

router.post('/tickets', async (req, res, next) => {
  try {
    const { roomId, category, priority, description, assignedTo, estimatedCost } = req.body;
    const result = await query(
      `INSERT INTO maintenance_tickets (room_id, category, priority, description, assigned_to, estimated_cost, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Signalé')`,
      [roomId, category, priority || 'Normale', description, assignedTo || null, estimatedCost || null]
    );
    res.status(201).json({ success: true, ticketId: result.insertId });
  } catch (error) {
    next(error);
  }
});

export default router;
