/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wrench, Plus, Search, HelpCircle, AlertTriangle, UserCheck, ShieldAlert, Sparkles, X } from 'lucide-react';
import { PageHeader, Badge, AlertBanner, StatCard } from '../components/ui/pms-ui';
import { mockMaintenanceTickets, mockRooms } from '../mockData';
import { IMaintenanceTicket, TMaintenanceStatus } from '../types';

export default function Maintenance() {
  const [tickets, setTickets] = useState<IMaintenanceTicket[]>(mockMaintenanceTickets);
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddTicket, setShowAddTicket] = useState(false);

  // Form states
  const [roomNum, setRoomNum] = useState('102');
  const [category, setCategory] = useState('Plomberie');
  const [priority, setPriority] = useState<'Faible' | 'Normale' | 'Haute' | 'Critique'>('Normale');
  const [description, setDescription] = useState('');

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const matchedRoom = mockRooms.find(r => r.room_number === roomNum);
    const newTicket: IMaintenanceTicket = {
      id: `maint-${Date.now()}`,
      room_id: matchedRoom ? matchedRoom.id : 'room-102',
      category,
      priority,
      description,
      assigned_to: 'Technicien de garde',
      status: 'Signalé',
      created_at: new Date().toISOString().split('T')[0]
    };

    setTickets([newTicket, ...tickets]);
    setShowAddTicket(false);
    setDescription('');
    setSuccessMsg(`Ticket créé avec succès pour la chambre ${roomNum}.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const updateTicketStatus = (id: string, newStatus: TMaintenanceStatus) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          actual_cost: newStatus === 'Clôturé' ? (t.estimated_cost || 10000) : t.actual_cost
        };
      }
      return t;
    }));
    setSuccessMsg(`Ticket mis à jour au statut : ${newStatus}`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const getRoomNum = (roomId: string) => {
    return mockRooms.find(r => r.id === roomId)?.room_number || '-';
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Gestion de la Maintenance"
        description="Suivre les incidents techniques, assigner les réparations et estimer les coûts de remise en état."
        actionButton={{
          label: 'Signaler un Incident',
          onClick: () => setShowAddTicket(true),
          icon: Plus
        }}
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tickets ouverts</span>
            <span className="text-2xl font-extrabold text-brand-orange block mt-1">{tickets.filter(t => t.status !== 'Clôturé').length}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Incidents Critiques</span>
            <span className="text-2xl font-extrabold text-rose-600 block mt-1">{tickets.filter(t => t.priority === 'Critique' && t.status !== 'Clôturé').length}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Incidents Résolus</span>
            <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{tickets.filter(t => t.status === 'Clôturé').length}</span>
          </div>
        </div>

        {/* INCIDENTS TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-900">Registre des interventions & pannes hôtelières</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                  <th className="py-3 px-6">Date de signalement</th>
                  <th className="py-3 px-4">Chambre</th>
                  <th className="py-3 px-4">Domaine d'incident</th>
                  <th className="py-3 px-4">Priorité</th>
                  <th className="py-3 px-4">Description de la panne</th>
                  <th className="py-3 px-4">Technicien affecté</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 font-semibold text-slate-500">{t.created_at}</td>
                    <td className="py-3.5 px-4 font-black text-slate-900">Chambre {getRoomNum(t.room_id)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{t.category}</td>
                    <td className="py-3.5 px-4">
                      <Badge label={t.priority} type="priority" status={t.priority === 'Critique' ? 'occupée' : t.priority === 'Haute' ? 'réservée' : 'libre'} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium max-w-[200px] truncate" title={t.description}>{t.description}</td>
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">{t.assigned_to || '-'}</td>
                    <td className="py-3.5 px-4">
                      <Badge label={t.status} type="maint" status={t.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-1">
                      {t.status === 'Signalé' && (
                        <button
                          onClick={() => updateTicketStatus(t.id, 'En cours')}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                        >
                          Démarrer Réparation
                        </button>
                      )}
                      {t.status === 'En cours' && (
                        <button
                          onClick={() => updateTicketStatus(t.id, 'Clôturé')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1 rounded"
                        >
                          Résoudre
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DIALOG SIGNAlER PANNE */}
        {showAddTicket && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden text-left">
              <div className="p-4 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-xs uppercase tracking-wider">Signaler incident technique</h3>
                <button onClick={() => setShowAddTicket(false)} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddTicket} className="p-5 space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-700">Chambre concernée</label>
                    <select
                      value={roomNum}
                      onChange={(e) => setRoomNum(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    >
                      {mockRooms.map(r => <option key={r.id} value={r.room_number}>Chambre {r.room_number}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-700">Priorité d'urgence</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                    >
                      <option value="Faible">Faible (Prévu)</option>
                      <option value="Normale">Normale</option>
                      <option value="Haute">Haute (Chambre réservée bientôt)</option>
                      <option value="Critique">Critique (Chambre occupée active)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Domaine de la panne</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  >
                    <option value="Plomberie">Plomberie (Sanitaire / Fuite)</option>
                    <option value="Climatisation">Climatisation / Chauffage</option>
                    <option value="Électricité">Électricité / Éclairage</option>
                    <option value="Menuiserie">Menuiserie / Serrures électroniques</option>
                    <option value="Internet">Réseau WiFi / Télévision</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700">Description détaillée de l'anomalie</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Ex: La poignée de la porte de douche s'est détachée..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTicket(false)}
                    className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-600"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-hover"
                  >
                    Créer le Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
