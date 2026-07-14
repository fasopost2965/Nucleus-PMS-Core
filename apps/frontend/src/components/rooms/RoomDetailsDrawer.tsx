import React, { useState } from 'react';
import { X, Calendar, Wrench, Shield, Clock, Users, Bed, Eye, HelpCircle, Check, Info, Coins } from 'lucide-react';
import { IRoom, IRoomCategory, IAmenity, IReservation, IHousekeepingTask, IMaintenanceTicket, IGuest } from '../../types';
import RoomStatusBadge from './RoomStatusBadge';
import { renderAmenityIcon, getRoomStatusDetails } from './roomUtils';
import { TRoomStatus } from '../../types';

interface RoomDetailsDrawerProps {
  room: IRoom | null;
  category?: IRoomCategory;
  calculatedStatus: TRoomStatus;
  amenities: IAmenity[];
  reservations: IReservation[];
  guests: IGuest[];
  housekeepingTasks: IHousekeepingTask[];
  maintenanceTickets: IMaintenanceTicket[];
  onClose: () => void;
  onEdit?: (room: IRoom) => void;
}

export default function RoomDetailsDrawer({
  room,
  category,
  calculatedStatus,
  amenities,
  reservations,
  guests,
  housekeepingTasks,
  maintenanceTickets,
  onClose,
  onEdit
}: RoomDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'prices' | 'operational' | 'logs'>('details');

  if (!room) return null;

  // Find related operational data
  const currentReservations = reservations.filter(r => r.room_id === room.id);
  const activeReservation = currentReservations.find(r => r.status === 'En séjour');
  const futureReservations = currentReservations.filter(r => r.status === 'Confirmée');
  const activeGuest = activeReservation ? guests.find(g => g.id === activeReservation.guest_id) : null;
  
  const currentHousekeeping = housekeepingTasks.find(h => h.room_id === room.id);
  const activeMaintenance = maintenanceTickets.find(
    m => m.room_id === room.id && ['Signalé', 'Assigné', 'En cours'].includes(m.status)
  );

  return (
    <div
      id="room-details-drawer-backdrop"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex justify-end transition-opacity animate-fade-in"
      onClick={onClose}
    >
      <div
        id="room-details-drawer-content"
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between text-left animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header section with Room name and close */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black">Chambre {room.room_number}</h2>
              <RoomStatusBadge status={calculatedStatus} />
            </div>
            <p className="text-xs text-slate-400">
              {category?.name || 'Sans catégorie'} • {room.floor}
            </p>
          </div>
          <button
            id="close-drawer-btn"
            onClick={onClose}
            className="p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div className="flex border-b border-slate-100 bg-slate-50 p-1">
          <button
            id="tab-details"
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${activeTab === 'details' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Fiche Technique
          </button>
          <button
            id="tab-prices"
            onClick={() => setActiveTab('prices')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${activeTab === 'prices' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Tarification
          </button>
          <button
            id="tab-operational"
            onClick={() => setActiveTab('operational')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${activeTab === 'operational' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Exploitation
          </button>
          <button
            id="tab-logs"
            onClick={() => setActiveTab('logs')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${activeTab === 'logs' ? 'bg-white text-brand-orange shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Traçabilité
          </button>
        </div>

        {/* Dynamic Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: GENERAL SPECIFICATIONS & AMENITIES */}
          {activeTab === 'details' && (
            <div className="space-y-6" id="details-tab-content">
              {/* Core Features Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Lit & Configuration</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Bed size={16} className="text-slate-500" />
                    <span className="text-sm font-black text-slate-800">{room.bed_type}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Superficie & Capacité</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Users size={16} className="text-slate-500" />
                    <span className="text-sm font-black text-slate-800">{room.area} m² • max {room.capacity} pax</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {category?.description && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Description de la catégorie</h4>
                  <p className="text-xs text-slate-600 bg-slate-50/50 p-3 rounded-lg border border-slate-100 italic">
                    "{category.description}"
                  </p>
                </div>
              )}

              {/* Internal service Notes */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Notes internes & Consignes</h4>
                <p className="text-xs text-slate-700 bg-amber-50/40 border border-amber-100 p-3 rounded-lg leading-relaxed">
                  {room.notes || "Aucune consigne interne ou note de service particulière n'est enregistrée pour cette chambre."}
                </p>
              </div>

              {/* Reusable Amenities checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Équipements répertoriés</h4>
                <div className="grid grid-cols-2 gap-2">
                  {amenities.map(amenity => {
                    const hasAmenity = room.amenities.includes(amenity.id);
                    return (
                      <div
                        key={amenity.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs font-semibold ${hasAmenity ? 'border-slate-200 bg-white text-slate-800' : 'border-slate-100 bg-slate-50/50 text-slate-400 line-through opacity-60'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={hasAmenity ? 'text-brand-orange' : 'text-slate-300'}>
                            {renderAmenityIcon(amenity.icon, '', 14)}
                          </span>
                          <span>{amenity.name}</span>
                        </div>
                        {hasAmenity && <Check size={12} className="text-emerald-500 stroke-[3]" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MULTIPLE TARIFF RATES */}
          {activeTab === 'prices' && (
            <div className="space-y-6" id="prices-tab-content">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <Coins className="text-brand-orange shrink-0" size={24} />
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Modèle multi-tarifs activé</h4>
                  <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                    Le PMS de l'hôtel Brunch de Bouaké gère des grilles tarifaires dérivées pour s'adapter automatiquement aux saisons, événements et partenariats OTA.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Grille des Tarifs nuitées</h4>
                
                {room.prices.map((tariff) => {
                  let label = '';
                  let desc = '';
                  let highlight = false;

                  switch (tariff.rate_type) {
                    case 'normal':
                      label = 'Standard (Semaine)';
                      desc = 'Tarif standard applicable du lundi au jeudi hors saison.';
                      highlight = true;
                      break;
                    case 'weekend':
                      label = 'Week-end';
                      desc = 'Tarif applicable le vendredi, samedi et dimanche.';
                      break;
                    case 'season':
                      label = 'Haute Saison';
                      desc = 'Grille majorée appliquée durant les périodes de fêtes ou grands événements de Bouaké.';
                      break;
                    case 'corporate':
                      label = 'Corporate / Entreprise';
                      desc = 'Tarif négocié pour les professionnels et entreprises partenaires.';
                      break;
                    case 'ota':
                      label = 'Canaux En Ligne (OTA)';
                      desc = 'Synchronisé sur les centrales de réservation (Booking, Expedia).';
                      break;
                  }

                  return (
                    <div
                      key={tariff.rate_type}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${highlight ? 'border-brand-orange bg-brand-orange/[0.01] shadow-xs' : 'border-slate-100 bg-white'}`}
                    >
                      <div className="space-y-0.5 max-w-[70%]">
                        <span className={`text-xs font-black block ${highlight ? 'text-brand-orange' : 'text-slate-800'}`}>
                          {label}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight block">
                          {desc}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-slate-900 block">
                          {tariff.amount.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">FCFA / nuit</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: OPERATIONAL LIVE DATA */}
          {activeTab === 'operational' && (
            <div className="space-y-6" id="operational-tab-content">
              
              {/* Guest / Reservation card */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Occupation courante</h4>
                {activeGuest && activeReservation ? (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-500 block">En Séjour Actif</span>
                        <h4 className="text-sm font-black text-slate-900 mt-0.5">
                          {activeGuest.first_name} {activeGuest.last_name}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {activeGuest.phone} • {activeGuest.email}
                        </p>
                      </div>
                      <span className="bg-rose-50 border border-rose-100 text-[10px] font-black px-2 py-0.5 text-rose-600 rounded">
                        {activeReservation.reservation_number}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold">Arrivée</span>
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} className="text-slate-400" />
                          {activeReservation.arrival_date}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold">Départ</span>
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} className="text-slate-400" />
                          {activeReservation.departure_date}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500 font-semibold py-8">
                    Aucun séjour actif n'est en cours dans cette chambre actuellement.
                  </div>
                )}
              </div>

              {/* Cleaning operations */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Entretien & Ménage</h4>
                {currentHousekeeping ? (
                  <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[9px] text-slate-400 block font-bold">Gouvernant(e) assigné(e)</span>
                      <span className="text-xs font-black text-slate-800">{currentHousekeeping.employee_id || 'Non assigné'}</span>
                      <span className="text-[10px] text-slate-400 block">Dernier planifié: {currentHousekeeping.scheduled_time}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-bold mb-1">Priorité: {currentHousekeeping.priority}</span>
                      <span className="bg-indigo-50 border border-indigo-100 text-[10px] font-black px-2.5 py-1 text-indigo-700 rounded-lg">
                        {currentHousekeeping.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500 font-semibold py-8">
                    Aucune tâche de ménage urgente n'est planifiée.
                  </div>
                )}
              </div>

              {/* Maintenance operations */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Maintenance technique</h4>
                {activeMaintenance ? (
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-amber-600 block">Incident Actif ({activeMaintenance.priority})</span>
                        <h4 className="text-xs font-black text-slate-800 mt-0.5">
                          {activeMaintenance.category} — {activeMaintenance.status}
                        </h4>
                      </div>
                      {activeMaintenance.estimated_cost && (
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block font-bold">Coût estimé</span>
                          <span className="text-xs font-black font-mono text-slate-800">{activeMaintenance.estimated_cost.toLocaleString()} XOF</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 italic">
                      "{activeMaintenance.description}"
                    </p>
                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                      <span>Signalé le {activeMaintenance.created_at}</span>
                      <span>Assigné à : {activeMaintenance.assigned_to || 'Aucun'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center text-xs text-slate-500 font-semibold py-8">
                    Aucune panne ou anomalie technique n'est signalée sur cette chambre.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: SYSTEM LOGS & AUDITABILITY */}
          {activeTab === 'logs' && (
            <div className="space-y-4" id="logs-tab-content">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span>Créé le :</span>
                  <span className="font-bold text-slate-900">{new Date(room.created_at).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span>Créé par :</span>
                  <span className="font-bold text-slate-900">{room.created_by}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span>Dernière mise à jour :</span>
                  <span className="font-bold text-slate-900">{new Date(room.updated_at).toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Modifié par :</span>
                  <span className="font-bold text-slate-900">{room.updated_by}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Historique du référentiel</h4>
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-4 text-xs">
                  
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 bg-emerald-100 text-emerald-600 rounded-full p-0.5 border-4 border-white">
                      <Check size={10} className="stroke-[3]" />
                    </span>
                    <span className="text-[10px] text-slate-400 block font-bold">15 Juin 2026</span>
                    <span className="font-bold text-slate-800">Mise à jour des tarifs saisonniers</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tarif Haute Saison augmenté de 5,000 FCFA pour le Festival de Bouaké par Amandine (Admin).
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 bg-blue-100 text-blue-600 rounded-full p-0.5 border-4 border-white">
                      <Check size={10} className="stroke-[3]" />
                    </span>
                    <span className="text-[10px] text-slate-400 block font-bold">12 Janvier 2026</span>
                    <span className="font-bold text-slate-800">Enregistrement initial de la chambre</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Chambre enregistrée au référentiel avec équipements par défaut par Koffi (Réception).
                    </p>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Button at Bottom */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            PMS BRUNCH BOUAKE • ID: {room.id}
          </span>
          {onEdit && (
            <button
              id="drawer-edit-btn"
              onClick={() => onEdit(room)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-lg transition-colors"
            >
              Modifier la fiche
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
