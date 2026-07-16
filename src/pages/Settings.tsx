/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Globe, 
  Percent, 
  Upload, 
  Download, 
  RefreshCw, 
  Shield, 
  FileJson,
  CheckCircle,
  Sparkles,
  X,
  Plus,
  Trash2,
  Users,
  BedDouble,
  Coffee,
  Clock,
  CreditCard,
  Hotel,
  ShieldCheck,
  ChevronRight,
  Sliders,
  AlertTriangle,
  LogOut,
  UserCheck,
  FileText
} from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { 
  mockRoomCategories, 
  mockRooms, 
  mockReservations, 
  mockGuests, 
  mockSuppliers, 
  mockStockItems,
  mockHousekeepingTasks,
  mockMaintenanceTickets,
  mockStockMovements
} from '../mockData';
import { IRoomCategory, IGuest } from '../types';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  email: string;
  phone: string;
  status: 'Actif' | 'Suspendu';
  date_added: string;
  timesheet_required?: boolean;
}

export default function SettingsPage() {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'identity' | 'rooms' | 'services' | 'finance' | 'staff' | 'system'>('identity');
  
  // 1. HOTEL IDENTITY STATES
  const [hotelName, setHotelName] = useState(() => localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip');
  const [legalName, setLegalName] = useState(() => localStorage.getItem('legalName') || 'Brunch Resto-Bar Vip SARL');
  const [phone, setPhone] = useState(() => localStorage.getItem('hotelPhone') || '+225 07 45 89 12 34');
  const [email, setEmail] = useState(() => localStorage.getItem('hotelEmail') || 'contact@brunchresto.vip');
  const [website, setWebsite] = useState(() => localStorage.getItem('hotelWebsite') || 'www.brunchresto.vip');
  const [address, setAddress] = useState(() => localStorage.getItem('hotelAddress') || 'Quartier Commerce, face SGBCI, Bouaké, Côte d\'Ivoire');
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('hotelLogo'));
  const [checkInTime, setCheckInTime] = useState(() => localStorage.getItem('pms_checkin_time') || '14:00');
  const [checkOutTime, setCheckOutTime] = useState(() => localStorage.getItem('pms_checkout_time') || '12:00');
  const [earlyArrivalFee, setEarlyArrivalFee] = useState(() => Number(localStorage.getItem('pms_early_arrival_fee') || '10000'));
  const [lateCheckOutFee, setLateCheckOutFee] = useState(() => Number(localStorage.getItem('pms_late_checkout_fee') || '15000'));

  // 2. ROOM CATEGORIES STATE
  const [categories, setCategories] = useState<IRoomCategory[]>(() => {
    const stored = localStorage.getItem('pms_room_categories');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockRoomCategories;
  });
  const [editingCategory, setEditingCategory] = useState<IRoomCategory | null>(null);

  // 3. SERVICES & MENUS STATES
  const [breakfastPrice, setBreakfastPrice] = useState(() => Number(localStorage.getItem('pms_breakfast_price') || '5000'));
  const [breakfastAvailable, setBreakfastAvailable] = useState(() => localStorage.getItem('pms_breakfast_available') !== 'false');
  const [shuttlePrice, setShuttlePrice] = useState(() => Number(localStorage.getItem('pms_shuttle_price') || '15000'));
  const [shuttleAvailable, setShuttleAvailable] = useState(() => localStorage.getItem('pms_shuttle_available') !== 'false');
  const [extraBedPrice, setExtraBedPrice] = useState(() => Number(localStorage.getItem('pms_extra_bed_price') || '10000'));
  const [laundryShirtPrice, setLaundryShirtPrice] = useState(() => Number(localStorage.getItem('pms_laundry_shirt_price') || '2000'));
  const [laundryPantPrice, setLaundryPantPrice] = useState(() => Number(localStorage.getItem('pms_laundry_pant_price') || '2500'));
  const [laundryDressPrice, setLaundryDressPrice] = useState(() => Number(localStorage.getItem('pms_laundry_dress_price') || '3500'));

  // 4. FINANCE, TAXES & PAYMENTS STATES
  const [tvaEnabled, setTvaEnabled] = useState(() => localStorage.getItem('tvaEnabled') !== 'false');
  const [tvaRate, setTvaRate] = useState(() => Number(localStorage.getItem('tvaRate') || '18'));
  const [touristTaxEnabled, setTouristTaxEnabled] = useState(() => localStorage.getItem('touristTaxEnabled') !== 'false');
  const [touristTaxAmt, setTouristTaxAmt] = useState(() => Number(localStorage.getItem('touristTaxAmt') || '1000'));
  const [defaultCurrency, setDefaultCurrency] = useState(() => localStorage.getItem('defaultCurrency') || 'XOF');
  
  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState(() => {
    const stored = localStorage.getItem('pms_accepted_payments');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return {
      cash: true,
      wave: true,
      orange_money: true,
      mtn_money: true,
      moov_money: true,
      credit_card: true,
      bank_transfer: true,
      cheque: false
    };
  });

  // 4.1 INVOICE CUSTOMIZATION STATES
  const [invoiceTemplate, setInvoiceTemplate] = useState(() => localStorage.getItem('invoiceTemplate') || 'modern');
  const [invoiceShowLogo, setInvoiceShowLogo] = useState(() => localStorage.getItem('invoiceShowLogo') !== 'false');
  const [invoiceShowIdDoc, setInvoiceShowIdDoc] = useState(() => localStorage.getItem('invoiceShowIdDoc') !== 'false');
  const [invoiceShowBankDetails, setInvoiceShowBankDetails] = useState(() => localStorage.getItem('invoiceShowBankDetails') !== 'false');
  const [invoiceShowSignatures, setInvoiceShowSignatures] = useState(() => localStorage.getItem('invoiceShowSignatures') !== 'false');
  const [invoiceShowNotes, setInvoiceShowNotes] = useState(() => localStorage.getItem('invoiceShowNotes') !== 'false');
  const [invoiceCustomNotes, setInvoiceCustomNotes] = useState(() => localStorage.getItem('invoiceCustomNotes') || "• TVA au taux de 18% appliquée sur l'ensemble des prestations assujetties.\n• Taxe de séjour hôtelière collectée pour le compte de la municipalité.\n• En cas de litige, seul le tribunal de commerce compétent est saisi.");
  const [invoiceAvoirCustomNotes, setInvoiceAvoirCustomNotes] = useState(() => localStorage.getItem('invoiceAvoirCustomNotes') || "• Cet avoir est à valoir sur vos prochains séjours ou remboursable sous conditions.\n• Document d'annulation/rectification commerciale.");
  const [invoiceBankDetails, setInvoiceBankDetails] = useState(() => localStorage.getItem('invoiceBankDetails') || "NSIA BANQUE CI: CI123 45678 901234567890 12\nOrange Money: +225 07 45 89 12 34\nWave Transfer: +225 07 45 89 12 34");

  // 5. STAFF / PERSONNEL STATES
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const stored = localStorage.getItem('pms_employees');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      { id: 'emp-1', first_name: 'Amadou', last_name: 'Koné', role: 'Administrateur', email: 'amadou.kone@brunchresto.vip', phone: '+225 07 45 89 12 34', status: 'Actif', date_added: '2026-01-10' },
      { id: 'emp-2', first_name: 'Fatoumata', last_name: 'Coulibaly', role: 'Réceptionniste', email: 'fatou.c@brunchresto.vip', phone: '+225 05 12 34 56 78', status: 'Actif', date_added: '2026-02-15' },
      { id: 'emp-3', first_name: 'Yao', last_name: 'Anderson', role: 'Gouverneur de Lingerie', email: 'anderson.y@brunchresto.vip', phone: '+225 01 02 03 04 05', status: 'Actif', date_added: '2026-03-20' },
      { id: 'emp-4', first_name: 'Abdoulaye', last_name: 'Sangaré', role: 'Serveur Principal / Bar', email: 'sangar.abdoul@brunchresto.vip', phone: '+225 07 77 88 99 00', status: 'Actif', date_added: '2026-04-01' }
    ];
  });
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    first_name: '',
    last_name: '',
    role: 'Réceptionniste',
    email: '',
    phone: ''
  });

  // 6. SYSTEM / APPLICATION STATES
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('pms_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: 'Amadou Koné', role: 'Super Administrateur' };
  });
  const isAdmin = currentUser.role.toLowerCase().includes('admin');

  const [appMode, setAppMode] = useState(() => localStorage.getItem('appMode') || 'production');
  const [backupEnabled, setBackupEnabled] = useState(() => localStorage.getItem('backupEnabled') !== 'false');
  const [lockEnabled, setLockEnabled] = useState(() => localStorage.getItem('pms_lock_enabled') !== 'false');
  const [lockTimeout, setLockTimeout] = useState(() => Number(localStorage.getItem('pms_lock_timeout') || '10'));
  const [timesheetRequired, setTimesheetRequired] = useState(() => localStorage.getItem('pms_timesheet_required') !== 'false');

  // Trigger global layout refresh on change
  const triggerConfigRefresh = () => {
    window.dispatchEvent(new Event('hotel-config-changed'));
  };

  useEffect(() => {
    const fetchSettingsFromDB = async () => {
      try {
        const token = localStorage.getItem('pms_jwt_token');
        if (!token) return;
        const res = await fetch('/api/settings/hotel', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.hotel_name || s.hotelName) setHotelName(s.hotel_name || s.hotelName);
          if (s.legal_name || s.legalName) setLegalName(s.legal_name || s.legalName);
          if (s.phone || s.hotelPhone) setPhone(s.phone || s.hotelPhone);
          if (s.email || s.hotelEmail) setEmail(s.email || s.hotelEmail);
          if (s.website || s.hotelWebsite) setWebsite(s.website || s.hotelWebsite);
          if (s.address || s.hotelAddress) setAddress(s.address || s.hotelAddress);
          if (s.logo !== undefined) setLogo(s.logo);
        }
      } catch (err) {
        console.error('Failed to fetch settings from DB:', err);
      }
    };

    fetchSettingsFromDB();
  }, []);

  // MAIN SAVE HANDLER
  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Hotel Identity & Policy Storage
      localStorage.setItem('hotelName', hotelName);
      localStorage.setItem('legalName', legalName);
      localStorage.setItem('hotelPhone', phone);
      localStorage.setItem('hotelEmail', email);
      localStorage.setItem('hotelWebsite', website);
      localStorage.setItem('hotelAddress', address);
      localStorage.setItem('pms_checkin_time', checkInTime);
      localStorage.setItem('pms_checkout_time', checkOutTime);
      localStorage.setItem('pms_early_arrival_fee', String(earlyArrivalFee));
      localStorage.setItem('pms_late_checkout_fee', String(lateCheckOutFee));

      // 2. Room Categories Storage
      localStorage.setItem('pms_room_categories', JSON.stringify(categories));

      // 3. Services & Pricing Storage
      localStorage.setItem('pms_breakfast_price', String(breakfastPrice));
      localStorage.setItem('pms_breakfast_available', String(breakfastAvailable));
      localStorage.setItem('pms_shuttle_price', String(shuttlePrice));
      localStorage.setItem('pms_shuttle_available', String(shuttleAvailable));
      localStorage.setItem('pms_extra_bed_price', String(extraBedPrice));
      localStorage.setItem('pms_laundry_shirt_price', String(laundryShirtPrice));
      localStorage.setItem('pms_laundry_pant_price', String(laundryPantPrice));
      localStorage.setItem('pms_laundry_dress_price', String(laundryDressPrice));

      // 4. Finance & Payments
      localStorage.setItem('tvaEnabled', String(tvaEnabled));
      localStorage.setItem('tvaRate', String(tvaRate));
      localStorage.setItem('touristTaxEnabled', String(touristTaxEnabled));
      localStorage.setItem('touristTaxAmt', String(touristTaxAmt));
      localStorage.setItem('defaultCurrency', defaultCurrency);
      localStorage.setItem('pms_accepted_payments', JSON.stringify(paymentMethods));

      // 4.1 Invoice Template Customization
      localStorage.setItem('invoiceTemplate', invoiceTemplate);
      localStorage.setItem('invoiceShowLogo', String(invoiceShowLogo));
      localStorage.setItem('invoiceShowIdDoc', String(invoiceShowIdDoc));
      localStorage.setItem('invoiceShowBankDetails', String(invoiceShowBankDetails));
      localStorage.setItem('invoiceShowSignatures', String(invoiceShowSignatures));
      localStorage.setItem('invoiceShowNotes', String(invoiceShowNotes));
      localStorage.setItem('invoiceCustomNotes', invoiceCustomNotes);
      localStorage.setItem('invoiceAvoirCustomNotes', invoiceAvoirCustomNotes);
      localStorage.setItem('invoiceBankDetails', invoiceBankDetails);

      // 5. Staff Storage
      localStorage.setItem('pms_employees', JSON.stringify(employees));

      // 6. System Preferences
      localStorage.setItem('appMode', appMode);
      localStorage.setItem('backupEnabled', String(backupEnabled));
      localStorage.setItem('pms_lock_enabled', String(lockEnabled));
      localStorage.setItem('pms_lock_timeout', String(lockTimeout));
      localStorage.setItem('pms_timesheet_required', String(timesheetRequired));

      if (logo) {
        localStorage.setItem('hotelLogo', logo);
      } else {
        localStorage.removeItem('hotelLogo');
      }

      // 7. Save to server database as well
      const token = localStorage.getItem('pms_jwt_token');
      if (token) {
        await fetch('/api/settings/hotel', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            hotel_name: hotelName,
            legal_name: legalName,
            phone,
            email,
            website,
            address,
            logo
          })
        });
      }

      triggerConfigRefresh();
      setSuccessMsg('Toutes les configurations hôtelières et applicatives ont été enregistrées avec succès.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setErrorMsg('Erreur lors de l\'enregistrement des paramètres locaux et de la base de données.');
      setTimeout(() => setErrorMsg(''), 5000);
    }
  };

  // LOGO LOGIC
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1.5 * 1024 * 1024) {
        setErrorMsg('L\'image dépasse 1.5 Mo.');
        setTimeout(() => setErrorMsg(''), 4000);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogo(base64);
        localStorage.setItem('hotelLogo', base64);
        triggerConfigRefresh();
        setSuccessMsg('Logo téléversé et appliqué avec succès !');
        setTimeout(() => setSuccessMsg(''), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetPresetLogo = () => {
    const defaultVipLogo = 'PRESET_VIP_LOGO';
    setLogo(defaultVipLogo);
    localStorage.setItem('hotelLogo', defaultVipLogo);
    triggerConfigRefresh();
    setSuccessMsg('Logo standard Brunch Resto-Bar VIP restauré.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleClearLogo = () => {
    setLogo(null);
    localStorage.removeItem('hotelLogo');
    triggerConfigRefresh();
  };

  // CATEGORIES LOGIC
  const handleEditCategoryClick = (cat: IRoomCategory) => {
    setEditingCategory({ ...cat });
  };

  const handleSaveCategoryEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const updated = categories.map(c => c.id === editingCategory.id ? editingCategory : c);
    setCategories(updated);
    localStorage.setItem('pms_room_categories', JSON.stringify(updated));
    setEditingCategory(null);
    setSuccessMsg(`La catégorie de chambre "${editingCategory.name}" a été modifiée temporairement. N'oubliez pas d'enregistrer.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // EMPLOYEES LOGIC
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.first_name || !newEmployee.last_name) return;

    const added: Employee = {
      id: `emp-${Date.now()}`,
      first_name: newEmployee.first_name,
      last_name: newEmployee.last_name,
      role: newEmployee.role,
      email: newEmployee.email || 'non-renseigne@hotel.com',
      phone: newEmployee.phone || 'non-renseigne',
      status: 'Actif',
      date_added: new Date().toISOString().split('T')[0],
      timesheet_required: true
    };

    const updated = [...employees, added];
    setEmployees(updated);
    localStorage.setItem('pms_employees', JSON.stringify(updated));
    setShowAddEmployeeModal(false);
    setNewEmployee({ first_name: '', last_name: '', role: 'Réceptionniste', email: '', phone: '' });
    setSuccessMsg(`L'employé(e) "${added.first_name} ${added.last_name}" a été ajouté(e) au personnel.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet employé de l\'annuaire ?')) {
      const updated = employees.filter(emp => emp.id !== id);
      setEmployees(updated);
      localStorage.setItem('pms_employees', JSON.stringify(updated));
      setSuccessMsg('Employé retiré avec succès.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleToggleEmployeeStatus = (id: string) => {
    const updated = employees.map(emp => {
      if (emp.id === id) {
        return { ...emp, status: emp.status === 'Actif' ? 'Suspendu' as const : 'Actif' as const };
      }
      return emp;
    });
    setEmployees(updated);
    localStorage.setItem('pms_employees', JSON.stringify(updated));
    setSuccessMsg('Statut d\'accès de l\'employé mis à jour.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // SYSTEM LOGIC: EXPORT, IMPORT & RESETS
  const handleDownloadConfig = () => {
    const configData = {
      hotelName, legalName, phone, email, website, address, logo,
      checkInTime, checkOutTime, earlyArrivalFee, lateCheckOutFee,
      categories,
      breakfastPrice, breakfastAvailable, shuttlePrice, shuttleAvailable, extraBedPrice,
      laundryShirtPrice, laundryPantPrice, laundryDressPrice,
      tvaEnabled, tvaRate, touristTaxEnabled, touristTaxAmt, defaultCurrency,
      paymentMethods,
      employees,
      appMode, backupEnabled,
      exportedAt: new Date().toISOString(),
      software: "Evreghen PMS v1.4"
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(configData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pms_global_config_${hotelName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    
    setSuccessMsg('Fichier de configuration global de l\'hôtel téléchargé avec succès !');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.hotelName) setHotelName(parsed.hotelName);
          if (parsed.legalName) setLegalName(parsed.legalName);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.website) setWebsite(parsed.website);
          if (parsed.address) setAddress(parsed.address);
          if (parsed.logo !== undefined) setLogo(parsed.logo);
          
          if (parsed.checkInTime) setCheckInTime(parsed.checkInTime);
          if (parsed.checkOutTime) setCheckOutTime(parsed.checkOutTime);
          if (parsed.earlyArrivalFee) setEarlyArrivalFee(Number(parsed.earlyArrivalFee));
          if (parsed.lateCheckOutFee) setLateCheckOutFee(Number(parsed.lateCheckOutFee));

          if (parsed.categories) setCategories(parsed.categories);
          
          if (parsed.breakfastPrice) setBreakfastPrice(Number(parsed.breakfastPrice));
          if (parsed.breakfastAvailable !== undefined) setBreakfastAvailable(parsed.breakfastAvailable);
          if (parsed.shuttlePrice) setShuttlePrice(Number(parsed.shuttlePrice));
          if (parsed.shuttleAvailable !== undefined) setShuttleAvailable(parsed.shuttleAvailable);
          if (parsed.extraBedPrice) setExtraBedPrice(Number(parsed.extraBedPrice));
          
          if (parsed.tvaEnabled !== undefined) setTvaEnabled(parsed.tvaEnabled);
          if (parsed.tvaRate) setTvaRate(Number(parsed.tvaRate));
          if (parsed.touristTaxEnabled !== undefined) setTouristTaxEnabled(parsed.touristTaxEnabled);
          if (parsed.touristTaxAmt) setTouristTaxAmt(Number(parsed.touristTaxAmt));
          if (parsed.defaultCurrency) setDefaultCurrency(parsed.defaultCurrency);
          if (parsed.paymentMethods) setPaymentMethods(parsed.paymentMethods);

          if (parsed.employees) setEmployees(parsed.employees);
          if (parsed.appMode) setAppMode(parsed.appMode);
          if (parsed.backupEnabled !== undefined) setBackupEnabled(parsed.backupEnabled);

          setSuccessMsg('Import de configuration réussi ! Les réglages importés ont été appliqués.');
          triggerConfigRefresh();
          setTimeout(() => setSuccessMsg(''), 5000);
        } catch (err) {
          setErrorMsg('Échec de l\'import : format de fichier de configuration invalide.');
          setTimeout(() => setErrorMsg(''), 5000);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetToDemoData = async () => {
    if (confirm('⚠️ Attention : Cette action va écraser TOUTES vos données actuelles (chambres, réservations, factures, stocks) et restaurer le jeu de données de démonstration de Brunch Resto-Bar VIP Bouaké. Continuer ?')) {
      try {
        const token = localStorage.getItem('pms_jwt_token');
        if (token) {
          await fetch('/api/system/seed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
        }

        localStorage.clear();
        localStorage.removeItem('pms_db_purged');
        
        // Repopulate standard config
        localStorage.setItem('hotelName', 'Brunch Resto-Bar Vip');
        localStorage.setItem('legalName', 'Brunch Resto-Bar Vip SARL');
        localStorage.setItem('hotelPhone', '+225 07 45 89 12 34');
        localStorage.setItem('hotelEmail', 'contact@brunchresto.vip');
        localStorage.setItem('hotelWebsite', 'www.brunchresto.vip');
        localStorage.setItem('hotelAddress', 'Quartier Commerce, face SGBCI, Bouaké, Côte d\'Ivoire');
        localStorage.setItem('tvaEnabled', 'true');
        localStorage.setItem('tvaRate', '18');
        localStorage.setItem('touristTaxEnabled', 'true');
        localStorage.setItem('touristTaxAmt', '1000');
        localStorage.setItem('appMode', 'production');
        localStorage.setItem('backupEnabled', 'true');
        localStorage.setItem('defaultCurrency', 'XOF');
        localStorage.setItem('hotelLogo', 'PRESET_VIP_LOGO');

        // Repopulate core PMS objects
        localStorage.setItem('pms_rooms', JSON.stringify(mockRooms));
        localStorage.setItem('pms_reservations', JSON.stringify(mockReservations));
        localStorage.setItem('pms_guests', JSON.stringify(mockGuests));
        localStorage.setItem('pms_suppliers', JSON.stringify(mockSuppliers));
        localStorage.setItem('pms_stock', JSON.stringify(mockStockItems));
        localStorage.setItem('pms_housekeeping_tasks', JSON.stringify(mockHousekeepingTasks));
        localStorage.setItem('pms_stock_movements', JSON.stringify(mockStockMovements));
        localStorage.setItem('pms_room_categories', JSON.stringify(mockRoomCategories));
        
        setSuccessMsg('Le système a été réinitialisé avec succès avec les données de démonstration d\'origine ! Rechargement en cours...');
        triggerConfigRefresh();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setErrorMsg('Erreur lors de la réinitialisation de la démo.');
      }
    }
  };

  const handleClearAllDatabase = async () => {
    if (confirm('❌ DANGER : Cette action va effacer l\'intégralité des données locales de l\'application (Aucune sauvegarde locale). L\'application sera vierge et prête pour accueillir vos vraies données de Brunch Bouaké. Êtes-vous absolument sûr ?')) {
      try {
        // Keep active session keys
        const pmsUser = localStorage.getItem('pms_user');
        const pmsToken = localStorage.getItem('pms_jwt_token');
        const hotelLogo = localStorage.getItem('hotelLogo');

        if (pmsToken) {
          await fetch('/api/system/purge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${pmsToken}`
            }
          });
        }

        localStorage.clear();
        
        // Restore active session keys
        if (pmsUser) localStorage.setItem('pms_user', pmsUser);
        if (pmsToken) localStorage.setItem('pms_jwt_token', pmsToken);
        if (hotelLogo) localStorage.setItem('hotelLogo', hotelLogo);

        // Set the purged flag so that empty state is prioritized and mock fallbacks are bypassed
        localStorage.setItem('pms_db_purged', 'true');

        // Seed empty structure placeholders to prevent fallback to demo data
        localStorage.setItem('hotelName', 'Brunch Bouaké');
        localStorage.setItem('legalName', 'Brunch Bouaké SARL');
        localStorage.setItem('pms_rooms', JSON.stringify([]));
        localStorage.setItem('pms_reservations', JSON.stringify([]));
        localStorage.setItem('pms_guests', JSON.stringify([]));
        localStorage.setItem('pms_suppliers', JSON.stringify([]));
        localStorage.setItem('pms_stock', JSON.stringify([]));
        localStorage.setItem('pms_stock_movements', JSON.stringify([]));
        localStorage.setItem('pms_housekeeping_tasks', JSON.stringify([]));
        localStorage.setItem('pms_maintenance_tickets', JSON.stringify([]));
        localStorage.setItem('pms_payments', JSON.stringify([]));
        localStorage.setItem('pms_invoices', JSON.stringify([]));
        localStorage.setItem('pms_restaurant_orders', JSON.stringify([]));
        localStorage.setItem('pms_employees', JSON.stringify([]));
        localStorage.setItem('pms_room_categories', JSON.stringify(mockRoomCategories)); // Keep basic standard categories

        // HRMS Module empty collections
        localStorage.setItem('hrms_employees', JSON.stringify([]));
        localStorage.setItem('hrms_departments', JSON.stringify([]));
        localStorage.setItem('hrms_jobs', JSON.stringify([]));
        localStorage.setItem('hrms_teams', JSON.stringify([]));
        localStorage.setItem('hrms_contracts', JSON.stringify([]));
        localStorage.setItem('hrms_skills', JSON.stringify([]));
        localStorage.setItem('hrms_employee_skills', JSON.stringify([]));
        localStorage.setItem('hrms_documents', JSON.stringify([]));
        localStorage.setItem('hrms_onboarding_tasks', JSON.stringify([]));
        localStorage.setItem('hrms_business_events', JSON.stringify([]));
        localStorage.setItem('hrms_payroll_rules', JSON.stringify([]));
        
        setSuccessMsg('Base de données vidée ! L\'application est désormais vierge et prête pour vos données réelles. Rechargement du PMS...');
        triggerConfigRefresh();
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setErrorMsg('Erreur lors du nettoyage de la base de données.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <PageHeader
        title="Centre de Configuration Global"
        description="Ajustez l'identité visuelle de votre établissement, gérez la tarification des chambres, configurez les taxes, le bar-restaurant, et administrez le personnel hôtelier."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}
        {errorMsg && (
          <AlertBanner text={errorMsg} type="warning" />
        )}

        {/* SETTINGS WORKSPACE CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-4 min-h-[550px]">
          
          {/* TAB SIDE NAVIGATION */}
          <div className="bg-slate-900 text-slate-300 p-5 lg:border-r border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800 text-left">
                <span className="text-[10px] font-black text-brand-orange uppercase tracking-wider block">Menu Administration</span>
                <h4 className="text-white text-xs font-bold mt-1">Évreghen PMS Admin</h4>
              </div>
              
              <nav className="space-y-1 text-left">
                <button
                  type="button"
                  onClick={() => setActiveTab('identity')}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    activeTab === 'identity' 
                      ? 'bg-brand-orange text-white shadow-sm font-extrabold' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Hotel size={14} />
                  <span>1. Hôtel & Identité</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('rooms')}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    activeTab === 'rooms' 
                      ? 'bg-brand-orange text-white shadow-sm font-extrabold' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BedDouble size={14} />
                  <span>2. Catégories & Tarifs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('services')}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    activeTab === 'services' 
                      ? 'bg-brand-orange text-white shadow-sm font-extrabold' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Coffee size={14} />
                  <span>3. Services & Bar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('finance')}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    activeTab === 'finance' 
                      ? 'bg-brand-orange text-white shadow-sm font-extrabold' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <DollarSign size={14} />
                  <span>4. Finance & Paiements</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('staff')}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    activeTab === 'staff' 
                      ? 'bg-brand-orange text-white shadow-sm font-extrabold' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Users size={14} />
                  <span>5. Personnel & Accès</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('system')}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center space-x-2.5 transition-all cursor-pointer ${
                    activeTab === 'system' 
                      ? 'bg-brand-orange text-white shadow-sm font-extrabold' 
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <RefreshCw size={14} />
                  <span>6. Système & Maintenance</span>
                </button>
              </nav>
            </div>


          </div>

          {/* TAB BODY FORM */}
          <form onSubmit={handleSaveAllSettings} className="lg:col-span-3 p-6 lg:p-8 flex flex-col justify-between text-left">
            
            {/* CONTENT VIEWS */}
            <div className="space-y-6">

              {/* TAB 1: IDENTITY & LOGO */}
              {activeTab === 'identity' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Identité & Logo de l'Hôtel</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Configurer l'identité de marque légale, l'adresse de facturation, les coordonnées et les heures d'opération.</p>
                  </div>

                  {/* Logo Frame */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-slate-200 bg-slate-50/30">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shadow-inner text-white">
                        {logo === 'PRESET_VIP_LOGO' ? (
                          <div className="text-center p-2 flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center font-bold text-base text-white shadow-lg animate-pulse">
                              B
                            </div>
                            <span className="text-[8px] font-black tracking-wider text-brand-orange mt-1">RESTO VIP</span>
                          </div>
                        ) : logo ? (
                          <img src={logo} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="text-center p-2 text-slate-500 flex flex-col items-center space-y-1">
                            <Settings size={18} className="opacity-40 animate-spin" style={{ animationDuration: '6s' }} />
                            <span className="text-[9px] font-bold">Aucun Logo</span>
                          </div>
                        )}
                      </div>
                      {logo && (
                        <button
                          type="button"
                          onClick={handleClearLogo}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-105 transition-all cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h4 className="font-extrabold text-slate-800 text-xs">Télécharger le logo officiel de l'hôtel</h4>
                      <p className="text-[10px] text-slate-400">Le logo sera intégré sur la barre latérale gauche, vos factures de séjours imprimées et les fiches d'identité clients.</p>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        <label className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center space-x-1">
                          <Upload size={10} />
                          <span>Choisir un fichier</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={handleSetPresetLogo}
                          className="bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 cursor-pointer border border-brand-orange/20"
                        >
                          <Sparkles size={10} />
                          <span>Logo VIP standard</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Address & Legal info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-slate-700">Nom commercial de l'hôtel</label>
                      <input
                        type="text"
                        required
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:border-brand-orange focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-700">Nom légal de facturation (Raison Sociale)</label>
                      <input
                        type="text"
                        required
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:border-brand-orange focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-slate-700 flex items-center space-x-1"><Phone size={10} /> <span>Tél de l'Établissement</span></label>
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:border-brand-orange focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-700 flex items-center space-x-1"><Mail size={10} /> <span>Email officiel</span></label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:border-brand-orange focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-700 flex items-center space-x-1"><Globe size={10} /> <span>Site internet officiel</span></label>
                      <input
                        type="text"
                        required
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:border-brand-orange focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs font-semibold">
                    <label className="text-slate-700">Adresse géographique complète</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:border-brand-orange focus:outline-none"
                    />
                  </div>

                  {/* Operation hours & Policies */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h4 className="text-slate-800 font-extrabold text-xs">Politiques d'arrivée / départ (Heures d'exploitation)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                      <div className="space-y-1">
                        <label className="text-slate-500">Heure de Check-In légal</label>
                        <input
                          type="text"
                          placeholder="14:00"
                          value={checkInTime}
                          onChange={(e) => setCheckInTime(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-center focus:border-brand-orange focus:outline-none font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Heure de Check-Out légal</label>
                        <input
                          type="text"
                          placeholder="12:00"
                          value={checkOutTime}
                          onChange={(e) => setCheckOutTime(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-center focus:border-brand-orange focus:outline-none font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Frais d'Arrivée Anticipée (XOF)</label>
                        <input
                          type="number"
                          value={earlyArrivalFee}
                          onChange={(e) => setEarlyArrivalFee(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-center focus:border-brand-orange focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Frais de Départ Tardif (XOF)</label>
                        <input
                          type="number"
                          value={lateCheckOutFee}
                          onChange={(e) => setLateCheckOutFee(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-center focus:border-brand-orange focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ROOM CATEGORIES & TARIFS */}
              {activeTab === 'rooms' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Catégories de Chambres & Tarifs Pivot</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Configurer les prix par défaut de vos catégories de chambres de l'hôtel.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/20 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="text-left space-y-1 max-w-md">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full bg-${cat.color || 'slate'}-500`} />
                            <h4 className="font-extrabold text-xs text-slate-900">{cat.name}</h4>
                            <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.2 rounded-full font-bold">Max {cat.max_capacity} pers.</span>
                          </div>
                          <p className="text-[10px] text-slate-400 italic line-clamp-2">"{cat.description}"</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-slate-100 pt-2.5 sm:pt-0 sm:border-0">
                          <div className="text-left sm:text-right">
                            <span className="text-[9px] text-slate-400 font-bold block uppercase">Prix par nuit</span>
                            <span className="font-mono text-xs font-black text-slate-950">{(cat.default_price).toLocaleString()} XOF</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEditCategoryClick(cat)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                          >
                            Ajuster Tarif
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* INLINE EDIT MODE MODAL */}
                  {editingCategory && (
                    <div className="bg-brand-orange/5 p-4 rounded-xl border border-brand-orange/20 space-y-3">
                      <div className="flex justify-between items-center border-b border-brand-orange/10 pb-1.5">
                        <h4 className="text-xs font-extrabold text-brand-orange flex items-center gap-1">
                          <Sliders size={12} />
                          <span>Modifier la catégorie : {editingCategory.name}</span>
                        </h4>
                        <button type="button" onClick={() => setEditingCategory(null)} className="text-slate-400 hover:text-slate-600">
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold">
                        <div className="space-y-1">
                          <label className="text-slate-700">Nom complet de la catégorie</label>
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-700">Prix Pivot par nuit (XOF)</label>
                          <input
                            type="number"
                            value={editingCategory.default_price}
                            onChange={(e) => setEditingCategory({ ...editingCategory, default_price: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-700">Capacité maximale (adultes)</label>
                          <input
                            type="number"
                            value={editingCategory.max_capacity}
                            onChange={(e) => setEditingCategory({ ...editingCategory, max_capacity: Number(e.target.value) })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-1 text-xs font-semibold">
                        <label className="text-slate-700">Description marketing (affichée au client)</label>
                        <input
                          type="text"
                          value={editingCategory.description}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCategoryEdit}
                          className="bg-brand-orange text-white text-[10px] font-bold px-4 py-1.5 rounded-lg cursor-pointer"
                        >
                          Appliquer Temporairement
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SERVICES & MENUS */}
              {activeTab === 'services' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Services d'Hébergement & Tarifs Restauration</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Configurer les prix par défaut des petits-déjeuners, navettes, lits d'appoint et tarifs buanderie.</p>
                  </div>

                  {/* Resto/Breakfast Pricing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/20 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <Coffee size={14} className="text-brand-orange" />
                          <span>Service Petit-Déjeuner</span>
                        </h4>
                        <input
                          type="checkbox"
                          checked={breakfastAvailable}
                          onChange={(e) => setBreakfastAvailable(e.target.checked)}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Le prix par personne appliqué d'office lors des ajouts en demi-pension ou en chambre.</p>
                      {breakfastAvailable && (
                        <div className="space-y-1 font-semibold text-xs">
                          <label className="text-slate-500">Tarif par repas et par personne (XOF)</label>
                          <input
                            type="number"
                            value={breakfastPrice}
                            onChange={(e) => setBreakfastPrice(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Airport Shuttle */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/20 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <Globe size={14} className="text-brand-orange" />
                          <span>Navette Aéroport Bouaké</span>
                        </h4>
                        <input
                          type="checkbox"
                          checked={shuttleAvailable}
                          onChange={(e) => setShuttleAvailable(e.target.checked)}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Le prix par trajet pour accueillir ou transférer les clients depuis l'aéroport.</p>
                      {shuttleAvailable && (
                        <div className="space-y-1 font-semibold text-xs">
                          <label className="text-slate-500">Tarif du trajet de navette (XOF)</label>
                          <input
                            type="number"
                            value={shuttlePrice}
                            onChange={(e) => setShuttlePrice(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bed & Laundry Pricing */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
                    <h4 className="font-extrabold text-xs text-slate-900 border-b border-slate-100 pb-2">Lit d'Appoint & Grille Tarifaire Pressing/Buanderie</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold">
                      <div className="space-y-1">
                        <label className="text-slate-500">Lit d'appoint / nuit (XOF)</label>
                        <input
                          type="number"
                          value={extraBedPrice}
                          onChange={(e) => setExtraBedPrice(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Lavage Chemise (XOF)</label>
                        <input
                          type="number"
                          value={laundryShirtPrice}
                          onChange={(e) => setLaundryShirtPrice(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Lavage Pantalon (XOF)</label>
                        <input
                          type="number"
                          value={laundryPantPrice}
                          onChange={(e) => setLaundryPantPrice(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500">Lavage Robe (XOF)</label>
                        <input
                          type="number"
                          value={laundryDressPrice}
                          onChange={(e) => setLaundryDressPrice(Number(e.target.value))}
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: FINANCE, TAXES & PAYMENTS */}
              {activeTab === 'finance' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Régime Fiscal, Devises & Modes de Règlements</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Configurer les taux d'imposition (TVA), la taxe de séjour légale et cocher les moyens de règlements autorisés.</p>
                  </div>

                  {/* Taxes Config */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                          <Percent size={14} className="text-brand-orange" />
                          <span>TVA sur Hébergement & Restauration</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={tvaEnabled}
                          onChange={(e) => setTvaEnabled(e.target.checked)}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Si activée, la TVA sera calculée et séparée sur toutes les factures et synthèses de caisse.</p>
                      {tvaEnabled && (
                        <div className="space-y-1 font-semibold text-xs">
                          <label className="text-slate-500">Taux légal de TVA (%)</label>
                          <input
                            type="number"
                            value={tvaRate}
                            onChange={(e) => setTvaRate(Number(e.target.value))}
                            className="w-full border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/20">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                          <MapPin size={14} className="text-brand-orange" />
                          <span>Taxe de séjour touristique municipale</span>
                        </label>
                        <input
                          type="checkbox"
                          checked={touristTaxEnabled}
                          onChange={(e) => setTouristTaxEnabled(e.target.checked)}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Une taxe fixe réglementaire due par nuitée d'hébergement par personne physique.</p>
                      {touristTaxEnabled && (
                        <div className="space-y-1 font-semibold text-xs">
                          <label className="text-slate-500">Montant de séjour / nuitée (XOF)</label>
                          <input
                            type="number"
                            value={touristTaxAmt}
                            onChange={(e) => setTouristTaxAmt(Number(e.target.value))}
                            className="w-full border border-slate-300 bg-white rounded-lg px-3 py-1.5 text-xs focus:outline-none font-mono"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment methods Checklist */}
                  <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <CreditCard size={14} className="text-brand-orange" />
                        <span>Moyens de Paiement Reçus en Caisse</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Cochez les modes de règlements autorisés lors de la validation des factures de séjours ou de bar-restauration.</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold select-none">
                      <label className="flex items-center space-x-2.5 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentMethods.cash}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, cash: e.target.checked })}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4"
                        />
                        <span>💵 Espèces (Cash)</span>
                      </label>
                      <label className="flex items-center space-x-2.5 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentMethods.wave}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, wave: e.target.checked })}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4"
                        />
                        <span>🌊 Wave Money</span>
                      </label>
                      <label className="flex items-center space-x-2.5 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentMethods.orange_money}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, orange_money: e.target.checked })}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4"
                        />
                        <span>🍊 Orange Money</span>
                      </label>
                      <label className="flex items-center space-x-2.5 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentMethods.mtn_money}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, mtn_money: e.target.checked })}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4"
                        />
                        <span>🟡 MTN MoMo</span>
                      </label>
                      <label className="flex items-center space-x-2.5 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentMethods.moov_money}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, moov_money: e.target.checked })}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4"
                        />
                        <span>🔵 Moov Money</span>
                      </label>
                      <label className="flex items-center space-x-2.5 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentMethods.credit_card}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, credit_card: e.target.checked })}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4"
                        />
                        <span>💳 Carte Bancaire</span>
                      </label>
                      <label className="flex items-center space-x-2.5 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentMethods.bank_transfer}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, bank_transfer: e.target.checked })}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4"
                        />
                        <span>🏢 Virement</span>
                      </label>
                      <label className="flex items-center space-x-2.5 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={paymentMethods.cheque}
                          onChange={(e) => setPaymentMethods({ ...paymentMethods, cheque: e.target.checked })}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4"
                        />
                        <span>📝 Chèque</span>
                      </label>
                    </div>
                  </div>

                  {/* INVOICE & RECEIPT CUSTOMIZER PANEL */}
                  <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <FileText size={14} className="text-brand-orange" />
                        <span>Modèles & Éléments de Facturation Client & Avoirs</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Personnalisez le visuel de vos factures de séjour, reçus de caisse, et factures d'avoir. Les changements s'appliquent automatiquement en temps réel.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-semibold">
                      {/* Template Selector */}
                      <div className="md:col-span-1 space-y-2.5">
                        <label className="text-slate-800 font-extrabold">Style / Gabarit Visuel (Template)</label>
                        <p className="text-[10px] text-slate-400 font-medium">Sélectionnez le design visuel de vos documents imprimables :</p>
                        <div className="space-y-2">
                          <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${invoiceTemplate === 'modern' ? 'border-brand-orange bg-brand-orange/5' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="invoiceTemplate"
                                value="modern"
                                checked={invoiceTemplate === 'modern'}
                                onChange={() => setInvoiceTemplate('modern')}
                                className="text-brand-orange focus:ring-brand-orange"
                              />
                              <span className="font-extrabold text-slate-900">✨ Moderne & Élégant</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Dégradés subtils, badge d'état surélevé, coins de tableaux arrondis et police équilibrée.</span>
                          </label>

                          <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${invoiceTemplate === 'classic' ? 'border-brand-orange bg-brand-orange/5' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="invoiceTemplate"
                                value="classic"
                                checked={invoiceTemplate === 'classic'}
                                onChange={() => setInvoiceTemplate('classic')}
                                className="text-brand-orange focus:ring-brand-orange"
                              />
                              <span className="font-extrabold text-slate-900">💼 Classique Corporate</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Double ligne de séparation supérieure, style de facture d'affaires standardisé d'Afrique de l'Ouest.</span>
                          </label>

                          <label className={`flex flex-col p-3 border rounded-xl cursor-pointer transition-all ${invoiceTemplate === 'minimal' ? 'border-brand-orange bg-brand-orange/5' : 'border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name="invoiceTemplate"
                                value="minimal"
                                checked={invoiceTemplate === 'minimal'}
                                onChange={() => setInvoiceTemplate('minimal')}
                                className="text-brand-orange focus:ring-brand-orange"
                              />
                              <span className="font-extrabold text-slate-900">⚙️ Minimaliste Épuré</span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">Design noir et blanc à contraste élevé, idéal pour l'impression jet d'encre directe sans fioritures.</span>
                          </label>
                        </div>
                      </div>

                      {/* Elements to Include Checklist */}
                      <div className="md:col-span-2 space-y-4">
                        <label className="text-slate-800 font-extrabold block">Éléments visuels à inclure</label>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <label className="flex items-center space-x-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={invoiceShowLogo}
                              onChange={(e) => setInvoiceShowLogo(e.target.checked)}
                              className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5"
                            />
                            <div>
                              <span className="block font-bold text-slate-800 text-[11px]">Logo de l'Hôtel</span>
                              <span className="text-[9px] text-slate-400 font-medium">Afficher l'image du logo dans l'en-tête</span>
                            </div>
                          </label>

                          <label className="flex items-center space-x-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={invoiceShowIdDoc}
                              onChange={(e) => setInvoiceShowIdDoc(e.target.checked)}
                              className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5"
                            />
                            <div>
                              <span className="block font-bold text-slate-800 text-[11px]">Identité Client</span>
                              <span className="text-[9px] text-slate-400 font-medium">Afficher N° CNI / Passeport du client</span>
                            </div>
                          </label>

                          <label className="flex items-center space-x-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={invoiceShowBankDetails}
                              onChange={(e) => setInvoiceShowBankDetails(e.target.checked)}
                              className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5"
                            />
                            <div>
                              <span className="block font-bold text-slate-800 text-[11px]">RIB / Coordonnées Bancaires</span>
                              <span className="text-[9px] text-slate-400 font-medium">Inclure le RIB pour virements et versements</span>
                            </div>
                          </label>

                          <label className="flex items-center space-x-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={invoiceShowSignatures}
                              onChange={(e) => setInvoiceShowSignatures(e.target.checked)}
                              className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5"
                            />
                            <div>
                              <span className="block font-bold text-slate-800 text-[11px]">Emplacements de Signature</span>
                              <span className="text-[9px] text-slate-400 font-medium">Blocs de signature pour réceptionniste & client</span>
                            </div>
                          </label>

                          <label className="flex items-center space-x-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50/50 cursor-pointer sm:col-span-2">
                            <input
                              type="checkbox"
                              checked={invoiceShowNotes}
                              onChange={(e) => setInvoiceShowNotes(e.target.checked)}
                              className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5"
                            />
                            <div>
                              <span className="block font-bold text-slate-800 text-[11px]">Notes légales & Conditions de séjour</span>
                              <span className="text-[9px] text-slate-400 font-medium">Afficher les paragraphes réglementaires de l'hôtel en bas de page</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-100 text-xs font-semibold">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Custom Bank Details */}
                        {invoiceShowBankDetails && (
                          <div className="space-y-1 md:col-span-2">
                            <label className="text-slate-700 flex items-center justify-between">
                              <span>Coordonnées bancaires & Mobile Money (RIB de Facturation)</span>
                              <span className="text-[9px] text-slate-400 font-medium">Un compte par ligne</span>
                            </label>
                            <textarea
                              rows={3}
                              value={invoiceBankDetails}
                              onChange={(e) => setInvoiceBankDetails(e.target.value)}
                              placeholder="Ex: NSIA BANQUE CI: CI123 45678...&#10;Wave Money: +225 07..."
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-mono"
                            />
                          </div>
                        )}

                        {/* Standard Legal Notes */}
                        {invoiceShowNotes && (
                          <>
                            <div className="space-y-1">
                              <label className="text-slate-700">Mentions légales de bas de page (Facture standard)</label>
                              <textarea
                                rows={4}
                                value={invoiceCustomNotes}
                                onChange={(e) => setInvoiceCustomNotes(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-medium leading-relaxed"
                              />
                            </div>

                            {/* Credit Note Notes */}
                            <div className="space-y-1">
                              <label className="text-slate-700">Mentions légales de bas de page (Facture d'Avoir / Avoir commercial)</label>
                              <textarea
                                rows={4}
                                value={invoiceAvoirCustomNotes}
                                onChange={(e) => setInvoiceAvoirCustomNotes(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:border-brand-orange focus:outline-none font-medium leading-relaxed"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: STAFF & USERS */}
              {activeTab === 'staff' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Personnel & Rôles d'Accès PMS</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Annuaire de votre personnel de l'hôtel habilité à modifier l'outil d'exploitation hôtelière.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddEmployeeModal(true)}
                      className="bg-brand-orange text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Ajouter un employé</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employees.map((emp) => (
                      <div key={emp.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between gap-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="text-left space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px]">
                                {emp.first_name[0]}{emp.last_name[0]}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-900">{emp.first_name} {emp.last_name}</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{emp.role}</p>
                              </div>
                            </div>
                            
                            <div className="text-[10px] text-slate-500 font-semibold space-y-0.5 pt-1 border-t border-slate-50">
                              <p>Tél : <span className="font-mono text-slate-800">{emp.phone}</span></p>
                              <p>Email : <span className="font-mono text-slate-800">{emp.email}</span></p>
                              <p className="text-[8px] text-slate-400">Ajouté le : {emp.date_added}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end space-y-2 select-none">
                            <button
                              type="button"
                              onClick={() => handleToggleEmployeeStatus(emp.id)}
                              className="cursor-pointer"
                            >
                              <Badge 
                                label={emp.status} 
                                type="default" 
                                status={emp.status === 'Actif' ? 'confirmée' : 'occupée'} 
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                              title="Retirer cet employé"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* HR Permissions toggling */}
                        <div className="border-t border-slate-100 pt-3 mt-1 flex items-center justify-between">
                          <div className="text-left">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Configuration RH</span>
                            <span className="text-[10px] text-slate-400 font-medium block">Saisie du Timesheet obligatoire</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {!isAdmin && <span className="text-[10px] text-slate-400">🔒 Admin</span>}
                            <input
                              type="checkbox"
                              disabled={!isAdmin}
                              checked={emp.timesheet_required !== false}
                              onChange={() => {
                                const updated = employees.map(e => {
                                  if (e.id === emp.id) {
                                    return { ...e, timesheet_required: e.timesheet_required === false ? true : false };
                                  }
                                  return e;
                                });
                                setEmployees(updated);
                                localStorage.setItem('pms_employees', JSON.stringify(updated));
                                window.dispatchEvent(new Event('pms-timesheet-changed'));
                              }}
                              className="rounded text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ADD EMPLOYEE INTERACTION DIALOG */}
                  {showAddEmployeeModal && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
                        <div className="p-4 bg-[#141517] text-white flex justify-between items-center">
                          <h3 className="font-bold text-xs uppercase tracking-wider">Nouvel Employé Hôtelier</h3>
                          <button type="button" onClick={() => setShowAddEmployeeModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                            <X size={16} />
                          </button>
                        </div>

                        <form onSubmit={handleAddEmployee} className="p-5 space-y-3.5 text-xs font-semibold">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-slate-700">Prénom <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                required
                                placeholder="Ex: Kouassi"
                                value={newEmployee.first_name}
                                onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-slate-700">Nom de famille <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                required
                                placeholder="Ex: Koffi"
                                value={newEmployee.last_name}
                                onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                                className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-700">Rôle au sein de l'établissement</label>
                            <select
                              value={newEmployee.role}
                              onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:outline-none"
                            >
                              <option value="Administrateur">Administrateur / Gérant</option>
                              <option value="Réceptionniste">Réceptionniste</option>
                              <option value="Gouverneur de Lingerie">Gouvernance / Lingerie</option>
                              <option value="Chef Serveur / Resto">Serveur / Restaurant / Bar</option>
                              <option value="Technicien Maintenance">Agent de Maintenance</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-700">Téléphone Mobile</label>
                            <input
                              type="text"
                              placeholder="+225 07..."
                              value={newEmployee.phone}
                              onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:outline-none font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-700">Adresse Email Pro</label>
                            <input
                              type="email"
                              placeholder="nom@brunchresto.vip"
                              value={newEmployee.email}
                              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                              className="w-full border border-slate-300 rounded-lg px-3 py-1.8 text-xs focus:outline-none font-mono"
                            />
                          </div>

                          <div className="pt-3 flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowAddEmployeeModal(false)}
                              className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                            >
                              Annuler
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover cursor-pointer"
                            >
                              Enregistrer l'accès
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SYSTEM, COOLDOWN & BACKUPS */}
              {activeTab === 'system' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-extrabold text-slate-900">Préférences Système & Maintenance Database</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Exporter votre base locale au format de sauvegarde standard JSON, ou purger/restaurer l'intégralité des données d'exploitation.</p>
                  </div>

                  {/* System & Mode selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/10 space-y-3 font-semibold text-xs text-left">
                      <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                        <Sliders size={14} className="text-brand-orange" />
                        <span>Mode Applicatif</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium">Détermine le niveau de sécurité et de journalisation de l'application hôtelière.</p>
                      
                      <div className="space-y-1 pt-1">
                        <select
                          value={appMode}
                          onChange={(e) => setAppMode(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-2.5 py-1.8 text-xs focus:outline-none bg-white font-bold"
                        >
                          <option value="production">Production (Sécurisé)</option>
                          <option value="demo">Mode Simulation / Bac à Sable (Demo)</option>
                          <option value="maintenance">Maintenance Active (Accès réservé)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 select-none cursor-pointer">
                        <div>
                          <label className="text-slate-800 text-[11px] font-bold block">Sauvegarde horaire</label>
                          <span className="text-[8px] text-slate-400 block font-medium">Archiver localement en cache toutes les heures</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={backupEnabled}
                          onChange={(e) => setBackupEnabled(e.target.checked)}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5 cursor-pointer"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 select-none">
                        <div>
                          <label className="text-slate-800 text-[11px] font-bold block">Verrouillage automatique</label>
                          <span className="text-[8px] text-slate-400 block font-medium">Sécuriser l'application en cas d'inactivité prolongée</span>
                        </div>
                        <input
                          type="checkbox"
                          disabled={!isAdmin}
                          checked={lockEnabled}
                          onChange={(e) => setLockEnabled(e.target.checked)}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {lockEnabled && (
                        <div className="pt-2 border-t border-slate-100">
                          <label className="text-slate-800 text-[11px] font-bold block mb-1">Délai d'inactivité</label>
                          <select
                            disabled={!isAdmin}
                            value={lockTimeout}
                            onChange={(e) => setLockTimeout(Number(e.target.value))}
                            className="w-full border border-slate-300 rounded-lg px-2.5 py-1.8 text-xs focus:outline-none bg-white font-bold disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                          >
                            <option value={1}>1 minute</option>
                            <option value={3}>3 minutes</option>
                            <option value={5}>5 minutes</option>
                            <option value={10}>10 minutes (Défaut)</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 heure</option>
                          </select>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 select-none">
                        <div>
                          <label className="text-slate-800 text-[11px] font-bold block">Saisie du Timesheet obligatoire</label>
                          <span className="text-[8px] text-slate-400 block font-medium">Exiger l'activation du temps de service pour travailler</span>
                        </div>
                        <input
                          type="checkbox"
                          disabled={!isAdmin}
                          checked={timesheetRequired}
                          onChange={(e) => setTimesheetRequired(e.target.checked)}
                          className="rounded text-brand-orange focus:ring-brand-orange w-4.5 h-4.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {!isAdmin && (
                        <div className="pt-2 border-t border-slate-100 text-[9px] text-amber-600 font-bold flex items-center gap-1">
                          <span>🔒 Ces options de sécurité sont gérées exclusivement par l'Administrateur du PMS.</span>
                        </div>
                      )}
                    </div>

                    {/* JSON BACKUPS */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/10 space-y-3 text-left">
                      <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1">
                        <FileJson size={14} className="text-brand-orange" />
                        <span>Téléverser / Exporter les Données</span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium leading-normal">Téléchargez la base de données locale du PMS hôtelier. Vous pourrez la charger plus tard ou l'installer sur un autre navigateur web.</p>
                      
                      <div className="grid grid-cols-1 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleDownloadConfig}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Download size={12} />
                          <span>Exporter l'archive JSON</span>
                        </button>

                        <label className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[11px] font-bold py-2 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer text-center">
                          <Upload size={12} />
                          <span>Importer archive JSON</span>
                          <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* CRITICAL ACTIONS RESETS */}
                  <div className="p-5 border border-red-200 rounded-xl bg-red-50/30 space-y-4">
                    <div className="flex items-center space-x-2 border-b border-red-100 pb-2">
                      <AlertTriangle className="text-red-600 animate-bounce" size={16} />
                      <h4 className="font-black text-red-900 text-xs uppercase tracking-wider">Zone de Restauration & Purge Critique</h4>
                    </div>
                    <p className="text-[10px] text-red-700 leading-normal">Ces actions sont destructives. Elles écrasent les données locales de votre navigateur pour soit charger la démo officielle de l'hôtel, soit réinitialiser le système pour un tout nouvel établissement d'exploitation.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleResetToDemoData}
                        className="bg-red-700 hover:bg-red-800 text-white text-[11px] font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-red-700/10 flex-1"
                      >
                        <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '4s' }} />
                        <span>Restaurer Jeu de Démo d'Origine</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClearAllDatabase}
                        className="bg-white border-2 border-red-200 hover:bg-red-50 text-red-800 text-[11px] font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer flex-1"
                      >
                        <Trash2 size={13} />
                        <span>Purge Complète / PMS Vierge</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* SAVE ALL PREFERENCES SUBMIT FOOTER */}
            <div className="pt-6 border-t border-slate-100 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 font-semibold self-start sm:self-auto">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Tous les réglages sont sauvegardés localement (localStorage).</span>
              </div>
              <button
                type="submit"
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors flex items-center space-x-1.5 cursor-pointer shadow-md shadow-brand-orange/15 w-full sm:w-auto justify-center"
              >
                <Save size={14} />
                <span>Enregistrer les Paramètres</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
