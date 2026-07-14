import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/stock', async (req, res, next) => {
  try {
    const stockItems = await query(`SELECT si.*, s.company_name AS supplier_name FROM stock_items si LEFT JOIN suppliers s ON si.supplier_id = s.id ORDER BY si.name`);
    res.json({ success: true, stockItems });
  } catch (error) {
    next(error);
  }
});

router.get('/suppliers', async (req, res, next) => {
  try {
    const suppliers = await query(`SELECT * FROM suppliers ORDER BY company_name`);
    res.json({ success: true, suppliers });
  } catch (error) {
    next(error);
  }
});

router.get('/rooms', async (req, res, next) => {
  try {
    const rooms = await query(`SELECT id, room_number, floor, active FROM rooms ORDER BY room_number`);
    res.json({ success: true, rooms });
  } catch (error) {
    next(error);
  }
});

export default router;
