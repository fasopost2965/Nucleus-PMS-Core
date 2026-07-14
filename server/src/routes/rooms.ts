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
      `SELECT id, room_number AS room_number, floor, status, category, category_id, housekeeping_status, maintenance_status, price_per_night AS pricePerNight FROM rooms ${whereClause} ORDER BY room_number`,
      params
    );

    res.json({ success: true, rooms });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const allowedFields = ['housekeeping_status', 'current_status', 'maintenance_status', 'notes', 'active'];
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(req.body).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'Aucun champ de mise à jour valide fourni.' });
    }

    params.push(id);
    await query(`UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
