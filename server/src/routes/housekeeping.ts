import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await query(`SELECT ht.*, r.room_number FROM housekeeping_tasks ht LEFT JOIN rooms r ON ht.room_id = r.id ORDER BY ht.scheduled_time DESC`);
    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

router.post('/tasks', async (req, res, next) => {
  try {
    const { roomId, employeeId, priority, status, scheduledTime, notes } = req.body;
    const result = await query(
      `INSERT INTO housekeeping_tasks (room_id, employee_id, priority, status, scheduled_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [roomId, employeeId || null, priority || 'Normale', status || 'À nettoyer', scheduledTime || null, notes || null]
    );
    res.status(201).json({ success: true, taskId: result.insertId });
  } catch (error) {
    next(error);
  }
});

export default router;
