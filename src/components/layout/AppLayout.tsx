/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Bed,
  CalendarDays,
  Users,
  Coins,
  Sparkles,
  Wrench,
  Utensils,
  Boxes,
  BarChart3,
  Settings,
  ShieldAlert,
  LogOut,
  Search,
  Languages,
  DollarSign,
  User,
  Menu,
  X,
  PlusCircle,
  HelpCircle,
  Clock,
  Compass,
  ChevronRight,
  Smartphone,
  Globe,
  Briefcase,
  Pin,
  Lock
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { hasPermission } from '../../utils/permissions';

interface AppLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    role: string;
    email: string;
    avatar?: string;
  } | null;
  onLogout: () => void;
}

export default function AppLayout({ children, user, onLogout }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hotelName, setHotelName] = useState(() => localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip');
  const [hotelLogo, setHotelLogo] = useState<string | null>(() => localStorage.getItem('hotelLogo'));

  // Inactivity Auto-Lock system
  const [isLocked, setIsLocked] = useState(() => {
    return localStorage.getItem('pms_is_locked') === 'true';
  });
  const [lockPassword, setLockPassword] = useState('');
  const [lockError, setLockError] = useState('');

  // Timesheet tracker state
  const [timesheetActive, setTimesheetActive] = useState(() => localStorage.getItem('pms_timesheet_active') === 'true');
  const [timesheetStart, setTimesheetStart] = useState(() => Number(localStorage.getItem('pms_timesheet_start_time') || '0'));
  const [timesheetRequired, setTimesheetRequired] = useState(() => localStorage.getItem('pms_timesheet_required') === 'true');
  const [elapsedText, setElapsedText] = useState('00:00:00');

  useEffect(() => {
    // Check if auto-lock is enabled
    const lockEnabled = localStorage.getItem('pms_lock_enabled') !== 'false';
    if (!lockEnabled || !user) return;

    const timeoutInMinutes = Number(localStorage.getItem('pms_lock_timeout') || '10');
    const timeoutMs = timeoutInMinutes * 60 * 1000;

    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsLocked(true);
        localStorage.setItem('pms_is_locked', 'true');
      }, timeoutMs);
    };

    // Activity event listeners
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handleActivity = () => {
      if (!isLocked) resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Start timer on mount
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, isLocked]);

  useEffect(() => {
    const syncTimesheet = () => {
      setTimesheetActive(localStorage.getItem('pms_timesheet_active') === 'true');
      setTimesheetStart(Number(localStorage.getItem('pms_timesheet_start_time') || '0'));
      setTimesheetRequired(localStorage.getItem('pms_timesheet_required') === 'true');
    };

    window.addEventListener('pms-timesheet-changed', syncTimesheet);
    return () => {
      window.removeEventListener('pms-timesheet-changed', syncTimesheet);
    };
  }, []);

  useEffect(() => {
    if (!timesheetActive || !timesheetStart) {
      setElapsedText('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const diff = Date.now() - timesheetStart;
      const hours = Math.floor(diff / (3600 * 1000));
      const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
      const seconds = Math.floor((diff % (60 * 1000)) / 1000);

      const fH = String(hours).padStart(2, '0');
      const fM = String(minutes).padStart(2, '0');
      const fS = String(seconds).padStart(2, '0');

      setElapsedText(`${fH}:${fM}:${fS}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [timesheetActive, timesheetStart]);

  const handleToggleTimesheet = () => {
    if (timesheetActive) {
      // Save to timesheet history before stopping
      const durationMs = Date.now() - timesheetStart;
      const hours = (durationMs / (1000 * 60 * 60)).toFixed(2);
      const historyStr = localStorage.getItem('pms_timesheet_history') || '[]';
      try {
        const history = JSON.parse(historyStr);
        history.unshift({
          id: `ts-${Date.now()}`,
          userEmail: user?.email || 'admin',
          userName: user?.name || 'Administrateur',
          startTime: new Date(timesheetStart).toLocaleString('fr-FR'),
          endTime: new Date().toLocaleString('fr-FR'),
          hours: Number(hours),
          status: 'Validé'
        });
        localStorage.setItem('pms_timesheet_history', JSON.stringify(history));
      } catch (e) {}

      localStorage.removeItem('pms_timesheet_active');
      localStorage.removeItem('pms_timesheet_start_time');
      setTimesheetActive(false);
    } else {
      const now = Date.now();
      localStorage.setItem('pms_timesheet_active', 'true');
      localStorage.setItem('pms_timesheet_start_time', now.toString());
      setTimesheetStart(now);
      setTimesheetActive(true);
    }
    // Dispatch event to inform other active tabs or pages
    window.dispatchEvent(new Event('pms-timesheet-changed'));
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = 'Prodesk@2026';
    if (lockPassword === correctPassword) {
      setIsLocked(false);
      localStorage.removeItem('pms_is_locked');
      setLockPassword('');
      setLockError('');
    } else {
      setLockError('Mot de passe de déverrouillage incorrect (Défaut: Prodesk@2026).');
    }
  };

  useEffect(() => {
    const handleConfigChange = () => {
      setHotelName(localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip');
      setHotelLogo(localStorage.getItem('hotelLogo'));
    };

    window.addEventListener('hotel-config-changed', handleConfigChange);
    window.addEventListener('storage', handleConfigChange);

    return () => {
      window.removeEventListener('hotel-config-changed', handleConfigChange);
      window.removeEventListener('storage', handleConfigChange);
    };
  }, []);
  const [sidebarPinned, setSidebarPinned] = useState<boolean>(() => {
    const stored = localStorage.getItem('pms_sidebar_pinned');
    return stored !== null ? stored === 'true' : true;
  });
  const [lang, setLang] = useState<'FR' | 'EN'>('FR');
  const [currency, setCurrency] = useState<'XOF' | 'EUR'>(() => {
    return (localStorage.getItem('pms_currency') as 'XOF' | 'EUR') || 'XOF';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [notifCount, setNotifCount] = useState(3);

  const handleCurrencyChange = (newCurrency: 'XOF' | 'EUR') => {
    setCurrency(newCurrency);
    localStorage.setItem('pms_currency', newCurrency);
    window.dispatchEvent(new Event('pms-currency-changed'));
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/reception', label: 'Réception', icon: Bell },
    { path: '/rooms', label: 'Chambres', icon: Bed },
    { path: '/reservations', label: 'Réservations', icon: CalendarDays },
    { path: '/guests', label: 'Clients', icon: Users },
    { path: '/finance', label: 'Finance', icon: Coins },
    { path: '/hrms', label: 'RH Enterprise', icon: Briefcase },
    { path: '/housekeeping', label: 'Housekeeping', icon: Sparkles },
    { path: '/maintenance', label: 'Maintenance', icon: Wrench },
    { path: '/restaurant', label: 'Restaurant', icon: Utensils },
    { path: '/inventory', label: 'Stock', icon: Boxes },
    { path: '/reports', label: 'Rapports', icon: BarChart3 },
    { path: '/settings', label: 'Paramètres', icon: Settings },
    { path: '/admin', label: 'Administration', icon: ShieldAlert }
  ];

  const allowedOperations = menuItems.slice(0, 11).filter(item => 
    user ? hasPermission(user.email, user.role, item.path) : false
  );
  const allowedSystemAdmin = menuItems.slice(11).filter(item => 
    user ? hasPermission(user.email, user.role, item.path) : false
  );

  const futureMenuItems = [
    { label: 'POS Restaurant', icon: Utensils },
    { label: 'CRM Clients', icon: Users },
    { label: 'Channel Manager OTA', icon: Globe },
    { label: 'Application Mobile', icon: Smartphone }
  ];

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => location.pathname === item.path);
    return activeItem ? activeItem.label : 'Module';
  };

  const currentHour = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen flex bg-background text-on-background" id="pms-app-root">
      {/* SIDEBAR - Evreghen Command Center Premium Style (Fixed or Floating toggle) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/70 backdrop-blur-[12px] text-white/80 border-r border-white/10 flex flex-col transition-transform duration-300 transform ${
        sidebarPinned 
          ? 'md:static md:h-screen md:flex-shrink-0' 
          : 'md:z-50 shadow-2xl'
      } ${
        sidebarOpen 
          ? 'translate-x-0' 
          : `-translate-x-full ${sidebarPinned ? 'md:translate-x-0' : 'md:-translate-x-full'}`
      }`}>
        {/* BRAND HEADER */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/40">
          <div className="flex items-center space-x-3">
            {hotelLogo === 'PRESET_VIP_LOGO' ? (
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-brand-orange/40 flex items-center justify-center font-black text-brand-orange text-lg shadow-lg shadow-brand-orange/10 relative">
                B
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse"></span>
              </div>
            ) : hotelLogo ? (
              <img 
                src={hotelLogo} 
                alt="Logo" 
                className="w-9 h-9 rounded-lg object-contain bg-white p-0.5 shadow-md border border-white/10" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-brand-orange/20">
                {hotelName ? hotelName[0].toUpperCase() : 'B'}
              </div>
            )}
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-sm tracking-wide uppercase leading-none truncate max-w-[130px]" title={hotelName}>
                {hotelName}
              </h1>
              <span className="text-[10px] text-brand-orange font-semibold tracking-wider uppercase">Command Center</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {/* PIN TOGGLE (Desktop only) */}
            <button 
              onClick={() => {
                const newVal = !sidebarPinned;
                setSidebarPinned(newVal);
                localStorage.setItem('pms_sidebar_pinned', String(newVal));
              }} 
              className="hidden md:flex p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title={sidebarPinned ? "Désépingler la barre latérale (Mode Flottant)" : "Épingler la barre latérale (Mode Fixe)"}
            >
              <Pin size={14} className={`transition-transform duration-200 ${sidebarPinned ? 'rotate-45 text-brand-orange' : 'opacity-50'}`} />
            </button>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CURRENT CONTEXT MINI WIDGET */}
        <div className="px-5 py-4 border-b border-white/10 bg-black/20 text-xs flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock size={13} className="text-brand-orange" />
            <span className="font-mono text-white text-[11px]">{currentHour} Bouaké</span>
          </div>
          <div className="flex items-center space-x-1 bg-white/10 px-2 py-0.5 rounded text-[10px] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block mr-1"></span>
            LIVE
          </div>
        </div>

        {/* NAVIGATION MENUS */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {allowedOperations.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-2">Opérations</span>
              <nav className="space-y-1">
                {allowedOperations.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive 
                          ? 'bg-brand-orange text-white font-bold shadow-lg shadow-brand-orange/20' 
                          : 'hover:bg-white/10 hover:text-white text-white/70'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} className={isActive ? 'text-white' : 'text-white/45 group-hover:text-white'} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {allowedSystemAdmin.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-2">Système & Admin</span>
              <nav className="space-y-1">
                {allowedSystemAdmin.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive 
                          ? 'bg-brand-orange text-white font-bold shadow-lg shadow-brand-orange/20' 
                          : 'hover:bg-white/10 hover:text-white text-white/70'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} className={isActive ? 'text-white' : 'text-white/45 group-hover:text-white'} />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* FUTURE MODULES ("À venir") */}
          <div>
            <span className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-2">Modules futurs</span>
            <div className="space-y-1 opacity-65">
              {futureMenuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-not-allowed bg-white/5 text-white/50"
                    title="Prévu pour les prochaines versions"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon size={14} className="text-white/30" />
                      <span>{item.label}</span>
                    </div>
                    <span className="bg-white/10 text-white/70 text-[8px] font-bold px-1.5 py-0.5 rounded">À venir</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* TIMESHEET TRACKER PANEL */}
        {user && (
          <div className="mx-4 mb-3 bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/45 uppercase tracking-wider flex items-center gap-1">
                <Clock size={11} className={timesheetActive ? "text-emerald-500 animate-pulse" : "text-white/40"} />
                <span>Temps de Service (Timesheet)</span>
              </span>
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${timesheetActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/50'}`}>
                {timesheetActive ? 'ACTIF' : 'INACTIF'}
              </span>
            </div>
            
            <div className="flex items-baseline justify-between pt-1">
              <span className={`font-mono text-base font-black tracking-wider ${timesheetActive ? 'text-emerald-400' : 'text-white/40'}`}>
                {elapsedText}
              </span>
              {timesheetStart > 0 && (
                <span className="text-[9px] text-white/40 font-medium">
                  Début : {new Date(timesheetStart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            <button
              onClick={handleToggleTimesheet}
              className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-center space-x-1 ${
                timesheetActive 
                  ? 'bg-red-500/20 hover:bg-red-500/35 text-red-400 border border-red-500/30' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
              }`}
            >
              <Clock size={12} />
              <span>{timesheetActive ? 'Clôturer mon service' : 'Activer mon Timesheet'}</span>
            </button>
          </div>
        )}

        {/* SIDEBAR FOOTER / PROFILE */}
        <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30 flex items-center justify-center font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-white text-xs font-bold truncate">{user.name}</h4>
                  <p className="text-[10px] text-white/50 truncate capitalize">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={onLogout} 
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
          
          <div className="text-center pt-1 border-t border-white/5">
            <p className="text-[9px] text-white/30 font-medium tracking-wide">
              &copy; {new Date().getFullYear()} Fasopost Digital &bull; +212 777346787
            </p>
          </div>
        </div>
      </aside>

      {/* OVERLAY FOR SIDEBAR */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className={`fixed inset-0 z-40 bg-black/50 ${sidebarPinned ? 'md:hidden' : 'block'}`}
        ></div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full md:max-h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-black/70 backdrop-blur-[12px] border-b border-white/10 flex items-center justify-between px-4 md:px-8 flex-shrink-0 shadow-md z-30 text-white animate-fade-in">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className={`p-2 rounded-md hover:bg-white/10 text-white/80 transition-colors ${sidebarPinned ? 'md:hidden' : 'block'}`}
              title="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            
            {/* Global Context Indicator / Breadcrumbs */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-white/60">
              <span>PMS</span>
              <ChevronRight size={14} className="text-white/40" />
              <span className="text-white font-bold">{getPageTitle()}</span>
            </div>
          </div>

          {/* HEADER OPTIONS */}
          <div className="flex items-center space-x-3 lg:space-x-6">
            
            {/* GLOBAL SEARCH */}
            <div className="relative hidden md:block w-64">
              <input
                type="text"
                placeholder="Recherche globale..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white/10 focus:bg-white/15 text-xs text-white placeholder-white/40 rounded-lg border border-white/10 focus:border-white/20 focus:outline-none transition-all duration-150"
              />
              <Search className="absolute left-3 top-2.5 text-white/40" size={14} />
            </div>

            {/* CURRENCY TOGGLE */}
            <div className="flex bg-white/10 p-1 rounded-lg text-[10px] font-bold border border-white/5">
              <button
                onClick={() => handleCurrencyChange('XOF')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${currency === 'XOF' ? 'bg-brand-orange text-white shadow-xs' : 'text-white/60 hover:text-white'}`}
              >
                FCFA (XOF)
              </button>
              <button
                onClick={() => handleCurrencyChange('EUR')}
                className={`px-2 py-1 rounded-md transition-all cursor-pointer ${currency === 'EUR' ? 'bg-brand-orange text-white shadow-xs' : 'text-white/60 hover:text-white'}`}
              >
                EUR (€)
              </button>
            </div>

            {/* LANGUAGE TOGGLE */}
            <button
              onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
              className="flex items-center space-x-1.5 text-xs text-white/80 hover:text-brand-orange px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
              title="Changer de langue"
            >
              <Languages size={14} />
              <span className="font-bold">{lang}</span>
            </button>

            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative">
              <button onClick={() => setNotifCount(0)} className="p-2 text-white/80 hover:bg-white/10 hover:text-brand-orange rounded-full relative transition-colors">
                <Bell size={18} />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-brand-orange text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {notifCount}
                  </span>
                )}
              </button>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

            {/* QUICK ACTIONS BUTTON */}
            <div className="hidden sm:block">
              <button 
                onClick={() => navigate('/reservations', { state: { openCreateModal: true } })}
                className="flex items-center space-x-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-xs"
              >
                <PlusCircle size={14} />
                <span>Réservation</span>
              </button>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto bg-background relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* INACTIVITY LOCK OVERLAY SCREEN */}
      {isLocked && (
        <div className="fixed inset-0 z-[9999] bg-[#0E0F11]/95 backdrop-blur-[16px] flex flex-col items-center justify-center px-4 select-none">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center border border-slate-200 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange mb-4 shadow-lg shadow-brand-orange/5">
              <Lock size={26} className="animate-pulse" />
            </div>
            
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Session Verrouillée</h2>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Par mesure de sécurité, l'application a été automatiquement verrouillée suite à une période d'inactivité.
            </p>
            
            {user && (
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left flex items-center space-x-3 border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center uppercase">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 block truncate">{user.name}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{user.email}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleUnlock} className="mt-5 space-y-3">
              <div className="space-y-1 text-left">
                <label className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Saisir le mot de passe</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={lockPassword}
                  onChange={(e) => setLockPassword(e.target.value)}
                  placeholder="Mot de passe (Défaut: Prodesk@2026)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-brand-orange bg-slate-50 font-bold"
                />
                {lockError && (
                  <span className="text-[10px] text-red-500 font-bold block mt-1 leading-tight">{lockError}</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold py-2 rounded-lg transition-colors cursor-pointer shadow-md shadow-brand-orange/20"
              >
                Déverrouiller
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsLocked(false);
                  localStorage.removeItem('pms_is_locked');
                  onLogout();
                }}
                className="w-full text-slate-400 hover:text-slate-700 text-[10px] font-bold py-1.5 transition-colors cursor-pointer"
              >
                Se déconnecter / Autre utilisateur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY TIMESHEET BLOCKER */}
      {user && timesheetRequired && !timesheetActive && !isLocked && (
        <div className="fixed inset-0 z-[9998] bg-[#0E0F11]/90 backdrop-blur-[12px] flex flex-col items-center justify-center px-4 select-none">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center border border-slate-200 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange mb-4 shadow-lg shadow-brand-orange/5">
              <Clock size={26} className="animate-pulse" />
            </div>
            
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Bonjour {user.name} 👋
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
              Pour continuer vous devez démarrer votre timesheet
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleToggleTimesheet}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black py-2.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
              >
                <Clock size={14} />
                <span>Activer mon Timesheet</span>
              </button>
              
              <button
                type="button"
                onClick={onLogout}
                className="w-full text-slate-400 hover:text-slate-700 text-[10px] font-bold py-1.5 transition-colors cursor-pointer"
              >
                Se déconnecter / Autre compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
