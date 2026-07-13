/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bed,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Clock,
  PlusCircle,
  HelpCircle,
  Calendar,
  Users,
  Coins,
  Wrench,
  Sparkles,
  ArrowRight,
  Flame,
  CheckSquare
} from 'lucide-react';
import { StatCard, AlertBanner } from '../components/ui/pms-ui';
import { mockRooms, mockReservations, mockActivityLogs } from '../mockData';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [activities, setActivities] = useState(mockActivityLogs);
  const [successMsg, setSuccessMsg] = useState('');

  // Calculate quick stats dynamically from mock data
  const totalRooms = mockRooms.length;
  const occupiedRooms = mockRooms.filter(r => r.current_status === 'Occupée').length;
  const maintenanceRooms = mockRooms.filter(r => r.current_status === 'Maintenance').length;
  const availableRooms = mockRooms.filter(r => r.current_status === 'Libre').length;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  // Graphical Data
  const occupancyData = [
    { name: 'Lun', Standard: 65, Suite: 50, Deluxe: 70 },
    { name: 'Mar', Standard: 70, Suite: 60, Deluxe: 80 },
    { name: 'Mer', Standard: 80, Suite: 70, Deluxe: 90 },
    { name: 'Jeu', Standard: 75, Suite: 80, Deluxe: 85 },
    { name: 'Ven', Standard: 90, Suite: 90, Deluxe: 95 },
    { name: 'Sam', Standard: 95, Suite: 100, Deluxe: 100 },
    { name: 'Dim', Standard: 85, Suite: 80, Deluxe: 90 },
  ];

  const revenueData = [
    { name: '07/07', Chambres: 340000, Restaurant: 120000, Total: 460000 },
    { name: '08/07', Chambres: 410000, Restaurant: 165000, Total: 575000 },
    { name: '09/07', Chambres: 280000, Restaurant: 95000, Total: 375000 },
    { name: '10/07', Chambres: 520000, Restaurant: 210000, Total: 730000 },
    { name: '11/07', Chambres: 640000, Restaurant: 295000, Total: 935000 },
    { name: '12/07', Chambres: 480000, Restaurant: 180000, Total: 660000 },
    { name: '13/07', Chambres: 550000, Restaurant: 220000, Total: 770000 },
  ];

  // Quick simulated actions
  const triggerQuickAction = (actionName: string) => {
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: `act-${Date.now()}`,
      time,
      user: 'Amadou (Super Admin)',
      module: 'Actions Rapides',
      action: 'Déclenchement',
      details: `Action "${actionName}" exécutée avec succès dans le simulateur.`,
      type: 'success' as const
    };
    setActivities([newLog, ...activities]);
    setSuccessMsg(`Action "${actionName}" simulée avec succès.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tableau de bord principal</h1>
          <p className="text-xs text-slate-500 mt-1">Brunch Bouaké PMS • Vue d'ensemble en temps réel de votre établissement</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0 bg-white p-1.5 rounded-lg border border-slate-200">
          <Calendar size={14} className="text-slate-500 ml-1.5" />
          <span className="text-xs font-bold text-slate-800 pr-1.5">Aujourd'hui : {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {successMsg && (
        <AlertBanner text={successMsg} type="success" />
      )}

      {/* KPI STATS CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Taux d'occupation"
          value={`${occupancyRate}%`}
          change="+4.5%"
          changeType="increase"
          icon={Bed}
          color="orange"
        />
        <StatCard
          title="Chambres Disponibles"
          value={`${availableRooms} / ${totalRooms}`}
          change="Sûr"
          changeType="neutral"
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Revenus du jour (estimé)"
          value="770 000 FCFA"
          change="+12.4%"
          changeType="increase"
          icon={Coins}
          color="blue"
        />
        <StatCard
          title="Maintenance active"
          value={`${maintenanceRooms} chambre(s)`}
          change="Urgent"
          changeType="decrease"
          icon={Wrench}
          color="red"
        />
      </div>

      {/* WIDGETS AND CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: REVENUE TREND (Large) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Évolution des revenus (7 derniers jours)</h3>
              <p className="text-[10px] text-slate-400">Total cumulé Chambres & Restaurant à Bouaké</p>
            </div>
            <div className="flex space-x-1.5 text-[10px] font-bold text-slate-500">
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-brand-orange rounded-xs inline-block mr-1"></span> Chambres</span>
              <span className="flex items-center"><span className="w-2.5 h-2.5 bg-[#4F46E5] rounded-xs inline-block mr-1"></span> Resto</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip formatter={(value) => [`${value.toLocaleString()} FCFA`]} />
                <Legend iconSize={8} fontSize={10} />
                <Bar dataKey="Chambres" fill="#D45D1A" radius={[4, 4, 0, 0]} name="Chambres" />
                <Bar dataKey="Restaurant" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Restaurant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ALERTS & URGENT OPERATIONAL TASKS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <AlertTriangle className="text-brand-orange" size={16} />
              <span>Centre d'alertes opérationnelles</span>
            </h3>
            <p className="text-[10px] text-slate-400">Actions prioritaires requises immédiatement</p>
          </div>
          
          <div className="space-y-2 flex-1 overflow-y-auto">
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-ping"></span>
              <div>
                <h4 className="text-xs font-bold text-red-900">Maintenance Critique #maint-2</h4>
                <p className="text-[10px] text-red-700 mt-0.5">Climatiseur Chambre 203 hors-service (Rapport Abdoulaye).</p>
                <span className="text-[8px] bg-red-200 text-red-800 font-bold px-1.5 py-0.5 rounded-sm inline-block mt-1">Assigné</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
              <div>
                <h4 className="text-xs font-bold text-amber-900">Seuil d'alerte stock franchi</h4>
                <p className="text-[10px] text-amber-700 mt-0.5">Reste : 8 pièces de "Draps de bain Coton Blanc" (Seuil mini: 20).</p>
                <span className="text-[8px] bg-amber-200 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm inline-block mt-1">Stock faible</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
              <div>
                <h4 className="text-xs font-bold text-blue-900">Arrivée VIP aujourd'hui</h4>
                <p className="text-[10px] text-blue-700 mt-0.5">Jean-Pierre Duval (Chambre 202 Suite Brunch). Champagne prêt.</p>
                <span className="text-[8px] bg-blue-200 text-blue-800 font-bold px-1.5 py-0.5 rounded-sm inline-block mt-1">VIP</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 2: OCCUPANCY BY CATEGORY (Small/Medium) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Prévisions d'occupation (%)</h3>
            <p className="text-[10px] text-slate-400">Tendances de taux d'occupation par catégorie</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDlx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D45D1A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D45D1A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSuite" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Deluxe" stroke="#D45D1A" fillOpacity={1} fill="url(#colorDlx)" />
                <Area type="monotone" dataKey="Suite" stroke="#4F46E5" fillOpacity={1} fill="url(#colorSuite)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TIMELINE OF RECENT ACTIVITIES */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
              <Clock className="text-slate-600" size={16} />
              <span>Activité récente (Audit)</span>
            </h3>
            <p className="text-[10px] text-slate-400">Flux d'actions en direct enregistrées aujourd'hui</p>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto max-h-56">
            {activities.map((log) => (
              <div key={log.id} className="relative flex space-x-3 text-xs">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    log.type === 'success' ? 'bg-emerald-500' : log.type === 'error' ? 'bg-rose-500' : log.type === 'warning' ? 'bg-amber-500' : 'bg-slate-400'
                  }`}></div>
                  <div className="w-px h-full bg-slate-200 mt-1"></div>
                </div>
                <div className="pb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{log.time}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded font-medium">{log.module}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5 font-medium">{log.details}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Par : {log.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACCESS BUTTONS PANEL */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Raccourcis & Actions rapides</h3>
            <p className="text-[10px] text-slate-400">Exécuter des processus métier instantanés</p>
          </div>
          <div className="grid grid-cols-2 gap-2 flex-1">
            <button
              onClick={() => triggerQuickAction('Check-in Express')}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-slate-700 hover:text-brand-orange transition-all duration-150 text-center cursor-pointer"
            >
              <CheckSquare size={20} className="mb-1.5" />
              <span className="text-[10px] font-bold">Check-in Express</span>
            </button>
            <button
              onClick={() => triggerQuickAction('Clôture Caisse')}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-slate-700 hover:text-brand-orange transition-all duration-150 text-center cursor-pointer"
            >
              <Coins size={20} className="mb-1.5" />
              <span className="text-[10px] font-bold">Clôture Caisse</span>
            </button>
            <button
              onClick={() => triggerQuickAction('Lancer Night Audit')}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-slate-700 hover:text-brand-orange transition-all duration-150 text-center cursor-pointer"
            >
              <Clock size={20} className="mb-1.5" />
              <span className="text-[10px] font-bold">Night Audit (00h)</span>
            </button>
            <button
              onClick={() => triggerQuickAction('Simuler Alerte Stock')}
              className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:border-brand-orange hover:bg-orange-50 text-slate-700 hover:text-brand-orange transition-all duration-150 text-center cursor-pointer"
            >
              <Sparkles size={20} className="mb-1.5" />
              <span className="text-[10px] font-bold">Alerte Stock</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
