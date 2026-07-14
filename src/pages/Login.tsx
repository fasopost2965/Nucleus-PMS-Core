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
  const [email, setEmail] = useState('admin@nucleus-pms.com');
  const [password, setPassword] = useState('Admin123!');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.login(email.trim(), password.trim());
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error?.message || 'Identifiants invalides.');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-[#1e2022] to-[#0E0F11] px-4">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-md">
        
        {/* BRAND PROMO SECTION */}
        <div className="p-8 text-center bg-[#141517] text-white border-b border-[#232529]">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-orange flex items-center justify-center font-bold text-white text-3xl shadow-lg shadow-brand-orange/30 mb-4 animate-bounce">
            B
          </div>
          <h2 className="text-xl font-bold tracking-tight">Brunch Bouaké PMS</h2>
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

          {/* QUICK CREDENTIALS PANEL */}
          <div className="mt-8 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Accès rapide démonstration</h4>
            <div className="text-[11px] text-slate-500 space-y-1">
              <p>Email: <code className="bg-slate-200 px-1 rounded text-slate-700 font-mono font-bold">admin@nucleus-pms.com</code></p>
              <p>Mot de passe: <code className="bg-slate-200 px-1 rounded text-slate-700 font-mono font-bold">Admin123!</code></p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
