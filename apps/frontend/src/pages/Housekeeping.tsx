/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, CheckSquare, Search, Filter, RefreshCw, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockHousekeepingTasks, mockRooms } from '../mockData';
import { IHousekeepingTask, THousekeepingStatus } from '../types';

export default function Housekeeping() {
  const [tasks, setTasks] = useState<IHousekeepingTask[]>(mockHousekeepingTasks);
  const [rooms, setRooms] = useState(mockRooms);
  const [successMsg, setSuccessMsg] = useState('');

  const updateTaskStatus = (id: string, newStatus: THousekeepingStatus) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          completed_time: newStatus === 'Disponible' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : t.completed_time
        };
      }
      return t;
    }));

    setSuccessMsg(`Tâche mise à jour avec succès au statut : ${newStatus}`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getRoomNum = (roomId: string) => {
    return rooms.find(r => r.id === roomId)?.room_number || '-';
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Suivi de l'Entretien (Housekeeping)"
        description="Gérer le cycle de nettoyage des chambres, affecter les femmes de ménage et valider l'inspection avant remise en vente."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* SUMMARY PROGRESS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">État Global Propreté</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Propre & Prête : {rooms.filter(r => r.housekeeping_status === 'Disponible').length} / {rooms.length}</span>
                <span>{Math.round((rooms.filter(r => r.housekeeping_status === 'Disponible').length / rooms.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(rooms.filter(r => r.housekeeping_status === 'Disponible').length / rooms.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-left col-span-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Checklist d'inspection standard (Brunch Bouaké)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-bold text-slate-700">
              <span className="flex items-center space-x-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> <span>Salle de bain astiquée</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> <span>Draps & Lit au carré</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> <span>Minibar réapprovisionné</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 size={12} className="text-emerald-500" /> <span>Produits d'accueil posés</span></span>
            </div>
          </div>
        </div>

        {/* TASKS LIST WORKSPACE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Registre des tâches de nettoyage courantes</h3>
            <span className="text-[10px] text-slate-400 font-semibold">Tâches planifiées le matin</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                  <th className="py-3 px-6">Chambre</th>
                  <th className="py-3 px-4">Femme de ménage affectée</th>
                  <th className="py-3 px-4">Priorité opérationnelle</th>
                  <th className="py-3 px-4">Heure de planification</th>
                  <th className="py-3 px-4">Heure de fin</th>
                  <th className="py-3 px-4">État de propreté</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 font-black text-slate-900 text-sm">Chambre {getRoomNum(task.room_id)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center space-x-2">
                      <User size={12} className="text-slate-400" />
                      <span>{task.employee_id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge label={task.priority} type="priority" status={task.priority === 'Haute' ? 'occupée' : task.priority === 'Normale' ? 'réservée' : 'libre'} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">{task.scheduled_time}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono font-semibold">{task.completed_time || '-'}</td>
                    <td className="py-3.5 px-4">
                      <Badge label={task.status} type="hsk" status={task.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-1.5">
                      {task.status === 'À nettoyer' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'En cours')}
                          className="bg-slate-800 hover:bg-slate-950 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                        >
                          Démarrer
                        </button>
                      )}
                      {task.status === 'En cours' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'Contrôle')}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                        >
                          Demander Inspection
                        </button>
                      )}
                      {task.status === 'Contrôle' && (
                        <button
                          onClick={() => {
                            updateTaskStatus(task.id, 'Disponible');
                            // Sync rooms state
                            setRooms(rooms.map(r => r.id === task.room_id ? { ...r, housekeeping_status: 'Disponible' } : r));
                          }}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                        >
                          Valider (Propre)
                        </button>
                      )}
                      <button
                        onClick={() => alert(`Fiche d'entretien de la chambre ${getRoomNum(task.room_id)} simulée.`)}
                        className="text-slate-400 hover:text-slate-600 inline-block p-1"
                      >
                        <RefreshCw size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
