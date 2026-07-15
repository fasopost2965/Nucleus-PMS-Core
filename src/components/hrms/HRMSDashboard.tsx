/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  Coins, 
  Clock, 
  CheckSquare, 
  Activity, 
  Shield 
} from 'lucide-react';
import { StatCard } from '../ui/pms-ui';
import { IHRMSBusinessEvent, IHRMSOnboardingTask, IHRMSEmployee } from '../../types';

interface HRMSDashboardProps {
  activeEmployeesCount: number;
  totalMonthlyPayrollEstimateXOF: number;
  avgHourlyCost: number;
  onboardingCompletionRate: number;
  businessEvents: IHRMSBusinessEvent[];
  onboardingTasks: IHRMSOnboardingTask[];
  employees: IHRMSEmployee[];
  handleToggleOnboardingTask: (id: string) => void;
}

export default function HRMSDashboard({
  activeEmployeesCount,
  totalMonthlyPayrollEstimateXOF,
  avgHourlyCost,
  onboardingCompletionRate,
  businessEvents,
  onboardingTasks,
  employees,
  handleToggleOnboardingTask
}: HRMSDashboardProps) {
  const [timesheetHistory, setTimesheetHistory] = React.useState<{
    id: string;
    userName: string;
    userEmail: string;
    startTime: string;
    endTime: string;
    hours: number;
    status: string;
  }[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('pms_timesheet_history') || '[]');
    } catch (e) {
      return [];
    }
  });

  React.useEffect(() => {
    const handleSync = () => {
      try {
        setTimesheetHistory(JSON.parse(localStorage.getItem('pms_timesheet_history') || '[]'));
      } catch (e) {}
    };
    window.addEventListener('pms-timesheet-changed', handleSync);
    return () => {
      window.removeEventListener('pms-timesheet-changed', handleSync);
    };
  }, []);
  return (
    <div className="space-y-6" id="hrms-dashboard-root">
      {/* 1. Stat Bento Grid (reusing the high-quality StatCard from pms-ui) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Effectifs Actifs"
          value={activeEmployeesCount}
          change="100% opérationnels"
          changeType="neutral"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Masse Salariale Est."
          value={`${totalMonthlyPayrollEstimateXOF.toLocaleString('fr-FR')} FCFA`}
          change="Estimation mensuelle"
          changeType="neutral"
          icon={Coins}
          color="orange"
        />
        <StatCard
          title="Coût Horaire Moyen"
          value={`${avgHourlyCost} FCFA/h`}
          change="Imputation analytique"
          changeType="neutral"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Intégration Onboarding"
          value={`${onboardingCompletionRate}%`}
          change="Taux de complétion"
          changeType="increase"
          icon={CheckSquare}
          color="amber"
        />
      </div>

      {/* 2. Main Dashboard Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Event Stream */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-xs rounded-2xl p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-orange animate-pulse" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Bus d'Événements Métier (Event-Driven Logs)</h3>
                <p className="text-xs text-slate-500">Flux d'activité asynchrone en temps réel</p>
              </div>
            </div>
            <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded text-slate-600 border border-slate-200 font-mono font-bold tracking-wider">
              PRODUCE_SUBSCRIBE
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {businessEvents.map((evt) => (
              <div 
                key={evt.id} 
                className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-start gap-3 transition"
              >
                <span className={`mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider border ${
                  evt.event_type === 'EmployeeCreated' ? 'bg-emerald-50 text-success border-emerald-100' :
                  evt.event_type === 'ContractSigned' ? 'bg-blue-50 text-info border-blue-100' :
                  evt.event_type === 'EmployeeUpdated' ? 'bg-amber-50 text-warning border-amber-100' :
                  evt.event_type === 'EmployeeOffboarded' ? 'bg-red-50 text-danger border-red-100' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {evt.event_type}
                </span>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    {evt.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Auteur : {evt.actor_name}</span>
                    <span>{new Date(evt.timestamp).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Active Onboarding Tasks Checklist */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 flex flex-col h-[400px]">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <CheckSquare className="w-4.5 h-4.5 text-warning" />
              Onboarding Actif
            </h3>
            <p className="text-xs text-slate-500">Tâches requises pour les nouvelles recrues</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
            {onboardingTasks.map(task => {
              const emp = employees.find(e => e.id === task.employee_id);
              if (!emp) return null;
              const isCompleted = task.status === 'completed';
              return (
                <div 
                  key={task.id} 
                  onClick={() => handleToggleOnboardingTask(task.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    isCompleted 
                      ? 'bg-emerald-50/40 border-emerald-100 text-slate-500' 
                      : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={isCompleted} 
                    onChange={() => {}} // Handled by div click
                    className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-brand-orange focus:ring-brand-orange focus:ring-opacity-25"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {task.task_name}
                    </p>
                    <p className="text-[10px] text-brand-orange font-bold uppercase tracking-wider mt-0.5">
                      {emp.first_name} {emp.last_name} • {emp.employee_code}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Timesheet Log Panel */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-2xl p-6 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" />
              <span>Historique des Sessions de Service (Timesheets)</span>
            </h3>
            <p className="text-xs text-slate-500">Heures de connexion et temps de travail validés</p>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('pms_timesheet_history', '[]');
              setTimesheetHistory([]);
              window.dispatchEvent(new Event('pms-timesheet-changed'));
            }}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 px-2.5 py-1 rounded font-bold transition-all cursor-pointer"
          >
            Purger l'historique
          </button>
        </div>

        {timesheetHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Aucun historique de connexion enregistré. Activez votre timesheet depuis le menu latéral pour commencer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-2.5 px-3">Collaborateur</th>
                  <th className="py-2.5 px-3">Heure d'Arrivée (Start)</th>
                  <th className="py-2.5 px-3">Heure de Départ (End)</th>
                  <th className="py-2.5 px-3 text-right">Durée Accumulée</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {timesheetHistory.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-bold text-slate-800 block">{log.userName}</span>
                        <span className="text-[10px] text-slate-400 block">{log.userEmail}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono font-medium">{log.startTime}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono font-medium">{log.endTime}</td>
                    <td className="py-3 px-3 text-right font-black text-slate-800 font-mono">
                      {log.hours}h ({Math.round(log.hours * 60)} min)
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {log.status || 'Validé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Global compliance banner */}
      <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-start gap-3 text-left">
          <Shield className="w-6 h-6 text-brand-orange mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-slate-800 text-sm font-bold">Sécurité RBAC et validations réglementaires de l'espace UEMOA</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl mt-0.5">
              Fiches de poste, habilitations, numéros CNPS et contrats archivés sans écrasement pour assurer la conformité d'audit et la sécurité des données de l'hôtel.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <span className="text-[10px] bg-emerald-50 text-success px-3 py-1 rounded-full border border-emerald-100 font-bold uppercase tracking-wider">
            Zod Validated
          </span>
          <span className="text-[10px] bg-orange-100 text-brand-orange px-3 py-1 rounded-full border border-orange-200 font-bold uppercase tracking-wider">
            RBAC Active
          </span>
        </div>
      </div>
    </div>
  );
}
