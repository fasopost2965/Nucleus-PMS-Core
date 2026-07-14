import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const whereClause = q
      ? `WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?`
      : '';
    const params = q ? [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`] : [];

    const guests = await query(
      `SELECT id, first_name AS firstName, last_name AS lastName, email, phone, nationality FROM guests ${whereClause} ORDER BY last_name, first_name`,
      params
    );

    res.json({ success: true, guests });
  } catch (error) {
    next(error);
  }
});

export default router;
