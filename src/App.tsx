/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

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
  // Global authentication state — null = non connecté, affiche le login
  const [user, setUser] = useState<IUser | null>(null);

  const handleLogin = (loggedUser: IUser) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // If logged out, always redirect/render Login screen
  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <HashRouter>
      <AppLayout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reception" element={<Reception />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/housekeeping" element={<Housekeeping />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/hrms" element={<HRMS />} />
          
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
