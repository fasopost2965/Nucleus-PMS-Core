/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Eye, RefreshCw, HardDrive, Cpu, ShieldAlert, Users, Key, Terminal, Shield, Check, Info } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockActivityLogs } from '../mockData';
import { ALL_PMS_MODULES, getUserPrivileges, saveUserPrivileges, resetUserPrivileges } from '../utils/permissions';

export default function Admin() {
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'diagnostic'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated users
  const [users, setUsers] = useState([
    { id: 'u-1', name: 'Amadou Koné', role: 'Super Administrateur', email: 'fasopost24@gmail.com', status: 'Actif' },
    { id: 'u-2', name: 'Support Technique', role: 'Support Technique', email: 'support@brunchbouake.com', status: 'Actif' },
    { id: 'u-3', name: 'E. Konin', role: 'Super Administrateur', email: 'ekonin@brunchbouake.com', status: 'Actif' },
    { id: 'u-4', name: 'Service Réservations', role: 'Réceptionniste', email: 'reservation@brunchbouake.com', status: 'Actif' }
  ]);

  const [editingPrivilegesUser, setEditingPrivilegesUser] = useState<any | null>(null);
  const [selectedPrivileges, setSelectedPrivileges] = useState<string[]>([]);

  const handleEditPrivileges = (u: any) => {
    setEditingPrivilegesUser(u);
    setSelectedPrivileges(getUserPrivileges(u.email, u.role));
  };

  const handleTogglePrivilege = (path: string) => {
    if (selectedPrivileges.includes(path)) {
      setSelectedPrivileges(selectedPrivileges.filter(p => p !== path));
    } else {
      setSelectedPrivileges([...selectedPrivileges, path]);
    }
  };

  const handleSavePrivileges = () => {
    if (editingPrivilegesUser) {
      saveUserPrivileges(editingPrivilegesUser.email, selectedPrivileges);
      setSuccessMsg(`Privilèges de "${editingPrivilegesUser.name}" enregistrés avec succès.`);
      setEditingPrivilegesUser(null);
      // Dispatch storage event so components can react to permissions change
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handleResetToDefaults = () => {
    if (editingPrivilegesUser) {
      resetUserPrivileges(editingPrivilegesUser.email);
      setSuccessMsg(`Privilèges de "${editingPrivilegesUser.name}" réinitialisés aux valeurs par défaut.`);
      setEditingPrivilegesUser(null);
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'Actif' ? 'Suspendu' : 'Actif';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    setSuccessMsg('Statut de l\'utilisateur mis à jour.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="flex flex-col h-full text-left">
      <PageHeader
        title="Administration Système"
        description="Gérer les comptes d'accès des employés hôteliers, inspecter la sécurité (Audit Trail) et surveiller la santé des serveurs."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* SUB NAV BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Comptes Employés
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'audit' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Journal d'Audit Système
            </button>
            <button
              onClick={() => setActiveTab('diagnostic')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'diagnostic' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Diagnostic Serveur
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={12} />
          </div>
        </div>

        {/* ACTIVE MODULE WINDOW */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                    <th className="py-3 px-6">Identifiant unique</th>
                    <th className="py-3 px-4">Employé</th>
                    <th className="py-3 px-4">Rôle Système</th>
                    <th className="py-3 px-4">Adresse email</th>
                    <th className="py-3 px-4 text-center">Accès active</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users
                    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.includes(searchQuery))
                    .map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-6 font-mono text-slate-500 font-bold">{u.id}</td>
                        <td className="py-3.5 px-4 font-extrabold text-slate-900">{u.name}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-orange-50 text-brand-orange font-bold px-2 py-0.5 rounded text-[10px] border border-orange-100">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono font-medium">{u.email}</td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge label={u.status} type="default" status={u.status === 'Actif' ? 'disponible' : 'occupée'} />
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditPrivileges(u)}
                              className="bg-orange-50 hover:bg-orange-100 text-brand-orange font-bold text-[10px] px-2 py-1 border border-orange-200 rounded-lg cursor-pointer flex items-center space-x-1"
                              title="Gérer les privilèges spécifiques de cet utilisateur"
                            >
                              <Shield size={10} />
                              <span>Privilèges</span>
                            </button>
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-1 border border-slate-200 rounded-lg cursor-pointer"
                            >
                              {u.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && editingPrivilegesUser && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 animate-fade-in text-slate-800">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                    <Shield className="text-brand-orange animate-pulse" size={16} />
                    <span>Gestion des Privilèges : {editingPrivilegesUser.name}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Rôle de base : <span className="font-bold text-slate-700">{editingPrivilegesUser.role}</span> &bull; Email : <span className="font-mono text-slate-600 bg-slate-100 px-1 py-0.5 rounded">{editingPrivilegesUser.email}</span>
                  </p>
                </div>
                <button
                  onClick={() => setEditingPrivilegesUser(null)}
                  className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 mb-4 shadow-inner">
                <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 p-3 rounded-lg text-xs font-medium border border-blue-100">
                  <Info size={14} className="flex-shrink-0" />
                  <span>
                    {editingPrivilegesUser.role === 'Super Administrateur' || editingPrivilegesUser.role === 'Support Technique' 
                      ? "Cet utilisateur possède un rôle d'administration système de niveau supérieur. Tous les modules lui sont accessibles par défaut et ne peuvent être restreints."
                      : "Sélectionnez ou désélectionnez les modules ci-dessous pour accorder ou retirer des privilèges d'accès pour cet utilisateur. Les droits seront sauvegardés de façon permanente."}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {ALL_PMS_MODULES.map((mod) => {
                    const isChecked = selectedPrivileges.includes(mod.path);
                    const isSuper = editingPrivilegesUser.role === 'Super Administrateur' || editingPrivilegesUser.role === 'Support Technique';
                    return (
                      <label 
                        key={mod.path} 
                        className={`flex items-center space-x-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                          isChecked || isSuper
                            ? 'border-brand-orange/40 bg-orange-50/20 text-brand-orange font-bold' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        } ${isSuper ? 'opacity-65 cursor-not-allowed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked || isSuper}
                          disabled={isSuper}
                          onChange={() => handleTogglePrivilege(mod.path)}
                          className="rounded text-brand-orange focus:ring-brand-orange cursor-pointer"
                        />
                        <span className="text-[11px]">{mod.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  onClick={handleResetToDefaults}
                  disabled={editingPrivilegesUser.role === 'Super Administrateur' || editingPrivilegesUser.role === 'Support Technique'}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3 py-1.5 border border-slate-200 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Réinitialiser au rôle
                </button>
                <button
                  onClick={handleSavePrivileges}
                  disabled={editingPrivilegesUser.role === 'Super Administrateur' || editingPrivilegesUser.role === 'Support Technique'}
                  className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-xs px-4 py-1.5 rounded-lg cursor-pointer flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-brand-orange/10"
                >
                  <Check size={14} />
                  <span>Enregistrer les privilèges</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                    <th className="py-3 px-6">Heure</th>
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-4">Module</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Détail des modifications</th>
                    <th className="py-3 px-6 text-right">Adresse IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mockActivityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-6 font-semibold text-slate-500">{log.time}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{log.user}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">{log.module}</td>
                      <td className="py-3.5 px-4 font-black uppercase text-[10px] text-slate-700">{log.action}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{log.details}</td>
                      <td className="py-3.5 px-6 text-right font-mono text-slate-400">192.168.1.{Math.floor(Math.random() * 200)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* CPU gauge */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="flex items-center space-x-1.5"><Cpu size={14} className="text-slate-400" /> <span>Utilisation CPU</span></span>
                    <span>12%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                </div>

                {/* RAM gauge */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="flex items-center space-x-1.5"><HardDrive size={14} className="text-slate-400" /> <span>Mémoire Vive (RAM)</span></span>
                    <span>34%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '34%' }}></div>
                  </div>
                </div>

                {/* Disk gauge */}
                <div className="p-4 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span className="flex items-center space-x-1.5"><HardDrive size={14} className="text-slate-400" /> <span>Espace Disque</span></span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

              </div>

              {/* Service Health Console */}
              <div className="p-4 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-400 border border-slate-800 space-y-1 shadow-inner">
                <p className="text-[#A1A5B7] font-bold uppercase mb-1 flex items-center space-x-1">
                  <Terminal size={12} />
                  <span>Brunch Bouake Node Ingress Service Console</span>
                </p>
                <p>[SYSTEM] boot successfully at 2026-07-13T06:49:45-07:00</p>
                <p>[DATABASE] Connected to host: my-local-mysql-bouake:3306 (MySQL 8.0)</p>
                <p>[NETWORK] Ingress proxy binding established at 0.0.0.0:3000</p>
                <p>[API_GW] Swagger UI compiled on path /api/docs</p>
                <p>[SYSTEM] All server sub-nodes are online and responsive.</p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
