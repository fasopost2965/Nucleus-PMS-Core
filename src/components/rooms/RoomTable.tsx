import React from 'react';
import { Eye, Edit2, Trash2, ArrowUpRight, HelpCircle } from 'lucide-react';
import { IRoom, IRoomCategory, IAmenity } from '../../types';
import RoomStatusBadge from './RoomStatusBadge';
import { renderAmenityIcon } from './roomUtils';
import { TRoomStatus } from '../../types';

interface RoomTableProps {
  rooms: IRoom[];
  categories: IRoomCategory[];
  amenities: IAmenity[];
  calculatedStatuses: Record<string, TRoomStatus>;
  onView: (room: IRoom) => void;
  onEdit: (room: IRoom) => void;
  onToggleActive: (room: IRoom) => void;
  onDelete: (room: IRoom) => void;
}

export default function RoomTable({
  rooms,
  categories,
  amenities,
  calculatedStatuses,
  onView,
  onEdit,
  onToggleActive,
  onDelete
}: RoomTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="rooms-table-wrapper">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs" id="rooms-data-table">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold bg-slate-50/50">
              <th className="py-3.5 px-6">N° Chambre</th>
              <th className="py-3.5 px-4">Catégorie</th>
              <th className="py-3.5 px-4">Étage</th>
              <th className="py-3.5 px-4">Lit & Superficie</th>
              <th className="py-3.5 px-4">Équipements</th>
              <th className="py-3.5 px-4">Tarif Standard</th>
              <th className="py-3.5 px-4">Statut Courant</th>
              <th className="py-3.5 px-4">État Référentiel</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400 font-medium">
                  Aucune chambre ne correspond aux critères de recherche actuels.
                </td>
              </tr>
            ) : (
              rooms.map((room) => {
                const cat = categories.find(c => c.id === room.category_id);
                const status = calculatedStatuses[room.id] || 'Disponible';
                const roomAmenities = amenities.filter(a => room.amenities.includes(a.id));

                return (
                  <tr key={room.id} className="hover:bg-slate-50/30 transition-colors" id={`room-row-${room.id}`}>
                    
                    {/* Room number & ID */}
                    <td className="py-3.5 px-6 font-black text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{room.room_number}</span>
                        {!room.active && (
                          <span className="bg-red-50 text-red-600 text-[8px] font-extrabold uppercase px-1 rounded">
                            H.S
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category with soft colors */}
                    <td className="py-3.5 px-4">
                      {cat ? (
                        <span className={`inline-flex items-center gap-1 font-bold text-slate-700`}>
                          {cat.icon && renderAmenityIcon(cat.icon, 'text-slate-400', 11)}
                          <span>{cat.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Non spécifié</span>
                      )}
                    </td>

                    {/* Floor */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {room.floor}
                    </td>

                    {/* Bed Type and Area */}
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
                      <span>{room.bed_type}</span>
                      <span className="text-[10px] text-slate-400 block font-normal">{room.area} m²</span>
                    </td>

                    {/* Amenities quick icons list */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        {roomAmenities.slice(0, 4).map(amenity => (
                          <span
                            key={amenity.id}
                            className="p-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-md hover:bg-slate-100/50 hover:text-slate-700 transition-colors cursor-help"
                            title={amenity.name}
                          >
                            {renderAmenityIcon(amenity.icon, 'text-slate-400', 12)}
                          </span>
                        ))}
                        {roomAmenities.length > 4 && (
                          <span className="text-[10px] font-extrabold text-slate-400 pl-1 cursor-help" title={`${roomAmenities.length - 4} autres équipements disponibles`}>
                            +{roomAmenities.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Base price & tariff info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 font-mono">
                        {room.base_price.toLocaleString()} XOF
                      </div>
                      {room.prices.length > 1 && (
                        <span className="text-[9px] font-bold text-brand-orange block leading-none mt-0.5" title="Grilles multiples configurées">
                          {room.prices.length} grilles tarifaires
                        </span>
                      )}
                    </td>

                    {/* Dynamic Status Badges */}
                    <td className="py-3.5 px-4">
                      <RoomStatusBadge status={status} />
                    </td>

                    {/* Referral state active/inactive */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase ${room.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${room.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span>{room.active ? 'Actif' : 'Désactivé'}</span>
                      </span>
                    </td>

                    {/* Actions column */}
                    <td className="py-3.5 px-6 text-right space-x-1">
                      <button
                        id={`table-view-btn-${room.id}`}
                        onClick={() => onView(room)}
                        className="text-slate-400 hover:text-brand-orange hover:bg-slate-50 p-1.5 rounded-lg transition-colors inline-block"
                        title="Consulter les détails"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        id={`table-edit-btn-${room.id}`}
                        onClick={() => onEdit(room)}
                        className="text-slate-400 hover:text-slate-800 hover:bg-slate-50 p-1.5 rounded-lg transition-colors inline-block"
                        title="Modifier la chambre"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        id={`table-active-btn-${room.id}`}
                        onClick={() => onToggleActive(room)}
                        className={`p-1.5 rounded-lg transition-colors inline-block ${room.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}
                        title={room.active ? "Désactiver" : "Activer"}
                      >
                        <ArrowUpRight size={13} />
                      </button>
                      <button
                        id={`table-delete-btn-${room.id}`}
                        onClick={() => onDelete(room)}
                        className="text-slate-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-block"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
