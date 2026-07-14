import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;

    const filters: string[] = [];
    const params: any[] = [];

    if (status) {
      filters.push('status = ?');
      params.push(status);
    }

    if (category) {
      filters.push('category = ?');
      params.push(category);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const rooms = await query(
      `SELECT id, room_number AS roomNumber, floor, status, category, price_per_night AS pricePerNight FROM rooms ${whereClause} ORDER BY room_number`,
      params
    );

    res.json({ success: true, rooms });
  } catch (error) {
    next(error);
  }
});

export default router;
