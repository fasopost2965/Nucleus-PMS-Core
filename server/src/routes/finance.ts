import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/invoices/:id', async (req, res, next) => {
  try {
    const invoiceId = Number(req.params.id);
    const [invoice] = await query(`SELECT * FROM invoices WHERE id = ?`, [invoiceId]);
    if (!invoice) {
      return res.status(404).json({ success: false, error: { message: 'Facture introuvable' } });
    }
    const items = await query(`SELECT * FROM invoice_items WHERE invoice_id = ?`, [invoiceId]);
    res.json({ success: true, invoice, items });
  } catch (error) {
    next(error);
  }
});

router.get('/invoices', async (req, res, next) => {
  try {
    const invoices = await query(`SELECT * FROM invoices ORDER BY created_at DESC`);
    res.json({ success: true, invoices });
  } catch (error) {
    next(error);
  }
});

router.get('/payments', async (req, res, next) => {
  try {
    const payments = await query(`SELECT * FROM payments ORDER BY payment_date DESC`);
    res.json({ success: true, payments });
  } catch (error) {
    next(error);
  }
});

export default router;
