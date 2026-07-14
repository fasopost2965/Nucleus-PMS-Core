import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [settings] = await query(`SELECT * FROM hotels LIMIT 1`);
    res.json({ success: true, settings: settings || null });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const {
      name,
      legalName,
      phone,
      email,
      website,
      address,
      defaultCurrency,
      tvaRate,
      touristTaxEnabled,
      touristTaxAmount
    } = req.body;

    const [existing] = await query(`SELECT id FROM hotels LIMIT 1`);
    if (!existing) {
      await query(
        `INSERT INTO hotels (name, legal_name, phone, email, website, address, default_currency, tva_rate, tourist_tax_enabled, tourist_tax_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, legalName, phone, email, website, address, defaultCurrency, tvaRate, touristTaxEnabled ? 1 : 0, touristTaxAmount]
      );
    } else {
      await query(
        `UPDATE hotels SET name = ?, legal_name = ?, phone = ?, email = ?, website = ?, address = ?, default_currency = ?, tva_rate = ?, tourist_tax_enabled = ?, tourist_tax_amount = ? WHERE id = ?`,
        [name, legalName, phone, email, website, address, defaultCurrency, tvaRate, touristTaxEnabled ? 1 : 0, touristTaxAmount, existing.id]
      );
    }

    res.json({ success: true, message: 'Paramètres mis à jour avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;
