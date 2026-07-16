/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LogIn, Key, Mail, ShieldAlert, Eye, EyeOff, ArrowLeft, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';

interface LoginProps {
  onLoginSuccess: (user: { name: string; role: string; email: string; mustChangePassword?: boolean }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [hotelLogo, setHotelLogo] = useState<string | null>(() => localStorage.getItem('hotelLogo'));
  const [hotelName, setHotelName] = useState<string>(() => localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip');

  // Password recovery states
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [devCodeBanner, setDevCodeBanner] = useState('');

  // Load credentials and load hotel settings dynamically on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('pms_remembered_email');
    const rememberedPassword = localStorage.getItem('pms_remembered_password');
    if (rememberedEmail) setEmail(rememberedEmail);
    if (rememberedPassword) setPassword(rememberedPassword);

    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings/hotel');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setHotelName(s.hotel_name || 'Brunch Resto-Bar Vip');
          setHotelLogo(s.logo || null);
          localStorage.setItem('hotelName', s.hotel_name || 'Brunch Resto-Bar Vip');
          if (s.logo) {
            localStorage.setItem('hotelLogo', s.logo);
          } else {
            localStorage.removeItem('hotelLogo');
          }
        }
      } catch (err) {
        console.error('Failed to load hotel settings in login screen:', err);
      }
    };
    loadSettings();

    const handleConfigChange = () => {
      setHotelName(localStorage.getItem('hotelName') || 'Brunch Resto-Bar Vip');
      setHotelLogo(localStorage.getItem('hotelLogo'));
    };

    window.addEventListener('hotel-config-changed', handleConfigChange);
    return () => {
      window.removeEventListener('hotel-config-changed', handleConfigChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // Persist or clear remembered credentials
    if (rememberMe) {
      localStorage.setItem('pms_remembered_email', trimmedEmail);
      localStorage.setItem('pms_remembered_password', trimmedPassword);
    } else {
      localStorage.removeItem('pms_remembered_email');
      localStorage.removeItem('pms_remembered_password');
    }

    try {
      // 1. First, attempt to log in using the backend API database
      const res = await api.login(trimmedEmail, trimmedPassword);
      if (res && res.success && res.user) {
        onLoginSuccess({
          name: `${res.user.firstName || ''} ${res.user.lastName || ''}`.trim() || res.user.name || 'Utilisateur',
          role: res.user.role || 'Super Administrateur',
          email: res.user.email,
          mustChangePassword: res.user.mustChangePassword
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

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    setDevCodeBanner('');
    try {
      const res = await api.forgotPassword(resetEmail.trim());
      if (res && res.success) {
        setSuccessMsg("Un code de validation à 6 chiffres a été généré avec succès !");
        if (res.devCode) {
          setDevCodeBanner(res.devCode);
        }
        setMode('reset');
      } else {
        setError("Une erreur est survenue lors de la demande de réinitialisation.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.resetPassword({
        email: resetEmail.trim(),
        code: resetCode.trim(),
        newPassword: newPassword.trim()
      });
      if (res && res.success) {
        setSuccessMsg("Votre mot de passe a été modifié avec succès ! Veuillez vous connecter.");
        setMode('login');
        setEmail(resetEmail);
        setPassword('');
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        setDevCodeBanner('');
      } else {
        setError("Code de réinitialisation invalide ou expiré.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
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

        {/* DYNAMIC FORMS ACCORDING TO MODE */}
        <div className="p-8">
          {/* Global Alert Boxes */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2 mb-4">
              <ShieldAlert size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2 mb-4">
              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dev Simulated Code helper */}
          {devCodeBanner && (
            <div className="p-3 bg-brand-orange/10 border border-brand-orange/30 rounded-lg text-xs font-semibold text-slate-800 mb-4 flex flex-col space-y-1.5 text-left select-all">
              <div className="flex items-center space-x-1.5 text-brand-orange">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse"></span>
                <span className="text-[10px] uppercase font-black tracking-wider">Simulateur de réception email</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                Pour cet environnement de démonstration, voici votre code secret de réinitialisation :
              </p>
              <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-md border border-brand-orange/20 mt-1">
                <span className="font-mono font-black text-sm tracking-widest text-slate-900">{devCodeBanner}</span>
                <span className="text-[9px] uppercase bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded font-black">Copier</span>
              </div>
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5 text-left">
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

              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 block">Mot de passe</label>
                  <button 
                    type="button" 
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccessMsg('');
                    }} 
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orange-hover"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 text-sm text-slate-800 rounded-lg border border-slate-300 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <Key className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* REMEMBER ME */}
              <div className="flex items-center justify-between select-none">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-brand-orange focus:ring-brand-orange w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">Se souvenir de moi</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">v1.4.0 (Sprint 2)</span>
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
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5 text-left">
              <div className="space-y-1 pb-1">
                <h3 className="text-sm font-extrabold text-slate-900">Mot de passe perdu ?</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Veuillez renseigner l'adresse email de votre compte collaborateur. Nous allons vous envoyer un code secret pour définir un nouveau mot de passe d'accès.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Votre adresse email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 rounded-lg border border-slate-300 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange focus:outline-none transition-all"
                    placeholder="Ex: amadou@brunchbouake.com"
                  />
                  <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !resetEmail}
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/10 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Demander le code de réinitialisation</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccessMsg('');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Retour à la connexion</span>
              </button>
            </form>
          )}

          {/* MODE: CODE VERIFICATION & RESET */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-5 text-left">
              <div className="space-y-1 pb-1">
                <h3 className="text-sm font-extrabold text-slate-900">Nouveau Mot de passe</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Entrez le code secret à 6 chiffres reçu ainsi que votre nouveau mot de passe de sécurité.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block text-center">Code secret de sécurité</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full py-2.5 text-base text-center font-mono font-black tracking-widest text-slate-950 rounded-lg border border-slate-300 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange focus:outline-none transition-all placeholder:text-slate-300"
                  placeholder="000000"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 text-sm text-slate-800 rounded-lg border border-slate-300 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange focus:outline-none transition-all"
                    placeholder="Au moins 6 caractères"
                  />
                  <Key className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !resetCode || !newPassword}
                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-brand-orange/10 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Enregistrer mon nouveau mot de passe</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError('');
                  setSuccessMsg('');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Retour à l'étape précédente</span>
              </button>
            </form>
          )}
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
