import React from 'react';
import { Eye, Edit2, Trash2, ArrowUpRight, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { IRoom, IRoomCategory, IAmenity } from '../../types';
import RoomStatusBadge from './RoomStatusBadge';
import { renderAmenityIcon } from './roomUtils';
import { TRoomStatus } from '../../types';

interface RoomCardProps {
  key?: any;
  room: IRoom;
  category?: IRoomCategory;
  calculatedStatus: TRoomStatus;
  amenities: IAmenity[];
  onView: (room: IRoom) => void;
  onEdit: (room: IRoom) => void;
  onToggleActive: (room: IRoom) => void;
  onDelete: (room: IRoom) => void;
}

export default function RoomCard({
  room,
  category,
  calculatedStatus,
  amenities,
  onView,
  onEdit,
  onToggleActive,
  onDelete
}: RoomCardProps) {
  // Filter the list of active amenities present in this room
  const roomAmenities = amenities.filter(a => room.amenities.includes(a.id));

  // Determine border and accent colors based on category
  const categoryColorClass = category?.color || 'slate';
  
  // Custom theme background mapping
  const colorBorders: Record<string, string> = {
    emerald: 'border-l-emerald-500 hover:border-emerald-200',
    blue: 'border-l-blue-500 hover:border-blue-200',
    indigo: 'border-l-indigo-500 hover:border-indigo-200',
    amber: 'border-l-amber-500 hover:border-amber-200',
    rose: 'border-l-rose-500 hover:border-rose-200',
    slate: 'border-l-slate-500 hover:border-slate-200'
  };

  const selectedBorder = colorBorders[categoryColorClass] || 'border-l-slate-400 hover:border-slate-200';

  return (
    <div
      id={`room-card-${room.id}`}
      className={`bg-white rounded-xl border border-slate-200 border-l-4 ${selectedBorder} p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between h-56 text-left relative overflow-hidden group`}
    >
      {/* Top Header Row of the Card */}
      <div>
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 id={`room-number-card-${room.id}`} className="text-lg font-black text-slate-900 leading-none">
                Chambre {room.room_number}
              </h4>
              {!room.active && (
                <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              {room.floor} • {room.area} m² • {room.bed_type}
            </p>
          </div>
          
          <RoomStatusBadge status={calculatedStatus} />
        </div>

        {/* Category & Capacity Indicator */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            {category ? (
              <>
                {category.icon && renderAmenityIcon(category.icon, 'text-slate-400', 12)}
                <span>{category.name}</span>
              </>
            ) : (
              'Inconnu'
            )}
          </span>
          <span className="text-[10px] font-semibold text-slate-500">
            Capacité: {room.capacity} pers.
          </span>
        </div>

        {/* Dynamic Icons for Amenities */}
        <div className="mt-4 flex flex-wrap gap-1.5 h-6 overflow-hidden">
          {roomAmenities.slice(0, 5).map(amenity => (
            <div
              key={amenity.id}
              className="bg-slate-50 hover:bg-slate-100/80 border border-slate-100 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-1 text-[9px] font-medium transition-colors cursor-help"
              title={amenity.name}
            >
              {renderAmenityIcon(amenity.icon, 'text-slate-500', 10)}
              <span>{amenity.name}</span>
            </div>
          ))}
          {roomAmenities.length > 5 && (
            <span className="text-[9px] text-slate-400 font-bold self-center">
              +{roomAmenities.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* Pricing & Actions Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <div>
          <span className="text-[10px] text-slate-400 block font-semibold leading-none">Tarif nuit standard</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-black text-slate-900 font-mono">
              {room.base_price.toLocaleString()}
            </span>
            <span className="text-[9px] text-slate-400 font-bold">XOF</span>
            {room.prices.length > 1 && (
              <span
                className="bg-brand-orange/10 text-brand-orange text-[8px] font-bold px-1 py-0.5 rounded cursor-help"
                title={`${room.prices.length} grilles tarifaires configurées (normal, week-end, entreprise, etc.)`}
              >
                Multi-tarifs
              </span>
            )}
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            id={`view-room-btn-${room.id}`}
            onClick={() => onView(room)}
            className="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-slate-50 rounded-lg transition-colors"
            title="Consulter les détails"
          >
            <Eye size={14} />
          </button>
          
          <button
            id={`edit-room-btn-${room.id}`}
            onClick={() => onEdit(room)}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            title="Modifier la chambre"
          >
            <Edit2 size={14} />
          </button>

          <button
            id={`toggle-active-room-btn-${room.id}`}
            onClick={() => onToggleActive(room)}
            className={`p-1.5 rounded-lg transition-colors ${room.active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-100'}`}
            title={room.active ? "Désactiver la chambre" : "Activer la chambre"}
          >
            <ArrowUpRight size={14} />
          </button>

          <button
            id={`delete-room-btn-${room.id}`}
            onClick={() => onDelete(room)}
            className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer la chambre"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
