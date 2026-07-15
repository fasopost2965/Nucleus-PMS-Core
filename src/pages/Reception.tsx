/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Bell,
  CheckCircle,
  HelpCircle,
  Clock,
  Bed,
  Search,
  Calendar,
  LogOut,
  User,
  Coffee,
  X,
  ChevronRight,
  Sparkles,
  Wrench,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { PageHeader, Badge, AlertBanner } from '../components/ui/pms-ui';
import { mockRooms, mockGuests, mockReservations, mockInvoices } from '../mockData';
import { IRoom, IReservation, IGuest, TRoomStatus, IInvoice } from '../types';
import { handleRoomMaintenanceTrigger } from '../stockService';
import PrintableReceipt from '../components/ui/PrintableReceipt';
import { Printer } from 'lucide-react';

export default function Reception() {
  const [rooms, setRooms] = useState<IRoom[]>(() => {
    const stored = localStorage.getItem('pms_rooms');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockRooms;
  });
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [reservations, setReservations] = useState<IReservation[]>(() => {
    const stored = localStorage.getItem('pms_reservations');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockReservations;
  });

  const [guests, setGuests] = useState<IGuest[]>(() => {
    const stored = localStorage.getItem('pms_guests');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return mockGuests;
  });

  // Dialog/Modal state for Check-in / Check-out
  const [activeTab, setActiveTab] = useState<'plan' | 'arrivals' | 'departures'>('plan');

  // Selected receipt data state for modal
  const [selectedReceiptData, setSelectedReceiptData] = useState<{
    invoice: IInvoice;
    guest: IGuest;
    reservation: IReservation;
  } | null>(null);

  const triggerPrintReceiptForReservation = (res: IReservation) => {
    const guest = guests.find(g => g.id === res.guest_id);
    if (!guest) return;

    // Look for existing invoice or build a simulated one
    const existingInv = mockInvoices.find(i => i.reservation_id === res.id);
    const inv: IInvoice = existingInv || {
      id: `inv-${res.id}`,
      invoice_number: `FACT-${res.reservation_number.substring(4)}`,
      reservation_id: res.id,
      guest_id: res.guest_id,
      subtotal: res.total_amount - res.tax_amount,
      discount: res.discount,
      tax: res.tax_amount,
      total: res.total_amount,
      paid: res.deposit,
      balance: res.balance,
      status: res.balance <= 0 ? 'Payée' : 'Émise',
      issued_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setSelectedReceiptData({
      invoice: inv,
      guest,
      reservation: res
    });
  };
  
  // Calculate operational widgets
  const arrivalsCount = reservations.filter(r => r.status === 'Confirmée').length;
  const departuresCount = reservations.filter(r => r.status === 'En séjour').length; // simulated for demo
  const freeCount = rooms.filter(r => r.current_status === 'Libre').length;
  const occupiedCount = rooms.filter(r => r.current_status === 'Occupée').length;
  const dirtyCount = rooms.filter(r => r.current_status === 'À nettoyer').length;

  const handleRoomClick = (room: IRoom) => {
    setSelectedRoom(room);
  };

  const updateRoomStatus = (roomId: string, newStatus: TRoomStatus) => {
    const updatedRooms = rooms.map(r => r.id === roomId ? { ...r, current_status: newStatus } : r);
    setRooms(updatedRooms);
    localStorage.setItem('pms_rooms', JSON.stringify(updatedRooms));
    if (selectedRoom && selectedRoom.id === roomId) {
      setSelectedRoom({ ...selectedRoom, current_status: newStatus });
    }

    let maintenanceMsg = "";
    if (newStatus === 'Maintenance') {
      const res = handleRoomMaintenanceTrigger(roomId, 'Réception (Front Desk)');
      if (res.success) {
        maintenanceMsg = " • " + res.message;
      }
    }

    const roomNum = rooms.find(r => r.id === roomId)?.room_number || "";
    setSuccessMsg(`Statut de la chambre ${roomNum} mis à jour : ${newStatus}.${maintenanceMsg}`);
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  const getGuestForRoom = (roomNum: string) => {
    const res = reservations.find(r => {
      const room = rooms.find(rm => rm.id === r.room_id);
      return room?.room_number === roomNum && r.status === 'En séjour';
    });
    if (res) {
      return guests.find(g => g.id === res.guest_id);
    }
    return null;
  };

  const getReservationForRoom = (roomId: string) => {
    return reservations.find(r => r.room_id === roomId && r.status === 'En séjour');
  };

  const handleCheckIn = (resId: string, roomId: string) => {
    updateRoomStatus(roomId, 'Occupée');
    const updated = reservations.map(r => r.id === resId ? { ...r, status: 'En séjour' as const } : r);
    setReservations(updated);
    localStorage.setItem('pms_reservations', JSON.stringify(updated));
  };

  const handleCheckOut = (resId: string, roomId: string) => {
    updateRoomStatus(roomId, 'À nettoyer');
    const updated = reservations.map(r => r.id === resId ? { ...r, status: 'Terminée' as const } : r);
    setReservations(updated);
    localStorage.setItem('pms_reservations', JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Module Réception"
        description="Piloter l'accueil, les check-ins, check-outs et l'état d'occupation des chambres en temps réel."
      />

      <div className="p-6 lg:p-8 space-y-6 flex-1 overflow-y-auto">
        {successMsg && (
          <AlertBanner text={successMsg} type="success" />
        )}

        {/* OPERATIONS SUMMARY WIDGETS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Arrivées Prévues</span>
            <span className="text-2xl font-extrabold text-brand-orange block mt-1">{arrivalsCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Départs du Jour</span>
            <span className="text-2xl font-extrabold text-slate-700 block mt-1">{departuresCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chambres Libres</span>
            <span className="text-2xl font-extrabold text-emerald-600 block mt-1">{freeCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Chambres Occupées</span>
            <span className="text-2xl font-extrabold text-rose-600 block mt-1">{occupiedCount}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-center shadow-xs col-span-2 md:col-span-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">À Nettoyer</span>
            <span className="text-2xl font-extrabold text-blue-600 block mt-1">{dirtyCount}</span>
          </div>
        </div>

        {/* VIEW NAVIGATION & SEARCH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg self-start">
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'plan' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Plan de l'hôtel
            </button>
            <button
              onClick={() => setActiveTab('arrivals')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'arrivals' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Arrivées
            </button>
            <button
              onClick={() => setActiveTab('departures')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'departures' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-600'}`}
            >
              Départs
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Rechercher une chambre ou un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-brand-orange focus:outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          
          {/* LEFT AREA: ROOM GRID PLAN OR LISTS */}
          <div className="xl:col-span-2 space-y-4">
            
            {activeTab === 'plan' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900">Vue Plan de l'Hôtel</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Double-cliquez pour ouvrir la fiche</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {rooms
                    .filter(r => r.room_number.includes(searchQuery) || r.bed_type.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((room) => {
                      const guest = getGuestForRoom(room.room_number);
                      const isSelected = selectedRoom?.id === room.id;
                      
                      return (
                        <div
                          key={room.id}
                          onClick={() => handleRoomClick(room)}
                          className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative text-left select-none ${
                            isSelected 
                              ? 'border-brand-orange ring-1 ring-brand-orange/20 shadow-md bg-orange-50/10' 
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-xs bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-lg font-black text-slate-900 leading-none">{room.room_number}</span>
                            <Badge label={room.current_status} type="room" status={room.current_status} />
                          </div>

                          <div className="mt-3.5 space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                              {room.id === 'room-101' ? 'Standard' : room.id === 'room-102' ? 'Standard' : room.id === 'room-103' ? 'Twin' : room.id === 'room-104' ? 'Deluxe' : room.id === 'room-202' ? 'Suite Brunch' : 'Familiale'}
                            </p>
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {guest ? `${guest.first_name} ${guest.last_name}` : 'Disponible'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {room.floor}
                            </p>
                          </div>

                          {/* Housekeeping Quick indicator dot */}
                          <div className="absolute bottom-2.5 right-2.5 flex space-x-1 items-center">
                            <span 
                              className={`w-2 h-2 rounded-full ${
                                room.housekeeping_status === 'Disponible' ? 'bg-emerald-500' : 'bg-amber-500'
                              }`} 
                              title={`Nettoyage: ${room.housekeeping_status}`}
                            ></span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === 'arrivals' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Arrivées attendues aujourd'hui</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="pb-3">N° Réservation</th>
                        <th className="pb-3">Client</th>
                        <th className="pb-3">Date de séjour</th>
                        <th className="pb-3">Statut</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reservations
                        .filter(r => r.status === 'Confirmée')
                        .map(res => {
                          const guest = guests.find(g => g.id === res.guest_id);
                          return (
                            <tr key={res.id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 font-mono font-bold text-slate-800">{res.reservation_number}</td>
                              <td className="py-3.5 font-bold text-slate-900">{guest ? `${guest.first_name} ${guest.last_name}` : 'Inconnu'}</td>
                              <td className="py-3.5 text-slate-600">{res.arrival_date} au {res.departure_date} ({res.nights}n)</td>
                              <td className="py-3.5"><Badge label={res.status} type="res" status={res.status} /></td>
                              <td className="py-3.5 text-right">
                                <button 
                                  onClick={() => {
                                    handleCheckIn(res.id, res.room_id);
                                  }}
                                  className="bg-brand-orange hover:bg-brand-orange-hover text-white text-[11px] font-bold px-2.5 py-1 rounded"
                                >
                                  Check-In
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'departures' && (
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Départs attendus aujourd'hui</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="pb-3">Chambre</th>
                        <th className="pb-3">Client</th>
                        <th className="pb-3">Solde restant</th>
                        <th className="pb-3">Statut</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reservations
                        .filter(r => r.status === 'En séjour')
                        .map(res => {
                          const guest = guests.find(g => g.id === res.guest_id);
                          const room = rooms.find(rm => rm.id === res.room_id);
                          return (
                            <tr key={res.id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 font-black text-slate-900">{room?.room_number}</td>
                              <td className="py-3.5 font-bold text-slate-900">{guest ? `${guest.first_name} ${guest.last_name}` : 'Inconnu'}</td>
                              <td className="py-3.5 font-mono text-rose-600 font-bold">{res.balance.toLocaleString()} XOF</td>
                              <td className="py-3.5"><Badge label={res.status} type="res" status={res.status} /></td>
                              <td className="py-3.5 text-right space-x-1">
                                <button 
                                  onClick={() => triggerPrintReceiptForReservation(res)}
                                  className="text-slate-400 hover:text-brand-orange hover:bg-slate-50 inline-block p-1.5 rounded transition-colors"
                                  title="Imprimer la Facture / Reçu client"
                                >
                                  <Printer size={13} />
                                </button>
                                <button 
                                  onClick={() => {
                                    handleCheckOut(res.id, res.room_id);
                                  }}
                                  className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1.5 rounded transition-colors inline-block"
                                >
                                  Check-Out
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT AREA: DETAIL PANEL / ROOM DRAWER SHEET */}
          <div className="space-y-4">
            {selectedRoom ? (
              <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden text-left">
                {/* Panel Header */}
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-brand-orange font-bold uppercase tracking-wider block">Détails Chambre</span>
                    <h3 className="text-xl font-black text-white">Chambre {selectedRoom.room_number}</h3>
                  </div>
                  <button onClick={() => setSelectedRoom(null)} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                {/* Panel Content */}
                <div className="p-5 space-y-5">
                  
                  {/* Statuses badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge label={`Chambre: ${selectedRoom.current_status}`} type="room" status={selectedRoom.current_status} />
                    <Badge label={`Ménage: ${selectedRoom.housekeeping_status}`} type="hsk" status={selectedRoom.housekeeping_status} />
                  </div>

                  {/* Room Config Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[#A1A5B7] font-semibold block text-[10px] uppercase">Capacité</span>
                      <span className="font-bold text-slate-800">{selectedRoom.capacity} Adultes</span>
                    </div>
                    <div>
                      <span className="text-[#A1A5B7] font-semibold block text-[10px] uppercase">Tarif de base</span>
                      <span className="font-bold text-slate-800">{selectedRoom.base_price.toLocaleString()} XOF / Nuit</span>
                    </div>
                  </div>

                  {/* Resident Info if occupied */}
                  {selectedRoom.current_status === 'Occupée' ? (
                    <div className="space-y-3.5 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-[#A1A5B7] font-semibold block text-[10px] uppercase mb-1">Occupant actuel</span>
                        {getGuestForRoom(selectedRoom.room_number) ? (
                          <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-xs">
                              <User size={14} />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-slate-800">
                                {getGuestForRoom(selectedRoom.room_number)?.first_name} {getGuestForRoom(selectedRoom.room_number)?.last_name}
                              </h4>
                              <p className="text-[10px] text-slate-500 font-mono">{getGuestForRoom(selectedRoom.room_number)?.phone}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-600">Client enregistré via réservation</span>
                        )}
                      </div>

                      {getReservationForRoom(selectedRoom.id) && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Arrivée</span>
                            <span className="font-bold text-slate-700">{getReservationForRoom(selectedRoom.id)?.arrival_date}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Solde</span>
                            <span className="font-bold text-rose-600">{getReservationForRoom(selectedRoom.id)?.balance.toLocaleString()} XOF</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 text-center">
                      Aucun occupant enregistré actuellement dans cette chambre.
                    </div>
                  )}

                  {/* Actions buttons based on status */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actions réceptionniste</span>
                    
                    {selectedRoom.current_status === 'Libre' && (
                      <button 
                        onClick={() => updateRoomStatus(selectedRoom.id, 'Occupée')}
                        className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <UserPlus size={14} />
                        <span>Enregistrer un Check-In (Walk-in)</span>
                      </button>
                    )}

                    {selectedRoom.current_status === 'Occupée' && (
                      <div className="space-y-2">
                        {(() => {
                          const res = getReservationForRoom(selectedRoom.id);
                          if (res) {
                            return (
                              <button
                                onClick={() => triggerPrintReceiptForReservation(res)}
                                className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                              >
                                <Printer size={14} />
                                <span>Facture Provisoire / Reçu</span>
                              </button>
                            );
                          }
                          return null;
                        })()}
                        
                        <button 
                          onClick={() => updateRoomStatus(selectedRoom.id, 'À nettoyer')}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Enregistrer le Check-Out</span>
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => updateRoomStatus(selectedRoom.id, 'À nettoyer')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition-colors border border-slate-200 text-center"
                      >
                        Mettre à nettoyer
                      </button>
                      <button 
                        onClick={() => updateRoomStatus(selectedRoom.id, 'Maintenance')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 rounded-lg transition-colors border border-slate-200 text-center"
                      >
                        Signaler Incident
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                <HelpCircle size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-semibold">Sélectionnez une chambre du plan de l'hôtel pour voir les détails, gérer le check-in, check-out ou le ménage.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* PRINTABLE RECEIPT MODAL INTEGRATION */}
      {selectedReceiptData && (
        <PrintableReceipt
          invoice={selectedReceiptData.invoice}
          guest={selectedReceiptData.guest}
          reservation={selectedReceiptData.reservation}
          onClose={() => setSelectedReceiptData(null)}
        />
      )}
    </div>
  );
}
