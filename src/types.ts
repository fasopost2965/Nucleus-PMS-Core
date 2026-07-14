/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IGuest {
  id: string;
  first_name: string;
  last_name: string;
  gender: 'M' | 'F' | 'Autre';
  birth_date: string;
  nationality: string;
  phone: string;
  email: string;
  address: string;
  document_type: 'CNI' | 'Passeport' | 'Permis' | 'Autre';
  document_number: string;
  notes?: string;
  vip: boolean;
  blacklist: boolean;
  guest_type?: 'Individuel' | 'Entreprise' | 'Corporate';
  company_name?: string;
  tax_id?: string;
  deferred_payment_authorized?: boolean;
  payment_terms?: string;
  credit_limit?: number;
}

export interface IAmenity {
  id: string;
  name: string;
  icon: string; // Lucide icon name, e.g. 'Wifi', 'Wind', etc.
  category: string; // 'Confort' | 'Technologie' | 'Salle de bain' | 'Vue' | 'Autre'
  active: boolean;
}

export interface IRoomTariff {
  rate_type: 'normal' | 'weekend' | 'season' | 'corporate' | 'ota';
  amount: number;
}

export interface IRoomCategory {
  id: string;
  name: string;
  description: string;
  default_price: number;
  max_capacity: number;
  color: string;
  icon?: string; // e.g. 'Bed', 'Flame', 'Sparkles', etc.
}

export type TRoomStatus = 'Disponible' | 'Occupée' | 'Réservée' | 'Nettoyage' | 'Maintenance' | 'Hors service' | 'Libre' | 'À nettoyer';
export type THousekeepingStatus = 'À nettoyer' | 'En cours' | 'Contrôle' | 'Disponible';
export type TMaintenanceStatus = 'Signalé' | 'Assigné' | 'En cours' | 'Résolu' | 'Clôturé';

export interface IRoom {
  id: string;
  room_number: string;
  category_id: string;
  floor: string;
  capacity: number;
  bed_type: string;
  area: number;
  base_price: number;
  amenities: string[]; // references IAmenity.id
  notes?: string;
  active: boolean;
  prices: IRoomTariff[];
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  // Retro-compatibility fields for legacy page compilations
  current_status?: TRoomStatus;
  housekeeping_status?: THousekeepingStatus;
  maintenance_status?: TMaintenanceStatus;
}

export type TReservationStatus = 'Brouillon' | 'En attente' | 'Confirmée' | 'En séjour' | 'Terminée' | 'Annulée' | 'No Show';

export interface IReservation {
  id: string;
  reservation_number: string;
  guest_id: string;
  room_id: string;
  booking_source_id: string;
  status: TReservationStatus;
  arrival_date: string;
  departure_date: string;
  adults: number;
  children: number;
  nights: number;
  room_rate: number;
  discount: number;
  tax_amount: number;
  total_amount: number;
  deposit: number;
  balance: number;
  remarks?: string;
}

export type TInvoiceStatus = 'Brouillon' | 'Émise' | 'Partiellement payée' | 'Payée' | 'Annulée';

export interface IInvoice {
  id: string;
  invoice_number: string;
  reservation_id: string;
  guest_id: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
  status: TInvoiceStatus;
  issued_at: string;
}

export interface IInvoiceItem {
  id: string;
  invoice_id: string;
  item_type: 'Chambre' | 'Restaurant' | 'Minibar' | 'Service' | 'Supplément';
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax: number;
  total: number;
}

export type TPaymentMethod = 'Espèces' | 'Carte' | 'Mobile Money' | 'Virement' | 'Chèque';

export interface IPayment {
  id: string;
  invoice_id: string;
  reservation_id: string;
  payment_method: TPaymentMethod;
  amount: number;
  reference?: string;
  payment_date: string;
  cashier_id: string;
  status: 'Validé' | 'Remboursé' | 'Annulé';
}

export interface IHousekeepingTask {
  id: string;
  room_id: string;
  employee_id: string;
  priority: 'Faible' | 'Normale' | 'Haute';
  status: THousekeepingStatus;
  scheduled_time: string;
  completed_time?: string;
  notes?: string;
}

export interface IMaintenanceTicket {
  id: string;
  room_id: string;
  category: string;
  priority: 'Faible' | 'Normale' | 'Haute' | 'Critique';
  description: string;
  assigned_to?: string;
  estimated_cost?: number;
  actual_cost?: number;
  status: TMaintenanceStatus;
  created_at: string;
}

export interface IStockItem {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  category_id: string;
  supplier_id: string;
  purchase_price: number;
  selling_price: number;
  unit: string;
  minimum_stock: number;
  current_stock: number;
}

export interface ISupplier {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  email: string;
  address: string;
}

export interface IMenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  selling_price: number;
  tax_rate: number;
  available: boolean;
  image?: string;
}

export interface IRestaurantOrder {
  id: string;
  order_number: string;
  reservation_id?: string;
  guest_id?: string;
  room_id?: string;
  status: 'En attente' | 'En préparation' | 'Servie' | 'Facturée' | 'Annulée';
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface IRestaurantOrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface IStockMovement {
  id: string;
  timestamp: string;
  item_id: string;
  item_name: string;
  sku: string;
  quantity: number;
  from_location: string;
  to_location: string;
  staff_name: string;
  type: string;
}

// ==========================================
// MODULE HRMS (HUMAN RESOURCES) TYPES
// ==========================================

export interface IHRMSDepartment {
  id: string;
  hotel_id: number;
  name: string;
  code: string;
  cost_center_code: string;
  manager_id?: string; // hrms_employees.id
  created_at: string;
}

export interface IHRMSJob {
  id: string;
  hotel_id: number;
  department_id: string;
  title: string;
  description: string;
  salary_min: number;
  salary_max: number;
  hourly_cost: number;
  created_at: string;
}

export interface IHRMSTeam {
  id: string;
  hotel_id: number;
  department_id: string;
  name: string;
  code: string;
  supervisor_id?: string;
  created_at: string;
}

export type TEmpType = 'FULL_TIME' | 'PART_TIME' | 'EXTRA' | 'SEASONAL' | 'INTERN' | 'CONSULTANT';
export type TEmpStatus = 'active' | 'suspended' | 'on_leave' | 'terminated';

export interface IHRMSEmployee {
  id: string;
  hotel_id: number;
  user_id?: string;
  department_id: string;
  job_id: string;
  team_id?: string;
  employee_code: string;
  employee_type: TEmpType;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: 'M' | 'F' | 'Autre';
  date_of_birth: string;
  address: string;
  nationality: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  hire_date: string;
  status: TEmpStatus;
  cnps_number?: string;
  
  // Banking / Mobile Money
  payment_method: 'bank_transfer' | 'mobile_money' | 'cash';
  bank_name?: string;
  bank_account_number?: string;
  bank_swift?: string;
  bank_iban?: string;
  mobile_money_provider?: 'Orange Money' | 'MTN MoMo' | 'Wave';
  mobile_money_number?: string;

  created_at: string;
  updated_at: string;
}

export interface IHRMSContract {
  id: string;
  hotel_id: number;
  employee_id: string;
  contract_type: 'CDI' | 'CDD' | 'EXTRA' | 'INTERN' | 'CONSULTANT';
  start_date: string;
  end_date?: string;
  trial_period_end?: string;
  base_salary: number;
  currency: string; // e.g., 'XOF' or 'EUR'
  social_security_opt_in: boolean;
  status: 'draft' | 'active' | 'expired' | 'superseded' | 'terminated';
  signature_status: 'unsigned' | 'signed';
  signed_at?: string;
  signed_by?: string;
  notes?: string;
  created_at: string;
}

export interface IHRMSSkill {
  id: string;
  hotel_id: number;
  name: string;
  category: 'languages' | 'technical_haccp' | 'safety' | 'soft_skills';
  description: string;
}

export interface IHRMSEmployeeSkill {
  id: string;
  hotel_id: number;
  employee_id: string;
  skill_id: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  obtained_date?: string;
  expiration_date?: string;
}

export interface IHRMSDocument {
  id: string;
  hotel_id: number;
  employee_id: string;
  document_type: 'id_card' | 'contract' | 'diploma' | 'payslip' | 'medical_certificate' | 'other';
  file_name: string;
  file_path: string;
  file_size: number; // in bytes
  mime_type: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface IHRMSOnboardingTask {
  id: string;
  hotel_id: number;
  employee_id: string;
  task_name: string;
  assigned_to?: string;
  status: 'pending' | 'completed';
  completed_at?: string;
  completed_by?: string;
}

export interface IHRMSBusinessEvent {
  id: string;
  hotel_id: number;
  timestamp: string;
  event_type: 'EmployeeCreated' | 'EmployeeUpdated' | 'ContractSigned' | 'PayrollGenerated' | 'SalaryAdvanceApproved' | 'EmployeeOffboarded' | 'LeaveApproved';
  actor_name: string;
  description: string;
  payload?: any;
}

export interface IHRMSPayrollRule {
  id: string;
  hotel_id: number;
  country_code: string; // e.g. 'CI'
  default_currency: string;
  cnps_employee_rate: number;
  cnps_employer_rate: number;
  cnps_ceiling: number;
  salary_tax_rate: number;
  national_contribution_rate: number;
  effective_date: string;
  active: boolean;
}


