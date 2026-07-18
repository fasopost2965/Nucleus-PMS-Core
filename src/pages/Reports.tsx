/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Download,
  Search,
  HelpCircle,
  FileSpreadsheet,
  Eye,
  Printer,
  Calendar,
  Clock,
  User,
  Shield,
  Activity,
  Users
} from 'lucide-react';
import { PageHeader, Badge, AlertBanner, StatCard } from '../components/ui/pms-ui';
import { api } from '../utils/api';

interface IMonthlyPerformanceReport {
  period: string;
  revenue: number;
  occupiedNights: number;
  occupancyRate: number;
  taxCollected: number;
}

const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

function formatReportPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const label = MONTH_LABELS[month - 1];
  return label ? `${label} ${year}` : period;
}

export default function Reports() {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'financial' | 'timesheets'>('financial');
  const [employeeFilter, setEmployeeFilter] = useState('');

  // Financial performance is computed server-side from real reservations
  // (see server/services/financialReports.ts). The Timesheets/Connections
  // tab below has no backend counterpart at all — no schema table tracks
  // clock-in/out sessions or login events — and stays a local simulation.
  const [performanceReports, setPerformanceReports] = useState<IMonthlyPerformanceReport[]>([]);
  const [isReportsLoading, setIsReportsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setIsReportsLoading(true);
    try {
      const reports = await api.getFinancialPerformanceReports();
      setPerformanceReports(reports);
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de charger les rapports financiers.');
    } finally {
      setIsReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const isPurged = localStorage.getItem('pms_db_purged') === 'true';

  // Current logged in user
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('pms_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { name: 'Amadou Koné', role: 'Super Administrateur', email: 'amadou.kone@brunchresto.vip' };
  });

  const isAdmin = currentUser.role.toLowerCase().includes('admin');

  // Load timesheet history
  const [timesheetHistory] = useState<{
    id: string;
    userName: string;
    userEmail: string;
    startTime: string;
    endTime: string;
    hours: number;
    status: string;
    motif?: string;
  }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pms_timesheet_history') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Load connection logs (actual logins/logouts)
  const [connectionLogs] = useState<{
    id: string;
    userName: string;
    userEmail: string;
    role: string;
    timestamp: string;
    type: string;
  }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pms_connection_journal') || '[]');
    } catch (e) {
      return [];
    }
  });

  // Calculate stats
  const totalGlobalHours = timesheetHistory.reduce((sum, log) => sum + log.hours, 0);
  
  const personalLogs = timesheetHistory.filter(
    log => log.userEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
  );
  const totalPersonalHours = personalLogs.reduce((sum, log) => sum + log.hours, 0);

  const personalConnLogs = connectionLogs.filter(
    log => log.userEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
  );

  const triggerExport = (format: 'pdf' | 'excel' | 'csv') => {
    if (isPurged) {
      alert('Aucune donnée à exporter.');
      return;
    }
    setSuccessMsg(`Fichier de rapport au format .${format} généré et téléchargé virtuellement avec succès.`);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Filter global timesheet logs
  const filteredGlobalLogs = timesheetHistory.filter(log => {
    if (!employeeFilter) return true;
    const term = employeeFilter.toLowerCase();
    return log.userName.toLowerCase().includes(term) || log.userEmail.toLowerCase().includes(term);
  });

  // Filter global connection logs
  const filteredGlobalConnLogs = connectionLogs.filter(log => {
    if (!employeeFilter) return true;
    const term = employeeFilter.toLowerCase();
    return log.userName.toLowerCase().includes(term) || log.userEmail.toLowerCase().includes(term);
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <PageHeader
        title="Rapports & Statistiques"
        description="Analysez les performances financières, l'occupation des chambres et suivez rigoureusement les temps de connexion des collaborateurs."
      />

      {/* TABS CONTAINER */}
      <div className="px-6 lg:px-8 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('financial')}
            className={`py-4 px-1 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'financial'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 size={15} />
            <span>Performances Financières</span>
          </button>
          <button
            onClick={() => setActiveTab('timesheets')}
            className={`py-4 px-1 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'timesheets'
                ? 'border-brand-orange text-brand-orange'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock size={15} />
            <span>Temps de Service & Connexions</span>
          </button>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {errorMsg && (
          <AlertBanner text={errorMsg} type="error" />
        )}
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* TAB 1: FINANCIAL REPORTS */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Téléchargements rapides de rapports</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => triggerExport('pdf')}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-all"
                  >
                    <Download size={14} />
                    <span>Rapport d'activité PDF</span>
                  </button>
                  <button
                    onClick={() => triggerExport('excel')}
                    className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-all"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                    <span>Fichier de caisse Excel (.xlsx)</span>
                  </button>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-100 text-brand-orange">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase">Clôture Mensuelle</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-normal">Les chiffres de la période actuelle (Juillet 2026) seront gelés définitivement lors du Night Audit du 31 Juillet à minuit.</p>
                </div>
              </div>
            </div>

            {/* PERFORMANCE LOG TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900">Bilan des performances mensuelles hôtelières</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Devise d'établissement : XOF</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                      <th className="py-3 px-6">Période d'activité</th>
                      <th className="py-3 px-4 text-right">Chiffre d'Affaires total</th>
                      <th className="py-3 px-4 text-center">Nuitées vendues</th>
                      <th className="py-3 px-4 text-center">Taux d'occupation moyen</th>
                      <th className="py-3 px-4 text-right">Taxes perçues (5%)</th>
                      <th className="py-3 px-6 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {performanceReports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 text-center text-slate-400 font-medium">
                          {isReportsLoading
                            ? 'Chargement des rapports...'
                            : "Aucune donnée mensuelle disponible. Les rapports se rempliront automatiquement dès l'enregistrement des vraies réservations."}
                        </td>
                      </tr>
                    ) : (
                      performanceReports.map((report, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-6 font-bold text-slate-900">{formatReportPeriod(report.period)}</td>
                          <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-800">{report.revenue.toLocaleString()} XOF</td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-600">{report.occupiedNights} nuits</td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-700">{report.occupancyRate}%</td>
                          <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-500">{report.taxCollected.toLocaleString()} XOF</td>
                          <td className="py-3.5 px-6 text-right space-x-2">
                            <button
                              onClick={() => alert(`Aperçu à l'écran du rapport pour ${report.period} simulé.`)}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Visualiser"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => alert(`Lancement de l'impression physique du rapport ${report.period}`)}
                              className="text-slate-400 hover:text-slate-700 p-1"
                              title="Imprimer"
                            >
                              <Printer size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TIMESHEETS & CONNECTIONS LOG */}
        {activeTab === 'timesheets' && (
          <div className="space-y-6">
            {/* STATS BENTO ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* PERSONAL STAT CARD */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left relative overflow-hidden shadow-xs">
                <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100">
                  <Activity size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mes statistiques personnelles</span>
                <span className="text-xl font-black text-slate-900 block mt-2 font-mono">
                  {totalPersonalHours.toFixed(1)} heures
                </span>
                <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                  ⏱️ Temps cumulé sur {personalLogs.length} sessions
                </span>
              </div>

              {/* GLOBAL STAT CARD (Total hours) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left relative overflow-hidden shadow-xs">
                <div className="absolute top-4 right-4 bg-brand-orange/10 text-brand-orange p-2 rounded-xl border border-brand-orange/20">
                  <Clock size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Temps global de service</span>
                <span className="text-xl font-black text-slate-900 block mt-2 font-mono">
                  {totalGlobalHours.toFixed(1)} heures
                </span>
                <span className="text-[10px] text-slate-500 font-bold block mt-1">
                  👥 Somme cumulée de toutes les fiches de connexion
                </span>
              </div>

              {/* COLLABORATOR COUNT CARD */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left relative overflow-hidden shadow-xs">
                <div className="absolute top-4 right-4 bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100">
                  <Users size={18} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fiches enregistrées</span>
                <span className="text-xl font-black text-slate-900 block mt-2 font-mono">
                  {timesheetHistory.length} sessions
                </span>
                <span className="text-[10px] text-slate-500 font-bold block mt-1">
                  📁 Historique des pointages d'arrivée/départ
                </span>
              </div>
            </div>

            {/* DUAL SECTION LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SECTION A: MON JOURNAL DE CONNEXION (PERSONAL LOG) */}
              <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 text-left flex flex-col">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Mon Journal de Connexion Personnel</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Vos sessions de travail enregistrées sur cette machine</p>
                </div>

                {personalLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200 my-auto">
                    Aucune session enregistrée pour votre profil hôtelier. Activez votre timesheet depuis le menu latéral pour commencer à enregistrer vos heures de service.
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[350px] space-y-2.5 pr-1">
                    {personalLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 hover:border-slate-300 transition-all flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black font-mono text-slate-400">Début :</span>
                            <span className="text-[11px] font-bold text-slate-700 font-mono">{log.startTime}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black font-mono text-slate-400">Départ :</span>
                            <span className="text-[11px] font-bold text-slate-700 font-mono">{log.endTime}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black px-2 py-0.5 rounded-full block text-center">
                            {log.hours}h ({Math.round(log.hours * 60)} min)
                          </span>
                          {log.motif && (
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded block text-center">
                              {log.motif}
                            </span>
                          )}
                          <span className="text-[8px] text-slate-400 font-bold block">Validé • Auto-Calculé</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Personal Security Login/Logout Connection Logs */}
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <h4 className="font-bold text-slate-700 text-xs mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span>Journal de mes accès hôteliers (Login/Logout)</span>
                  </h4>
                  {personalConnLogs.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-[10px] font-semibold bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      Aucune activité de connexion enregistrée.
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[200px] space-y-1.5 pr-1">
                      {personalConnLogs.map((cLog) => (
                        <div key={cLog.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-[10px]">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800">{cLog.timestamp}</span>
                            <span className="text-[8px] text-slate-400 block">{cLog.role}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 font-bold rounded-md uppercase text-[8px] ${
                            cLog.type.includes('Inactivité') 
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : cLog.type.includes('Déconnexion')
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {cLog.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION B: RAPPORT GLOBAL DES CONNEXIONS (ADMIN VIEW OR READ-ONLY LIST) */}
              <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-5 text-left flex flex-col">
                <div className="border-b border-slate-100 pb-3 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-500" />
                      <span>{isAdmin ? "Rapport Global d'Émargement" : "Historique Général des Connexions"}</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Suivi complet des heures de service de l'établissement</p>
                  </div>
                  
                  {/* Search box */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrer par nom..."
                      value={employeeFilter}
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                      className="pl-7 pr-3 py-1 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:border-brand-orange bg-slate-50 font-bold w-full sm:w-[150px]"
                    />
                  </div>
                </div>

                {filteredGlobalLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200 my-auto">
                    Aucune fiche de connexion ne correspond à la recherche.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-[350px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-2 px-2">Collaborateur</th>
                          <th className="py-2 px-2">Période</th>
                          <th className="py-2 px-2 text-right">Durée</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {filteredGlobalLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-2">
                              <div>
                                <span className="font-black text-slate-800 block leading-tight">{log.userName}</span>
                                <span className="text-[9px] text-slate-400 block leading-tight">{log.userEmail}</span>
                              </div>
                            </td>
                            <td className="py-2 px-2">
                              <div className="text-slate-500 font-mono text-[10px]">
                                <span className="block">D : {log.startTime}</span>
                                <span className="block">F : {log.endTime}</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <span className="font-bold text-slate-900 font-mono block">{log.hours}h</span>
                              {log.motif && (
                                <span className="inline-block text-[8px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded mt-0.5">
                                  {log.motif}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Global Security Login/Logout Connection Logs */}
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <h4 className="font-bold text-slate-700 text-xs mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span>Journal Global des Connexions / Déconnexions</span>
                  </h4>
                  {filteredGlobalConnLogs.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-[10px] font-semibold bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                      Aucune activité globale de connexion enregistrée.
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[200px] space-y-1.5 pr-1">
                      {filteredGlobalConnLogs.map((cLog) => (
                        <div key={cLog.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-[10px]">
                          <div>
                            <span className="font-bold text-slate-800 block">{cLog.userName}</span>
                            <span className="text-[8px] text-slate-400 block">{cLog.userEmail} • {cLog.timestamp}</span>
                          </div>
                          <span className={`px-1.5 py-0.5 font-bold rounded-md uppercase text-[8px] shrink-0 ${
                            cLog.type.includes('Inactivité') 
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : cLog.type.includes('Déconnexion')
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {cLog.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
