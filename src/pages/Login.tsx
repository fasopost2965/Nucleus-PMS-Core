/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LogIn, Key, Mail, ShieldAlert } from 'lucide-react';
import { api } from '../utils/api';

interface LoginProps {
  onLoginSuccess: (user: { name: string; role: string; email: string }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [hotelLogo] = useState<string | null>(() => localStorage.getItem('hotelLogo'));
  const [hotelName] = useState<string>(() => localStorage.getItem('hotelName') || 'Brunch Bouaké');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
      // 1. First, attempt to log in using the backend API database
      const res = await api.login(trimmedEmail, trimmedPassword);
      if (res && res.success && res.user) {
        onLoginSuccess({
          name: `${res.user.firstName || ''} ${res.user.lastName || ''}`.trim() || res.user.name || 'Utilisateur',
          role: res.user.role || 'Super Administrateur',
          email: res.user.email
        });
        setIsLoading(false);
        return;
      }
    } catch (apiErr: any) {
      console.warn("Backend connection error or authentication failed:", apiErr);
      // If the API server is active but explicitly rejected credentials, show that exact error.
      if (apiErr.message && (apiErr.message.includes('incorrect') || apiErr.message.includes('invalides') || apiErr.message.includes('status 401') || apiErr.message.includes('401'))) {
        setError(apiErr.message || 'Adresse email ou mot de passe incorrect.');
        setIsLoading(false);
        return;
      }
    }

    // 2. Client-side fallback for static web hosting / offline SPA mode (LocalStorage)
    const ALLOWED_USERS = [
      {
        email: 'support@brunchbouake.com',
        password: 'Prodesk@2026',
        name: 'Support Technique',
        role: 'Support Technique'
      },
      {
        email: 'ekonin@brunchbouake.com',
        password: 'Prodesk@2026',
        name: 'E. Konin',
        role: 'Super Administrateur'
      },
      {
        email: 'reservation@brunchbouake.com',
        password: 'Prodesk@2026',
        name: 'Service Réservations',
        role: 'Réceptionniste'
      },
      {
        email: 'fasopost24@gmail.com',
        password: 'Prodesk@2026',
        name: 'Amadou Koné',
        role: 'Super Administrateur'
      }
    ];

    const foundUser = ALLOWED_USERS.find(
      u => u.email.toLowerCase() === trimmedEmail && u.password === trimmedPassword
    );

    if (foundUser) {
      onLoginSuccess({
        name: foundUser.name,
        role: foundUser.role,
        email: foundUser.email
      });
    } else {
      setError('Adresse email ou mot de passe incorrect.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-radial from-[#1e2022] to-[#0E0F11] px-4 space-y-6">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-md">
        
        {/* BRAND PROMO SECTION */}
        <div className="p-8 text-center bg-[#141517] text-white border-b border-[#232529]">
          {hotelLogo === 'PRESET_VIP_LOGO' ? (
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border-2 border-brand-orange/60 flex items-center justify-center font-black text-brand-orange text-3xl shadow-lg shadow-brand-orange/30 mb-4 relative">
              B
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-brand-orange animate-pulse"></span>
            </div>
          ) : hotelLogo ? (
            <img 
              src={hotelLogo} 
              alt="Logo" 
              className="w-16 h-16 mx-auto rounded-2xl object-contain bg-white p-1 shadow-lg border border-white/20 mb-4" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-orange flex items-center justify-center font-bold text-white text-3xl shadow-lg shadow-brand-orange/30 mb-4 animate-bounce">
              {hotelName ? hotelName[0].toUpperCase() : 'B'}
            </div>
          )}
          <h2 className="text-xl font-bold tracking-tight">{hotelName} PMS</h2>
          <p className="text-xs text-[#A1A5B7] mt-1.5 uppercase font-semibold tracking-wider">Property Management System</p>
        </div>

        {/* LOGIN FORM */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Adresse Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 rounded-lg border border-slate-300 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange focus:outline-none transition-all"
                  placeholder="admin@brunchbouake.com"
                />
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 block">Mot de passe</label>
                <a href="#forgot" onClick={() => alert("Un lien de réinitialisation vous sera envoyé sur votre adresse email de secours.")} className="text-xs font-semibold text-brand-orange hover:text-brand-orange-hover">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 rounded-lg border border-slate-300 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange focus:outline-none transition-all"
                  placeholder="••••••••"
                />
                <Key className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">Se souvenir de moi</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">v1.0.0 (Sprint 1)</span>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-sm font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/10 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Connexion en cours...</span>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* FOOTER COPYRIGHT */}
      <div className="text-center">
        <p className="text-xs text-slate-500 font-semibold tracking-wide">
          &copy; {new Date().getFullYear()} Fasopost Digital <span className="text-brand-orange mx-1.5">&bull;</span> +212 777346787
        </p>
      </div>
    </div>
  );
}
