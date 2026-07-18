import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../config/db';
import { generateToken } from '../config/jwt';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { ADMIN_ROLES, RECEPTION_ROLES, resolveRole } from '../config/roles';

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
    const user = users.find((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase());

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
      role: resolveRole(user),
      name: `${user.first_name} ${user.last_name}`
    });

    const getUserPrivilegesList = (u: any) => {
      if (u.privileges && Array.isArray(u.privileges)) {
        return u.privileges;
      }
      const defaults: Record<string, string[]> = {
        'Super Administrateur': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ],
        'Support Technique': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ],
        'Réceptionniste': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/restaurant'
        ],
        'Housekeeping': [
          '/dashboard', '/housekeeping', '/maintenance'
        ],
        'Technicien Maintenance': [
          '/dashboard', '/maintenance'
        ],
        'Magasinier / Stock': [
          '/dashboard', '/inventory'
        ]
      };
      return defaults[u.role] || ['/dashboard'];
    };

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: resolveRole(user),
        privileges: getUserPrivilegesList(user),
        mustChangePassword: !!user.must_change_password
      }
    });
  } catch (err) {
    next(err);
  }
});

// Public Hotel settings endpoint (so Login page can render logo/brand from MySQL)
router.get('/settings/hotel', async (req, res, next) => {
  try {
    const settingsList = await db.getCollection('hotel_settings');
    const settings = settingsList[0] || {
      id: 1,
      hotel_name: 'Brunch Resto-Bar Vip',
      legal_name: 'Brunch Resto-Bar Vip SARL',
      phone: '+225 07 45 89 12 34',
      email: 'contact@brunchresto.vip',
      website: 'www.brunchresto.vip',
      address: 'Quartier Commerce, face SGBCI, Bouaké, Côte d\'Ivoire'
    };
    return res.status(200).json({ success: true, settings });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// PUBLIC PASSWORD RESET ENDPOINTS
// ==========================================

router.post('/auth/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { message: 'L\'adresse email est requise.' } });
    }
    const users = await db.getCollection('users');
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'Aucun compte associé à cette adresse email.' } });
    }

    // Generate a 6-digit numeric reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    await db.update('users', user.id, {
      reset_code: resetCode,
      reset_code_expires: expiry
    });

    // The reset code is only echoed back outside production, for local testing.
    // In production it must be delivered out-of-band (email/SMS) — never in the API response.
    return res.status(200).json({
      success: true,
      message: 'Un code de réinitialisation vous a été généré.',
      ...(process.env.NODE_ENV !== 'production' ? { devCode: resetCode } : {})
    });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/reset-password', async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: { message: 'Tous les champs sont requis.' } });
    }

    const users = await db.getCollection('users');
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'Utilisateur introuvable.' } });
    }

    if (!user.reset_code || String(user.reset_code).trim() !== String(code).trim()) {
      return res.status(400).json({ success: false, error: { message: 'Code de réinitialisation invalide.' } });
    }

    if (user.reset_code_expires && new Date() > new Date(user.reset_code_expires)) {
      return res.status(400).json({ success: false, error: { message: 'Ce code a expiré.' } });
    }

    // Hash new password and clear the code fields
    const hashed = bcrypt.hashSync(newPassword, 10);
    await db.update('users', user.id, {
      password_hash: hashed,
      reset_code: null,
      reset_code_expires: null
    });

    return res.status(200).json({
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès !'
    });
  } catch (err) {
    next(err);
  }
});

// Apply JWT Authentication middleware to all remaining endpoints
router.use(authMiddleware as any);

// Authenticated Password Change Endpoint
router.post('/auth/change-password', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: { message: 'Le mot de passe actuel et le nouveau mot de passe sont requis.' } });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: { message: 'Non autorisé.' } });
    }

    const user = await db.getById('users', req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'Utilisateur introuvable.' } });
    }

    const passwordMatch = bcrypt.compareSync(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ success: false, error: { message: 'Le mot de passe actuel est incorrect.' } });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: { message: 'Le nouveau mot de passe doit faire au moins 6 caractères.' } });
    }

    const hashed = bcrypt.hashSync(newPassword, 10);
    await db.update('users', user.id, {
      password_hash: hashed,
      must_change_password: false
    });

    return res.status(200).json({
      success: true,
      message: 'Votre mot de passe a été modifié avec succès.'
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================

router.get('/users', async (req, res, next) => {
  try {
    const users = await db.getCollection('users');
    
    // Map db structure to clean API response
    const mappedUsers = users.map((u: any) => ({
      id: u.id,
      name: u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : (u.name || 'Collaborateur'),
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email,
      role: resolveRole(u),
      status: u.status === 'suspended' ? 'Suspendu' : 'Actif',
      phone: u.phone || '',
      privileges: u.privileges || []
    }));

    return res.status(200).json({ success: true, users: mappedUsers });
  } catch (err) {
    next(err);
  }
});

router.post('/users', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { first_name, last_name, email, password, role, phone, privileges } = req.body;
    
    // --- SERVER-SIDE VALIDATION ---
    if (!first_name || !first_name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Le prénom de l\'employé est obligatoire.' } });
    }
    if (!last_name || !last_name.trim()) {
      return res.status(400).json({ success: false, error: { message: 'Le nom de l\'employé est obligatoire.' } });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, error: { message: 'L\'adresse email est obligatoire.' } });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: { message: 'L\'adresse email saisie est invalide.' } });
    }

    let finalPassword = password;
    if (!finalPassword || !finalPassword.trim()) {
      finalPassword = '123456';
    } else if (finalPassword.length < 6) {
      return res.status(400).json({ success: false, error: { message: 'Le mot de passe temporaire doit contenir au moins 6 caractères.' } });
    }

    if (!role) {
      return res.status(400).json({ success: false, error: { message: 'Le rôle système d\'accès est obligatoire.' } });
    }

    const validRoles = [
      'Super Administrateur', 'Support Technique', 'Directeur', 
      'Réceptionniste', 'Réceptionniste / Front Desk', 
      'Housekeeping', 'Housekeeping / Gouvernance', 
      'Technicien', 'Technicien Maintenance', 'Magasinier / Stock'
    ];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: { message: `Le rôle système "${role}" n'est pas reconnu.` } });
    }

    const users = await db.getCollection('users');
    if (users.some((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ success: false, error: { message: `Un compte utilisateur avec l'adresse email "${email}" existe déjà.` } });
    }

    // --- ROBUST DATA PREPARATION & AUTO-IDS ---
    // Generate an integer ID instead of string 'u-timestamp' to support MySQL INT id columns
    const maxId = users.reduce((max: number, u: any) => {
      const numId = typeof u.id === 'number' ? u.id : parseInt(String(u.id).replace(/\D/g, ''), 10);
      return !isNaN(numId) && numId > max ? numId : max;
    }, 0);
    const newId = maxId > 0 ? maxId + 1 : Math.floor(Math.random() * 900000) + 100000;

    // Map role name to integer role_id to satisfy MySQL foreign keys or constraints
    const roleIdMap: Record<string, number> = {
      'Super Administrateur': 1,
      'Support Technique': 1,
      'Directeur': 2,
      'Réceptionniste': 3,
      'Réceptionniste / Front Desk': 3,
      'Housekeeping': 4,
      'Housekeeping / Gouvernance': 4,
      'Technicien': 5,
      'Technicien Maintenance': 5,
      'Magasinier / Stock': 5
    };
    const role_id = roleIdMap[role] || 3;

    const newUser = {
      id: newId,
      role_id: role_id,
      email: email.toLowerCase().trim(),
      password_hash: bcrypt.hashSync(finalPassword, 10),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone ? phone.trim() : '',
      status: 'active',
      role: role,
      timezone: 'Africa/Abidjan',
      privileges: privileges || ['/dashboard'],
      must_change_password: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('[API Admin] Attempting to insert validated user:', { id: newUser.id, email: newUser.email, role_id: newUser.role_id });
    
    let inserted;
    try {
      inserted = await db.insert('users', newUser);
    } catch (dbErr: any) {
      console.error('[API Admin ERROR] Database insertion failed during user creation:', dbErr);
      return res.status(500).json({ 
        success: false, 
        error: { 
          message: `Échec d'enregistrement en base de données: ${dbErr.message}`,
          details: dbErr.stack || dbErr.toString()
        } 
      });
    }

    await logActivity(req.user?.id || 1, 'admin', 'create_user', String(inserted.id), `Création du compte utilisateur pour ${first_name} ${last_name} (${email})`);

    return res.status(201).json({
      success: true,
      user: {
        id: inserted.id,
        name: `${inserted.first_name} ${inserted.last_name}`,
        firstName: inserted.first_name,
        lastName: inserted.last_name,
        email: inserted.email,
        role: inserted.role,
        status: 'Actif',
        privileges: inserted.privileges
      }
    });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, password, role, phone, privileges, status } = req.body;

    const existingUser = await db.getById('users', id);
    if (!existingUser) {
      return res.status(404).json({ success: false, error: { message: 'Utilisateur introuvable.' } });
    }

    const updatedFields: any = {};
    if (first_name !== undefined) updatedFields.first_name = first_name;
    if (last_name !== undefined) updatedFields.last_name = last_name;
    if (email !== undefined) {
      const emailTrimmed = email.toLowerCase().trim();
      if (existingUser.email && existingUser.email.toLowerCase().trim() !== emailTrimmed) {
        const users = await db.getCollection('users');
        if (users.some((u: any) => u.id != id && u.email && u.email.toLowerCase().trim() === emailTrimmed)) {
          return res.status(400).json({ success: false, error: { message: `Un autre compte utilisateur utilise déjà l'adresse email "${email}".` } });
        }
      }
      updatedFields.email = emailTrimmed;
    }
    if (phone !== undefined) updatedFields.phone = phone;
    if (role !== undefined) updatedFields.role = role;
    if (privileges !== undefined) updatedFields.privileges = privileges;
    
    if (status !== undefined) {
      updatedFields.status = (status === 'Suspendu' || status === 'suspended') ? 'suspended' : 'active';
    }

    if (password) {
      updatedFields.password_hash = bcrypt.hashSync(password, 10);
    }

    const updated = await db.update('users', id, updatedFields);
    await logActivity(req.user?.id || 1, 'admin', 'update_user', String(id), `Mise à jour du compte utilisateur pour ${updated.first_name} ${updated.last_name}`);

    return res.status(200).json({
      success: true,
      user: {
        id: updated.id,
        name: `${updated.first_name} ${updated.last_name}`,
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
        role: updated.role,
        status: updated.status === 'suspended' ? 'Suspendu' : 'Actif',
        privileges: updated.privileges
      }
    });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const user = await db.getById('users', id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'Utilisateur introuvable.' } });
    }

    await db.delete('users', id);
    await logActivity(req.user?.id || 1, 'admin', 'delete_user', String(id), `Suppression du compte de ${user.first_name} ${user.last_name} (${user.email})`);

    return res.status(200).json({ success: true, message: 'Utilisateur supprimé.' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// SYSTEM ADMINISTRATION ENDPOINTS
// ==========================================

router.get('/admin/db-diagnostics', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const diagnostics = await db.getDiagnostics();
    return res.status(200).json({ success: true, diagnostics });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/debug-user-creation', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const schemaInfo = await db.inspectUsersSchema();
    return res.status(200).json({ success: true, schemaInfo });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/backup', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const backupData = await db.backup();
    await logActivity(req.user?.id || 1, 'admin', 'backup_db', null, `Sauvegarde complète de la base de données exportée par l'administrateur`);
    
    if (req.query.download === 'true') {
      const filename = `brunch_bouake_pms_backup_${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(JSON.stringify(backupData, null, 2));
    }
    
    return res.status(200).json({ success: true, backup: backupData });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/restore', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const backupData = req.body;
    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ success: false, error: { message: 'Données de sauvegarde invalides.' } });
    }

    // Basic structure check
    if (!backupData.users || !Array.isArray(backupData.users)) {
      return res.status(400).json({ success: false, error: { message: 'Format de fichier incorrect. La table "users" est requise dans la sauvegarde.' } });
    }

    const result = await db.restore(backupData);
    await logActivity(req.user?.id || 1, 'admin', 'restore_db', null, `Restauration de la base de données effectuée avec succès (${result.restoredTables.length} tables restaurées)`);

    return res.status(200).json({ success: true, message: 'La base de données a été restaurée avec succès.', details: result });
  } catch (err: any) {
    console.error('[API Admin Restore Error]:', err);
    return res.status(500).json({ success: false, error: { message: `Échec de la restauration : ${err.message}` } });
  }
});

router.get('/admin/backup-config', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const settings = await db.getCollection('settings');
    const system_config = await db.getCollection('system_config');
    const module_access = await db.getCollection('module_access');
    const roles = await db.getCollection('roles');
    const role_permissions = await db.getCollection('role_permissions');

    const backupData = {
      settings,
      system_config,
      module_access,
      roles,
      role_permissions,
      timestamp: new Date().toISOString(),
      type: 'system_configuration'
    };

    await logActivity(req.user?.id || 1, 'admin', 'backup_config', null, `Exportation de la configuration système`);

    const filename = `brunch_bouake_config_backup_${new Date().toISOString().slice(0, 10)}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    next(err);
  }
});

router.post('/admin/restore-config', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const backupData = req.body;
    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ success: false, error: { message: 'Données de configuration invalides.' } });
    }

    const tablesToRestore = ['settings', 'system_config', 'module_access', 'roles', 'role_permissions'];
    const restoredTables: string[] = [];

    for (const table of tablesToRestore) {
      if (backupData[table] && Array.isArray(backupData[table])) {
        await db.saveCollection(table, backupData[table]);
        restoredTables.push(table);
      }
    }

    if (restoredTables.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Aucune table de configuration valide trouvée dans le fichier.' } });
    }

    await logActivity(req.user?.id || 1, 'admin', 'restore_config', null, `Restauration de la configuration système (${restoredTables.join(', ')})`);

    return res.status(200).json({ 
      success: true, 
      message: 'La configuration système a été restaurée avec succès.',
      details: { restoredTables } 
    });
  } catch (err: any) {
    console.error('[API Admin Restore Config Error]:', err);
    return res.status(500).json({ success: false, error: { message: `Échec de la restauration de la configuration : ${err.message}` } });
  }
});

// ==========================================
// ACTIVITY LOGGING UTILITY
// ==========================================
const logActivity = async (userId: number, module: string, action: string, recordId: string | null, details: string, ipAddress?: string) => {
  try {
    const logs = await db.getCollection('audit_logs');
    const newLog = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      user_id: userId,
      module,
      action,
      record_id: recordId,
      details,
      ip_address: ipAddress || '127.0.0.1',
      created_at: new Date().toISOString()
    };
    logs.push(newLog);
    await db.saveCollection('audit_logs', logs);
  } catch (err) {
    console.error('[Activity Log] Error saving activity log:', err);
  }
};

router.get('/activity-logs', async (req: AuthenticatedRequest, res, next) => {
  try {
    const logs = await db.getCollection('audit_logs');
    const users = await db.getCollection('users');
    
    // Sort logs descending by created_at or id
    const sortedLogs = [...logs].sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const enrichedLogs = sortedLogs.map((log: any) => {
      const u = users.find((user: any) => user.id == log.user_id);
      return {
        ...log,
        user: u ? {
          id: u.id,
          first_name: u.first_name,
          last_name: u.last_name,
          email: u.email,
          role: resolveRole(u)
        } : null
      };
    });

    return res.status(200).json({ success: true, logs: enrichedLogs });
  } catch (err) {
    next(err);
  }
});

router.post('/auth/extend-session', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token de session manquant ou invalide.', code: 'UNAUTHORIZED' }
      });
    }

    const users = await db.getCollection('users');
    const user = users.find((u: any) => u.email.toLowerCase() === req.user!.email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Utilisateur inexistant.', code: 'USER_NOT_FOUND' }
      });
    }

    // Generate fresh JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: resolveRole(user),
      name: `${user.first_name} ${user.last_name}`
    });

    await logActivity(user.id, 'auth', 'extend_session', String(user.id), `Session utilisateur prolongée de 24h.`);

    const getUserPrivilegesList = (u: any) => {
      if (u.privileges && Array.isArray(u.privileges)) {
        return u.privileges;
      }
      const defaults: Record<string, string[]> = {
        'Super Administrateur': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ],
        'Support Technique': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ],
        'Réceptionniste': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/restaurant'
        ],
        'Housekeeping': [
          '/dashboard', '/housekeeping', '/maintenance'
        ],
        'Technicien Maintenance': [
          '/dashboard', '/maintenance'
        ],
        'Magasinier / Stock': [
          '/dashboard', '/inventory'
        ]
      };
      return defaults[u.role] || ['/dashboard'];
    };

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: resolveRole(user),
        privileges: getUserPrivilegesList(user),
        mustChangePassword: !!user.must_change_password
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/auth/verify', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token de session manquant ou invalide.', code: 'UNAUTHORIZED' }
      });
    }

    const users = await db.getCollection('users');
    const user = users.find((u: any) => u.email.toLowerCase() === req.user!.email.toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Utilisateur inexistant dans la base de données. Session interrompue.', code: 'USER_NOT_FOUND' }
      });
    }

    await logActivity(user.id, 'auth', 'verify_session', String(user.id), `Vérification automatique de la session utilisateur.`);

    const getUserPrivilegesList = (u: any) => {
      if (u.privileges && Array.isArray(u.privileges)) {
        return u.privileges;
      }
      const defaults: Record<string, string[]> = {
        'Super Administrateur': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ],
        'Support Technique': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ],
        'Réceptionniste': [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/restaurant'
        ],
        'Housekeeping': [
          '/dashboard', '/housekeeping', '/maintenance'
        ],
        'Technicien Maintenance': [
          '/dashboard', '/maintenance'
        ],
        'Magasinier / Stock': [
          '/dashboard', '/inventory'
        ]
      };
      return defaults[u.role] || ['/dashboard'];
    };

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: resolveRole(user),
        privileges: getUserPrivilegesList(user),
        mustChangePassword: !!user.must_change_password
      }
    });
  } catch (err) {
    next(err);
  }
});

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

router.post('/rooms', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
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
    await logActivity(req.user?.id || 1, 'rooms', 'create_room', inserted.id, `Création de la chambre ${inserted.room_number} (${inserted.bed_type})`);
    return res.status(201).json({ success: true, room: inserted });
  } catch (err) {
    next(err);
  }
});

router.put('/rooms/:id', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db.update('rooms', id, {
      ...req.body,
      updated_by: req.user?.name || 'Administrateur'
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'Chambre introuvable.' } });
    }

    await logActivity(req.user?.id || 1, 'rooms', 'update_room', id, `Mise à jour de la chambre ${updated.room_number}`);
    return res.status(200).json({ success: true, room: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/rooms/:id', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const room = await db.getById('rooms', id);
    const success = await db.delete('rooms', id);
    if (!success) {
      return res.status(404).json({ success: false, error: { message: 'Chambre introuvable.' } });
    }

    await logActivity(req.user?.id || 1, 'rooms', 'delete_room', id, `Suppression de la chambre ${room ? room.room_number : id}`);
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

router.post('/guests', requireRole(...RECEPTION_ROLES), async (req, res, next) => {
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

router.put('/guests/:id', requireRole(...RECEPTION_ROLES), async (req, res, next) => {
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

router.get('/guests/history/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservations = await db.getCollection('reservations');
    const guestReservations = reservations.filter((r: any) => String(r.guest_id) === String(id));
    return res.status(200).json({ success: true, history: guestReservations });
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

router.post('/reservations', requireRole(...RECEPTION_ROLES), async (req, res, next) => {
  try {
    const { guest_id, room_id, arrival_date, departure_date, room_rate } = req.body;
    if (!guest_id || !room_id || !arrival_date || !departure_date) {
      return res.status(400).json({ success: false, error: { message: 'Champs obligatoires manquants.' } });
    }

    // --- SERVER-SIDE VALIDATION ---
    const arrDate = new Date(arrival_date);
    const depDate = new Date(departure_date);
    if (isNaN(arrDate.getTime()) || isNaN(depDate.getTime())) {
      return res.status(400).json({ success: false, error: { message: 'Les dates d\'arrivée ou de départ fournies sont invalides.' } });
    }
    if (arrDate >= depDate) {
      return res.status(400).json({ success: false, error: { message: 'La date d\'arrivée doit être strictement antérieure à la date de départ.' } });
    }

    const rooms = await db.getCollection('rooms');
    const validRoom = rooms.find((r: any) => r.id === room_id);
    if (!validRoom) {
      return res.status(400).json({ success: false, error: { message: 'La chambre sélectionnée est invalide ou introuvable.' } });
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

router.post('/reservations/:id/check-in', requireRole(...RECEPTION_ROLES), async (req, res, next) => {
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

router.post('/finance/payments', requireRole(...RECEPTION_ROLES), async (req: AuthenticatedRequest, res, next) => {
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

router.post('/hrms/employees', requireRole(...ADMIN_ROLES), async (req: AuthenticatedRequest, res, next) => {
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

router.put('/hrms/employees/:id', requireRole(...ADMIN_ROLES), async (req, res, next) => {
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

router.post('/hrms/departments', requireRole(...ADMIN_ROLES), async (req, res, next) => {
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

router.post('/hrms/jobs', requireRole(...ADMIN_ROLES), async (req, res, next) => {
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

router.post('/hrms/teams', requireRole(...ADMIN_ROLES), async (req, res, next) => {
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

router.post('/hrms/contracts', requireRole(...ADMIN_ROLES), async (req, res, next) => {
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

router.put('/hrms/contracts/:id', requireRole(...ADMIN_ROLES), async (req, res, next) => {
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

router.put('/hrms/onboarding-tasks/:id', requireRole(...ADMIN_ROLES), async (req, res, next) => {
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
// 8. HOTEL SETTINGS ENDPOINTS
// ==========================================
router.get('/room_categories', async (req, res, next) => {
  try {
    const categories = await db.getCollection('room_categories');
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

router.put('/room_categories', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const { categories } = req.body;
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ success: false, error: { message: 'Données de catégories invalides.' } });
    }
    await db.saveCollection('room_categories', categories);
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
});

router.put('/settings/hotel', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const settingsList = await db.getCollection('hotel_settings');
    const existing = settingsList[0] || { id: 1 };
    const updatedData = { ...existing, ...req.body };
    
    await db.saveCollection('hotel_settings', [updatedData]);
    return res.status(200).json({ success: true, settings: updatedData });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 9. SYSTEM MAINTENANCE ENDPOINTS (PURGE & SEED)
// ==========================================
import { getInitialSeedData, writeDB, readDB } from '../config/db';

router.post('/system/purge', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const currentData = readDB();
    const seedBase = getInitialSeedData();
    
    // Create a blank data structure keeping only critical system parameters
    const purgedData = {
      ...seedBase,
      hotel_settings: {
        ...(seedBase.hotel_settings || {}),
        app_mode: 'production'
      } as any,
      rooms: [],
      room_categories: seedBase.room_categories, // Keep default room categories
      reservations: [],
      guests: [],
      invoices: [],
      payments: [],
      housekeeping_tasks: [],
      maintenance_tickets: [],
      stock_items: [],
      stock_movements: [],
      restaurant_orders: [],
      connection_journal: [],
      timesheet_history: [],
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


// ==========================================
// 10. SYSTEM SYNCHRONIZATION ENDPOINTS
// ==========================================

const nameMap: Record<string, string> = {
  'pms_rooms': 'rooms',
  'pms_room_categories': 'room_categories',
  'pms_reservations': 'reservations',
  'pms_guests': 'guests',
  'pms_suppliers': 'suppliers',
  'pms_stock': 'stock_items',
  'pms_stock_movements': 'stock_movements',
  'pms_housekeeping_tasks': 'housekeeping_tasks',
  'pms_maintenance_tickets': 'maintenance_tickets',
  'pms_payments': 'payments',
  'pms_invoices': 'invoices',
  'pms_restaurant_orders': 'restaurant_orders',
  'pms_employees': 'employees',
  'pms_connection_journal': 'connection_journal',
  'pms_timesheet_history': 'timesheet_history',
  'hrms_employees': 'hrms_employees',
  'hrms_departments': 'hrms_departments',
  'hrms_jobs': 'hrms_jobs',
  'hrms_teams': 'hrms_teams',
  'hrms_contracts': 'hrms_contracts',
  'hrms_skills': 'hrms_skills',
  'hrms_employee_skills': 'hrms_employee_skills',
  'hrms_onboarding_tasks': 'hrms_onboarding_tasks',
  'hrms_business_events': 'hrms_business_events',
  'hrms_payroll_rules': 'hrms_payroll_rules'
};

router.get('/system/sync', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const settingsList = await db.getCollection('hotel_settings');
    const settings = settingsList[0] || {};
    const appMode = settings.app_mode || 'demo';

    const collections: Record<string, any> = {};
    for (const [localKey, serverCol] of Object.entries(nameMap)) {
      collections[localKey] = await db.getCollection(serverCol) || [];
    }

    return res.status(200).json({
      success: true,
      appMode,
      collections
    });
  } catch (err) {
    next(err);
  }
});

router.post('/system/sync', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const { collectionName, data } = req.body;
    if (!collectionName || !Array.isArray(data)) {
      return res.status(400).json({ success: false, error: { message: 'Données de collection manquantes ou invalides.' } });
    }

    const serverCol = nameMap[collectionName];
    if (!serverCol) {
      return res.status(400).json({ success: false, error: { message: `La collection "${collectionName}" n'est pas reconnue.` } });
    }

    await db.saveCollection(serverCol, data);
    return res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/system/seed', requireRole(...ADMIN_ROLES), async (req, res, next) => {
  try {
    const seedData = getInitialSeedData();
    if (seedData.hotel_settings) {
      (seedData.hotel_settings as any).app_mode = 'demo';
    }
    // Reset back to standard mock/seed data
    writeDB(seedData);
    return res.status(200).json({ 
      success: true, 
      message: 'Les données de démonstration du serveur ont été restaurées avec succès.' 
    });
  } catch (err) {
    next(err);
  }
});

export default router;
