/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Boxes, Plus, Search, HelpCircle, AlertTriangle, 
  RefreshCw, Trash2, Home, Check, CheckSquare, Layers, 
  RotateCw, ArrowUpRight, ArrowDownRight, Sparkles, Clock, ArrowRight,
  Users, Edit2
} from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockStockItems, mockSuppliers, mockRooms } from '../mockData';
import { IStockItem, IStockMovement, ISupplier, IHousekeepingTask } from '../types';
import { getStockMovements, saveStockMovements, logManualStockMovement, formatCurrentTimestamp } from '../stockService';

export default function Inventory() {
  // Sync stock with localStorage
  const [stock, setStock] = useState<IStockItem[]>(() => {
    const stored = localStorage.getItem('pms_stock');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockStockItems;
  });

  // Sync stock movements with localStorage
  const [movements, setMovements] = useState<IStockMovement[]>(() => {
    return getStockMovements();
  });

  // Sync suppliers with localStorage
  const [suppliers, setSuppliers] = useState<ISupplier[]>(() => {
    const stored = localStorage.getItem('pms_suppliers');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockSuppliers;
  });

  // Sync rooms with localStorage
  const [rooms, setRooms] = useState(() => {
    const stored = localStorage.getItem('pms_rooms');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockRooms;
  });

  // Sync housekeeping tasks with localStorage
  const [housekeepingTasks, setHousekeepingTasks] = useState<IHousekeepingTask[]>(() => {
    const stored = localStorage.getItem('pms_housekeeping_tasks');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    const defaultTasks = [
      { id: 'hsk-1', room_id: 'room-101', employee_id: 'Awa Diop', priority: 'Haute' as const, scheduled_time: '08:30', completed_time: '11:15', status: 'Disponible' as const },
      { id: 'hsk-2', room_id: 'room-102', employee_id: 'Koffi Yao', priority: 'Normale' as const, scheduled_time: '09:00', completed_time: '', status: 'À nettoyer' as const },
      { id: 'hsk-3', room_id: 'room-103', employee_id: 'Mariam Sylla', priority: 'Basse' as const, scheduled_time: '10:00', completed_time: '', status: 'En cours' as const },
      { id: 'hsk-4', room_id: 'room-104', employee_id: 'Awa Diop', priority: 'Haute' as const, scheduled_time: '08:30', completed_time: '', status: 'Contrôle' as const }
    ];
    localStorage.setItem('pms_housekeeping_tasks', JSON.stringify(defaultTasks));
    return defaultTasks;
  });

  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: ''
  });
  const [editingSupplier, setEditingSupplier] = useState<ISupplier | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAdjModal, setShowAdjModal] = useState(false);
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'general' | 'lingerie' | 'standards' | 'movements'>('general');
  const [lingerieSubTab, setLingerieSubTab] = useState<'washer' | 'dispatch' | 'sandbox'>('washer');

  // Router deep linking support
  const location = useLocation();
  useEffect(() => {
    if (location.state && (location.state as any).tab) {
      setActiveTab((location.state as any).tab);
    }
  }, [location]);

  // Sync state reactively across pages/components via storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const storedStock = localStorage.getItem('pms_stock');
      if (storedStock) {
        try { setStock(JSON.parse(storedStock)); } catch (e) {}
      }
      setMovements(getStockMovements());

      const storedRooms = localStorage.getItem('pms_rooms');
      if (storedRooms) {
        try { setRooms(JSON.parse(storedRooms)); } catch (e) {}
      }

      const storedTasks = localStorage.getItem('pms_housekeeping_tasks');
      if (storedTasks) {
        try { setHousekeepingTasks(JSON.parse(storedTasks)); } catch (e) {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Adjustment states
  const [selectedItemId, setSelectedItemId] = useState('stk-3'); 
  const [adjType, setAdjType] = useState<'in' | 'out'>('in');
  const [adjQty, setAdjAmt] = useState(10);

  // Manual simulated cleaning action (for demo convenience)
  const [demoRoomId, setDemoRoomId] = useState('room-101');

  // Real-time Washing Machine state
  const [isWashing, setIsWashing] = useState(false);
  const [washProgress, setWashProgress] = useState(0);
  const [washTimeLeft, setWashTimeLeft] = useState(0);
  const [washStepText, setWashStepText] = useState('');
  const [washType, setWashType] = useState<'express' | 'eco' | 'intensif' | null>(null);

  // Laundry washing simulation state
  const [washQuantities, setWashQuantities] = useState({
    sheets: 0,
    bedspreads: 0,
    pillows: 0,
    towels: 0
  });

  const saveStock = (newStock: IStockItem[]) => {
    setStock(newStock);
    localStorage.setItem('pms_stock', JSON.stringify(newStock));
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    const itemToAdjust = stock.find(item => item.id === selectedItemId);
    const updated = stock.map(item => {
      if (item.id === selectedItemId) {
        const delta = adjType === 'in' ? adjQty : -adjQty;
        return {
          ...item,
          current_stock: Math.max(0, item.current_stock + delta)
        };
      }
      return item;
    });

    saveStock(updated);

    if (itemToAdjust) {
      logManualStockMovement(
        itemToAdjust.id,
        itemToAdjust.name,
        itemToAdjust.sku,
        adjQty,
        adjType === 'in' ? 'Achat / Fournisseur' : (itemToAdjust.category_id || 'Stock Général'),
        adjType === 'in' ? (itemToAdjust.category_id || 'Stock Général') : 'Utilisation / Retrait',
        'Amadou (Super Admin)',
        adjType === 'in' ? 'Ajustement Entrée' : 'Ajustement Sortie'
      );
      setMovements(getStockMovements());
    }

    setShowAdjModal(false);
    setSuccessMsg(`Ajustement de stock enregistré avec succès.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Automated washing cycle with real-time simulation
  const handleWashingCycle = (type: 'express' | 'eco' | 'intensif', customQuantities?: typeof washQuantities) => {
    if (isWashing) return;

    const sheetsToWash = customQuantities ? customQuantities.sheets : sheetsData.dirty;
    const bedspreadsToWash = customQuantities ? customQuantities.bedspreads : bedspreadsData.dirty;
    const pillowsToWash = customQuantities ? customQuantities.pillows : pillowsData.dirty;
    const towelsToWash = customQuantities ? customQuantities.towels : towelsData.dirty;

    const totalToWash = sheetsToWash + bedspreadsToWash + pillowsToWash + towelsToWash;
    if (totalToWash === 0) {
      alert("Aucun linge sale disponible à laver.");
      return;
    }

    setIsWashing(true);
    setWashType(type);
    setWashProgress(0);

    const durations = {
      express: 8,  // 8s simulation
      eco: 14,     // 14s simulation
      intensif: 22 // 22s simulation
    };
    const totalDuration = durations[type];
    setWashTimeLeft(totalDuration);

    const steps = [
      { p: 0, text: "Initialisation & pesée automatique du tambour..." },
      { p: 15, text: "Verrouillage de la porte et injection de l'eau à 60°C..." },
      { p: 35, text: "Lavage principal - Rotation alternée active..." },
      { p: 60, text: "Vidange et essorages intermédiaires à 1200 tr/min..." },
      { p: 80, text: "Injection d'adoucissant et rinçage final..." },
      { p: 90, text: "Séchage thermique à air pulsé..." },
      { p: 100, text: "Cycle de lavage complété ! Prêt pour le rangement." }
    ];

    setWashStepText(steps[0].text);

    let currentProgress = 0;
    const intervalMs = 200;
    const totalTicks = (totalDuration * 1000) / intervalMs;
    const increment = 100 / totalTicks;

    const timer = setInterval(() => {
      currentProgress = Math.min(100, currentProgress + increment);
      setWashProgress(Math.round(currentProgress));

      const secondsLeft = Math.max(0, totalDuration - Math.round((currentProgress / 100) * totalDuration));
      setWashTimeLeft(secondsLeft);

      const currentStep = [...steps].reverse().find(s => currentProgress >= s.p);
      if (currentStep) {
        setWashStepText(currentStep.text);
      }

      if (currentProgress >= 100) {
        clearInterval(timer);

        // Retrieve fresh stock from storage to avoid overwriting background changes
        let latestStock = [];
        const stored = localStorage.getItem('pms_stock');
        if (stored) {
          try { latestStock = JSON.parse(stored); } catch (e) { latestStock = [...stock]; }
        } else {
          latestStock = [...stock];
        }

        const updatedStock = latestStock.map(item => {
          switch (item.id) {
            // Clean Linge (increases)
            case 'stk-3': return { ...item, current_stock: item.current_stock + sheetsToWash };
            case 'stk-5': return { ...item, current_stock: item.current_stock + bedspreadsToWash };
            case 'stk-6': return { ...item, current_stock: item.current_stock + pillowsToWash };
            case 'stk-7': return { ...item, current_stock: item.current_stock + towelsToWash };

            // Dirty Linge (decreases)
            case 'stk-3-sale': return { ...item, current_stock: Math.max(0, item.current_stock - sheetsToWash) };
            case 'stk-5-sale': return { ...item, current_stock: Math.max(0, item.current_stock - bedspreadsToWash) };
            case 'stk-6-sale': return { ...item, current_stock: Math.max(0, item.current_stock - pillowsToWash) };
            case 'stk-7-sale': return { ...item, current_stock: Math.max(0, item.current_stock - towelsToWash) };

            default: return item;
          }
        });

        saveStock(updatedStock);

        // Notify other windows/components
        window.dispatchEvent(new Event('storage'));

        // Record stock movements in logs
        if (sheetsToWash > 0) logManualStockMovement('stk-3', 'Draps Plat Coton (Linge Propre)', 'DRAP-CTN-PROP', sheetsToWash, 'Linge Sale (Buanderie)', 'Linge Propre', 'Koffi (Buanderie)', 'Lavage Buanderie');
        if (bedspreadsToWash > 0) logManualStockMovement('stk-5', 'Couvre-lits Satin (Linge Propre)', 'COUV-SAT-PROP', bedspreadsToWash, 'Linge Sale (Buanderie)', 'Linge Propre', 'Koffi (Buanderie)', 'Lavage Buanderie');
        if (pillowsToWash > 0) logManualStockMovement('stk-6', 'Taies d\'oreiller Coton (Linge Propre)', 'TAIE-CTN-PROP', pillowsToWash, 'Linge Sale (Buanderie)', 'Linge Propre', 'Koffi (Buanderie)', 'Lavage Buanderie');
        if (towelsToWash > 0) logManualStockMovement('stk-7', 'Serviettes de bain (Linge Propre)', 'SERV-BAIN-PROP', towelsToWash, 'Linge Sale (Buanderie)', 'Linge Propre', 'Koffi (Buanderie)', 'Lavage Buanderie');

        setMovements(getStockMovements());
        setWashQuantities({ sheets: 0, bedspreads: 0, pillows: 0, towels: 0 });
        setSuccessMsg(`Blanchisserie : Cycle ${type.toUpperCase()} complété ! ${totalToWash} pièces de linge lavées et rangées dans le placard.`);
        setTimeout(() => setSuccessMsg(''), 5000);

        setIsWashing(false);
        setWashType(null);
      }
    }, intervalMs);
  };

  // Demo tool: simulate room cleaning to show stock flows
  const simulateRoomCleaning = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId) || rooms[0];
    const isSuiteOrFamily = room.category_id === 'cat-ste' || room.category_id === 'cat-fam';
    const mult = isSuiteOrFamily ? 2 : 1;

    const sheetsQty = 1 * mult;
    const bedspreadsQty = 1 * mult;
    const pillowsQty = 2 * mult;
    const towelsQty = 2 * mult;

    // Check if clean stock has enough items
    let lowStockWarning = false;
    const cleanSheets = stock.find(s => s.id === 'stk-3')?.current_stock || 0;
    const cleanBedspreads = stock.find(s => s.id === 'stk-5')?.current_stock || 0;
    const cleanPillows = stock.find(s => s.id === 'stk-6')?.current_stock || 0;
    const cleanTowels = stock.find(s => s.id === 'stk-7')?.current_stock || 0;

    if (
      cleanSheets < sheetsQty ||
      cleanBedspreads < bedspreadsQty ||
      cleanPillows < pillowsQty ||
      cleanTowels < towelsQty
    ) {
      lowStockWarning = true;
    }

    const updated = stock.map(item => {
      switch (item.id) {
        // Clean stock decreases
        case 'stk-3': return { ...item, current_stock: Math.max(0, item.current_stock - sheetsQty) };
        case 'stk-5': return { ...item, current_stock: Math.max(0, item.current_stock - bedspreadsQty) };
        case 'stk-6': return { ...item, current_stock: Math.max(0, item.current_stock - pillowsQty) };
        case 'stk-7': return { ...item, current_stock: Math.max(0, item.current_stock - towelsQty) };

        // Dirty stock increases
        case 'stk-3-sale': return { ...item, current_stock: item.current_stock + sheetsQty };
        case 'stk-5-sale': return { ...item, current_stock: item.current_stock + bedspreadsQty };
        case 'stk-6-sale': return { ...item, current_stock: item.current_stock + pillowsQty };
        case 'stk-7-sale': return { ...item, current_stock: item.current_stock + towelsQty };

        default: return item;
      }
    });

    saveStock(updated);

    // Also update room and housekeeping tasks state for consistency!
    const updatedRooms = rooms.map(r => {
      if (r.id === room.id) {
        return { ...r, housekeeping_status: 'Disponible' as const };
      }
      return r;
    });
    setRooms(updatedRooms);
    localStorage.setItem('pms_rooms', JSON.stringify(updatedRooms));

    const updatedTasks = housekeepingTasks.map(t => {
      if (t.room_id === room.id) {
        return {
          ...t,
          status: 'Disponible' as const,
          completed_time: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    });
    setHousekeepingTasks(updatedTasks);
    localStorage.setItem('pms_housekeeping_tasks', JSON.stringify(updatedTasks));

    // Log the movements
    logManualStockMovement('stk-3', 'Draps Plat Coton (Linge Propre)', 'DRAP-CTN-PROP', sheetsQty, 'Linge Propre', `Chambre ${room.room_number}`, 'Awa (Housekeeping)', 'Dotation Chambre');
    logManualStockMovement('stk-3-sale', 'Draps Plat Coton (Linge Sale)', 'DRAP-CTN-SALE', sheetsQty, `Chambre ${room.room_number}`, 'Linge Sale (Buanderie)', 'Awa (Housekeeping)', 'Envoi Buanderie');
    
    logManualStockMovement('stk-5', 'Couvre-lits Satin (Linge Propre)', 'COUV-SAT-PROP', bedspreadsQty, 'Linge Propre', `Chambre ${room.room_number}`, 'Awa (Housekeeping)', 'Dotation Chambre');
    logManualStockMovement('stk-5-sale', 'Couvre-lits Satin (Linge Sale)', 'COUV-SAT-SALE', bedspreadsQty, `Chambre ${room.room_number}`, 'Linge Sale (Buanderie)', 'Awa (Housekeeping)', 'Envoi Buanderie');

    logManualStockMovement('stk-6', 'Taies d\'oreiller Coton (Linge Propre)', 'TAIE-CTN-PROP', pillowsQty, 'Linge Propre', `Chambre ${room.room_number}`, 'Awa (Housekeeping)', 'Dotation Chambre');
    logManualStockMovement('stk-6-sale', 'Taies d\'oreiller Coton (Linge Sale)', 'TAIE-CTN-SALE', pillowsQty, `Chambre ${room.room_number}`, 'Linge Sale (Buanderie)', 'Awa (Housekeeping)', 'Envoi Buanderie');

    logManualStockMovement('stk-7', 'Serviettes de bain (Linge Propre)', 'SERV-BAIN-PROP', towelsQty, 'Linge Propre', `Chambre ${room.room_number}`, 'Awa (Housekeeping)', 'Dotation Chambre');
    logManualStockMovement('stk-7-sale', 'Serviettes de bain (Linge Sale)', 'SERV-BAIN-SALE', towelsQty, `Chambre ${room.room_number}`, 'Linge Sale (Buanderie)', 'Awa (Housekeeping)', 'Envoi Buanderie');

    setMovements(getStockMovements());

    // Dispatch global storage event for other pages to sync
    window.dispatchEvent(new Event('storage'));

    if (lowStockWarning) {
      setSuccessMsg(`[Simulation] Chambre ${room.room_number} nettoyée ! ⚠️ Alerte stock bas sur le linge propre.`);
    } else {
      setSuccessMsg(`[Simulation] Chambre ${room.room_number} nettoyée ! Linge sale envoyé en buanderie et remplacé par du linge propre.`);
    }
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Quick Housekeeper Room Clean dispatch trigger
  const handleQuickCleanRoom = (taskId: string, roomId: string) => {
    const updatedTasks = housekeepingTasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: 'Disponible' as const,
          completed_time: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return t;
    });
    setHousekeepingTasks(updatedTasks);
    localStorage.setItem('pms_housekeeping_tasks', JSON.stringify(updatedTasks));

    const updatedRooms = rooms.map(r => {
      if (r.id === roomId) {
        return { ...r, housekeeping_status: 'Disponible' as const };
      }
      return r;
    });
    setRooms(updatedRooms);
    localStorage.setItem('pms_rooms', JSON.stringify(updatedRooms));

    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;

    let currentStock = [...stock];
    const isSuiteOrFamily = targetRoom.category_id === 'cat-ste' || targetRoom.category_id === 'cat-fam';
    const mult = isSuiteOrFamily ? 2 : 1;

    const sheetsQty = 1 * mult;
    const bedspreadsQty = 1 * mult;
    const pillowsQty = 2 * mult;
    const towelsQty = 2 * mult;

    const updatedStock = currentStock.map(item => {
      switch (item.id) {
        case 'stk-3': return { ...item, current_stock: Math.max(0, item.current_stock - sheetsQty) };
        case 'stk-5': return { ...item, current_stock: Math.max(0, item.current_stock - bedspreadsQty) };
        case 'stk-6': return { ...item, current_stock: Math.max(0, item.current_stock - pillowsQty) };
        case 'stk-7': return { ...item, current_stock: Math.max(0, item.current_stock - towelsQty) };

        case 'stk-3-sale': return { ...item, current_stock: item.current_stock + sheetsQty };
        case 'stk-5-sale': return { ...item, current_stock: item.current_stock + bedspreadsQty };
        case 'stk-6-sale': return { ...item, current_stock: item.current_stock + pillowsQty };
        case 'stk-7-sale': return { ...item, current_stock: item.current_stock + towelsQty };

        default: return item;
      }
    });

    localStorage.setItem('pms_stock', JSON.stringify(updatedStock));
    setStock(updatedStock);

    // Notify other components/pages
    window.dispatchEvent(new Event('storage'));

    logManualStockMovement('stk-3', 'Draps Plat Coton (Linge Propre)', 'DRAP-CTN-PROP', sheetsQty, 'Linge Propre', `Chambre ${targetRoom.room_number}`, 'Awa (Housekeeping)', 'Dotation Chambre');
    logManualStockMovement('stk-3-sale', 'Draps Plat Coton (Linge Sale)', 'DRAP-CTN-SALE', sheetsQty, `Chambre ${targetRoom.room_number}`, 'Linge Sale (Buanderie)', 'Awa (Housekeeping)', 'Envoi Buanderie');
    
    logManualStockMovement('stk-5', 'Couvre-lits Satin (Linge Propre)', 'COUV-SAT-PROP', bedspreadsQty, 'Linge Propre', `Chambre ${targetRoom.room_number}`, 'Awa (Housekeeping)', 'Dotation Chambre');
    logManualStockMovement('stk-5-sale', 'Couvre-lits Satin (Linge Sale)', 'COUV-SAT-SALE', bedspreadsQty, `Chambre ${targetRoom.room_number}`, 'Linge Sale (Buanderie)', 'Awa (Housekeeping)', 'Envoi Buanderie');

    logManualStockMovement('stk-6', 'Taies d\'oreiller Coton (Linge Propre)', 'TAIE-CTN-PROP', pillowsQty, 'Linge Propre', `Chambre ${targetRoom.room_number}`, 'Awa (Housekeeping)', 'Dotation Chambre');
    logManualStockMovement('stk-6-sale', 'Taies d\'oreiller Coton (Linge Sale)', 'TAIE-CTN-SALE', pillowsQty, `Chambre ${targetRoom.room_number}`, 'Linge Sale (Buanderie)', 'Awa (Housekeeping)', 'Envoi Buanderie');

    logManualStockMovement('stk-7', 'Serviettes de bain (Linge Propre)', 'SERV-BAIN-PROP', towelsQty, 'Linge Propre', `Chambre ${targetRoom.room_number}`, 'Awa (Housekeeping)', 'Dotation Chambre');
    logManualStockMovement('stk-7-sale', 'Serviettes de bain (Linge Sale)', 'SERV-BAIN-SALE', towelsQty, `Chambre ${targetRoom.room_number}`, 'Linge Sale (Buanderie)', 'Awa (Housekeeping)', 'Envoi Buanderie');

    setMovements(getStockMovements());

    setSuccessMsg(`Chambre ${targetRoom.room_number} propre ! Linge sale (${sheetsQty} d., ${bedspreadsQty} c., ${pillowsQty} t., ${towelsQty} s.) acheminé à la Buanderie.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const getSupplierName = (id: string) => {
    return suppliers.find(s => s.id === id)?.company_name || 'SOCOCE';
  };

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.company_name.trim()) return;

    const supplierToAdd: ISupplier = {
      id: `sup-${Date.now()}`,
      company_name: newSupplier.company_name,
      contact_name: newSupplier.contact_name || 'Non renseigné',
      phone: newSupplier.phone || 'Non renseigné',
      email: newSupplier.email || 'Non renseigné',
      address: newSupplier.address || 'Non renseigné'
    };

    const updatedSuppliers = [...suppliers, supplierToAdd];
    setSuppliers(updatedSuppliers);
    localStorage.setItem('pms_suppliers', JSON.stringify(updatedSuppliers));
    setShowAddSupplierModal(false);

    // Reset form
    setNewSupplier({
      company_name: '',
      contact_name: '',
      phone: '',
      email: '',
      address: ''
    });

    setSuccessMsg(`Le fournisseur "${supplierToAdd.company_name}" a été enregistré.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleUpdateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupplier || !editingSupplier.company_name.trim()) return;

    const updatedSuppliers = suppliers.map(s => {
      if (s.id === editingSupplier.id) {
        return {
          ...editingSupplier,
          contact_name: editingSupplier.contact_name || 'Non renseigné',
          phone: editingSupplier.phone || 'Non renseigné',
          email: editingSupplier.email || 'Non renseigné',
          address: editingSupplier.address || 'Non renseigné'
        };
      }
      return s;
    });

    setSuppliers(updatedSuppliers);
    localStorage.setItem('pms_suppliers', JSON.stringify(updatedSuppliers));
    setShowEditSupplierModal(false);
    setEditingSupplier(null);

    setSuccessMsg(`Le fournisseur "${editingSupplier.company_name}" a été mis à jour.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Helper values for standard lingerie status
  const getLinenData = (cleanId: string, dirtyId: string, chamberId: string) => {
    const clean = stock.find(s => s.id === cleanId);
    const dirty = stock.find(s => s.id === dirtyId);
    const chamber = stock.find(s => s.id === chamberId);
    return {
      name: clean?.name.split(' (')[0] || '',
      sku: clean?.sku.split('-')[0] || '',
      clean: clean?.current_stock || 0,
      minClean: clean?.minimum_stock || 0,
      dirty: dirty?.current_stock || 0,
      chamber: chamber?.current_stock || 0,
      total: (clean?.current_stock || 0) + (dirty?.current_stock || 0) + (chamber?.current_stock || 0)
    };
  };

  const sheetsData = getLinenData('stk-3', 'stk-3-sale', 'stk-3-chambre');
  const bedspreadsData = getLinenData('stk-5', 'stk-5-sale', 'stk-5-chambre');
  const pillowsData = getLinenData('stk-6', 'stk-6-sale', 'stk-6-chambre');
  const towelsData = getLinenData('stk-7', 'stk-7-sale', 'stk-7-chambre');

  // Calculate estimated total value
  const estimatedStockValue = stock.reduce((acc, item) => acc + (item.current_stock * item.purchase_price), 0);
  const lowStockItemsCount = stock.filter(item => item.current_stock < item.minimum_stock).length;

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Gestion Globale des Stocks & Matériel"
        description="Superviser l'inventaire en temps réel des consommables hôteliers, l'inventaire lingerie des chambres et les rotations automatiques de la buanderie."
        actionButton={{
          label: 'Ajustement de Stock',
          onClick: () => setShowAdjModal(true),
          icon: Plus
        }}
      />

      {/* ACTION TABS */}
      <div className="px-6 lg:px-8 border-b border-slate-200 bg-white flex space-x-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'general' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes size={14} />
          <span>Registre Général</span>
        </button>
        <button
          onClick={() => setActiveTab('lingerie')}
          className={`py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'lingerie' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCw size={14} />
          <span>Suivi Logistique & Buanderie</span>
        </button>
        <button
          onClick={() => setActiveTab('standards')}
          className={`py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'standards' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers size={14} />
          <span>Standards & Dotation Chambres</span>
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`py-3 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
            activeTab === 'movements' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock size={14} />
          <span>Mouvements de Stock</span>
        </button>
      </div>

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Valeur estimée du stock global</span>
            <span className="text-2xl font-extrabold text-brand-orange block mt-1">{estimatedStockValue.toLocaleString()} FCFA</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Articles sous le seuil d'alerte</span>
            <span className="text-2xl font-extrabold text-rose-600 block mt-1">{lowStockItemsCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rotation buanderie active</span>
            <span className="text-2xl font-extrabold text-emerald-600 block mt-1">
              {sheetsData.dirty + bedspreadsData.dirty + pillowsData.dirty + towelsData.dirty} pièces à laver
            </span>
          </div>
        </div>

        {/* TAB 1: GENERAL REGISTER */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Registre général de l'inventaire</h3>
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Rechercher par article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
                />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={12} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                    <th className="py-3 px-6">SKU</th>
                    <th className="py-3 px-4">Nom de l'article</th>
                    <th className="py-3 px-4">Catégorie</th>
                    <th className="py-3 px-4">Fournisseur</th>
                    <th className="py-3 px-4 text-right">Prix d'achat</th>
                    <th className="py-3 px-4 text-center">Unité</th>
                    <th className="py-3 px-4 text-center">Quantité actuelle</th>
                    <th className="py-3 px-4 text-center">Seuil mini</th>
                    <th className="py-3 px-6 text-right">Alerte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stock
                    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.includes(searchQuery))
                    .map((item) => {
                      const isLow = item.current_stock < item.minimum_stock;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-6 font-mono font-bold text-slate-500">{item.sku}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {item.category_id}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-semibold">{getSupplierName(item.supplier_id)}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold">{(item.purchase_price).toLocaleString()} XOF</td>
                          <td className="py-3.5 px-4 text-center text-slate-500 font-medium">{item.unit}</td>
                          <td className={`py-3.5 px-4 text-center font-black text-sm font-mono ${isLow ? 'text-red-600 bg-red-50/30' : 'text-slate-800'}`}>{item.current_stock}</td>
                          <td className="py-3.5 px-4 text-center text-slate-400 font-bold font-mono">{item.minimum_stock}</td>
                          <td className="py-3.5 px-6 text-right">
                            {isLow ? (
                              <Badge label="Seuil franchi" type="default" status="critique" />
                            ) : (
                              <Badge label="Normal" type="default" status="libre" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LINGERIE & LAUNDRY FLOW */}
        {activeTab === 'lingerie' && (
          <div className="space-y-6">
            {/* INTRO EXPLANATORY BLOCK */}
            <div className="p-4 bg-gradient-to-r from-brand-orange/5 to-slate-50 border border-brand-orange/10 rounded-xl flex items-start space-x-3 text-left">
              <Sparkles size={18} className="text-brand-orange mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <h4 className="font-bold text-slate-900">Module de Suivi Logistique Intégré de Bouaké</h4>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Ce tableau de bord centralise la gestion de la blanchisserie et de la logistique hôtelière. Vous pouvez piloter les cycles de lavage, suivre l'attribution de linge propre par chambre, et valider l'entretien en direct de nos hébergements.
                </p>
              </div>
            </div>

            {/* SUB-TABS NAVIGATION */}
            <div className="flex border-b border-slate-200 space-x-6">
              <button
                onClick={() => setLingerieSubTab('washer')}
                className={`pb-2.5 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                  lingerieSubTab === 'washer' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-855'
                }`}
              >
                <RotateCw size={14} className={isWashing ? 'animate-spin' : ''} />
                <span>Blanchisserie Live ({sheetsData.dirty + bedspreadsData.dirty + pillowsData.dirty + towelsData.dirty} p.)</span>
              </button>
              <button
                onClick={() => setLingerieSubTab('dispatch')}
                className={`pb-2.5 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                  lingerieSubTab === 'dispatch' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-855'
                }`}
              >
                <Users size={14} />
                <span>Entretien & Dispatch ({housekeepingTasks.filter(t => t.status !== 'Disponible').length} tâches)</span>
              </button>
              <button
                onClick={() => setLingerieSubTab('sandbox')}
                className={`pb-2.5 text-xs font-black transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                  lingerieSubTab === 'sandbox' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-855'
                }`}
              >
                <Sparkles size={14} />
                <span>Simulateur & Sandbox</span>
              </button>
            </div>

            {/* SUB-TAB: WASHER & LINGERIE STATS */}
            {lingerieSubTab === 'washer' && (
              <div className="space-y-6">
                {/* LIVE SYSTEM STATUS FOR LINGERIE */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {[sheetsData, bedspreadsData, pillowsData, towelsData].map((linen, idx) => {
                    const isLow = linen.clean < linen.minClean;
                    return (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h4 className="font-black text-sm text-slate-900 leading-tight">{linen.name}</h4>
                            <span className="text-[10px] font-mono font-bold text-slate-400">{linen.sku}</span>
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">Stock Propre (Disponible) :</span>
                              <span className={`font-mono font-extrabold ${isLow ? 'text-red-600 bg-red-50 px-1.5 py-0.5 rounded' : 'text-slate-800'}`}>
                                {linen.clean} / {linen.minClean} min
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500 font-semibold">En Chambre (Linge Actif) :</span>
                              <span className="font-mono font-bold text-slate-700">{linen.chamber}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-dashed border-slate-100 pt-2">
                              <span className="text-amber-600 font-bold flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <span>En Buanderie (Linge Sale) :</span>
                              </span>
                              <span className="font-mono font-black text-amber-600 text-sm">{linen.dirty}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold">Total Actifs: <strong className="text-slate-700 font-mono">{linen.total}</strong></span>
                          {isLow ? (
                            <span className="text-[10px] text-red-600 font-bold flex items-center space-x-1 bg-red-50 px-1.5 py-0.5 rounded">
                              <AlertTriangle size={10} />
                              <span>Seuil bas !</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Normal</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* INTERACTIVE CONTROLS SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                  
                  {/* LAUNDRY PROCESSING PANEL */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <RotateCw size={15} className={`text-brand-orange ${isWashing ? "animate-spin" : ""}`} />
                        <span>Lancement de Cycle de Lavage & Séchage</span>
                      </h3>
                      <Badge label="Buanderie" type="default" status="critique" />
                    </div>

                    <p className="text-xs text-slate-500 font-semibold">
                      Saisissez les quantités de linge lavées et prêtes à retourner dans le placard de stockage Linge Propre.
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-slate-600 font-bold block">Draps ({sheetsData.dirty} sale s)</label>
                        <input
                          type="number"
                          max={sheetsData.dirty}
                          min={0}
                          disabled={isWashing}
                          value={washQuantities.sheets}
                          onChange={(e) => setWashQuantities({ ...washQuantities, sheets: Math.min(sheetsData.dirty, Math.max(0, Number(e.target.value))) })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-mono disabled:opacity-55"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-600 font-bold block">Couvre-lits ({bedspreadsData.dirty} sale s)</label>
                        <input
                          type="number"
                          max={bedspreadsData.dirty}
                          min={0}
                          disabled={isWashing}
                          value={washQuantities.bedspreads}
                          onChange={(e) => setWashQuantities({ ...washQuantities, bedspreads: Math.min(bedspreadsData.dirty, Math.max(0, Number(e.target.value))) })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-mono disabled:opacity-55"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-600 font-bold block">Taies ({pillowsData.dirty} sale s)</label>
                        <input
                          type="number"
                          max={pillowsData.dirty}
                          min={0}
                          disabled={isWashing}
                          value={washQuantities.pillows}
                          onChange={(e) => setWashQuantities({ ...washQuantities, pillows: Math.min(pillowsData.dirty, Math.max(0, Number(e.target.value))) })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-mono disabled:opacity-55"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-600 font-bold block">Serviettes ({towelsData.dirty} sale s)</label>
                        <input
                          type="number"
                          max={towelsData.dirty}
                          min={0}
                          disabled={isWashing}
                          value={washQuantities.towels}
                          onChange={(e) => setWashQuantities({ ...washQuantities, towels: Math.min(towelsData.dirty, Math.max(0, Number(e.target.value))) })}
                          className="w-full border border-slate-200 rounded-lg p-2 font-mono disabled:opacity-55"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-wider">Sélectionner un programme de lavage :</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleWashingCycle('express', washQuantities.sheets || washQuantities.bedspreads || washQuantities.pillows || washQuantities.towels ? washQuantities : undefined)}
                          disabled={isWashing || (sheetsData.dirty === 0 && bedspreadsData.dirty === 0 && pillowsData.dirty === 0 && towelsData.dirty === 0)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 py-2.5 px-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center block"
                        >
                          <span className="block font-black text-[12px] text-emerald-700">Express 8s</span>
                          <span className="text-[9px] text-slate-400 font-medium">Lavage rapide</span>
                        </button>
                        <button
                          onClick={() => handleWashingCycle('eco', washQuantities.sheets || washQuantities.bedspreads || washQuantities.pillows || washQuantities.towels ? washQuantities : undefined)}
                          disabled={isWashing || (sheetsData.dirty === 0 && bedspreadsData.dirty === 0 && pillowsData.dirty === 0 && towelsData.dirty === 0)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 py-2.5 px-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center block"
                        >
                          <span className="block font-black text-[12px] text-blue-700">Coton Éco 14s</span>
                          <span className="text-[9px] text-slate-400 font-medium">Économique</span>
                        </button>
                        <button
                          onClick={() => handleWashingCycle('intensif', washQuantities.sheets || washQuantities.bedspreads || washQuantities.pillows || washQuantities.towels ? washQuantities : undefined)}
                          disabled={isWashing || (sheetsData.dirty === 0 && bedspreadsData.dirty === 0 && pillowsData.dirty === 0 && towelsData.dirty === 0)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 py-2.5 px-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-center block"
                        >
                          <span className="block font-black text-[12px] text-amber-700">Intensif 22s</span>
                          <span className="text-[9px] text-slate-400 font-medium">Haute température</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-[9px] text-slate-400 italic">
                      Note: Si vous n'entrez aucune quantité spécifique dans les cases ci-dessus, le programme sélectionné lavera automatiquement l'intégralité du linge sale disponible.
                    </p>
                  </div>

                  {/* WASHING DRUM GRAPHICAL DISPLAY */}
                  <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-[-20%] left-[-20%] w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>

                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 relative z-10">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Station Blanchisserie Live</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">Machine de l'Hôtel Brunch Bouaké</p>
                      </div>
                      {isWashing ? (
                        <span className="flex items-center space-x-1.5 bg-blue-900/40 text-blue-400 border border-blue-800 px-2 py-0.5 rounded text-[9px] font-black tracking-wider animate-pulse uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                          <span>En cycle - {washType}</span>
                        </span>
                      ) : (
                        <span className="bg-slate-850 text-slate-400 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase">
                          Prête / En veille
                        </span>
                      )}
                    </div>

                    <div className="my-6 flex flex-col items-center justify-center relative z-10">
                      <div className="relative w-32 h-32 rounded-full border-4 border-slate-700 bg-slate-950 flex items-center justify-center shadow-inner overflow-hidden">
                        <div className="absolute w-[94%] h-[94%] rounded-full border border-slate-800/80 bg-slate-900 flex flex-col items-center justify-center">
                          
                          {isWashing && (
                            <div className="absolute bottom-0 w-full bg-blue-500/15 border-t border-blue-400/30 transition-all duration-500 h-1/2">
                              <div className="absolute inset-0 flex flex-wrap justify-around items-center opacity-40">
                                {[...Array(4)].map((_, i) => (
                                  <span key={i} className="w-2 h-2 rounded-full bg-white opacity-80 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="relative z-20 flex flex-col items-center">
                            <RotateCw 
                              size={28} 
                              className={`${
                                isWashing 
                                  ? washType === 'express' 
                                    ? 'text-blue-400 animate-spin' 
                                    : 'text-emerald-400 animate-spin-slow' 
                                  : 'text-slate-600'
                              }`} 
                            />
                            <span className="text-[8px] font-mono font-bold text-slate-500 mt-1">LGM-8KG</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none rounded-full z-30"></div>
                      </div>
                    </div>

                    <div className="space-y-2 relative z-10 text-xs">
                      {isWashing ? (
                        <>
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-400">Progression globale :</span>
                            <span className="text-blue-400 font-mono text-xs">{washProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full transition-all duration-200" style={{ width: `${washProgress}%` }}></div>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800 pt-2 mt-2">
                            <span className="text-slate-300 italic truncate pr-2">{washStepText}</span>
                            <span className="font-mono font-black text-blue-400 flex-shrink-0">{washTimeLeft}s restants</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                          <Clock size={14} className="text-slate-500 mx-auto mb-1" />
                          <p className="text-[10px] text-slate-400 font-bold leading-normal">
                            La buanderie attend vos ordres. Tout le linge sale sera converti en linge propre à la fin du cycle.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SUB-TAB: HOUSEKEEPING TASK DISPATCH BOARD */}
            {lingerieSubTab === 'dispatch' && (
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <h4 className="font-black text-slate-900 text-xs flex items-center space-x-1.5">
                      <Users size={14} className="text-brand-orange" />
                      <span>Dispatch Logistique & Statut d'Entretien (Housekeeping)</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      En direct de l'entretien de l'hôtel Brunch Bouaké. Validez les chambres nettoyées pour automatiser la rotation des stocks de linge.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-brand-orange/10 text-brand-orange text-[10px] font-black rounded-lg border border-brand-orange/20">
                    {housekeepingTasks.filter(t => t.status !== 'Disponible').length} tâches actives
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {housekeepingTasks.map((task) => {
                    const roomObj = rooms.find(r => r.id === task.room_id);
                    const isSuiteOrFamily = roomObj?.category_id === 'cat-ste' || roomObj?.category_id === 'cat-fam';
                    const dotationCount = isSuiteOrFamily ? 2 : 1;

                    return (
                      <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400">{task.id.toUpperCase()}</span>
                            <h4 className="font-black text-slate-900 text-sm">Chambre {roomObj?.room_number || '-'}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{roomObj?.category_id === 'cat-ste' ? 'Suite Prestige Luxe' : 'Chambre Simple Standard'}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                              task.status === 'Disponible' ? 'bg-emerald-100 text-emerald-800' :
                              task.status === 'À nettoyer' ? 'bg-rose-100 text-rose-800' :
                              task.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {task.status}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold">Dotation : {isSuiteOrFamily ? 'Double' : 'Simple'} ({dotationCount} jeu)</span>
                          </div>
                        </div>

                        {/* Linen specification */}
                        <div className="bg-slate-50/50 p-2.5 my-3 rounded-lg text-[10px] text-slate-500 font-semibold space-y-1">
                          <p className="font-bold text-slate-700">Linge requis à installer :</p>
                          <p>• {dotationCount} Drap(s) • {dotationCount} Couvre-lit(s) • {dotationCount * 2} Taies • {dotationCount * 2} Serviettes</p>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                          <span className="text-[10px] text-slate-500 font-bold flex items-center space-x-1">
                            <Users size={12} className="text-slate-400" />
                            <span>Femme de chambre : <strong>{task.employee_id}</strong></span>
                          </span>
                          
                          {task.status !== 'Disponible' ? (
                            <button
                              onClick={() => handleQuickCleanRoom(task.id, task.room_id)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <CheckSquare size={11} />
                              <span>Valider & Re-stocker</span>
                            </button>
                          ) : (
                            <span className="text-emerald-600 font-black text-[10px] flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded">
                              <span>✓ Prête pour check-in</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SUB-TAB: SIMULATOR SANDBOX */}
            {lingerieSubTab === 'sandbox' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-left max-w-full">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                  <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900">Bac à sable de test : Simuler le ménage de fin de séjour d'une chambre</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 font-medium">
                      Pour simuler et observer le cycle de rotation du linge (Linge Propre ➔ En Chambre ➔ Linge Sale en Buanderie) directement sur cet écran, sélectionnez une chambre et cliquez sur le bouton.
                    </p>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-600 font-bold block">Sélectionner la chambre à nettoyer :</label>
                      <select
                        value={demoRoomId}
                        onChange={(e) => setDemoRoomId(e.target.value)}
                        className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2 text-xs font-semibold"
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>
                            Chambre {r.room_number} ({r.category_id === 'cat-ste' ? 'Suite Luxe' : 'Chambre Simple Standard'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 font-semibold space-y-1">
                      <p className="font-bold text-slate-800">Dotation qui sera déplacée :</p>
                      {demoRoomId === 'room-104' || demoRoomId === 'room-202' || demoRoomId === 'room-203' ? (
                        <>
                          <p className="flex justify-between"><span>• Draps Plat Coton :</span> <strong className="text-rose-600">2 Propres ➔ 2 Sales</strong></p>
                          <p className="flex justify-between"><span>• Couvre-lits Satin :</span> <strong className="text-rose-600">2 Propres ➔ 2 Sales</strong></p>
                          <p className="flex justify-between"><span>• Taies d'oreiller :</span> <strong className="text-rose-600">4 Propres ➔ 4 Sales</strong></p>
                          <p className="flex justify-between"><span>• Serviettes de bain :</span> <strong className="text-rose-600">4 Propres ➔ 4 Sales</strong></p>
                        </>
                      ) : (
                        <>
                          <p className="flex justify-between"><span>• Draps Plat Coton :</span> <strong className="text-rose-600">1 Propre ➔ 1 Sale</strong></p>
                          <p className="flex justify-between"><span>• Couvre-lit Satin :</span> <strong className="text-rose-600">1 Propre ➔ 1 Sale</strong></p>
                          <p className="flex justify-between"><span>• Taies d'oreiller :</span> <strong className="text-rose-600">2 Propres ➔ 2 Sales</strong></p>
                          <p className="flex justify-between"><span>• Serviettes de bain :</span> <strong className="text-rose-600">2 Propres ➔ 2 Sales</strong></p>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => simulateRoomCleaning(demoRoomId)}
                      className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center block"
                    >
                      Simuler le Nettoyage & Rotation du Linge
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STANDARDS & IN-ROOM EQUIPMENT CHECKLIST */}
        {activeTab === 'standards' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-left">
              <CheckSquare size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <h4 className="font-bold text-emerald-800">Dotation Matériel Standard des Chambres & Studios</h4>
                <p className="text-emerald-700 mt-1 font-medium leading-relaxed">
                  Chaque type d'hébergement dispose d'un inventaire de lingerie stricte. Les femmes de ménage doivent veiller à ce que l'équipement complet soit disposé à chaque recouche ou checkout.
                </p>
              </div>
            </div>

            {/* SPECIFICATIONS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              {/* CHMB SIMPLE CARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">Dotation Standard : Chambre Simple</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Catégorie Standard, Single, Double</p>
                  </div>
                  <Badge label="Mono-Set" type="default" status="libre" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-700 border-b border-slate-50 pb-2">
                    <span>Type d'Équipement</span>
                    <span>Quantité Requise</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Draps Coton Blanc</span>
                    <span className="font-mono font-extrabold bg-slate-50 px-2.5 py-1 rounded">1 pièce</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Couvre-lit Satin Matelassé</span>
                    <span className="font-mono font-extrabold bg-slate-50 px-2.5 py-1 rounded">1 pièce</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Taies d'oreiller Coton</span>
                    <span className="font-mono font-extrabold bg-slate-50 px-2.5 py-1 rounded">2 pièces</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Serviettes de bain grand format</span>
                    <span className="font-mono font-extrabold bg-slate-50 px-2.5 py-1 rounded">2 pièces</span>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 font-semibold">
                  Note : Le stock minimum autorisé dans les placards est de 25 sets complets pour garantir le roulement du lavage sans rupture.
                </div>
              </div>

              {/* SUITE LUXE CARD */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-900">Dotation Standard : Studio & Suite</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Suite Prestige, Studios Familiaux</p>
                  </div>
                  <Badge label="Double-Set" type="default" status="critique" />
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex justify-between text-xs font-bold text-slate-700 border-b border-slate-50 pb-2">
                    <span>Type d'Équipement</span>
                    <span>Quantité Requise</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Draps Coton Blanc</span>
                    <span className="font-mono font-extrabold bg-slate-50 px-2.5 py-1 rounded">2 pièces</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Couvre-lit Satin Matelassé</span>
                    <span className="font-mono font-extrabold bg-slate-50 px-2.5 py-1 rounded">2 pièces</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Taies d'oreiller Coton</span>
                    <span className="font-mono font-extrabold bg-slate-50 px-2.5 py-1 rounded">4 pièces</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-semibold">Serviettes de bain grand format</span>
                    <span className="font-mono font-extrabold bg-slate-50 px-2.5 py-1 rounded">4 pièces</span>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-slate-50 rounded-lg text-[10px] text-slate-500 font-semibold">
                  Note : Les Studios disposent en plus de 1 kit de cuisine et de torchons d'accueil pour la kitchenette privative.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: STOCK MOVEMENTS HISTORY */}
        {activeTab === 'movements' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-900 border border-slate-800 text-white rounded-xl flex items-start space-x-3 text-left">
              <Clock size={18} className="text-brand-orange mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <h4 className="font-bold text-white">Registre Historique des Mouvements de Stock</h4>
                <p className="text-slate-400 mt-1 font-medium leading-relaxed">
                  Cette table enregistre en temps réel tous les transferts de linge et de matériel, y compris les dotations de chambres, les retours buanderie et les demandes de maintenance automatique.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center flex-wrap gap-4">
                <h3 className="text-sm font-bold text-slate-900">Historique des entrées, sorties & transferts</h3>
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Filtrer par article, lieu ou staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
                  />
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={12} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Date & Heure</th>
                      <th className="px-4 py-3">Article / SKU</th>
                      <th className="px-4 py-3 text-center">Quantité</th>
                      <th className="px-4 py-3">Provenance → Destination</th>
                      <th className="px-4 py-3">Responsable</th>
                      <th className="px-4 py-3 text-right">Type de Mouvement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {movements.filter(m => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return m.item_name.toLowerCase().includes(q) || 
                             m.sku.toLowerCase().includes(q) ||
                             m.from_location.toLowerCase().includes(q) ||
                             m.to_location.toLowerCase().includes(q) ||
                             m.staff_name.toLowerCase().includes(q) ||
                             m.type.toLowerCase().includes(q);
                    }).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-semibold">
                          Aucun mouvement enregistré pour cette recherche.
                        </td>
                      </tr>
                    ) : (
                      movements.filter(m => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return m.item_name.toLowerCase().includes(q) || 
                               m.sku.toLowerCase().includes(q) ||
                               m.from_location.toLowerCase().includes(q) ||
                               m.to_location.toLowerCase().includes(q) ||
                               m.staff_name.toLowerCase().includes(q) ||
                               m.type.toLowerCase().includes(q);
                      }).map((m) => {
                        let directionColor = 'text-slate-500 bg-slate-100';
                        let IconComponent = Clock;
                        if (m.type.includes('Entrée') || m.type.includes('Lavage')) {
                          directionColor = 'text-emerald-700 bg-emerald-50 border-emerald-100';
                          IconComponent = ArrowUpRight;
                        } else if (m.type.includes('Sortie') || m.type.includes('Retrait') || m.type.includes('Envoi')) {
                          directionColor = 'text-rose-700 bg-rose-50 border-rose-100';
                          IconComponent = ArrowDownRight;
                        } else if (m.type.includes('Dotation')) {
                          directionColor = 'text-indigo-700 bg-indigo-50 border-indigo-100';
                          IconComponent = ArrowRight;
                        }

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-slate-500 whitespace-nowrap">{m.timestamp}</td>
                            <td className="px-4 py-3.5">
                              <div>
                                <span className="font-extrabold text-slate-800 block">{m.item_name}</span>
                                <span className="font-mono text-[9px] text-slate-400 font-bold block">{m.sku}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="font-mono font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                                {m.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-medium">
                              <div className="flex items-center space-x-1.5">
                                <span className="text-slate-600 font-semibold">{m.from_location}</span>
                                <ArrowRight size={10} className="text-slate-400" />
                                <span className="text-slate-800 font-bold">{m.to_location}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-slate-700">{m.staff_name}</td>
                            <td className="px-4 py-3.5 text-right whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${directionColor}`}>
                                <IconComponent size={10} className="mr-1" />
                                {m.type}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUPPLIERS DIRECTORY DISPLAY */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fournisseurs Agréés (Bouaké)</h3>
              <p className="text-[10px] text-slate-500 font-medium">Gérer les contacts des fournisseurs de consommables et lingerie de l'établissement.</p>
            </div>
            <button 
              onClick={() => setShowAddSupplierModal(true)}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus size={12} />
              <span>Nouveau Fournisseur</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suppliers.map(s => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/20 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="font-extrabold text-xs text-slate-900">{s.company_name}</h4>
                    <button
                      onClick={() => {
                        setEditingSupplier(s);
                        setShowEditSupplierModal(true);
                      }}
                      className="text-slate-400 hover:text-brand-orange p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Modifier le fournisseur"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Contact : {s.contact_name}</p>
                </div>
                <div className="mt-3 text-[10px] text-slate-600 space-y-1 font-semibold border-t border-slate-100 pt-2.5">
                  <p>Tél : <span className="font-mono text-slate-800">{s.phone}</span></p>
                  <p>Email : <span className="font-mono text-slate-800">{s.email}</span></p>
                  <p>Adresse : <span className="text-slate-800">{s.address}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADJUST DIALOG MODAL */}
        {showAdjModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left">
              <div className="p-4 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider">Ajuster les stocks</h3>
                <button onClick={() => setShowAdjModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAdjustStock} className="p-5 space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">Sélectionner l'article</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none bg-white cursor-pointer"
                  >
                    {stock.map(item => (
                      <option key={item.id} value={item.id}>{item.name} (Actuel: {item.current_stock})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">Type de mouvement</label>
                    <select
                      value={adjType}
                      onChange={(e) => setAdjType(e.target.value as 'in' | 'out')}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="in">Entrée (+) / Approvisionnement</option>
                      <option value="out">Sortie (-) / Consommation</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700">Quantité</label>
                    <input
                      type="number"
                      required
                      value={adjQty}
                      onChange={(e) => setAdjAmt(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAdjModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover cursor-pointer"
                  >
                    Enregistrer le mouvement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD SUPPLIER DIALOG MODAL */}
        {showAddSupplierModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider">Ajouter un Fournisseur</h3>
                <button onClick={() => setShowAddSupplierModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddSupplier} className="p-5 space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">Nom de l'entreprise <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SOCOCE Bouaké"
                    value={newSupplier.company_name}
                    onChange={(e) => setNewSupplier({...newSupplier, company_name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Nom du contact principal</label>
                  <input
                    type="text"
                    placeholder="Ex: Yao Anderson"
                    value={newSupplier.contact_name}
                    onChange={(e) => setNewSupplier({...newSupplier, contact_name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">Téléphone</label>
                    <input
                      type="text"
                      placeholder="Ex: +225 07 08 09 10 11"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700">Adresse Email</label>
                    <input
                      type="email"
                      placeholder="Ex: sales@sococe.ci"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Adresse / Ville</label>
                  <input
                    type="text"
                    placeholder="Ex: Quartier Commerce, Bouaké"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSupplierModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover cursor-pointer"
                  >
                    Ajouter le fournisseur
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT SUPPLIER DIALOG MODAL */}
        {showEditSupplierModal && editingSupplier && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
              <div className="p-4 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider">Modifier le Fournisseur</h3>
                <button onClick={() => { setShowEditSupplierModal(false); setEditingSupplier(null); }} className="text-slate-400 hover:text-white cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUpdateSupplier} className="p-5 space-y-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-700">Nom de l'entreprise <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SOCOCE Bouaké"
                    value={editingSupplier.company_name}
                    onChange={(e) => setEditingSupplier({...editingSupplier, company_name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Nom du contact principal</label>
                  <input
                    type="text"
                    placeholder="Ex: Yao Anderson"
                    value={editingSupplier.contact_name}
                    onChange={(e) => setEditingSupplier({...editingSupplier, contact_name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">Téléphone</label>
                    <input
                      type="text"
                      placeholder="Ex: +225 07 08 09 10 11"
                      value={editingSupplier.phone}
                      onChange={(e) => setEditingSupplier({...editingSupplier, phone: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-700">Adresse Email</label>
                    <input
                      type="email"
                      placeholder="Ex: sales@sococe.ci"
                      value={editingSupplier.email}
                      onChange={(e) => setEditingSupplier({...editingSupplier, email: e.target.value})}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Adresse / Ville</label>
                  <input
                    type="text"
                    placeholder="Ex: Quartier Commerce, Bouaké"
                    value={editingSupplier.address}
                    onChange={(e) => setEditingSupplier({...editingSupplier, address: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setShowEditSupplierModal(false); setEditingSupplier(null); }}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover cursor-pointer"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// Reuse X
function X(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
