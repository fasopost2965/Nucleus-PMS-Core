/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { hasPermission } from './utils/permissions';

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

interface IUser {
  name: string;
  role: string;
  email: string;
}

export default function App() {
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

  const handleLogin = (loggedUser: IUser) => {
    setUser(loggedUser);
    localStorage.setItem('pms_user', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('pms_user');
  };

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
