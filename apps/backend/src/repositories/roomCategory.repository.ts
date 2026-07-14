import { BaseRepository } from './base.repository';
import { RoomCategory, Room } from '@prisma/client';

export class RoomCategoryRepository extends BaseRepository<RoomCategory> {
  async findAll(): Promise<RoomCategory[]> {
    return this.db.roomCategory.findMany({
      where: { deletedAt: null }
    });
  }

  async findById(id: number): Promise<RoomCategory | null> {
    return this.db.roomCategory.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async create(data: Omit<RoomCategory, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy'>): Promise<RoomCategory> {
    return this.db.roomCategory.create({ data });
  }

  async update(id: number, data: Partial<RoomCategory>): Promise<RoomCategory> {
    return this.db.roomCategory.update({ where: { id }, data });
  }

  async softDelete(id: number, userId: number): Promise<RoomCategory> {
    return this.db.roomCategory.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId }
    });
  }
}
