/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Plus, Search, Eye, RefreshCw, HardDrive, Cpu, ShieldAlert, Users, Key, Terminal } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockActivityLogs } from '../mockData';

export default function Admin() {
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'diagnostic'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  // Simulated users
  const [users, setUsers] = useState([
    { id: 'u-1', name: 'Amadou Koné', role: 'Super Administrateur', email: 'amadou@brunchbouake.com', status: 'Actif' },
    { id: 'u-2', name: 'Koffi Germain', role: 'Réceptionniste', email: 'koffi@brunchbouake.com', status: 'Actif' },
    { id: 'u-3', name: 'Awa Koné', role: 'Housekeeping', email: 'awa@brunchbouake.com', status: 'Actif' },
    { id: 'u-4', name: 'Abdoulaye Touré', role: 'Technicien Maintenance', email: 'abdoulaye@brunchbouake.com', status: 'Actif' },
    { id: 'u-5', name: 'Yao Anderson', role: 'Magasinier / Stock', email: 'yao@brunchbouake.com', status: 'Suspendu' }
  ]);

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
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2 py-1 border border-slate-200 rounded-lg cursor-pointer"
                          >
                            {u.status === 'Actif' ? 'Suspendre' : 'Réactiver'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
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
