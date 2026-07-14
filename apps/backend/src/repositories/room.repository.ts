import { BaseRepository } from './base.repository';
import { Room } from '@prisma/client';

export class RoomRepository extends BaseRepository<Room> {
  async findAll(): Promise<Room[]> {
    return this.db.room.findMany({
      where: { deletedAt: null },
      include: { category: true }
    });
  }

  async findById(id: number): Promise<Room | null> {
    return this.db.room.findFirst({
      where: { id, deletedAt: null },
      include: { category: true }
    });
  }

  async findByNumber(number: string): Promise<Room | null> {
    return this.db.room.findFirst({
      where: { number, deletedAt: null }
    });
  }

  async countByCategoryId(categoryId: number): Promise<number> {
    return this.db.room.count({
      where: { categoryId, deletedAt: null }
    });
  }

  async create(data: Omit<Room, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy'>): Promise<Room> {
    return this.db.room.create({ data });
  }

  async update(id: number, data: Partial<Room>): Promise<Room> {
    return this.db.room.update({ where: { id }, data });
  }

  async softDelete(id: number, userId: number): Promise<Room> {
    return this.db.room.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId }
    });
  }
}
