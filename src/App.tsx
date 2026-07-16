/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { hasPermission } from './utils/permissions';
import { api } from './utils/api';

// Core layout
import AppLayout from './components/layout/AppLayout';

// Module pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reception from './pages/Reception';
import Rooms from './pages/Rooms';
import Reservations from './pages/Reservations';
import Guests from './pages/Guests';
import Finance from './pages/Finance';
import Housekeeping from './pages/Housekeeping';
import Maintenance from './pages/Maintenance';
import Restaurant from './pages/Restaurant';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import HRMS from './pages/HRMS';

import { useTimesheetLog } from './hooks/useTimesheetLog';

interface IUser {
  name: string;
  role: string;
  email: string;
}

export default function App() {
  const { logLogin, logLogout } = useTimesheetLog();

  // Global authentication state, checking localStorage first
  const [user, setUser] = useState<IUser | null>(() => {
    const saved = localStorage.getItem('pms_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Start with true if there is a token to verify
  const [isVerifying, setIsVerifying] = useState<boolean>(() => {
    return !!localStorage.getItem('pms_jwt_token');
  });

  const handleLogin = (loggedUser: IUser) => {
    logLogin({
      name: loggedUser.name,
      email: loggedUser.email,
      role: loggedUser.role
    });
    setUser(loggedUser);
    localStorage.setItem('pms_user', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    if (user) {
      logLogout({
        name: user.name,
        email: user.email,
        role: user.role
      });
    }
    setUser(null);
    localStorage.removeItem('pms_user');
    localStorage.removeItem('pms_jwt_token');
  };

  useEffect(() => {
    // 1. Fetch hotel settings so brand/logo updates propagate globally
    const loadHotelSettings = async () => {
      try {
        const res = await fetch('/api/settings/hotel');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          localStorage.setItem('hotelName', s.hotel_name || 'Brunch Resto-Bar Vip');
          if (s.logo) {
            localStorage.setItem('hotelLogo', s.logo);
          } else {
            localStorage.removeItem('hotelLogo');
          }
          // Dispatch events so already-rendered components refresh immediately
          window.dispatchEvent(new Event('hotel-config-changed'));
        }
      } catch (err) {
        console.error('Failed to pre-fetch hotel settings:', err);
      }
    };

    loadHotelSettings();

    // 2. Verify current user against MySQL database
    const verifyUserSession = async () => {
      const token = localStorage.getItem('pms_jwt_token');
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const res = await api.verifySession();
        if (res && res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('pms_user', JSON.stringify(res.user));
        } else {
          handleLogout();
        }
      } catch (err: any) {
        console.error('Session verification error:', err.message);
        if (err.message && (
          err.message.includes('401') || 
          err.message.includes('inexistant') || 
          err.message.includes('expired') || 
          err.message.includes('invalid') || 
          err.message.includes('session')
        )) {
          handleLogout();
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyUserSession();
  }, []);

  if (isVerifying) {
    const cachedLogo = localStorage.getItem('hotelLogo');
    const cachedName = localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E0F11] text-white">
        <div className="flex flex-col items-center space-y-4 text-center">
          {cachedLogo ? (
            <img src={cachedLogo} alt="Logo" className="h-16 w-16 object-contain rounded-xl mb-2" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-extrabold text-xl mb-2">
              B
            </div>
          )}
          <h2 className="text-lg font-bold tracking-tight text-slate-200">{cachedName}</h2>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono">
            <svg className="animate-spin h-4 w-4 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Vérification de la session en cours...</span>
          </div>
        </div>
      </div>
    );
  }

  // If logged out, always redirect/render Login screen
  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  // AccessDenied component for beautiful inline feedback when a module is restricted
  const AccessDenied = () => (
    <div className="flex flex-col items-center justify-center h-[70vh] px-4 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4 shadow-lg shadow-red-500/5">
        <ShieldAlert size={32} className="animate-bounce" />
      </div>
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Accès Restreint</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-md">
        Votre compte ne dispose pas des privilèges nécessaires pour accéder à ce module. Veuillez contacter votre Super Administrateur pour obtenir un accès spécifique.
      </p>
      <Link 
        to="/dashboard" 
        className="mt-6 flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-slate-900/10 cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Retour au Tableau de Bord</span>
      </Link>
    </div>
  );

  // ProtectedRoute helper component to guard restricted paths dynamically
  const ProtectedRoute = ({ path, element }: { path: string; element: React.ReactElement }) => {
    const allowed = hasPermission(user.email, user.role, path);
    return allowed ? element : <AccessDenied />;
  };

  return (
    <HashRouter>
      <AppLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reception" element={<ProtectedRoute path="/reception" element={<Reception />} />} />
          <Route path="/rooms" element={<ProtectedRoute path="/rooms" element={<Rooms />} />} />
          <Route path="/reservations" element={<ProtectedRoute path="/reservations" element={<Reservations />} />} />
          <Route path="/guests" element={<ProtectedRoute path="/guests" element={<Guests />} />} />
          <Route path="/finance" element={<ProtectedRoute path="/finance" element={<Finance />} />} />
          <Route path="/housekeeping" element={<ProtectedRoute path="/housekeeping" element={<Housekeeping />} />} />
          <Route path="/maintenance" element={<ProtectedRoute path="/maintenance" element={<Maintenance />} />} />
          <Route path="/restaurant" element={<ProtectedRoute path="/restaurant" element={<Restaurant />} />} />
          <Route path="/inventory" element={<ProtectedRoute path="/inventory" element={<Inventory />} />} />
          <Route path="/reports" element={<ProtectedRoute path="/reports" element={<Reports />} />} />
          <Route path="/settings" element={<ProtectedRoute path="/settings" element={<SettingsPage />} />} />
          <Route path="/admin" element={<ProtectedRoute path="/admin" element={<Admin />} />} />
          <Route path="/hrms" element={<ProtectedRoute path="/hrms" element={<HRMS />} />} />
          
          {/* Catch-all fallback redirecting to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </HashRouter>
  );
}

// Wrapper for Settings component to deal with Settings vs SettingsPage name matching
function SettingsPage() {
  return <Settings />;
}
