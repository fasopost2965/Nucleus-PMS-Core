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

router.get('/movements', async (req, res, next) => {
  try {
    const movements = await query(`SELECT * FROM stock_movements ORDER BY timestamp DESC`);
    res.json({ success: true, movements });
  } catch (error) {
    next(error);
  }
});

router.put('/stock/:id', async (req, res, next) => {
  try {
    const idParam = req.params.id;
    const allowedFields = ['current_stock', 'minimum_stock', 'supplier_id', 'name', 'unit', 'purchase_price', 'selling_price'];
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

    let whereClause = 'id = ?';
    let idValue: any = idParam;
    if (Number.isNaN(Number(idParam))) {
      whereClause = 'sku = ?';
      idValue = idParam;
    }

    params.push(idValue);
    await query(`UPDATE stock_items SET ${updates.join(', ')} WHERE ${whereClause}`, params);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/suppliers', async (req, res, next) => {
  try {
    const { company_name, contact_name, phone, email, address } = req.body;
    const result = await query(
      `INSERT INTO suppliers (company_name, contact_name, phone, email, address) VALUES (?, ?, ?, ?, ?)`,
      [company_name, contact_name || null, phone || null, email || null, address || null]
    );
    const [supplier] = await query(`SELECT * FROM suppliers WHERE id = ?`, [result.insertId]);
    res.status(201).json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
});

router.post('/movements', async (req, res, next) => {
  try {
    const { item_id, item_name, sku, quantity, from_location, to_location, staff_name, type } = req.body;
    let resolvedItemId = item_id;

    if (item_id && Number.isNaN(Number(item_id))) {
      const [item] = await query(`SELECT id FROM stock_items WHERE sku = ? LIMIT 1`, [item_id]);
      resolvedItemId = item?.id || null;
    }

    const result = await query(
      `INSERT INTO stock_movements (item_id, item_name, sku, quantity, from_location, to_location, staff_name, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [resolvedItemId, item_name, sku || null, quantity, from_location || null, to_location || null, staff_name || null, type || null]
    );
    res.status(201).json({ success: true, movementId: result.insertId });
  } catch (error) {
    next(error);
  }
});

export default router;
