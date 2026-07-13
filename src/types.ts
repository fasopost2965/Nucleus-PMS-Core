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
}

export interface IRoomCategory {
  id: string;
  name: string;
  description: string;
  default_price: number;
  max_capacity: number;
  color: string;
}

export type TRoomStatus = 'Libre' | 'Réservée' | 'Occupée' | 'À nettoyer' | 'Inspection' | 'Maintenance' | 'Hors service';
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
  current_status: TRoomStatus;
  housekeeping_status: THousekeepingStatus;
  maintenance_status: TMaintenanceStatus;
  notes?: string;
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
