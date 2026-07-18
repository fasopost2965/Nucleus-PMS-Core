import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { generateToken } from '../config/jwt';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

const ADMIN_ROLES = ['Super Administrateur', 'Directeur'];

const router = Router();

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email et mot de passe requis.', code: 'BAD_REQUEST' }
      });
    }

    const users = await db.getCollection('users');
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Identifiants invalides.', code: 'INVALID_CREDENTIALS' }
      });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: { message: 'Identifiants de connexion incorrects.', code: 'INVALID_CREDENTIALS' }
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role || 'Super Administrateur',
      name: `${user.first_name} ${user.last_name}`
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role || 'Super Administrateur'
      }
    });
  } catch (err) {
    next(err);
  }
});

// Apply JWT Authentication middleware to all remaining endpoints
router.use(authMiddleware as any);

// ==========================================
// 2. DASHBOARD KPI ENDPOINT
// ==========================================

router.get('/dashboard', async (req: AuthenticatedRequest, res, next) => {
  try {
    const rooms = await db.getCollection('rooms');
    const reservations = await db.getCollection('reservations');
    const tickets = await db.getCollection('maintenance_tickets');
    const tasks = await db.getCollection('housekeeping_tasks');

    // Counts
    const totalRooms = rooms.length;
    const occupiedCount = rooms.filter((r: any) => r.current_status === 'Occupée').length;
    const availableCount = rooms.filter((r: any) => r.current_status === 'Disponible' || r.current_status === 'Libre').length;
    const dirtyCount = rooms.filter((r: any) => r.housekeeping_status === 'À nettoyer' || r.current_status === 'Nettoyage').length;
    const maintenanceCount = rooms.filter((r: any) => r.current_status === 'Maintenance' || r.maintenance_status === 'Signalé').length;

    // Financial KPI
    const totalRevenueToday = reservations.reduce((acc: number, r: any) => {
      if (r.status === 'En séjour' || r.status === 'Terminée') {
        return acc + Number(r.room_rate || 0);
      }
      return acc;
    }, 0);

    const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        occupancyRate,
        occupiedRooms: occupiedCount,
        availableRooms: availableCount,
        dirtyRooms: dirtyCount,
        maintenanceRooms: maintenanceCount,
        revenueToday: totalRevenueToday,
        arrivalsCount: reservations.filter((r: any) => r.status === 'Confirmée').length,
        departuresCount: reservations.filter((r: any) => r.status === 'En séjour').length,
        restaurantOrdersOpen: 0,
        criticalStockAlerts: 1,
        urgentMaintenanceTickets: tickets.filter((t: any) => t.priority === 'Haute' || t.priority === 'Critique').length
      }
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. ROOM ENDPOINTS
// ==========================================

router.get('/rooms', async (req, res, next) => {
  try {
    const rooms = await db.getCollection('rooms');
    const categories = await db.getCollection('room_categories');
    
    // Dynamic join categories
    const roomsWithCat = rooms.map((r: any) => {
      const cat = categories.find((c: any) => c.id === r.category_id);
      return {
        ...r,
        category: cat ? cat.name : 'Standard'
      };
    });

    return res.status(200).json({
      success: true,
      rooms: roomsWithCat
    });
  } catch (err) {
    next(err);
  }
});

router.post('/rooms', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { room_number, category_id, floor, capacity, bed_type, area, base_price, amenities, notes } = req.body;
    
    if (!room_number || !category_id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Le numéro de chambre et la catégorie sont requis.', code: 'BAD_REQUEST' }
      });
    }

    const rooms = await db.getCollection('rooms');
    if (rooms.some((r: any) => r.room_number === room_number)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Une chambre portant ce numéro existe déjà.', code: 'ROOM_EXISTS' }
      });
    }

    const newRoom = {
      id: `room-${Date.now()}`,
      room_number,
      category_id,
      floor: floor || '1er Étage',
      capacity: Number(capacity) || 2,
      bed_type: bed_type || 'Lit Double',
      area: Number(area) || 20,
      base_price: Number(base_price) || 35000,
      amenities: amenities || [],
      notes: notes || '',
      active: true,
      prices: [],
      current_status: 'Disponible',
      housekeeping_status: 'Disponible',
      maintenance_status: 'Résolu',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: req.user?.name || 'Administrateur',
      updated_by: req.user?.name || 'Administrateur'
    };

    const inserted = await db.insert('rooms', newRoom);
    return res.status(201).json({ success: true, room: inserted });
  } catch (err) {
    next(err);
  }
});

router.put('/rooms/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db.update('rooms', id, {
      ...req.body,
      updated_by: req.user?.name || 'Administrateur'
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'Chambre introuvable.' } });
    }

    return res.status(200).json({ success: true, room: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/rooms/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const success = await db.delete('rooms', id);
    if (!success) {
      return res.status(404).json({ success: false, error: { message: 'Chambre introuvable.' } });
    }
    return res.status(200).json({ success: true, message: 'Chambre retirée du référentiel.' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. GUEST ENDPOINTS
// ==========================================

router.get('/guests', async (req, res, next) => {
  try {
    const guests = await db.getCollection('guests');
    return res.status(200).json({ success: true, guests });
  } catch (err) {
    next(err);
  }
});

router.post('/guests', async (req, res, next) => {
  try {
    const newGuest = {
      id: `guest-${Date.now()}`,
      ...req.body,
      vip: req.body.vip || false,
      blacklist: req.body.blacklist || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const inserted = await db.insert('guests', newGuest);
    return res.status(201).json({ success: true, guest: inserted });
  } catch (err) {
    next(err);
  }
});

router.put('/guests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db.update('guests', id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'Client introuvable.' } });
    }
    return res.status(200).json({ success: true, guest: updated });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. RESERVATION ENDPOINTS
// ==========================================

router.get('/reservations', async (req, res, next) => {
  try {
    const reservations = await db.getCollection('reservations');
    return res.status(200).json({ success: true, reservations });
  } catch (err) {
    next(err);
  }
});

router.post('/reservations', async (req, res, next) => {
  try {
    const { guest_id, room_id, arrival_date, departure_date, room_rate } = req.body;
    if (!guest_id || !room_id || !arrival_date || !departure_date) {
      return res.status(400).json({ success: false, error: { message: 'Champs obligatoires manquants.' } });
    }

    const newRes = {
      id: `res-${Date.now()}`,
      reservation_number: `RES-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Confirmée',
      adults: 1,
      children: 0,
      discount: 0,
      tax_amount: 0,
      deposit: 0,
      balance: Number(room_rate || 35000),
      total_amount: Number(room_rate || 35000),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const inserted = await db.insert('reservations', newRes);
    
    // Auto update room status to reserved
    await db.update('rooms', room_id, { current_status: 'Réservée' });

    return res.status(201).json({ success: true, reservation: inserted });
  } catch (err) {
    next(err);
  }
});

router.post('/reservations/:id/check-in', async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await db.getById('reservations', id);
    if (!reservation) {
      return res.status(404).json({ success: false, error: { message: 'Réservation introuvable.' } });
    }

    await db.update('reservations', id, { status: 'En séjour' });
    await db.update('rooms', reservation.room_id, { current_status: 'Occupée' });

    return res.status(200).json({
      success: true,
      message: 'Check-in enregistré avec succès',
      roomStatus: 'Occupée',
      reservationStatus: 'En séjour'
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 6. FINANCE & BILLING ENDPOINTS
// ==========================================

router.get('/finance/invoices', async (req, res, next) => {
  try {
    const invoices = await db.getCollection('invoices');
    return res.status(200).json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
});

router.get('/finance/invoices/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await db.getById('invoices', id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: { message: 'Folio introuvable.' } });
    }
    return res.status(200).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
});

router.post('/finance/payments', async (req: AuthenticatedRequest, res, next) => {
  try {
    const newPayment = {
      id: `pay-${Date.now()}`,
      ...req.body,
      payment_date: new Date().toISOString(),
      cashier_id: req.user?.name || 'Caissier',
      status: 'Validé'
    };
    const inserted = await db.insert('payments', newPayment);
    return res.status(201).json({ success: true, payment: inserted });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 7. HRMS (HUMAN RESOURCES) ENDPOINTS
// ==========================================

// 7.1 Employees
router.get('/hrms/employees', async (req, res, next) => {
  try {
    const employees = await db.getCollection('hrms_employees');
    return res.status(200).json({ success: true, employees });
  } catch (err) {
    next(err);
  }
});

router.post('/hrms/employees', async (req: AuthenticatedRequest, res, next) => {
  try {
    const employees = await db.getCollection('hrms_employees');
    const newEmployee = {
      id: `emp-${Date.now()}`,
      hotel_id: 1,
      employee_code: `EMP-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'active',
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const inserted = await db.insert('hrms_employees', newEmployee);

    // Business Event dispatch simulation
    const newEvent = {
      id: `evt-${Date.now()}`,
      hotel_id: 1,
      timestamp: new Date().toISOString(),
      event_type: 'EmployeeCreated',
      actor_name: req.user?.name || 'Système RH',
      description: `Création de la fiche employé ${newEmployee.first_name} ${newEmployee.last_name}.`
    };
    await db.insert('hrms_business_events', newEvent);

    return res.status(201).json({ success: true, employee: inserted });
  } catch (err) {
    next(err);
  }
});

router.put('/hrms/employees/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db.update('hrms_employees', id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'Employé introuvable.' } });
    }
    return res.status(200).json({ success: true, employee: updated });
  } catch (err) {
    next(err);
  }
});

// 7.2 Departments
router.get('/hrms/departments', async (req, res, next) => {
  try {
    const departments = await db.getCollection('hrms_departments');
    return res.status(200).json({ success: true, departments });
  } catch (err) {
    next(err);
  }
});

router.post('/hrms/departments', async (req, res, next) => {
  try {
    const newDept = {
      id: `dept-${Date.now()}`,
      hotel_id: 1,
      ...req.body,
      created_at: new Date().toISOString()
    };
    const inserted = await db.insert('hrms_departments', newDept);
    return res.status(201).json({ success: true, department: inserted });
  } catch (err) {
    next(err);
  }
});

// 7.3 Jobs
router.get('/hrms/jobs', async (req, res, next) => {
  try {
    const jobs = await db.getCollection('hrms_jobs');
    return res.status(200).json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
});

router.post('/hrms/jobs', async (req, res, next) => {
  try {
    const newJob = {
      id: `job-${Date.now()}`,
      hotel_id: 1,
      ...req.body,
      created_at: new Date().toISOString()
    };
    const inserted = await db.insert('hrms_jobs', newJob);
    return res.status(201).json({ success: true, job: inserted });
  } catch (err) {
    next(err);
  }
});

// 7.4 Teams
router.get('/hrms/teams', async (req, res, next) => {
  try {
    const teams = await db.getCollection('hrms_teams');
    return res.status(200).json({ success: true, teams });
  } catch (err) {
    next(err);
  }
});

router.post('/hrms/teams', async (req, res, next) => {
  try {
    const newTeam = {
      id: `team-${Date.now()}`,
      hotel_id: 1,
      ...req.body,
      created_at: new Date().toISOString()
    };
    const inserted = await db.insert('hrms_teams', newTeam);
    return res.status(201).json({ success: true, team: inserted });
  } catch (err) {
    next(err);
  }
});

// 7.5 Contracts
router.get('/hrms/contracts', async (req, res, next) => {
  try {
    const contracts = await db.getCollection('hrms_contracts');
    return res.status(200).json({ success: true, contracts });
  } catch (err) {
    next(err);
  }
});

router.post('/hrms/contracts', async (req, res, next) => {
  try {
    const newContract = {
      id: `contract-${Date.now()}`,
      hotel_id: 1,
      currency: 'XOF',
      status: 'active',
      signature_status: 'unsigned',
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const inserted = await db.insert('hrms_contracts', newContract);
    return res.status(201).json({ success: true, contract: inserted });
  } catch (err) {
    next(err);
  }
});

router.put('/hrms/contracts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db.update('hrms_contracts', id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'Contrat introuvable.' } });
    }
    return res.status(200).json({ success: true, contract: updated });
  } catch (err) {
    next(err);
  }
});

// 7.6 Onboarding tasks
router.get('/hrms/onboarding-tasks', async (req, res, next) => {
  try {
    const tasks = await db.getCollection('hrms_onboarding_tasks');
    return res.status(200).json({ success: true, onboardingTasks: tasks });
  } catch (err) {
    next(err);
  }
});

router.put('/hrms/onboarding-tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db.update('hrms_onboarding_tasks', id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'Tâche introuvable.' } });
    }
    return res.status(200).json({ success: true, onboardingTask: updated });
  } catch (err) {
    next(err);
  }
});

// 7.7 Skills
router.get('/hrms/skills', async (req, res, next) => {
  try {
    const skills = await db.getCollection('hrms_skills');
    return res.status(200).json({ success: true, skills });
  } catch (err) {
    next(err);
  }
});

// 7.8 Employee Skills
router.get('/hrms/employee-skills', async (req, res, next) => {
  try {
    const employeeSkills = await db.getCollection('hrms_employee_skills');
    return res.status(200).json({ success: true, employeeSkills });
  } catch (err) {
    next(err);
  }
});

// 7.9 Payroll Rules
router.get('/hrms/payroll-rules', async (req, res, next) => {
  try {
    const rules = await db.getCollection('hrms_payroll_rules');
    return res.status(200).json({ success: true, payrollRules: rules });
  } catch (err) {
    next(err);
  }
});

// 7.10 Business Events
router.get('/hrms/business-events', async (req, res, next) => {
  try {
    const events = await db.getCollection('hrms_business_events');
    return res.status(200).json({ success: true, businessEvents: events });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 8. SYSTEM MAINTENANCE ENDPOINTS (PURGE & SEED)
// ==========================================
import { getInitialSeedData, writeDB, readDB } from '../config/db';

router.post('/system/purge', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const currentData = readDB();
    
    // Create a blank data structure keeping only critical system parameters
    const purgedData = {
      ...getInitialSeedData(),
      rooms: [],
      reservations: [],
      guests: [],
      invoices: [],
      payments: [],
      housekeeping_tasks: [],
      maintenance_tickets: [],
      stock_items: [],
      stock_movements: [],
      restaurant_orders: [],
      hrms_employees: [],
      hrms_contracts: [],
      hrms_onboarding_tasks: [],
      hrms_business_events: [],
      audit_logs: [],
      hrms_departments: [],
      hrms_teams: [],
      hrms_jobs: []
    };
    
    // Keep users intact so that active sessions are preserved
    if (currentData && currentData.users) {
      purgedData.users = currentData.users;
    }
    
    writeDB(purgedData);
    
    return res.status(200).json({ 
      success: true, 
      message: 'La base de données du serveur a été vidée avec succès.' 
    });
  } catch (err) {
    next(err);
  }
});

router.post('/system/seed', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    // Reset back to standard mock/seed data
    writeDB(getInitialSeedData());
    return res.status(200).json({ 
      success: true, 
      message: 'Les données de démonstration du serveur ont été restaurées avec succès.' 
    });
  } catch (err) {
    next(err);
  }
});

export default router;
