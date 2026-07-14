import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/employees', async (req, res, next) => {
  try {
    const employees = await query(`SELECT * FROM hrms_employees ORDER BY last_name, first_name`);
    res.json({ success: true, employees });
  } catch (error) {
    next(error);
  }
});

router.get('/departments', async (req, res, next) => {
  try {
    const departments = await query(`SELECT * FROM hrms_departments ORDER BY name`);
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
});

router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await query(`SELECT * FROM hrms_jobs ORDER BY title`);
    res.json({ success: true, jobs });
  } catch (error) {
    next(error);
  }
});

router.get('/teams', async (req, res, next) => {
  try {
    const teams = await query(`SELECT * FROM hrms_teams ORDER BY name`);
    res.json({ success: true, teams });
  } catch (error) {
    next(error);
  }
});

router.get('/contracts', async (req, res, next) => {
  try {
    const contracts = await query(`SELECT * FROM hrms_contracts ORDER BY created_at DESC`);
    res.json({ success: true, contracts });
  } catch (error) {
    next(error);
  }
});

router.get('/payroll-rules', async (req, res, next) => {
  try {
    const payrollRules = await query(`SELECT * FROM hrms_payroll_rules ORDER BY name`);
    res.json({ success: true, payrollRules });
  } catch (error) {
    next(error);
  }
});

router.get('/business-events', async (req, res, next) => {
  try {
    const businessEvents = await query(`SELECT * FROM hrms_business_events ORDER BY timestamp DESC LIMIT 100`);
    res.json({ success: true, businessEvents });
  } catch (error) {
    next(error);
  }
});

export default router;
