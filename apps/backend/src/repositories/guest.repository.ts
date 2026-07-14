import { BaseRepository } from './base.repository';
import { Guest } from '@prisma/client';

export class GuestRepository extends BaseRepository<Guest> {
  async findAll(): Promise<Guest[]> {
    return this.db.guest.findMany({
      where: { deletedAt: null }
    });
  }

  async findById(id: number): Promise<Guest | null> {
    return this.db.guest.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async findByEmailOrPhone(email?: string, phone?: string): Promise<Guest | null> {
    if (!email && !phone) return null;
    
    return this.db.guest.findFirst({
      where: {
        deletedAt: null,
        OR: [
          email ? { email } : {},
          phone ? { phone } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    });
  }

  async create(data: Omit<Guest, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy'>): Promise<Guest> {
    return this.db.guest.create({ data });
  }

  async update(id: number, data: Partial<Guest>): Promise<Guest> {
    return this.db.guest.update({ where: { id }, data });
  }

  async softDelete(id: number, userId: number): Promise<Guest> {
    return this.db.guest.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId }
    });
  }
}
