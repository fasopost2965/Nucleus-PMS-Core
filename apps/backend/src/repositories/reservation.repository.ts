import { BaseRepository } from './base.repository';
import { Reservation } from '@prisma/client';

export class ReservationRepository extends BaseRepository<Reservation> {
  async findAll(): Promise<Reservation[]> {
    return this.db.reservation.findMany({
      where: { deletedAt: null },
      include: { guest: true, room: true, folio: true }
    });
  }

  async findById(id: number): Promise<Reservation | null> {
    return this.db.reservation.findFirst({
      where: { id, deletedAt: null },
      include: { guest: true, room: true, folio: { include: { items: true, payments: true, invoice: true } } }
    });
  }

  async findByRoomAndDates(roomId: number, checkInDate: Date, checkOutDate: Date): Promise<Reservation[]> {
    return this.db.reservation.findMany({
      where: {
        roomId,
        deletedAt: null,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        OR: [
          { checkInDate: { lte: checkOutDate }, checkOutDate: { gte: checkInDate } }
        ]
      }
    });
  }

  async create(data: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy'>): Promise<Reservation> {
    return this.db.reservation.create({ data });
  }

  async update(id: number, data: Partial<Reservation>): Promise<Reservation> {
    return this.db.reservation.update({ where: { id }, data });
  }

  async softDelete(id: number, userId: number): Promise<Reservation> {
    return this.db.reservation.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId }
    });
  }
}
