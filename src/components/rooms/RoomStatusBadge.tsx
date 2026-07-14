import React from 'react';
import { TRoomStatus } from '../../types';
import { getRoomStatusDetails } from './roomUtils';

interface RoomStatusBadgeProps {
  status: TRoomStatus;
  id?: string;
}

export default function RoomStatusBadge({ status, id }: RoomStatusBadgeProps) {
  const safeStatus = status || 'Disponible';
  const details = getRoomStatusDetails(safeStatus);

  return (
    <span
      id={id || `status-badge-${String(safeStatus).toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${details.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${details.dot}`} />
      <span>{details.label}</span>
    </span>
  );
}
