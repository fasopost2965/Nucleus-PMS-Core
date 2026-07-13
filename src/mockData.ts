/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  IGuest,
  IRoomCategory,
  IRoom,
  IAmenity,
  IReservation,
  IInvoice,
  IInvoiceItem,
  IPayment,
  IHousekeepingTask,
  IMaintenanceTicket,
  IStockItem,
  ISupplier,
  IMenuItem,
  IRestaurantOrder,
  IRestaurantOrderItem
} from './types';

// Amenities
export const mockAmenities: IAmenity[] = [
  { id: 'amen-wifi', name: 'Wi-Fi Haute Vitesse', icon: 'Wifi', category: 'Technologie', active: true },
  { id: 'amen-ac', name: 'Climatisation', icon: 'Wind', category: 'Confort', active: true },
  { id: 'amen-tv', name: 'TV Écran Plat', icon: 'Tv', category: 'Technologie', active: true },
  { id: 'amen-minibar', name: 'Mini-bar', icon: 'Coffee', category: 'Confort', active: true },
  { id: 'amen-bath', name: 'Baignoire', icon: 'Bath', category: 'Salle de bain', active: true },
  { id: 'amen-garden', name: 'Vue Jardin', icon: 'Trees', category: 'Vue', active: true },
  { id: 'amen-desk', name: 'Bureau de travail', icon: 'Briefcase', category: 'Confort', active: true },
  { id: 'amen-pool', name: 'Accès Piscine', icon: 'Waves', category: 'Services', active: true }
];

// Categories
export const mockRoomCategories: IRoomCategory[] = [
  { id: 'cat-std', name: 'Standard', description: 'Chambre confortable avec lit double, climatisation, bureau et TV.', default_price: 35000, max_capacity: 2, color: 'emerald', icon: 'Bed' },
  { id: 'cat-twin', name: 'Standard Twin', description: 'Chambre avec deux lits simples, idéale pour collègues ou amis.', default_price: 40000, max_capacity: 2, color: 'blue', icon: 'BedDouble' },
  { id: 'cat-dlx', name: 'Deluxe', description: 'Espace spacieux, lit King size, mini-bar, grand écran et vue sur jardin.', default_price: 55000, max_capacity: 2, color: 'indigo', icon: 'Sparkles' },
  { id: 'cat-ste', name: 'Suite Brunch', description: 'Le luxe absolu : salon privé, baignoire, lit King size et petit déjeuner brunch inclus.', default_price: 95000, max_capacity: 3, color: 'amber', icon: 'Crown' },
  { id: 'cat-fam', name: 'Familiale', description: 'Suite avec deux chambres séparées, idéale pour les séjours en famille.', default_price: 75000, max_capacity: 5, color: 'rose', icon: 'Users' }
];

// Rooms
export const mockRooms: IRoom[] = [
  {
    id: 'room-101',
    room_number: '101',
    category_id: 'cat-std',
    floor: '1er Étage',
    capacity: 2,
    bed_type: 'Lit Double',
    area: 22,
    base_price: 35000,
    amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-desk'],
    notes: 'Chambre proche de l\'ascenseur. Préférée des voyageurs d\'affaires.',
    active: true,
    prices: [
      { rate_type: 'normal', amount: 35000 },
      { rate_type: 'weekend', amount: 38000 },
      { rate_type: 'season', amount: 45000 },
      { rate_type: 'corporate', amount: 32000 },
      { rate_type: 'ota', amount: 40000 }
    ],
    created_at: '2026-01-10T12:00:00Z',
    updated_at: '2026-06-15T15:30:00Z',
    created_by: 'Koffi (Réception)',
    updated_by: 'Koffi (Réception)'
  },
  {
    id: 'room-102',
    room_number: '102',
    category_id: 'cat-std',
    floor: '1er Étage',
    capacity: 2,
    bed_type: 'Lit Double',
    area: 22,
    base_price: 35000,
    amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-desk'],
    notes: 'Très calme, donne sur la cour intérieure.',
    active: true,
    prices: [
      { rate_type: 'normal', amount: 35000 },
      { rate_type: 'weekend', amount: 38000 },
      { rate_type: 'season', amount: 45000 },
      { rate_type: 'corporate', amount: 32000 },
      { rate_type: 'ota', amount: 40000 }
    ],
    created_at: '2026-01-10T12:00:00Z',
    updated_at: '2026-01-10T12:00:00Z',
    created_by: 'Koffi (Réception)',
    updated_by: 'Koffi (Réception)'
  },
  {
    id: 'room-103',
    room_number: '103',
    category_id: 'cat-twin',
    floor: '1er Étage',
    capacity: 2,
    bed_type: '2 Lits Simples',
    area: 25,
    base_price: 40000,
    amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-desk'],
    notes: 'Idéal pour le co-sharing professionnel.',
    active: true,
    prices: [
      { rate_type: 'normal', amount: 40000 },
      { rate_type: 'weekend', amount: 44000 },
      { rate_type: 'season', amount: 50000 },
      { rate_type: 'corporate', amount: 36000 },
      { rate_type: 'ota', amount: 46000 }
    ],
    created_at: '2026-01-12T10:30:00Z',
    updated_at: '2026-04-18T09:15:00Z',
    created_by: 'Koffi (Réception)',
    updated_by: 'Amandine (Admin)'
  },
  {
    id: 'room-104',
    room_number: '104',
    category_id: 'cat-dlx',
    floor: '1er Étage',
    capacity: 2,
    bed_type: 'Lit King Size',
    area: 32,
    base_price: 55000,
    amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-minibar', 'amen-garden', 'amen-desk', 'amen-pool'],
    notes: 'Excellente luminosité le matin. Vue splendide sur le jardin.',
    active: true,
    prices: [
      { rate_type: 'normal', amount: 55000 },
      { rate_type: 'weekend', amount: 60000 },
      { rate_type: 'season', amount: 70000 },
      { rate_type: 'corporate', amount: 50000 },
      { rate_type: 'ota', amount: 63000 }
    ],
    created_at: '2026-01-15T14:00:00Z',
    updated_at: '2026-01-15T14:00:00Z',
    created_by: 'Amandine (Admin)',
    updated_by: 'Amandine (Admin)'
  },
  {
    id: 'room-201',
    room_number: '201',
    category_id: 'cat-dlx',
    floor: '2ème Étage',
    capacity: 2,
    bed_type: 'Lit King Size',
    area: 32,
    base_price: 55000,
    amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-minibar', 'amen-garden', 'amen-desk', 'amen-pool'],
    notes: 'Possède un petit balcon privé aménagé.',
    active: true,
    prices: [
      { rate_type: 'normal', amount: 55000 },
      { rate_type: 'weekend', amount: 60000 },
      { rate_type: 'season', amount: 70000 },
      { rate_type: 'corporate', amount: 50000 },
      { rate_type: 'ota', amount: 63000 }
    ],
    created_at: '2026-01-15T14:30:00Z',
    updated_at: '2026-05-12T11:00:00Z',
    created_by: 'Amandine (Admin)',
    updated_by: 'Koffi (Réception)'
  },
  {
    id: 'room-202',
    room_number: '202',
    category_id: 'cat-ste',
    floor: '2ème Étage',
    capacity: 3,
    bed_type: 'Lit King Size + Canapé',
    area: 45,
    base_price: 95000,
    amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-minibar', 'amen-bath', 'amen-garden', 'amen-desk', 'amen-pool'],
    notes: 'Bouteille de vin de palme de bienvenue. Suite de prestige.',
    active: true,
    prices: [
      { rate_type: 'normal', amount: 95000 },
      { rate_type: 'weekend', amount: 105000 },
      { rate_type: 'season', amount: 120000 },
      { rate_type: 'corporate', amount: 85000 },
      { rate_type: 'ota', amount: 110000 }
    ],
    created_at: '2026-01-20T09:00:00Z',
    updated_at: '2026-01-20T09:00:00Z',
    created_by: 'Amandine (Admin)',
    updated_by: 'Amandine (Admin)'
  },
  {
    id: 'room-203',
    room_number: '203',
    category_id: 'cat-ste',
    floor: '2ème Étage',
    capacity: 3,
    bed_type: 'Lit King Size + Canapé',
    area: 45,
    base_price: 95000,
    amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-minibar', 'amen-bath', 'amen-garden', 'amen-desk', 'amen-pool'],
    notes: 'Actuellement en révision technique périodique.',
    active: true,
    prices: [
      { rate_type: 'normal', amount: 95000 },
      { rate_type: 'weekend', amount: 105000 },
      { rate_type: 'season', amount: 120000 },
      { rate_type: 'corporate', amount: 85000 },
      { rate_type: 'ota', amount: 110000 }
    ],
    created_at: '2026-01-20T09:30:00Z',
    updated_at: '2026-07-11T16:00:00Z',
    created_by: 'Amandine (Admin)',
    updated_by: 'Abdoulaye (Technicien)'
  },
  {
    id: 'room-204',
    room_number: '204',
    category_id: 'cat-fam',
    floor: '2ème Étage',
    capacity: 5,
    bed_type: '1 King Size + 2 Simples',
    area: 55,
    base_price: 75000,
    amenities: ['amen-wifi', 'amen-ac', 'amen-tv', 'amen-minibar', 'amen-bath', 'amen-desk'],
    notes: 'Deux salles d\'eau séparées. Excellente pour les familles nombreuses.',
    active: true,
    prices: [
      { rate_type: 'normal', amount: 75000 },
      { rate_type: 'weekend', amount: 82000 },
      { rate_type: 'season', amount: 95000 },
      { rate_type: 'corporate', amount: 68000 },
      { rate_type: 'ota', amount: 85000 }
    ],
    created_at: '2026-01-25T11:00:00Z',
    updated_at: '2026-01-25T11:00:00Z',
    created_by: 'Amandine (Admin)',
    updated_by: 'Amandine (Admin)'
  }
];

// Guests
export const mockGuests: IGuest[] = [
  { id: 'guest-1', first_name: 'Amadou', last_name: 'Kouassi', gender: 'M', birth_date: '1985-04-12', nationality: 'Ivoirienne', phone: '+225 07 45 89 12 34', email: 'amadou.kouassi@gmail.com', address: 'Quartier Commerce, Bouaké', document_type: 'CNI', document_number: 'CI003489249', vip: true, blacklist: false },
  { id: 'guest-2', first_name: 'Mariam', last_name: 'Bamba', gender: 'F', birth_date: '1992-09-22', nationality: 'Ivoirienne', phone: '+225 05 01 23 45 67', email: 'm.bamba@outlook.com', address: 'Cocody Angré, Abidjan', document_type: 'Passeport', document_number: '12AA9045', vip: false, blacklist: false },
  { id: 'guest-3', first_name: 'Jean-Pierre', last_name: 'Duval', gender: 'M', birth_date: '1978-11-05', nationality: 'Française', phone: '+33 6 12 34 56 78', email: 'jp.duval@yahoo.fr', address: 'Marcory Zone 4, Abidjan', document_type: 'Passeport', document_number: 'FR843924', vip: true, blacklist: false },
  { id: 'guest-4', first_name: 'Fatoumata', last_name: 'Diallo', gender: 'F', birth_date: '1995-07-15', nationality: 'Guinéenne', phone: '+225 01 77 88 99 00', email: 'fatou.diallo@gmail.com', address: 'Quartier Kennedy, Bouaké', document_type: 'CNI', document_number: 'GN0934823', vip: false, blacklist: false },
  { id: 'guest-5', first_name: 'Yao', last_name: 'Koné', gender: 'M', birth_date: '1980-02-28', nationality: 'Ivoirienne', phone: '+225 07 11 22 33 44', email: 'koney@hotmail.fr', address: 'N\'Gattakro, Bouaké', document_type: 'Permis', document_number: 'CI320494', vip: false, blacklist: true }
];

// Reservations
export const mockReservations: IReservation[] = [
  { id: 'res-1', reservation_number: 'RES-2026-0001', guest_id: 'guest-1', room_id: 'room-101', booking_source_id: 'src-direct', status: 'En séjour', arrival_date: '2026-07-12', departure_date: '2026-07-15', adults: 2, children: 0, nights: 3, room_rate: 35000, discount: 5000, tax_amount: 3000, total_amount: 103000, deposit: 50000, balance: 53000, remarks: 'Arrivée tardive, lit double.' },
  { id: 'res-2', reservation_number: 'RES-2026-0002', guest_id: 'guest-2', room_id: 'room-104', booking_source_id: 'src-booking', status: 'En séjour', arrival_date: '2026-07-10', departure_date: '2026-07-14', adults: 2, children: 1, nights: 4, room_rate: 55000, discount: 0, tax_amount: 4000, total_amount: 224000, deposit: 100000, balance: 124000, remarks: 'Besoin d\'un lit bébé supplémentaire.' },
  { id: 'res-3', reservation_number: 'RES-2026-0003', guest_id: 'guest-3', room_id: 'room-202', booking_source_id: 'src-direct', status: 'En séjour', arrival_date: '2026-07-11', departure_date: '2026-07-16', adults: 2, children: 0, nights: 5, room_rate: 95000, discount: 20000, tax_amount: 5000, total_amount: 460000, deposit: 200000, balance: 260000, remarks: 'Client VIP. Bouteille de champagne de bienvenue.' },
  { id: 'res-4', reservation_number: 'RES-2026-0004', guest_id: 'guest-4', room_id: 'room-102', booking_source_id: 'src-whatsapp', status: 'Confirmée', arrival_date: '2026-07-14', departure_date: '2026-07-17', adults: 1, children: 0, nights: 3, room_rate: 35000, discount: 0, tax_amount: 3000, total_amount: 108000, deposit: 35000, balance: 73000, remarks: 'Acompte versé par Wave.' },
  { id: 'res-5', reservation_number: 'RES-2026-0005', guest_id: 'guest-5', room_id: 'room-204', booking_source_id: 'src-direct', status: 'No Show', arrival_date: '2026-07-08', departure_date: '2026-07-11', adults: 4, children: 1, nights: 3, room_rate: 75000, discount: 0, tax_amount: 6000, total_amount: 231000, deposit: 0, balance: 231000, remarks: 'N\'est pas venu. Blacklisté.' }
];

// Invoices
export const mockInvoices: IInvoice[] = [
  { id: 'inv-1', invoice_number: 'FACT-2026-0101', reservation_id: 'res-1', guest_id: 'guest-1', subtotal: 105000, discount: 5000, tax: 3000, total: 103000, paid: 50000, balance: 53000, status: 'Partiellement payée', issued_at: '2026-07-12 14:30' },
  { id: 'inv-2', invoice_number: 'FACT-2026-0102', reservation_id: 'res-2', guest_id: 'guest-2', subtotal: 220000, discount: 0, tax: 4000, total: 224000, paid: 100000, balance: 124000, status: 'Partiellement payée', issued_at: '2026-07-10 16:15' },
  { id: 'inv-3', invoice_number: 'FACT-2026-0103', reservation_id: 'res-3', guest_id: 'guest-3', subtotal: 475000, discount: 20000, tax: 5000, total: 460000, paid: 200000, balance: 260000, status: 'Partiellement payée', issued_at: '2026-07-11 11:00' },
  { id: 'inv-4', invoice_number: 'FACT-2026-0104', reservation_id: 'res-4', guest_id: 'guest-4', subtotal: 105000, discount: 0, tax: 3000, total: 108000, paid: 35000, balance: 73000, status: 'Brouillon', issued_at: '2026-07-13 09:00' }
];

export const mockInvoiceItems: IInvoiceItem[] = [
  { id: 'inv-item-1', invoice_id: 'inv-1', item_type: 'Chambre', item_id: 'room-101', description: 'Chambre 101 Standard - 3 Nuits', quantity: 3, unit_price: 35000, tax: 3000, total: 105000 },
  { id: 'inv-item-2', invoice_id: 'inv-2', item_type: 'Chambre', item_id: 'room-104', description: 'Chambre 104 Deluxe - 4 Nuits', quantity: 4, unit_price: 55000, tax: 4000, total: 220000 },
  { id: 'inv-item-3', invoice_id: 'inv-3', item_type: 'Chambre', item_id: 'room-202', description: 'Chambre 202 Suite Brunch - 5 Nuits', quantity: 5, unit_price: 95000, tax: 5000, total: 475000 }
];

// Payments
export const mockPayments: IPayment[] = [
  { id: 'pay-1', invoice_id: 'inv-1', reservation_id: 'res-1', payment_method: 'Espèces', amount: 50000, reference: 'CASH-REC-01', payment_date: '2026-07-12 14:45', cashier_id: 'usr-admin', status: 'Validé' },
  { id: 'pay-2', invoice_id: 'inv-2', reservation_id: 'res-2', payment_method: 'Mobile Money', amount: 100000, reference: 'OrangeMoney TXN892348392', payment_date: '2026-07-10 16:30', cashier_id: 'usr-admin', status: 'Validé' },
  { id: 'pay-3', invoice_id: 'inv-3', reservation_id: 'res-3', payment_method: 'Carte', amount: 200000, reference: 'VISA E-POS 4829', payment_date: '2026-07-11 11:15', cashier_id: 'usr-reception', status: 'Validé' },
  { id: 'pay-4', invoice_id: 'inv-4', reservation_id: 'res-4', payment_method: 'Mobile Money', amount: 35000, reference: 'Wave TX-9849204', payment_date: '2026-07-13 08:30', cashier_id: 'usr-reception', status: 'Validé' }
];

// Housekeeping
export const mockHousekeepingTasks: IHousekeepingTask[] = [
  { id: 'hsk-1', room_id: 'room-103', employee_id: 'Awa Koné', priority: 'Normale', status: 'À nettoyer', scheduled_time: '2026-07-13 09:00' },
  { id: 'hsk-2', room_id: 'room-201', employee_id: 'Saliou Coulibaly', priority: 'Haute', status: 'En cours', scheduled_time: '2026-07-13 08:30' },
  { id: 'hsk-3', room_id: 'room-101', employee_id: 'Awa Koné', priority: 'Faible', status: 'Disponible', completed_time: '2026-07-13 07:45', scheduled_time: '2026-07-13 07:00' }
];

// Maintenance
export const mockMaintenanceTickets: IMaintenanceTicket[] = [
  { id: 'maint-1', room_id: 'room-101', category: 'Plomberie', priority: 'Normale', description: 'Fuite légère sous le lavabo de la salle de bain.', assigned_to: 'Koffi Germain', estimated_cost: 15000, status: 'Signalé', created_at: '2026-07-12' },
  { id: 'maint-2', room_id: 'room-203', category: 'Climatisation', priority: 'Critique', description: 'Le climatiseur ne refroidit pas et fait du bruit.', assigned_to: 'Abdoulaye Touré', estimated_cost: 35000, actual_cost: 35000, status: 'En cours', created_at: '2026-07-11' }
];

// Suppliers & Stock
export const mockSuppliers: ISupplier[] = [
  { id: 'sup-1', company_name: 'SOCOCE Bouaké', contact_name: 'Yao Anderson', phone: '+225 07 08 09 10 11', email: 'sales@sococe-bouake.ci', address: 'Quartier Commerce, Bouaké' },
  { id: 'sup-2', company_name: 'SND Côte d\'Ivoire', contact_name: 'N\'Guessan Marie', phone: '+225 05 55 66 77 88', email: 'marie.nguessan@snd.ci', address: 'Zone Industrielle, Bouaké' },
  { id: 'sup-3', company_name: 'Quincaillerie du Centre', contact_name: 'Bamba Lanciné', phone: '+225 01 02 03 04 05', email: 'contact@quinc-centre.ci', address: 'Quartier Air France, Bouaké' }
];

export const mockStockItems: IStockItem[] = [
  { id: 'stk-1', sku: 'EAU-KIL-1.5L', barcode: '61890342934', name: 'Eau Minérale Kirene 1.5L', category_id: 'Boissons', supplier_id: 'sup-1', purchase_price: 350, selling_price: 1000, unit: 'Bouteille', minimum_stock: 50, current_stock: 120 },
  { id: 'stk-2', sku: 'CAF-BOU-1KG', name: 'Café de Bouaké Pur Arabica', category_id: 'Alimentation', supplier_id: 'sup-2', purchase_price: 4500, selling_price: 0, unit: 'Paquet 1kg', minimum_stock: 10, current_stock: 25 },
  { id: 'stk-3', sku: 'DRAP-CTN-BLC', name: 'Draps de bain Coton Blanc', category_id: 'Linge', supplier_id: 'sup-2', purchase_price: 8500, selling_price: 0, unit: 'Pièce', minimum_stock: 20, current_stock: 8 }, // Low stock!
  { id: 'stk-4', sku: 'AMP-LED-9W', name: 'Ampoule LED E27 9W', category_id: 'Maintenance', supplier_id: 'sup-3', purchase_price: 1200, selling_price: 0, unit: 'Boîte de 10', minimum_stock: 5, current_stock: 15 }
];

// Restaurant Menus
export const mockMenuItems: IMenuItem[] = [
  { id: 'menu-1', category_id: 'Plats', name: 'Kédjénou de Poulet de Bouaké', description: 'Poulet fermier cuit à l\'étouffée avec légumes locaux, piment doux et épices traditionnelles. Servi avec de l\'Attiéké ou du riz.', selling_price: 6500, tax_rate: 18, available: true },
  { id: 'menu-2', category_id: 'Plats', name: 'Le Grand Brunch Bouaké', description: 'La spécialité maison : œufs brouillés, bacon de dinde, saucisses, gaufres croustillantes, fruits frais et jus de bissap pressé.', selling_price: 8500, tax_rate: 18, available: true },
  { id: 'menu-3', category_id: 'Accompagnements', name: 'Allocos Dorés', description: 'Bananes plantains mûres frites dans de l\'huile végétale de palme, croustillantes et fondantes, servies avec piment maison.', selling_price: 1500, tax_rate: 18, available: true },
  { id: 'menu-4', category_id: 'Boissons', name: 'Jus de Bissap Maison', description: 'Infusion de fleurs d\'hibiscus séchées, aromatisée à la menthe fraîche et au sucre de canne.', selling_price: 1000, tax_rate: 18, available: true },
  { id: 'menu-5', category_id: 'Boissons', name: 'Bandji Frais (Jus de Palmier)', description: 'Sève de palmier fraîchement récoltée le matin, douce et sans fermentation.', selling_price: 1500, tax_rate: 18, available: false }
];

// Restaurant Orders
export const mockRestaurantOrders: IRestaurantOrder[] = [
  { id: 'ord-1', order_number: 'REST-001', room_id: 'room-101', guest_id: 'guest-1', status: 'Servie', subtotal: 14500, tax: 2610, total: 17110, created_at: '2026-07-13 08:30' },
  { id: 'ord-2', order_number: 'REST-002', room_id: 'room-202', guest_id: 'guest-3', status: 'En préparation', subtotal: 18500, tax: 3330, total: 21830, created_at: '2026-07-13 09:15' },
  { id: 'ord-3', order_number: 'REST-003', status: 'En attente', subtotal: 8000, tax: 1440, total: 9440, created_at: '2026-07-13 09:35' } // External client
];

export const mockRestaurantOrderItems: IRestaurantOrderItem[] = [
  { id: 'ord-it-1', order_id: 'ord-1', menu_item_id: 'menu-1', quantity: 2, unit_price: 6500, total: 13000 },
  { id: 'ord-it-2', order_id: 'ord-1', menu_item_id: 'menu-3', quantity: 1, unit_price: 1500, total: 1500 },
  { id: 'ord-it-3', order_id: 'ord-2', menu_item_id: 'menu-2', quantity: 2, unit_price: 8500, total: 17000 },
  { id: 'ord-it-4', order_id: 'ord-2', menu_item_id: 'menu-4', quantity: 1, unit_price: 1000, total: 1000 }
];

// Activity logs for timeline
export interface IActivityLog {
  id: string;
  time: string;
  user: string;
  module: string;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export const mockActivityLogs: IActivityLog[] = [
  { id: 'act-1', time: '09:30', user: 'Koffi (Réception)', module: 'Réservations', action: 'Création', details: 'Nouvelle réservation RES-2026-0004 pour Fatoumata Diallo', type: 'success' },
  { id: 'act-2', time: '09:15', user: 'Awa (Housekeeping)', module: 'Entretien', action: 'Changement d\'état', details: 'Chambre 101 marquée Propre', type: 'info' },
  { id: 'act-3', time: '08:45', user: 'Système', module: 'Caisse', action: 'Clôture automatique', details: 'Fermeture de la caisse de nuit - Écart: 0 FCFA', type: 'success' },
  { id: 'act-4', time: '08:30', user: 'Koffi (Réception)', module: 'Paiements', action: 'Validation', details: 'Acompte reçu de 35,000 FCFA pour RES-2026-0004 via Wave', type: 'success' },
  { id: 'act-5', time: '07:15', user: 'Abdoulaye (Technique)', module: 'Maintenance', action: 'Alerte', details: 'Climatiseur Chambre 203 hors-service (Ticket Critique #maint-2)', type: 'error' },
  { id: 'act-6', time: '06:00', user: 'Système', module: 'Stock', action: 'Alerte Stock', details: 'Le produit Draps de bain Coton Blanc est sous le seuil d\'alerte (Actuel: 8)', type: 'warning' }
];

// Reservation Sources details
export interface IBookingSource {
  id: string;
  name: string;
  type: 'Direct' | 'En ligne' | 'OTA';
  active: boolean;
}

export const mockBookingSources: IBookingSource[] = [
  { id: 'src-direct', name: 'Direct (Walk-in)', type: 'Direct', active: true },
  { id: 'src-phone', name: 'Téléphone', type: 'Direct', active: true },
  { id: 'src-whatsapp', name: 'WhatsApp', type: 'En ligne', active: true },
  { id: 'src-booking', name: 'Booking.com', type: 'OTA', active: true },
  { id: 'src-expedia', name: 'Expedia', type: 'OTA', active: true },
  { id: 'src-airbnb', name: 'Airbnb', type: 'OTA', active: true }
];
