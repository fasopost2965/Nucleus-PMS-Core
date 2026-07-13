import { IRoom, IReservation, IHousekeepingTask, IMaintenanceTicket, TRoomStatus } from '../../types';
import {
  Wifi,
  Wind,
  Tv,
  Coffee,
  Bath,
  Trees,
  Briefcase,
  Waves,
  Bed,
  BedDouble,
  Sparkles,
  Crown,
  Users,
  Eye,
  Edit2,
  Trash2,
  HelpCircle
} from 'lucide-react';
import React from 'react';

// Dictionary of allowed icons for amenities & categories
export const iconMap: Record<string, React.ComponentType<any>> = {
  Wifi,
  Wind,
  Tv,
  Coffee,
  Bath,
  Trees,
  Briefcase,
  Waves,
  Bed,
  BedDouble,
  Sparkles,
  Crown,
  Users,
  Eye,
  Edit2,
  Trash2
};

/**
 * Dynamically render a registered Lucide icon or fallback
 */
export function renderAmenityIcon(name: string, className?: string, size = 14) {
  const IconComponent = iconMap[name] || HelpCircle;
  return React.createElement(IconComponent, { className, size });
}

/**
 * Calculates the dynamic operational display status of a room
 * based on live hotel operations: reservations, housekeeping, and maintenance.
 */
export function calculateRoomStatus(
  room: IRoom,
  reservations: IReservation[],
  housekeepingTasks: IHousekeepingTask[],
  maintenanceTickets: IMaintenanceTicket[]
): TRoomStatus {
  if (!room.active) {
    return 'Hors service';
  }

  // 1. Check if there is an active maintenance ticket that blocks the room
  const activeMaintenance = maintenanceTickets.find(
    t => t.room_id === room.id && ['Signalé', 'Assigné', 'En cours'].includes(t.status)
  );
  if (activeMaintenance) {
    return 'Maintenance';
  }

  // 2. Check if there is a pending or active cleaning task
  const activeHousekeeping = housekeepingTasks.find(
    t => t.room_id === room.id && ['À nettoyer', 'En cours'].includes(t.status)
  );
  if (activeHousekeeping) {
    return 'Nettoyage';
  }

  // 3. Check if there is an active reservation
  // Using today's simulated system date: 2026-07-13
  const todayStr = '2026-07-13';
  
  const isOccupied = reservations.some(
    r => r.room_id === room.id && r.status === 'En séjour'
  );
  if (isOccupied) {
    return 'Occupée';
  }

  const isReserved = reservations.some(
    r => r.room_id === room.id && 
         r.status === 'Confirmée' && 
         todayStr >= r.arrival_date && 
         todayStr <= r.departure_date
  );
  if (isReserved) {
    return 'Réservée';
  }

  return 'Disponible';
}

/**
 * Returns a localized label and color settings for the given TRoomStatus.
 */
export function getRoomStatusDetails(status: TRoomStatus) {
  switch (status) {
    case 'Disponible':
      return {
        label: 'Disponible',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      };
    case 'Occupée':
      return {
        label: 'Occupée',
        bg: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
        dot: 'bg-rose-500',
        badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
      };
    case 'Réservée':
      return {
        label: 'Réservée',
        bg: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        dot: 'bg-blue-500',
        badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      };
    case 'Nettoyage':
      return {
        label: 'En Nettoyage',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
        dot: 'bg-indigo-500',
        badge: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
      };
    case 'Maintenance':
      return {
        label: 'Maintenance',
        bg: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        dot: 'bg-amber-500',
        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      };
    case 'Hors service':
      return {
        label: 'Hors service',
        bg: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200',
        dot: 'bg-slate-500',
        badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
      };
    default:
      return {
        label: 'Inconnu',
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        badge: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
      };
  }
}
