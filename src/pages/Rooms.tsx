/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bed, Plus, Edit2, ShieldAlert, Sparkles, Wrench, Search, RefreshCw, Trash2 } from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockRooms, mockRoomCategories } from '../mockData';
import { IRoom, IRoomCategory, TRoomStatus } from '../types';

export default function Rooms() {
  const [rooms, setRooms] = useState<IRoom[]>(mockRooms);
  const [categories, setCategories] = useState<IRoomCategory[]>(mockRoomCategories);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states for creating a new room
  const [showAddModal, setShowCreateModal] = useState(false);
  const [newRoomNum, setNewRoomNum] = useState('');
  const [newRoomCat, setNewRoomCat] = useState('cat-std');
  const [newRoomFloor, setNewRoomFloor] = useState('1er Étage');

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNum.trim()) return;

    if (rooms.some(r => r.room_number === newRoomNum)) {
      alert('Une chambre avec ce numéro existe déjà !');
      return;
    }

    const catObj = categories.find(c => c.id === newRoomCat);
    const newRoom: IRoom = {
      id: `room-${Date.now()}`,
      room_number: newRoomNum,
      category_id: newRoomCat,
      floor: newRoomFloor,
      capacity: catObj?.max_capacity || 2,
      bed_type: newRoomCat === 'cat-twin' ? '2 Lits Simples' : 'Lit Double',
      area: 25,
      base_price: catObj?.default_price || 35000,
      current_status: 'Libre',
      housekeeping_status: 'Disponible',
      maintenance_status: 'Signalé'
    };

    setRooms([...rooms, newRoom]);
    setNewRoomNum('');
    setShowCreateModal(false);
    setSuccessMsg(`La chambre ${newRoom.room_number} a été créée avec succès.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const deleteRoom = (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette chambre ?')) {
      setRooms(rooms.filter(r => r.id !== id));
      setSuccessMsg('Chambre supprimée avec succès.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const updateRoomStatus = (roomId: string, field: 'current_status', value: TRoomStatus) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, [field]: value } : r));
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Gestion des Chambres"
        description="Configurer les chambres physiques de l'hôtel, modifier les prix de base et gérer les attributions opérationnelles."
        actionButton={{
          label: 'Nouvelle Chambre',
          onClick: () => setShowCreateModal(true),
          icon: Plus
        }}
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* SECTION 1: CATEGORIES ROW WITH DEFAULT PRICES */}
        <div className="space-y-3 text-left">
          <h3 className="text-sm font-bold text-slate-900">Catégories & Tarifs standards de nuit</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-brand-orange`}></div>
                <h4 className="text-xs font-bold text-slate-900">{cat.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 h-7">{cat.description}</p>
                <div className="mt-3 flex justify-between items-baseline">
                  <span className="text-xs text-slate-400 font-semibold">Max {cat.max_capacity} pax</span>
                  <span className="text-sm font-black text-brand-orange">{cat.default_price.toLocaleString()} XOF</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: HIGH-DENSITY SEARCHABLE ROOMS LIST */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden text-left">
          
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrer par catégorie:</span>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-orange"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Rechercher par N° chambre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={12} />
            </div>
          </div>

          {/* Rooms Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/20">
                  <th className="py-3 px-6">N° Chambre</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4">Étage</th>
                  <th className="py-3 px-4">Type de Lit</th>
                  <th className="py-3 px-4">Tarif Nuit</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Ménage</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms
                  .filter(r => selectedCat === 'all' || r.category_id === selectedCat)
                  .filter(r => r.room_number.includes(searchQuery))
                  .map((room) => {
                    const cat = categories.find(c => c.id === room.category_id);
                    return (
                      <tr key={room.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-6 font-black text-slate-900 text-sm">{room.room_number}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{cat ? cat.name : 'Inconnu'}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{room.floor}</td>
                        <td className="py-3 px-4 text-slate-500 font-medium">{room.bed_type}</td>
                        <td className="py-3 px-4 font-bold text-slate-800 font-mono">{room.base_price.toLocaleString()} XOF</td>
                        <td className="py-3 px-4">
                          <select
                            value={room.current_status}
                            onChange={(e) => updateRoomStatus(room.id, 'current_status', e.target.value as TRoomStatus)}
                            className="bg-slate-100 border border-transparent rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-800 focus:outline-none"
                          >
                            <option value="Libre">Libre</option>
                            <option value="Occupée">Occupée</option>
                            <option value="À nettoyer">À nettoyer</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Hors service">Hors service</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <Badge label={room.housekeeping_status} type="hsk" status={room.housekeeping_status} />
                        </td>
                        <td className="py-3 px-6 text-right space-x-1.5">
                          <button
                            onClick={() => alert(`Fiche d'historique de la chambre ${room.room_number} simulée.`)}
                            className="text-slate-400 hover:text-slate-700 p-1 rounded"
                            title="Historique"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="text-slate-400 hover:text-red-600 p-1 rounded"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL / ADD DIALOG FORM */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden text-left">
              <div className="p-5 bg-[#141517] text-white flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider">Nouvelle Chambre</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddRoom} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Numéro de chambre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 301"
                    value={newRoomNum}
                    onChange={(e) => setNewRoomNum(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Catégorie</label>
                  <select
                    value={newRoomCat}
                    onChange={(e) => setNewRoomCat(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Étage</label>
                  <select
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:border-brand-orange focus:outline-none"
                  >
                    <option value="Rez-de-chaussée">Rez-de-chaussée</option>
                    <option value="1er Étage">1er Étage</option>
                    <option value="2ème Étage">2ème Étage</option>
                    <option value="3ème Étage">3ème Étage</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold rounded-lg text-slate-600 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Créer la chambre
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

// Simple dummy close icon for modals
function X(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
