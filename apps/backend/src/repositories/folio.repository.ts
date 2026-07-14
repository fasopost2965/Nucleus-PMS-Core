import { BaseRepository } from './base.repository';
import { Folio } from '@prisma/client';

export class FolioRepository extends BaseRepository<Folio> {
  async findAll(): Promise<Folio[]> {
    return this.db.folio.findMany({
      include: { items: true, payments: true, invoice: true }
    });
  }

  async findById(id: number): Promise<Folio | null> {
    return this.db.folio.findUnique({
      where: { id },
      include: { items: true, payments: true, invoice: true }
    });
  }

  async findByReservationId(reservationId: number): Promise<Folio | null> {
    return this.db.folio.findUnique({
      where: { reservationId },
      include: { items: true, payments: true, invoice: true }
    });
  }

  async create(data: Omit<Folio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folio> {
    return this.db.folio.create({ data });
  }

  async update(id: number, data: Partial<Folio>): Promise<Folio> {
    return this.db.folio.update({ where: { id }, data });
  }

  async softDelete(id: number, userId: number): Promise<Folio> {
    throw new Error('Folio ne peut pas être supprimé');
  }
}
