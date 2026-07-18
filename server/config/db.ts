import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Database config variables
const DB_HOST = process.env.DB_HOST || '';
const DB_USER = process.env.DB_USER || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || '';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

if (DB_HOST && (!DB_USER || !DB_PASSWORD || !DB_NAME)) {
  throw new Error('[Config] DB_HOST est défini mais DB_USER, DB_PASSWORD ou DB_NAME est manquant. Définissez ces variables d\'environnement avant de démarrer le serveur.');
}

let pool: mysql.Pool | null = null;
const useMySQL = !!DB_HOST;
let isMySQLOnline = useMySQL;

function isConnectionError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || '').toUpperCase();
  const code = (err.code || '').toUpperCase();
  return (
    code.includes('ECONNREFUSED') ||
    code.includes('ENOTFOUND') ||
    code.includes('ETIMEDOUT') ||
    code.includes('EHOSTUNREACH') ||
    code.includes('PROTOCOL_CONNECTION_LOST') ||
    code.includes('HANDSHAKE_TIMEOUT') ||
    code.includes('ER_ACCESS_DENIED_ERROR') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('CONNREFUSED') ||
    msg.includes('ACCESS DENIED')
  );
}

// Initialize MySQL Pool if config exists
if (useMySQL) {
  try {
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('[Database] MySQL Connection Pool initialized.');

    // Asynchronously verify/add columns to the hotel_settings table and create config tables
    (async () => {
      try {
        await pool!.query("ALTER TABLE `hotel_settings` ADD COLUMN `logo` LONGTEXT NULL");
        console.log('[Database MySQL] Ensured `logo` column exists in `hotel_settings`.');
      } catch (e: any) {
        if (isConnectionError(e)) {
          isMySQLOnline = false;
          console.warn('[Database MySQL] Connection refused or lost during initialization. Switched silently to Local JSON Fallback.');
        }
      }
      if (isMySQLOnline) {
        try {
          await pool!.query("ALTER TABLE `users` ADD COLUMN `must_change_password` BOOLEAN DEFAULT TRUE");
          console.log('[Database MySQL] Ensured `must_change_password` column exists in `users`.');
        } catch (e) {}

        try {
          await pool!.query("ALTER TABLE `hotel_settings` ADD COLUMN `extra_config` LONGTEXT NULL");
          console.log('[Database MySQL] Ensured `extra_config` column exists in `hotel_settings`.');
        } catch (e) {}

        try {
          await pool!.query(`
            CREATE TABLE IF NOT EXISTS \`backups\` (
              \`id\` BIGINT PRIMARY KEY,
              \`backup_type\` VARCHAR(50) NOT NULL,
              \`backup_data\` LONGTEXT NOT NULL,
              \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          console.log('[Database MySQL] Ensured `backups` table exists.');
        } catch (e: any) {
          console.warn('[Database MySQL] Failed to ensure `backups` table:', e.message);
        }

        try {
          await pool!.query(`
            CREATE TABLE IF NOT EXISTS \`settings\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`key_name\` VARCHAR(100) UNIQUE NOT NULL,
              \`value_text\` TEXT,
              \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          console.log('[Database MySQL] Ensured `settings` table exists.');
        } catch (e: any) {
          console.warn('[Database MySQL] Failed to ensure `settings` table:', e.message);
        }

        try {
          await pool!.query(`
            CREATE TABLE IF NOT EXISTS \`system_config\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`config_name\` VARCHAR(100) UNIQUE NOT NULL,
              \`config_value\` TEXT,
              \`description\` VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          console.log('[Database MySQL] Ensured `system_config` table exists.');
        } catch (e: any) {
          console.warn('[Database MySQL] Failed to ensure `system_config` table:', e.message);
        }

        try {
          await pool!.query(`
            CREATE TABLE IF NOT EXISTS \`module_access\` (
              \`id\` INT AUTO_INCREMENT PRIMARY KEY,
              \`role_id\` INT NOT NULL,
              \`module_name\` VARCHAR(100) NOT NULL,
              \`is_enabled\` BOOLEAN DEFAULT TRUE,
              \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
          `);
          console.log('[Database MySQL] Ensured `module_access` table exists.');
        } catch (e: any) {
          console.warn('[Database MySQL] Failed to ensure `module_access` table:', e.message);
        }

        // Seed initial records for these tables in MySQL if empty
        try {
          const [settingsRows]: any = await pool!.query('SELECT COUNT(*) as count FROM `settings`');
          if (settingsRows[0]?.count === 0) {
            await pool!.query("INSERT INTO `settings` (`key_name`, `value_text`) VALUES ('backup_interval_hours', '24'), ('maintenance_mode', 'false')");
            console.log('[Database MySQL] Seeded default settings records.');
          }
        } catch (e: any) {
          console.warn('[Database MySQL] Failed to seed `settings` table:', e.message);
        }

        try {
          const [configRows]: any = await pool!.query('SELECT COUNT(*) as count FROM `system_config`');
          if (configRows[0]?.count === 0) {
            await pool!.query("INSERT INTO `system_config` (`config_name`, `config_value`, `description`) VALUES ('pms_version', '3.0', 'Version majeure du système'), ('allowed_ip_range', '*', 'Plage IP autorisée pour l\\'accès administratif')");
            console.log('[Database MySQL] Seeded default system_config records.');
          }
        } catch (e: any) {
          console.warn('[Database MySQL] Failed to seed `system_config` table:', e.message);
        }

        try {
          const [accessRows]: any = await pool!.query('SELECT COUNT(*) as count FROM `module_access`');
          if (accessRows[0]?.count === 0) {
            await pool!.query("INSERT INTO `module_access` (`role_id`, `module_name`, `is_enabled`) VALUES (1, 'finance', 1), (2, 'hrms', 1), (3, 'restaurant', 1)");
            console.log('[Database MySQL] Seeded default module_access records.');
          }
        } catch (e: any) {
          console.warn('[Database MySQL] Failed to seed `module_access` table:', e.message);
        }
      }
    })();
  } catch (err: any) {
    console.error('[Database] Failed to initialize MySQL Pool, using JSON storage fallback.', err.message);
    pool = null;
    isMySQLOnline = false;
  }
}

// JSON Fallback storage config
const JSON_DB_DIR = path.join(process.cwd(), 'server', 'data');
const JSON_DB_FILE = path.join(JSON_DB_DIR, 'pms_database.json');

// Ensure database directory exists
if (!fs.existsSync(JSON_DB_DIR)) {
  fs.mkdirSync(JSON_DB_DIR, { recursive: true });
}

// Initial Database Seeding Helper
export function getInitialSeedData() {
  return {
    users: [
      {
        id: 1,
        role_id: 1,
        email: 'fasopost24@gmail.com',
        password_hash: bcrypt.hashSync('Prodesk@2026', 10),
        first_name: 'Amadou',
        last_name: 'Koné',
        phone: '+225 07 00 00 00 01',
        status: 'active',
        role: 'Super Administrateur',
        timezone: 'Africa/Abidjan',
        privileges: [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ]
      },
      {
        id: 2,
        role_id: 1,
        email: 'support@brunchbouake.com',
        password_hash: bcrypt.hashSync('Prodesk@2026', 10),
        first_name: 'Support',
        last_name: 'Technique',
        phone: '+225 07 00 00 00 02',
        status: 'active',
        role: 'Support Technique',
        timezone: 'Africa/Abidjan',
        privileges: [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ]
      },
      {
        id: 3,
        role_id: 1,
        email: 'ekonin@brunchbouake.com',
        password_hash: bcrypt.hashSync('Prodesk@2026', 10),
        first_name: 'E.',
        last_name: 'Konin',
        phone: '+225 07 00 00 00 03',
        status: 'active',
        role: 'Super Administrateur',
        timezone: 'Africa/Abidjan',
        privileges: [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/finance', 
          '/hrms', '/housekeeping', '/maintenance', '/restaurant', '/inventory', '/reports', '/settings', '/admin'
        ]
      },
      {
        id: 4,
        role_id: 3,
        email: 'reservation@brunchbouake.com',
        password_hash: bcrypt.hashSync('Prodesk@2026', 10),
        first_name: 'Service',
        last_name: 'Réservations',
        phone: '+225 07 00 00 00 04',
        status: 'active',
        role: 'Réceptionniste',
        timezone: 'Africa/Abidjan',
        privileges: [
          '/dashboard', '/reception', '/rooms', '/reservations', '/guests', '/restaurant'
        ]
      }
    ],
    roles: [
      { id: 1, name: 'Super Administrateur', description: 'Accès complet sur l\'ensemble du PMS.' },
      { id: 2, name: 'Directeur', description: 'Accès complet sur les opérations, RH et finance.' },
      { id: 3, name: 'Réceptionniste', description: 'Gestion des réservations, folios, clients et restaurant.' },
      { id: 4, name: 'Gouvernante', description: 'Gestion de l\'entretien ménager des chambres.' },
      { id: 5, name: 'Technicien', description: 'Gestion des tickets de maintenance.' }
    ],
    role_permissions: [
      { id: 1, role_id: 1, module: 'all', action: 'all' }
    ],
    hotel_settings: {
      id: 1,
      hotel_name: 'Brunch Bouaké PMS',
      legal_name: 'Le Brunch Sarl',
      address: 'Quartier Kennedy, Bouaké, Côte d\'Ivoire',
      phone: '+225 07 48 29 10 99',
      email: 'contact@brunchbouake.ci',
      website: 'www.brunchbouake.ci',
      currency: 'XOF',
      timezone: 'Africa/Abidjan',
      tva_rate: 18.00,
      tourist_tax_rate: 500,
      invoice_prefix: 'FA',
      invoice_start_number: 100
    },
    room_categories: [
      { id: 'cat-std', name: 'Standard', description: 'Chambre confortable avec lit double, climatisation, bureau et TV.', default_price: 35000, max_capacity: 2, color: 'emerald', icon: 'Bed' },
      { id: 'cat-twin', name: 'Standard Twin', description: 'Chambre avec deux lits simples, idéale pour collègues ou amis.', default_price: 40000, max_capacity: 2, color: 'blue', icon: 'BedDouble' },
      { id: 'cat-dlx', name: 'Deluxe', description: 'Espace spacieux, lit King size, mini-bar, grand écran et vue sur jardin.', default_price: 55000, max_capacity: 2, color: 'indigo', icon: 'Sparkles' },
      { id: 'cat-ste', name: 'Suite Brunch', description: 'Le luxe absolu : salon privé, baignoire, lit King size et petit déjeuner brunch inclus.', default_price: 95000, max_capacity: 3, color: 'amber', icon: 'Crown' },
      { id: 'cat-fam', name: 'Familiale', description: 'Suite avec deux chambres séparées, idéale pour les séjours en famille.', default_price: 75000, max_capacity: 5, color: 'rose', icon: 'Users' }
    ],
    rooms: [
      { id: 'room-101', room_number: '101', category_id: 'cat-std', floor: '1er Étage', capacity: 2, bed_type: 'Lit Double', area: 22, base_price: 35000, amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-desk'], notes: 'Chambre proche de l\'ascenseur. Préférée des voyageurs d\'affaires.', active: true, prices: [], created_at: '2026-01-10T12:00:00Z', updated_at: '2026-01-10T12:00:00Z', created_by: 'Koffi', updated_by: 'Koffi' },
      { id: 'room-102', room_number: '102', category_id: 'cat-std', floor: '1er Étage', capacity: 2, bed_type: 'Lit Double', area: 22, base_price: 35000, amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-desk'], notes: 'Très calme, donne sur la cour intérieure.', active: true, prices: [], created_at: '2026-01-10T12:00:00Z', updated_at: '2026-01-10T12:00:00Z', created_by: 'Koffi', updated_by: 'Koffi' },
      { id: 'room-103', room_number: '103', category_id: 'cat-twin', floor: '1er Étage', capacity: 2, bed_type: '2 Lits Simples', area: 24, base_price: 40000, amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-desk'], notes: 'Chambre spacieuse, deux lits séparés.', active: true, prices: [], created_at: '2026-01-10T12:00:00Z', updated_at: '2026-01-10T12:00:00Z', created_by: 'Koffi', updated_by: 'Koffi' },
      { id: 'room-201', room_number: '201', category_id: 'cat-dlx', floor: '2ème Étage', capacity: 2, bed_type: 'Lit King Size', area: 32, base_price: 55000, amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-minibar', 'amen-garden', 'amen-desk', 'amen-pool'], notes: 'Vue dégagée sur le jardin tropical.', active: true, prices: [], created_at: '2026-01-10T12:00:00Z', updated_at: '2026-01-10T12:00:00Z', created_by: 'Koffi', updated_by: 'Koffi' },
      { id: 'room-202', room_number: '202', category_id: 'cat-ste', floor: '2ème Étage', capacity: 3, bed_type: 'Lit King Size + Canapé Lit', area: 45, base_price: 95000, amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-minibar', 'amen-bath', 'amen-garden', 'amen-desk', 'amen-pool'], notes: 'Baignoire balnéo, salon privé.', active: true, prices: [], created_at: '2026-01-10T12:00:00Z', updated_at: '2026-01-10T12:00:00Z', created_by: 'Koffi', updated_by: 'Koffi' }
    ],
    amenities: [
      { id: 'amen-wifi', name: 'Wi-Fi Haute Vitesse', icon: 'Wifi', category: 'Technologie', active: true },
      { id: 'amen-ac', name: 'Climatisation', icon: 'Wind', category: 'Confort', active: true },
      { id: 'amen-tv', name: 'TV Écran Plat', icon: 'Tv', category: 'Technologie', active: true },
      { id: 'amen-minibar', name: 'Mini-bar', icon: 'Coffee', category: 'Confort', active: true },
      { id: 'amen-bath', name: 'Baignoire', icon: 'Bath', category: 'Salle de bain', active: true },
      { id: 'amen-garden', name: 'Vue Jardin', icon: 'Trees', category: 'Vue', active: true },
      { id: 'amen-desk', name: 'Bureau de travail', icon: 'Briefcase', category: 'Confort', active: true },
      { id: 'amen-pool', name: 'Accès Piscine', icon: 'Waves', category: 'Services', active: true }
    ],
    guests: [
      { id: 'guest-1', first_name: 'Assa', last_name: 'Diallo', gender: 'F', birth_date: '1994-11-22', nationality: 'Ivoirienne', email: 'assa.diallo@example.com', phone: '+225 07 08 09 10 11', address: 'Abidjan Cocody', document_type: 'Passeport', document_number: '14PD99281', notes: 'Client VIP. Aime les chambres au calme.', vip: true, blacklist: false, guest_type: 'Individuel' },
      { id: 'guest-2', first_name: 'Jean-Marc', last_name: 'Kouassi', gender: 'M', birth_date: '1985-04-03', nationality: 'Ivoirienne', email: 'jm.kouassi@corporate.ci', phone: '+225 01 02 03 04 05', address: 'Bouaké Nimbo', document_type: 'CNI', document_number: '00293184', notes: 'Tarif corporate négocié.', vip: false, blacklist: false, guest_type: 'Corporate', company_name: 'Sifca Group' }
    ],
    reservations: [
      { id: 'res-1', reservation_number: 'RES-2026-0001', guest_id: 'guest-1', room_id: 'room-101', booking_source_id: 'booking_com', status: 'En séjour', arrival_date: '2026-07-13', departure_date: '2026-07-18', adults: 2, children: 0, nights: 5, room_rate: 35000, discount: 0, tax_amount: 3150, total_amount: 175000, deposit: 50000, balance: 125000, remarks: 'Demande lit King size.' }
    ],
    invoices: [],
    payments: [],
    housekeeping_tasks: [
      { id: 'hk-1', room_id: 'room-102', employee_id: 'emp-2', priority: 'Normale', status: 'À nettoyer', scheduled_time: '2026-07-14T08:00:00Z', notes: 'Chambre libérée ce matin' }
    ],
    maintenance_tickets: [
      { id: 'mt-1', room_id: 'room-101', category: 'Climatisation', priority: 'Haute', description: 'La climatisation fait un bruit anormal et ne refroidit plus.', assigned_to: 'emp-5', estimated_cost: 25000, actual_cost: 0, status: 'Signalé', created_at: '2026-07-14T07:30:00Z' }
    ],
    stock_items: [
      { id: 'stock-1', sku: 'SKU-BOI-001', barcode: '1234567890', name: 'Eau Minérale Awa 1.5L', category_id: 'boissons', supplier_id: 'sup-1', purchase_price: 350, selling_price: 1000, unit: 'unit', minimum_stock: 24, current_stock: 48 },
      { id: 'stock-2', sku: 'SKU-ENT-001', barcode: '9876543210', name: 'Savon liquide d\'entretien', category_id: 'entretien', supplier_id: 'sup-2', purchase_price: 4500, selling_price: 0, unit: 'liter', minimum_stock: 10, current_stock: 4 }
    ],
    restaurant_menu_items: [
      { id: 'menu-1', category_id: 'brunch', name: 'Brunch Signature Bouaké', description: 'Œufs pochés, bananes pesées, saucisses locales, pancakes et boisson chaude.', selling_price: 12000, tax_rate: 18, available: true },
      { id: 'menu-2', category_id: 'cocktails', name: 'Bissap Royal Mojito', description: 'Feuilles de menthe, citron vert, rhum blanc, sirop de bissap et eau pétillante.', selling_price: 4500, tax_rate: 18, available: true }
    ],
    restaurant_orders: [],
    hrms_departments: [
      { id: 'dept-1', hotel_id: 1, name: 'Réception & Front Office', code: 'REC', cost_center_code: 'CC-REC-100', manager_id: 'emp-1', created_at: '2025-01-10T08:00:00Z' },
      { id: 'dept-2', hotel_id: 1, name: 'Housekeeping & Propreté', code: 'HK', cost_center_code: 'CC-HK-200', manager_id: 'emp-2', created_at: '2025-01-10T08:00:00Z' },
      { id: 'dept-3', hotel_id: 1, name: 'Restauration & Cuisine', code: 'REST', cost_center_code: 'CC-REST-300', manager_id: 'emp-3', created_at: '2025-01-10T08:00:00Z' },
      { id: 'dept-4', hotel_id: 1, name: 'Finance & Administration', code: 'FIN', cost_center_code: 'CC-FIN-400', manager_id: 'emp-4', created_at: '2025-01-10T08:00:00Z' },
      { id: 'dept-5', hotel_id: 1, name: 'Technique & Maintenance', code: 'TECH', cost_center_code: 'CC-TECH-500', manager_id: 'emp-5', created_at: '2025-01-10T08:00:00Z' }
    ],
    hrms_teams: [
      { id: 'team-1', hotel_id: 1, department_id: 'dept-2', name: 'Équipe Matin Propreté A', code: 'EQ-HK-A', supervisor_id: 'emp-2', created_at: '2025-01-15T08:00:00Z' },
      { id: 'team-2', hotel_id: 1, department_id: 'dept-2', name: 'Équipe Soir Propreté B', code: 'EQ-HK-B', supervisor_id: null, created_at: '2025-01-15T08:00:00Z' },
      { id: 'team-3', hotel_id: 1, department_id: 'dept-3', name: 'Brigade Cuisine de Jour', code: 'EQ-REST-A', supervisor_id: 'emp-3', created_at: '2025-01-15T08:00:00Z' }
    ],
    hrms_jobs: [
      { id: 'job-1', hotel_id: 1, department_id: 'dept-1', title: 'Réceptionniste de Jour', description: 'Accueil des clients, check-in, check-out et facturation au comptoir.', salary_min: 180000, salary_max: 280000, hourly_cost: 1200, created_at: '2025-01-12T08:00:00Z' },
      { id: 'job-2', hotel_id: 1, department_id: 'dept-2', title: 'Gouvernante de Chambre', description: 'Nettoyage, désinfection, remise en état et approvisionnement des chambres.', salary_min: 150000, salary_max: 220000, hourly_cost: 1000, created_at: '2025-01-12T08:00:00Z' },
      { id: 'job-3', hotel_id: 1, department_id: 'dept-3', title: 'Chef de Partie Cuisine', description: 'Préparation et gestion des plats froids/chauds pour le brunch et le resto VIP.', salary_min: 250000, salary_max: 450000, hourly_cost: 2000, created_at: '2025-01-12T08:00:00Z' },
      { id: 'job-4', hotel_id: 1, department_id: 'dept-4', title: 'Responsable Comptable & RH', description: 'Suivi de la facturation hôtelière générale, paie mensuelle et déclarations.', salary_min: 350000, salary_max: 600000, hourly_cost: 3000, created_at: '2025-01-12T08:00:00Z' },
      { id: 'job-5', hotel_id: 1, department_id: 'dept-5', title: 'Technicien de Maintenance Senior', description: 'Maintenance préventive et corrective de la plomberie, de la climatisation et de l\'électricité.', salary_min: 220000, salary_max: 350000, hourly_cost: 1600, created_at: '2025-01-12T08:00:00Z' }
    ],
    hrms_employees: [
      { id: 'emp-1', hotel_id: 1, user_id: '1', department_id: 'dept-1', job_id: 'job-1', employee_code: 'EMP-2025-001', employee_type: 'FULL_TIME', first_name: 'Koffi', last_name: 'Yao', email: 'koffi.yao@brunchbouake.ci', phone: '+225 07 48 29 10 99', gender: 'M', date_of_birth: '1992-05-14', address: 'Quartier Kennedy, Bouaké, Côte d\'Ivoire', nationality: 'Ivoirienne', emergency_contact_name: 'Yao Amenan (Épouse)', emergency_contact_phone: '+225 05 12 34 56 78', hire_date: '2025-01-15', status: 'active', cnps_number: 'CNPS-CI-9928102-Y', payment_method: 'bank_transfer', bank_name: 'SGCI (Société Générale Côte d\'Ivoire)', bank_account_number: 'CI083 01234 56789012345 67', bank_swift: 'SGCIABCIXX', bank_iban: 'CI83SGCI012345678901234567', created_at: '2025-01-14T10:00:00Z', updated_at: '2025-01-14T10:00:00Z' },
      { id: 'emp-2', hotel_id: 1, department_id: 'dept-2', job_id: 'job-2', team_id: 'team-1', employee_code: 'EMP-2025-002', employee_type: 'FULL_TIME', first_name: 'Mariam', last_name: 'Bamba', email: 'mariam.bamba@brunchbouake.ci', phone: '+225 01 02 88 11 22', gender: 'F', date_of_birth: '1995-09-22', address: 'Quartier Nimbo, Bouaké, Côte d\'Ivoire', nationality: 'Ivoirienne', emergency_contact_name: 'Bamba Lamine (Frère)', emergency_contact_phone: '+225 07 99 88 77 66', hire_date: '2025-02-01', status: 'active', cnps_number: 'CNPS-CI-8820193-M', payment_method: 'mobile_money', mobile_money_provider: 'Wave', mobile_money_number: '+225 01 02 88 11 22', created_at: '2025-01-30T10:00:00Z', updated_at: '2025-01-30T10:00:00Z' },
      { id: 'emp-3', hotel_id: 1, department_id: 'dept-3', job_id: 'job-3', team_id: 'team-3', employee_code: 'EMP-2025-003', employee_type: 'FULL_TIME', first_name: 'Moussa', last_name: 'Sanogo', email: 'moussa.sanogo@brunchbouake.ci', phone: '+225 05 66 55 44 33', gender: 'M', date_of_birth: '1990-11-05', address: 'Quartier Broukro, Bouaké, Côte d\'Ivoire', nationality: 'Ivoirienne', emergency_contact_name: 'Sanogo Aminata', emergency_contact_phone: '+225 05 06 07 08 09', hire_date: '2025-01-15', status: 'active', payment_method: 'cash', created_at: '2025-01-14T10:00:00Z', updated_at: '2025-01-14T10:00:00Z' }
    ],
    hrms_contracts: [
      { id: 'contract-1', hotel_id: 1, employee_id: 'emp-1', contract_type: 'CDI', start_date: '2025-01-15', base_salary: 220000, currency: 'XOF', social_security_opt_in: true, status: 'active', signature_status: 'signed', signed_at: '2025-01-15T09:00:00Z', notes: 'Contrat d\'embauche standard Réceptionniste de jour.', created_at: '2025-01-14T10:00:00Z' },
      { id: 'contract-2', hotel_id: 1, employee_id: 'emp-2', contract_type: 'CDD', start_date: '2025-02-01', end_date: '2026-02-01', base_salary: 160000, currency: 'XOF', social_security_opt_in: true, status: 'active', signature_status: 'signed', signed_at: '2025-02-01T09:00:00Z', notes: 'CDD renouvelable de 12 mois.', created_at: '2025-01-30T10:00:00Z' }
    ],
    hrms_skills: [
      { id: 'skill-1', hotel_id: 1, name: 'Anglais Courant / Anglais Hôtelier', category: 'languages', description: 'Capacité à mener une conversation fluide d\'accueil et de service client en anglais.' },
      { id: 'skill-2', hotel_id: 1, name: 'Certification HACCP Hygiène de Table', category: 'technical_haccp', description: 'Maîtrise absolue des contrôles de température, de stockage et d\'hygiène alimentaire ouest-africaine.' },
      { id: 'skill-3', hotel_id: 1, name: 'Secourisme & Évacuation Incendie', category: 'safety', description: 'Aptitude SST (Sauveteur Secouriste du Travail) et habilitation maniement d\'extincteurs.' },
      { id: 'skill-4', hotel_id: 1, name: 'Maitrise de Nucleus PMS Core v3.0', category: 'soft_skills', description: 'Expertise dans l\'usage quotidien du logiciel : attributions de chambres, rapports, facturation.' }
    ],
    hrms_employee_skills: [
      { id: 'emp-skill-1', hotel_id: 1, employee_id: 'emp-1', skill_id: 'skill-1', level: 'advanced', obtained_date: '2025-01-15' },
      { id: 'emp-skill-2', hotel_id: 1, employee_id: 'emp-1', skill_id: 'skill-4', level: 'expert', obtained_date: '2025-01-20' }
    ],
    hrms_documents: [
      { id: 'doc-1', hotel_id: 1, employee_id: 'emp-1', document_type: 'contract', file_name: 'Contrat_Koffi_Yao_Signe.pdf', file_path: '/uploads/documents/Contrat_Koffi_Yao_Signe.pdf', file_size: 1420102, mime_type: 'application/pdf', uploaded_at: '2025-01-15T10:00:00Z', uploaded_by: 'Comptable RH' }
    ],
    hrms_onboarding_tasks: [
      { id: 'ob-1', hotel_id: 1, employee_id: 'emp-1', task_name: 'Fournir la copie de la CNI / Passeport', assigned_to: 'Koffi Yao', status: 'completed', completed_at: '2025-01-15' },
      { id: 'ob-2', hotel_id: 1, employee_id: 'emp-1', task_name: 'Signature du contrat d\'embauche', assigned_to: 'Responsable RH', status: 'completed', completed_at: '2025-01-15' },
      { id: 'ob-3', hotel_id: 1, employee_id: 'emp-1', task_name: 'Création des accès sur Nucleus PMS', assigned_to: 'Admin', status: 'completed', completed_at: '2025-01-15' }
    ],
    hrms_payroll_rules: [
      { id: 1, hotel_id: 1, country_code: 'CI', default_currency: 'XOF', cnps_employee_rate: 0.0550, cnps_employer_rate: 0.0770, cnps_ceiling: 1200000.00, salary_tax_rate: 0.0120, national_contribution_rate: 0.0000, effective_date: '2025-01-01', active: true }
    ],
    hrms_business_events: [
      { id: 'evt-1', hotel_id: 1, timestamp: '2025-01-15T09:00:00Z', event_type: 'EmployeeCreated', actor_name: 'Comptable RH', description: 'Création de la fiche employé Koffi Yao et génération automatique des tâches d\'Onboarding.' }
    ],
    audit_logs: [
      {
        id: 1001,
        user_id: 1,
        module: 'settings',
        action: 'update_hotel_settings',
        record_id: '1',
        details: 'Mise à jour des coordonnées de l\'hôtel et configuration du taux de TVA à 18%',
        ip_address: '192.168.1.10',
        created_at: new Date(Date.now() - 3600000 * 2.5).toISOString() // 2.5 hours ago
      },
      {
        id: 1002,
        user_id: 4,
        module: 'reservations',
        action: 'check_in',
        record_id: 'res-1',
        details: 'Check-in validé pour le client Assa Diallo, attribution de la chambre 101',
        ip_address: '192.168.1.15',
        created_at: new Date(Date.now() - 3600000 * 1.8).toISOString() // 1.8 hours ago
      },
      {
        id: 1003,
        user_id: 4,
        module: 'billing',
        action: 'payment_received',
        record_id: 'pay-101',
        details: 'Acompte de 50 000 FCFA reçu via Mobile Money (Wave) pour la réservation RES-2026-0001',
        ip_address: '192.168.1.15',
        created_at: new Date(Date.now() - 3600000 * 1.5).toISOString() // 1.5 hours ago
      },
      {
        id: 1004,
        user_id: 1,
        module: 'hrms',
        action: 'sign_contract',
        record_id: 'contract-1',
        details: 'Signature du contrat d\'embauche CDI pour Koffi Yao (Réceptionniste)',
        ip_address: '192.168.1.10',
        created_at: new Date(Date.now() - 3600000 * 0.5).toISOString() // 30 mins ago
      }
    ],
    settings: [
      { id: 1, key_name: 'backup_interval_hours', value_text: '24' },
      { id: 2, key_name: 'maintenance_mode', value_text: 'false' }
    ],
    system_config: [
      { id: 1, config_name: 'pms_version', config_value: '3.0', description: 'Version majeure du système' },
      { id: 2, config_name: 'allowed_ip_range', config_value: '*', description: 'Plage IP autorisée pour l\'accès administratif' }
    ],
    module_access: [
      { id: 1, role_id: 1, module_name: 'finance', is_enabled: true },
      { id: 2, role_id: 2, module_name: 'hrms', is_enabled: true },
      { id: 3, role_id: 3, module_name: 'restaurant', is_enabled: true }
    ],
    backups: [],
    connection_journal: [],
    timesheet_history: []
  };
}

// Ensure database file exists and is populated
if (!fs.existsSync(JSON_DB_FILE)) {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(getInitialSeedData(), null, 2), 'utf8');
    console.log('[Database] Seeded fallback JSON database at:', JSON_DB_FILE);
  } catch (err: any) {
    console.error('[Database] Failed to write initial seed file:', err.message);
  }
}

// Read database
export function readDB(): any {
  try {
    const data = fs.readFileSync(JSON_DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[Database] Error reading JSON DB, returning seed template', err);
    return getInitialSeedData();
  }
}

// Write database
export function writeDB(data: any): void {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Database] Error writing JSON DB', err);
  }
}

// Applies a single UPDATE inside an existing MySQL transaction, restricting
// the SET clause to columns that actually exist on the table (mirrors the
// dynamic-column-detection already used by saveCollection).
async function applyUpdateInTransaction(
  connection: mysql.PoolConnection,
  table: string,
  id: string | number,
  fields: Record<string, any>,
  timestamp: string
): Promise<void> {
  const [columnsInfo] = await connection.query(`DESCRIBE \`${table}\``);
  const allowedColumns = (columnsInfo as any[]).map((col) => col.Field);
  const keys = Object.keys(fields).filter((k) => allowedColumns.includes(k) && k !== 'id');
  if (keys.length === 0) return;

  const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ');
  const values = keys.map((k) => {
    const val = fields[k];
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    if (typeof val === 'boolean') return val ? 1 : 0;
    return val;
  });

  const hasUpdatedAt = allowedColumns.includes('updated_at');
  const sql = hasUpdatedAt
    ? `UPDATE \`${table}\` SET ${setClause}, \`updated_at\` = ? WHERE \`id\` = ?`
    : `UPDATE \`${table}\` SET ${setClause} WHERE \`id\` = ?`;
  const params = hasUpdatedAt ? [...values, timestamp, id] : [...values, id];

  await connection.query(sql, params);
}

// Applies a single INSERT (or upsert) inside an existing MySQL transaction.
async function applyInsertInTransaction(
  connection: mysql.PoolConnection,
  table: string,
  item: Record<string, any>
): Promise<void> {
  const [columnsInfo] = await connection.query(`DESCRIBE \`${table}\``);
  const allowedColumns = (columnsInfo as any[]).map((col) => col.Field);
  const keys = Object.keys(item).filter((k) => allowedColumns.includes(k));
  if (keys.length === 0) return;

  const columns = keys.map((k) => `\`${k}\``).join(', ');
  const placeholders = keys.map(() => '?').join(', ');
  const updateExpression = keys
    .filter((k) => k !== 'id' && k !== 'created_at')
    .map((k) => `\`${k}\` = VALUES(\`${k}\`)`)
    .join(', ');
  const values = keys.map((k) => {
    const val = item[k];
    if (typeof val === 'object' && val !== null) return JSON.stringify(val);
    if (typeof val === 'boolean') return val ? 1 : 0;
    return val;
  });

  let sql = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`;
  if (updateExpression) sql += ` ON DUPLICATE KEY UPDATE ${updateExpression}`;

  await connection.query(sql, values);
}

export type TransactionMutation =
  | { type: 'insert'; collection: string; item: Record<string, any> }
  | { type: 'update'; collection: string; id: string | number; fields: Record<string, any> };

// General DB abstraction API
export const db = {
  getCollection: async (name: string): Promise<any[]> => {
    if (useMySQL && pool && isMySQLOnline) {
      try {
        const [rows] = await pool.query(`SELECT * FROM \`${name}\``);
        const mysqlRecords = rows as any[];
        
        // If MySQL has records, return them!
        if (mysqlRecords.length > 0) {
          return mysqlRecords;
        }
        
        // If MySQL is empty, but local JSON has records, sync local JSON to MySQL!
        const localData = readDB();
        const localRecords = localData[name] || [];
        if (localRecords.length > 0) {
          console.log(`[Database MySQL] Table ${name} is empty. Auto-seeding with ${localRecords.length} local records.`);
          await db.saveCollection(name, localRecords);
          return localRecords;
        }
        
        // Special case: if table is 'users' and both are empty, auto-seed default seed data
        if (name === 'users') {
          console.log(`[Database MySQL] Users table is completely empty. Seeding defaults.`);
          const initialData = getInitialSeedData();
          await db.saveCollection('users', initialData.users);
          return initialData.users;
        }
        
        return [];
      } catch (err: any) {
        if (isConnectionError(err)) {
          isMySQLOnline = false;
          console.warn(`[Database MySQL] Connection lost or refused while reading ${name}. Switched silently to Local JSON Fallback.`);
        } else {
          console.error(`[Database MySQL] Error reading ${name}, falling back to local JSON:`, err.message);
        }
      }
    }
    const data = readDB();
    let records = data[name] || [];
    if (name === 'users' && records.length === 0) {
      console.log(`[Database] Users collection is completely empty in local JSON. Seeding defaults.`);
      const initialData = getInitialSeedData();
      records = initialData.users;
      data.users = records;
      writeDB(data);
    }
    return records;
  },

  saveCollection: async (name: string, records: any[]): Promise<void> => {
    const data = readDB();
    data[name] = records;
    writeDB(data);
    
    // Attempt sync if MySQL is active
    if (useMySQL && pool && isMySQLOnline) {
      try {
        if (records.length === 0) {
          try {
            await pool.query(`DELETE FROM \`${name}\``);
          } catch (e: any) {
            if (isConnectionError(e)) {
              isMySQLOnline = false;
              console.warn(`[Database MySQL] Connection lost during clear table ${name}. Switched silently to Local JSON Fallback.`);
            } else {
              console.warn(`[Database MySQL] Failed to clear table ${name}:`, e.message);
            }
          }
          return;
        }

        // Fetch columns of the table dynamically to prevent "Unknown Column" errors
        const [columnsInfo] = await pool.query(`DESCRIBE \`${name}\``);
        const allowedColumns = (columnsInfo as any[]).map(col => col.Field);

        for (const record of records) {
          const keys = Object.keys(record).filter(k => allowedColumns.includes(k));
          if (keys.length === 0) continue;

          const columns = keys.map(k => `\`${k}\``).join(', ');
          const placeholders = keys.map(() => '?').join(', ');
          const updateExpression = keys
            .filter(k => k !== 'id' && k !== 'created_at')
            .map(k => `\`${k}\` = VALUES(\`${k}\`)`)
            .join(', ');

          const values = keys.map(k => {
            const val = record[k];
            if (typeof val === 'object' && val !== null) {
              return JSON.stringify(val);
            }
            if (typeof val === 'boolean') {
              return val ? 1 : 0;
            }
            return val;
          });

          let sql = `INSERT INTO \`${name}\` (${columns}) VALUES (${placeholders})`;
          if (updateExpression) {
            sql += ` ON DUPLICATE KEY UPDATE ${updateExpression}`;
          }

          await pool.query(sql, values);
        }
        console.log(`[Database MySQL] Successfully synchronized ${records.length} records to table ${name}.`);
      } catch (err: any) {
        if (isConnectionError(err)) {
          isMySQLOnline = false;
          console.warn(`[Database MySQL] Connection lost during synchronization for ${name}. Switched silently to Local JSON Fallback.`);
        } else {
          console.error(`[Database MySQL] Sync error for ${name}:`, err.message);
        }
      }
    }
  },

  // Direct element operations
  getById: async (collectionName: string, id: string | number): Promise<any> => {
    const items = await db.getCollection(collectionName);
    return items.find((item: any) => item.id == id) || null;
  },

  insert: async (collectionName: string, item: any): Promise<any> => {
    const items = await db.getCollection(collectionName);
    items.push(item);
    await db.saveCollection(collectionName, items);
    return item;
  },

  update: async (collectionName: string, id: string | number, updatedFields: any): Promise<any> => {
    const items = await db.getCollection(collectionName);
    const index = items.findIndex((item: any) => item.id == id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updatedFields, updated_at: new Date().toISOString() };
    await db.saveCollection(collectionName, items);
    return items[index];
  },

  delete: async (collectionName: string, id: string | number): Promise<boolean> => {
    const items = await db.getCollection(collectionName);
    const initialLen = items.length;
    const filtered = items.filter((item: any) => item.id != id);
    if (filtered.length === initialLen) return false;

    await db.saveCollection(collectionName, filtered);
    return true;
  },

  // Applies several mutations across one or more collections as a single
  // atomic unit, so a reservation status and its room status (for example)
  // can never be persisted out of sync with each other. The local JSON
  // store — the durable record whenever MySQL is offline — is updated with
  // one file write for the whole batch; if any referenced record is
  // missing, nothing is written at all. When MySQL is the active backend,
  // the same mutations are mirrored inside a real SQL transaction
  // (COMMIT/ROLLBACK) as a best-effort sync, matching the existing
  // JSON-primary / MySQL-mirror pattern used elsewhere in this file.
  runTransaction: async (mutations: TransactionMutation[]): Promise<any[] | null> => {
    const data = readDB();
    const now = new Date().toISOString();
    const results: any[] = [];

    for (const mutation of mutations) {
      const items = data[mutation.collection] || [];
      if (mutation.type === 'insert') {
        const record = { created_at: now, ...mutation.item, updated_at: now };
        items.push(record);
        data[mutation.collection] = items;
        results.push(record);
      } else {
        const index = items.findIndex((item: any) => item.id == mutation.id);
        if (index === -1) {
          return null; // Abort before writing anything: nothing partially applied.
        }
        items[index] = { ...items[index], ...mutation.fields, updated_at: now };
        data[mutation.collection] = items;
        results.push(items[index]);
      }
    }

    writeDB(data);

    if (useMySQL && pool && isMySQLOnline) {
      let connection: mysql.PoolConnection | undefined;
      try {
        connection = await pool.getConnection();
        await connection.beginTransaction();
        for (let i = 0; i < mutations.length; i++) {
          const mutation = mutations[i];
          if (mutation.type === 'insert') {
            await applyInsertInTransaction(connection, mutation.collection, results[i]);
          } else {
            await applyUpdateInTransaction(connection, mutation.collection, mutation.id, mutation.fields, now);
          }
        }
        await connection.commit();
      } catch (err: any) {
        if (connection) {
          try {
            await connection.rollback();
          } catch {
            // ignore rollback failure — connection is likely already broken
          }
        }
        if (isConnectionError(err)) {
          isMySQLOnline = false;
          console.warn('[Database MySQL] Connection lost during transactional update. Switched silently to Local JSON Fallback.');
        } else {
          console.error('[Database MySQL] Transactional mirror failed (JSON fallback already applied):', err.message);
        }
      } finally {
        connection?.release();
      }
    }

    return results;
  },

  getDiagnostics: async () => {
    const start = Date.now();
    let latency = 0;
    let connected = false;
    let error: string | null = null;
    const tableCounts: Record<string, number> = {};

    const tableNames = [
      'users', 'roles', 'role_permissions', 'hotel_settings', 'room_categories', 'rooms', 
      'amenities', 'guests', 'reservations', 'invoices', 'payments', 
      'housekeeping_tasks', 'maintenance_tickets', 'stock_items', 
      'restaurant_menu_items', 'restaurant_orders', 'hrms_departments',
      'settings', 'system_config', 'module_access'
    ];

    if (useMySQL && pool) {
      try {
        await pool.query('SELECT 1');
        latency = Date.now() - start;
        connected = true;
        isMySQLOnline = true; // Reset back to true if manual diagnostics succeeded

        for (const table of tableNames) {
          try {
            const [rows]: any = await pool.query(`SELECT COUNT(*) as count FROM \`${table}\``);
            tableCounts[table] = rows[0]?.count || 0;
          } catch (e: any) {
            tableCounts[table] = 0;
          }
        }
      } catch (err: any) {
        error = err.message;
        connected = false;
        if (isConnectionError(err)) {
          isMySQLOnline = false;
        }
      }
    }

    if (!connected) {
      try {
        const data = readDB();
        latency = Date.now() - start;
        for (const table of tableNames) {
          tableCounts[table] = Array.isArray(data[table]) ? data[table].length : (data[table] ? 1 : 0);
        }
      } catch (err: any) {
        error = err.message;
      }
    }

    return {
      useMySQL,
      connected: connected && useMySQL,
      engine: useMySQL && connected ? 'MySQL Database' : 'Local JSON File Fallback',
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME,
      user: DB_USER,
      latency,
      error,
      tableCounts
    };
  },

  inspectUsersSchema: async () => {
    if (useMySQL && pool && isMySQLOnline) {
      try {
        const [columns]: any = await pool.query('SHOW COLUMNS FROM `users`');
        let indexes: any[] = [];
        try {
          const [indexRows]: any = await pool.query('SHOW INDEX FROM `users`');
          indexes = indexRows;
        } catch (e) {}

        return {
          success: true,
          engine: 'MySQL',
          columns: columns.map((col: any) => ({
            field: col.Field,
            type: col.Type,
            null: col.Null,
            key: col.Key,
            default: col.Default,
            extra: col.Extra
          })),
          indexes: indexes.map((idx: any) => ({
            table: idx.Table,
            non_unique: idx.Non_unique,
            key_name: idx.Key_name,
            column_name: idx.Column_name
          }))
        };
      } catch (err: any) {
        if (isConnectionError(err)) {
          isMySQLOnline = false;
        }
        return {
          success: false,
          engine: 'MySQL',
          error: err.message
        };
      }
    }
    return {
      success: true,
      engine: 'JSON',
      columns: [
        { field: 'id', type: 'string/number', null: 'NO', key: 'PRI', default: null, extra: '' },
        { field: 'email', type: 'string', null: 'NO', key: 'UNI', default: null, extra: '' },
        { field: 'password_hash', type: 'string', null: 'NO', key: '', default: null, extra: '' },
        { field: 'first_name', type: 'string', null: 'YES', key: '', default: null, extra: '' },
        { field: 'last_name', type: 'string', null: 'YES', key: '', default: null, extra: '' },
        { field: 'phone', type: 'string', null: 'YES', key: '', default: null, extra: '' },
        { field: 'status', type: 'string', null: 'NO', key: '', default: 'active', extra: '' },
        { field: 'role', type: 'string', null: 'NO', key: '', default: 'Réceptionniste', extra: '' },
        { field: 'privileges', type: 'JSON', null: 'YES', key: '', default: null, extra: '' }
      ],
      indexes: []
    };
  },

  backup: async () => {
    const data: any = {};
    const tableNames = [
      'users', 'roles', 'role_permissions', 'hotel_settings', 'room_categories', 'rooms', 
      'amenities', 'guests', 'reservations', 'invoices', 'payments', 
      'housekeeping_tasks', 'maintenance_tickets', 'stock_items', 
      'restaurant_menu_items', 'restaurant_orders', 'hrms_departments',
      'settings', 'system_config', 'module_access'
    ];

    if (useMySQL && pool && isMySQLOnline) {
      for (const table of tableNames) {
        try {
          const [rows] = await pool.query(`SELECT * FROM \`${table}\``);
          data[table] = rows;
        } catch (e: any) {
          if (isConnectionError(e)) {
            isMySQLOnline = false;
            console.warn(`[Database Backup] Connection lost while backing up ${table}. Switched silently to Local JSON Fallback.`);
          } else {
            console.warn(`[Database Backup] Failed to read ${table} from MySQL:`, e.message);
          }
          const local = readDB();
          data[table] = local[table] || [];
        }
      }
    } else {
      const local = readDB();
      for (const table of tableNames) {
        data[table] = local[table] || [];
      }
    }
    return data;
  },

  restore: async (backupData: any) => {
    const tableNames = [
      'users', 'roles', 'role_permissions', 'hotel_settings', 'room_categories', 'rooms', 
      'amenities', 'guests', 'reservations', 'invoices', 'payments', 
      'housekeeping_tasks', 'maintenance_tickets', 'stock_items', 
      'restaurant_menu_items', 'restaurant_orders', 'hrms_departments',
      'settings', 'system_config', 'module_access'
    ];

    const current = readDB();
    const merged = { ...current };

    for (const table of tableNames) {
      if (backupData[table] !== undefined) {
        merged[table] = backupData[table];
      }
    }

    writeDB(merged);

    if (useMySQL && pool && isMySQLOnline) {
      for (const table of tableNames) {
        try {
          try {
            await pool.query(`DELETE FROM \`${table}\``);
          } catch (e: any) {
            if (isConnectionError(e)) {
              isMySQLOnline = false;
              console.warn(`[Database Restore] Connection lost during clear of ${table}. Switched silently to Local JSON Fallback.`);
            } else {
              console.warn(`[Database Restore] Failed to clean ${table} before restore:`, e.message);
            }
          }
          
          if (isMySQLOnline) {
            const records = merged[table];
            if (records) {
              const recordsArray = Array.isArray(records) ? records : [records];
              if (recordsArray.length > 0) {
                await db.saveCollection(table, recordsArray);
              }
            }
          }
        } catch (e: any) {
          console.error(`[Database Restore] Failed to restore table ${table} to MySQL:`, e.message);
        }
      }
    }
    return { success: true, restoredTables: Object.keys(backupData) };
  }
};
