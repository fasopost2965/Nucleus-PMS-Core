/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, RefreshCw, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../utils/api';

interface ForcePasswordChangeProps {
  user: { name: string; role: string; email: string; mustChangePassword?: boolean };
  onLogout: () => void;
  onPasswordChanged: (updatedUser: any) => void;
}

export default function ForcePasswordChange({ user, onLogout, onPasswordChanged }: ForcePasswordChangeProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('Le nouveau mot de passe doit être différent du mot de passe actuel.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      if (res && res.success) {
        setSuccess(true);
        setTimeout(() => {
          // Update the user state locally to remove the force password change flag
          const updatedUser = { ...user, mustChangePassword: false };
          onPasswordChanged(updatedUser);
        }, 1800);
      } else {
        setError(res.message || 'Impossible de modifier le mot de passe.');
      }
    } catch (err: any) {
      console.error('[ForcePasswordChange] Error:', err);
      setError(err.message || 'Une erreur est survenue lors de la modification de votre mot de passe. Veuillez vérifier votre mot de passe actuel.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0E0F11] text-white px-4">
      <div className="w-full max-w-md bg-[#16181C] border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative ambient background blur */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

        {success ? (
          <div className="flex flex-col items-center text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/5">
              <CheckCircle2 size={36} className="animate-bounce" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Mot de passe mis à jour !</h2>
            <p className="text-xs text-slate-400 mt-2 max-w-xs">
              Votre nouveau mot de passe a été enregistré avec succès. Configuration de votre session en cours...
            </p>
            <div className="flex items-center space-x-2 text-amber-500 text-xs font-mono mt-6">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Accès au PMS...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-1">
                <Lock size={24} />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-slate-100">Sécurité de votre compte</h1>
              <p className="text-xs text-slate-400">
                Bienvenue, <span className="text-amber-500 font-medium">{user.name}</span>.
              </p>
            </div>

            {/* Warning banner */}
            <div className="p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start space-x-3">
              <ShieldAlert className="text-amber-500 shrink-0 mt-0.5 animate-pulse" size={16} />
              <div className="space-y-0.5">
                <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Première connexion requise</h4>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Pour garantir la confidentialité de vos données, vous devez personnaliser votre mot de passe temporaire avant d'accéder au système.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Saisissez votre mot de passe temporaire"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#1F2126] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-[#25282F] transition-all text-slate-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Minimum 6 caractères"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1F2126] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-[#25282F] transition-all text-slate-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Répétez le nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#1F2126] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-500 focus:bg-[#25282F] transition-all text-slate-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin h-3.5 w-3.5" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <span>Mettre à jour le mot de passe</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
