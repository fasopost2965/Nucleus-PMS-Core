/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { mockRooms, mockStockItems, mockStockMovements } from './mockData';
import { IStockItem, IStockMovement, IRoom } from './types';

// Helper to get stock from local storage
export function getStock(): IStockItem[] {
  const stored = localStorage.getItem('pms_stock');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  if (localStorage.getItem('pms_db_purged') === 'true') {
    return [];
  }
  // Initialize with mock stock if not present
  localStorage.setItem('pms_stock', JSON.stringify(mockStockItems));
  return mockStockItems;
}

// Helper to save stock
export function saveStock(stock: IStockItem[]) {
  localStorage.setItem('pms_stock', JSON.stringify(stock));
}

// Helper to get rooms
export function getRoomsList(): IRoom[] {
  const stored = localStorage.getItem('pms_rooms');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  if (localStorage.getItem('pms_db_purged') === 'true') {
    return [];
  }
  localStorage.setItem('pms_rooms', JSON.stringify(mockRooms));
  return mockRooms;
}

// Helper to save rooms
export function saveRoomsList(rooms: IRoom[]) {
  localStorage.setItem('pms_rooms', JSON.stringify(rooms));
}

// Helper to get stock movements
export function getStockMovements(): IStockMovement[] {
  const stored = localStorage.getItem('pms_stock_movements');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  if (localStorage.getItem('pms_db_purged') === 'true') {
    return [];
  }
  // Initialize with mock movements if not present
  localStorage.setItem('pms_stock_movements', JSON.stringify(mockStockMovements));
  return mockStockMovements;
}

// Helper to save stock movements
export function saveStockMovements(movements: IStockMovement[]) {
  localStorage.setItem('pms_stock_movements', JSON.stringify(movements));
}

// Helper to format timestamps beautifully: YYYY-MM-DD HH:MM:SS
export function formatCurrentTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  return `${dateStr} ${timeStr}`;
}

// Main logic for setting a room to 'Maintenance'
// Automatically moves the linen currently active in that room to the Laundry queue.
export function handleRoomMaintenanceTrigger(roomId: string, staffName: string = 'Système (Automatique)'): {
  success: boolean;
  message: string;
} {
  const rooms = getRoomsList();
  const targetRoom = rooms.find(r => r.id === roomId);
  if (!targetRoom) {
    return { success: false, message: "Chambre introuvable." };
  }

  const stock = getStock();

  // Determine quantities based on room category
  // Suite Luxe / Studio Familial = Double-Set, Standard = Mono-Set
  const isSuiteOrFamily = targetRoom.category_id === 'cat-ste' || targetRoom.category_id === 'cat-fam';
  const mult = isSuiteOrFamily ? 2 : 1;

  const sheetsQty = 1 * mult;
  const bedspreadsQty = 1 * mult;
  const pillowsQty = 2 * mult;
  const towelsQty = 2 * mult;

  // Let's perform the stock updates
  // 1. "Linge en Chambre" decreases
  // 2. "Linge Sale (Buanderie)" increases
  const updatedStock = stock.map(item => {
    switch (item.id) {
      // Active "En Chambre" stock decreases
      case 'stk-3-chambre': return { ...item, current_stock: Math.max(0, item.current_stock - sheetsQty) };
      case 'stk-5-chambre': return { ...item, current_stock: Math.max(0, item.current_stock - bedspreadsQty) };
      case 'stk-6-chambre': return { ...item, current_stock: Math.max(0, item.current_stock - pillowsQty) };
      case 'stk-7-chambre': return { ...item, current_stock: Math.max(0, item.current_stock - towelsQty) };

      // Dirty "Linge Sale / Buanderie" stock increases
      case 'stk-3-sale': return { ...item, current_stock: item.current_stock + sheetsQty };
      case 'stk-5-sale': return { ...item, current_stock: item.current_stock + bedspreadsQty };
      case 'stk-6-sale': return { ...item, current_stock: item.current_stock + pillowsQty };
      case 'stk-7-sale': return { ...item, current_stock: item.current_stock + towelsQty };

      default: return item;
    }
  });

  saveStock(updatedStock);

  // Record 4 separate stock movements in the log
  const movements = getStockMovements();
  const timestamp = formatCurrentTimestamp();
  
  const newMovements: IStockMovement[] = [
    {
      id: `mvt-maint-sheets-${Date.now()}`,
      timestamp,
      item_id: 'stk-3-sale',
      item_name: 'Draps Plat Coton (Linge Sale)',
      sku: 'DRAP-CTN-SALE',
      quantity: sheetsQty,
      from_location: `Chambre ${targetRoom.room_number} (En Chambre)`,
      to_location: 'Linge Sale (Buanderie)',
      staff_name: staffName,
      type: 'Sortie Maintenance'
    },
    {
      id: `mvt-maint-bedspreads-${Date.now()}`,
      timestamp,
      item_id: 'stk-5-sale',
      item_name: 'Couvre-lits Satin (Linge Sale)',
      sku: 'COUV-SAT-SALE',
      quantity: bedspreadsQty,
      from_location: `Chambre ${targetRoom.room_number} (En Chambre)`,
      to_location: 'Linge Sale (Buanderie)',
      staff_name: staffName,
      type: 'Sortie Maintenance'
    },
    {
      id: `mvt-maint-pillows-${Date.now()}`,
      timestamp,
      item_id: 'stk-6-sale',
      item_name: 'Taies d\'oreiller Coton (Linge Sale)',
      sku: 'TAIE-CTN-SALE',
      quantity: pillowsQty,
      from_location: `Chambre ${targetRoom.room_number} (En Chambre)`,
      to_location: 'Linge Sale (Buanderie)',
      staff_name: staffName,
      type: 'Sortie Maintenance'
    },
    {
      id: `mvt-maint-towels-${Date.now()}`,
      timestamp,
      item_id: 'stk-7-sale',
      item_name: 'Serviettes de bain (Linge Sale)',
      sku: 'SERV-BAIN-SALE',
      quantity: towelsQty,
      from_location: `Chambre ${targetRoom.room_number} (En Chambre)`,
      to_location: 'Linge Sale (Buanderie)',
      staff_name: staffName,
      type: 'Sortie Maintenance'
    }
  ];

  saveStockMovements([...newMovements, ...movements]);

  return {
    success: true,
    message: `Chambre ${targetRoom.room_number} mise en maintenance. Linge (${sheetsQty} drap, ${bedspreadsQty} couvre-lit, ${pillowsQty} oreillers, ${towelsQty} serviettes) déplacé automatiquement du stock en chambre vers la file de lavage.`
  };
}

// Log a manual or standard stock adjustment
export function logManualStockMovement(
  itemId: string,
  itemName: string,
  sku: string,
  qty: number,
  fromLoc: string,
  toLoc: string,
  staffName: string,
  type: string
) {
  const movements = getStockMovements();
  const timestamp = formatCurrentTimestamp();
  const newMovement: IStockMovement = {
    id: `mvt-manual-${Date.now()}`,
    timestamp,
    item_id: itemId,
    item_name: itemName,
    sku,
    quantity: qty,
    from_location: fromLoc,
    to_location: toLoc,
    staff_name: staffName,
    type
  };
  saveStockMovements([newMovement, ...movements]);
}
