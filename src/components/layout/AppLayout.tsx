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
  Lock,
  Play
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
  const isAdmin = user && (user.role === 'Administrateur' || user.role === 'Super Administrateur');
  const isPaused = user ? localStorage.getItem('pms_last_logout_motif_' + user.email) === 'Pause' : false;
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
  const [timesheetRequired, setTimesheetRequired] = useState(() => {
    const userEmail = localStorage.getItem('pms_user') ? JSON.parse(localStorage.getItem('pms_user') || '{}').email : '';
    if (!userEmail) return false;
    const employeesStr = localStorage.getItem('pms_employees');
    if (employeesStr) {
      try {
        const list = JSON.parse(employeesStr);
        const match = list.find((e: any) => e.email.toLowerCase().trim() === userEmail.toLowerCase().trim());
        if (match) {
          return match.timesheet_required !== false;
        }
      } catch (e) {}
    }
    return false;
  });
  const [elapsedText, setElapsedText] = useState('00:00:00');
  
  // Logout Blocker State
  const [showLogoutBlockerModal, setShowLogoutBlockerModal] = useState(false);
  const [selectedMotif, setSelectedMotif] = useState<'Fin de service' | 'Pause' | 'Reconnexion' | ''>('');
  const [resumePauseReason, setResumePauseReason] = useState<string>('Break');
  const [forceOverlayDueToTermination, setForceOverlayDueToTermination] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Check if we are starting a fresh session
    const isNewSession = !sessionStorage.getItem('pms_tab_active');
    const wasActive = localStorage.getItem('pms_timesheet_active') === 'true';
    const wasPaused = localStorage.getItem('pms_last_logout_motif_' + user.email) === 'Pause';

    // If timesheet was still 'active' or 'paused' but we had a session/browser termination (new tab/restart)
    if (isNewSession && (wasActive || wasPaused)) {
      localStorage.setItem('pms_unexpected_termination', 'true');
    }

    sessionStorage.setItem('pms_tab_active', 'true');
  }, [user]);

  // Periodically validate active timesheet status (every 5 seconds)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      const wasActive = localStorage.getItem('pms_timesheet_active') === 'true';
      const wasPaused = localStorage.getItem('pms_last_logout_motif_' + user.email) === 'Pause';
      
      // If the app is active, let's also assert the unexpected termination flag is false
      if (wasActive && !localStorage.getItem('pms_unexpected_termination')) {
        // Keeps validation clean
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // Upon next interaction, if unexpected termination is flagged, force-redirect to timesheet overlay
  useEffect(() => {
    if (!user) return;
    
    const handleNextInteraction = () => {
      const wasActive = localStorage.getItem('pms_timesheet_active') === 'true';
      const wasPaused = localStorage.getItem('pms_last_logout_motif_' + user.email) === 'Pause';
      const hasTermination = localStorage.getItem('pms_unexpected_termination') === 'true';
      
      if (hasTermination && (wasActive || wasPaused)) {
        setForceOverlayDueToTermination(true);
        // Turn timesheet off to force clocking back in
        if (wasActive) {
          localStorage.removeItem('pms_timesheet_active');
          localStorage.removeItem('pms_timesheet_start_time');
          setTimesheetActive(false);
          // Dispatch event to sync across components
          window.dispatchEvent(new Event('pms-timesheet-changed'));
        }
      }
    };

    window.addEventListener('click', handleNextInteraction, { capture: true });
    window.addEventListener('keydown', handleNextInteraction, { capture: true });
    return () => {
      window.removeEventListener('click', handleNextInteraction, { capture: true });
      window.removeEventListener('keydown', handleNextInteraction, { capture: true });
    };
  }, [user]);

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

  // Idle Timer Auto-Logout at 15 minutes of complete inactivity
  useEffect(() => {
    if (!user) return;

    const logoutTimeoutMs = 15 * 60 * 1000; // 15 minutes
    let logoutTimer: NodeJS.Timeout;

    const resetLogoutTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        // Automatically save active timesheet session before logout
        if (localStorage.getItem('pms_timesheet_active') === 'true') {
          const tStart = Number(localStorage.getItem('pms_timesheet_start_time') || '0');
          if (tStart) {
            const durationMs = Date.now() - tStart;
            const hours = (durationMs / (1000 * 60 * 60)).toFixed(2);
            const historyStr = localStorage.getItem('pms_timesheet_history') || '[]';
            try {
              const history = JSON.parse(historyStr);
              history.unshift({
                id: `ts-${Date.now()}`,
                userEmail: user.email,
                userName: user.name,
                startTime: new Date(tStart).toLocaleString('fr-FR'),
                endTime: new Date().toLocaleString('fr-FR'),
                hours: Number(hours),
                status: 'Validé'
              });
              localStorage.setItem('pms_timesheet_history', JSON.stringify(history));
            } catch (e) {}
          }
          localStorage.removeItem('pms_timesheet_active');
          localStorage.removeItem('pms_timesheet_start_time');
          window.dispatchEvent(new Event('pms-timesheet-changed'));
        }
        
        // Log user connection timestamp inside general connections journal (as a logout entry)
        const connLogs = JSON.parse(localStorage.getItem('pms_connection_journal') || '[]');
        connLogs.unshift({
          id: `conn-${Date.now()}`,
          userName: user.name,
          userEmail: user.email,
          role: user.role,
          timestamp: new Date().toLocaleString('fr-FR'),
          type: 'Déconnexion (Inactivité)',
        });
        localStorage.setItem('pms_connection_journal', JSON.stringify(connLogs));

        // Call the parent log out handler
        onLogout();
      }, logoutTimeoutMs);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    const handleUserActivity = () => {
      resetLogoutTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    resetLogoutTimer();

    return () => {
      clearTimeout(logoutTimer);
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user, onLogout]);

  useEffect(() => {
    const syncTimesheet = () => {
      setTimesheetActive(localStorage.getItem('pms_timesheet_active') === 'true');
      setTimesheetStart(Number(localStorage.getItem('pms_timesheet_start_time') || '0'));
      
      const loggedInStr = localStorage.getItem('pms_user');
      if (loggedInStr) {
        try {
          const u = JSON.parse(loggedInStr);
          const employeesStr = localStorage.getItem('pms_employees');
          if (employeesStr) {
            const list = JSON.parse(employeesStr);
            const match = list.find((e: any) => e.email.toLowerCase().trim() === u.email.toLowerCase().trim());
            if (match) {
              setTimesheetRequired(match.timesheet_required !== false);
              return;
            }
          }
        } catch (e) {}
      }
      setTimesheetRequired(false);
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

  const handleToggleTimesheet = (motif?: string, pauseReason?: string) => {
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
          status: 'Validé',
          motif: motif || 'Fin de service'
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
      if (user?.email) {
        localStorage.removeItem('pms_last_logout_motif_' + user.email);
      }

      if (pauseReason) {
        const historyStr = localStorage.getItem('pms_timesheet_history') || '[]';
        try {
          const history = JSON.parse(historyStr);
          const latestPauseIndex = history.findIndex((h: any) => 
            h.userEmail === user?.email && h.motif === 'Pause'
          );
          if (latestPauseIndex !== -1) {
            history[latestPauseIndex].motif = `Pause (${pauseReason === 'Break' ? 'Break' : pauseReason === 'Meeting' ? 'Meeting' : 'Personal'})`;
            localStorage.setItem('pms_timesheet_history', JSON.stringify(history));
          }
        } catch (e) {}
      }

      setTimesheetStart(now);
      setTimesheetActive(true);
      localStorage.removeItem('pms_unexpected_termination');
      setForceOverlayDueToTermination(false);
    }
    // Dispatch event to inform other active tabs or pages
    window.dispatchEvent(new Event('pms-timesheet-changed'));
  };

  const handleManualLogout = () => {
    if (timesheetActive) {
      setSelectedMotif('');
      setShowLogoutBlockerModal(true);
    } else {
      onLogout();
    }
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

  const navigationDisabled = user && !isAdmin && !timesheetActive;

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



        {/* NAVIGATION MENUS */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {allowedOperations.length > 0 && (
            <div>
              <span className="px-3 text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-2">Opérations</span>
              <nav className="space-y-1">
                {allowedOperations.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  if (navigationDisabled) {
                    return (
                      <div
                        key={item.path}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-not-allowed opacity-40 bg-white/5 text-white/40"
                        title="Veuillez activer votre Timesheet pour accéder à ce module"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon size={18} className="text-white/30" />
                          <span>{item.label}</span>
                        </div>
                      </div>
                    );
                  }
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
                  if (navigationDisabled) {
                    return (
                      <div
                        key={item.path}
                        className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-not-allowed opacity-40 bg-white/5 text-white/40"
                        title="Veuillez activer votre Timesheet pour accéder à ce module"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon size={18} className="text-white/30" />
                          <span>{item.label}</span>
                        </div>
                      </div>
                    );
                  }
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
                onClick={handleManualLogout} 
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
            
            {/* TIMESHEET HEADER INDICATOR */}
            {user && (
              <div className={`flex items-center space-x-2 border rounded-xl px-2.5 py-1 transition-all duration-150 ${
                timesheetActive 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : isPaused 
                    ? 'bg-amber-500/10 border-amber-500/30 animate-pulse' 
                    : 'bg-white/10 border-white/5'
              }`}>
                <button
                  onClick={() => handleToggleTimesheet(undefined, isPaused ? resumePauseReason : undefined)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    timesheetActive 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/35 border border-red-500/30' 
                      : isPaused 
                        ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                  }`}
                  title={timesheetActive ? 'Clôturer mon service (Timesheet)' : isPaused ? 'Désactiver la pause / Reprendre' : 'Démarrer mon service (Timesheet)'}
                >
                  {timesheetActive ? (
                    <span className="w-1.5 h-1.5 rounded-xs bg-red-400"></span>
                  ) : (
                    <Play size={10} className="ml-0.5 fill-white text-white" />
                  )}
                </button>
                <div className="flex flex-col text-left">
                  <div className="flex items-center space-x-1.5 leading-none">
                    <Clock size={11} className={timesheetActive ? "text-emerald-400 animate-pulse" : isPaused ? "text-amber-400 animate-pulse" : "text-white/40"} />
                    <span className={`font-mono text-xs font-black tracking-wider ${
                      timesheetActive 
                        ? 'text-emerald-400' 
                        : isPaused 
                          ? 'text-amber-400 font-extrabold' 
                          : 'text-white/40'
                    }`}>
                      {elapsedText}
                    </span>
                  </div>
                  <span className={`text-[7px] font-bold uppercase tracking-wider mt-0.5 ${
                    timesheetActive 
                      ? 'text-emerald-400/80' 
                      : isPaused 
                        ? 'text-amber-400 font-extrabold' 
                        : 'text-white/40'
                  }`}>
                    {timesheetActive ? 'En service' : isPaused ? 'Pause active' : 'Pause'}
                  </span>
                </div>
              </div>
            )}

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
                  handleManualLogout();
                }}
                className="w-full text-slate-400 hover:text-slate-700 text-[10px] font-bold py-1.5 transition-colors cursor-pointer"
              >
                Se déconnecter / Autre utilisateur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY TIMESHEET BLOCKER FOR NON-ADMINS */}
      {user && !isAdmin && (!timesheetActive || forceOverlayDueToTermination) && !isLocked && (
        <div className="fixed inset-0 z-[9998] bg-[#0E0F11]/90 backdrop-blur-[16px] flex flex-col items-center justify-center px-4 select-none">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center border border-slate-200 animate-fade-in">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
              isPaused 
                ? 'bg-amber-100 border border-amber-300 text-amber-600 shadow-amber-500/5' 
                : 'bg-brand-orange/10 border border-brand-orange/30 text-brand-orange shadow-brand-orange/5'
            }`}>
              <Clock size={26} className="animate-pulse" />
            </div>
            
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {forceOverlayDueToTermination 
                ? '⚠️ Session interrompue' 
                : isPaused 
                  ? 'Service en Pause ⏸️' 
                  : `Bonjour ${user.name} 👋`}
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-2 max-w-xs mx-auto leading-relaxed">
              {forceOverlayDueToTermination 
                ? 'Une fermeture inattendue du navigateur ou de l\'onglet a été détectée alors que votre session était active. Veuillez réactiver votre temps de service pour continuer.'
                : isPaused 
                  ? 'Vous aviez suspendu votre service pour une pause. Pour pouvoir continuer à naviguer sur l\'application, vous devez désactiver la pause (reprendre votre service).'
                  : 'Pour accéder au tableau de bord hôtelier et pouvoir naviguer sur l\'application, vous devez activer votre temps de service (Timesheet).'}
            </p>
            <p className={`text-[10px] font-bold mt-3 px-2.5 py-1.5 rounded-lg border max-w-xs mx-auto ${
              isPaused 
                ? 'bg-amber-50 text-amber-600 border-amber-100' 
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
              {isPaused 
                ? '⏸️ Statut Actuel : Pause • Votre chronomètre est suspendu.' 
                : '⚠️ Attention : N\'oubliez pas de stopper votre chronomètre et clôturer votre service avant de vous déconnecter en fin de journée.'}
            </p>

            {isPaused && (
              <div className="mt-4 text-left">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Motif de la pause (Reason for pause) *
                </label>
                <select
                  value={resumePauseReason}
                  onChange={(e) => setResumePauseReason(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 transition-all cursor-pointer text-slate-800 font-bold"
                >
                  <option value="Break">☕ Pause déjeuner / Repas (Break)</option>
                  <option value="Meeting">👥 Réunion de service (Meeting)</option>
                  <option value="Personal">🚗 Impératif personnel (Personal)</option>
                </select>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => handleToggleTimesheet(undefined, isPaused ? resumePauseReason : undefined)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black py-2.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
              >
                <Clock size={14} />
                <span>{isPaused ? 'Désactiver la Pause & Reprendre' : 'Activer mon Timesheet'}</span>
              </button>

              {isPaused && (
                <button
                  type="button"
                  onClick={() => {
                    if (user?.email) {
                      localStorage.removeItem('pms_last_logout_motif_' + user.email);
                    }
                    try {
                      const historyStr = localStorage.getItem('pms_timesheet_history') || '[]';
                      const history = JSON.parse(historyStr);
                      const latestPauseIndex = history.findIndex((h: any) => 
                        h.userEmail === user?.email && h.motif === 'Pause'
                      );
                      if (latestPauseIndex !== -1) {
                        history[latestPauseIndex].motif = `Pause (Clock-out without resuming)`;
                        localStorage.setItem('pms_timesheet_history', JSON.stringify(history));
                      }
                    } catch(e) {}
                    
                    localStorage.removeItem('pms_timesheet_active');
                    localStorage.removeItem('pms_timesheet_start_time');
                    setTimesheetActive(false);
                    window.dispatchEvent(new Event('pms-timesheet-changed'));
                  }}
                  className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-black py-2.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-red-500/10 flex items-center justify-center gap-1.5"
                >
                  <Play size={10} className="rotate-90 fill-white" />
                  <span>Clôturer définitivement mon service</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={onLogout}
                className="w-full text-slate-400 hover:text-slate-700 text-[10px] font-bold py-1.5 transition-colors cursor-pointer"
              >
                Se déconnecter de la session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT BLOCKER / MOTIF SELECTION MODAL */}
      {showLogoutBlockerModal && (
        <div className="fixed inset-0 z-[9999] bg-[#0E0F11]/85 backdrop-blur-[8px] flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 animate-fade-in text-left">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-55 text-red-600 border border-red-100 flex items-center justify-center shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Déconnexion Suspendue</h3>
                <p className="text-[10px] text-slate-500 font-bold">Clôture de service obligatoire</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed font-bold">
              Votre temps de service hôtelier (Timesheet) est toujours actif. Veuillez sélectionner un motif de clôture pour arrêter votre chronomètre avant de quitter la session :
            </p>

            <div className="space-y-2 mb-6">
              {[
                { id: 'fin', label: 'Fin de service', desc: 'Clôture définitive du poste pour aujourd\'hui', value: 'Fin de service' },
                { id: 'pause', label: 'Pause', desc: 'Suspension temporaire pour pause ou repos', value: 'Pause' },
                { id: 'reconnexion', label: 'Reconnexion', desc: 'Déconnexion rapide pour changer de terminal', value: 'Reconnexion' }
              ].map((m) => (
                <label 
                  key={m.id} 
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedMotif === m.value 
                      ? 'bg-amber-50 border-amber-300 shadow-xs' 
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="logout_motif"
                    value={m.value}
                    checked={selectedMotif === m.value}
                    onChange={() => setSelectedMotif(m.value as any)}
                    className="mt-1 accent-brand-orange h-4 w-4 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-black text-slate-800 block">{m.label}</span>
                    <span className="text-[10px] text-slate-400 font-bold leading-normal block mt-0.5">{m.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutBlockerModal(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer text-center"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={!selectedMotif}
                onClick={() => {
                  if (user?.email) {
                    localStorage.setItem('pms_last_logout_motif_' + user.email, selectedMotif);
                  }
                  handleToggleTimesheet(selectedMotif);
                  setShowLogoutBlockerModal(false);
                  onLogout();
                }}
                className={`flex-1 text-white text-xs font-black py-2.5 rounded-lg transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  selectedMotif 
                    ? 'bg-brand-orange hover:bg-brand-orange-hover shadow-md shadow-brand-orange/15' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Clôturer & Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
