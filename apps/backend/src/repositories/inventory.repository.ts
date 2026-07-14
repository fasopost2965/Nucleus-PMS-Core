import { BaseRepository } from './base.repository';
import { InventoryItem, InventoryMovement } from '@prisma/client';

export class InventoryItemRepository extends BaseRepository<InventoryItem> {
  async findAll(): Promise<InventoryItem[]> {
    return this.db.inventoryItem.findMany({
      where: { deletedAt: null }
    });
  }

  async findById(id: number): Promise<InventoryItem | null> {
    return this.db.inventoryItem.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async create(data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy'>): Promise<InventoryItem> {
    return this.db.inventoryItem.create({ data });
  }

  async update(id: number, data: Partial<InventoryItem>): Promise<InventoryItem> {
    return this.db.inventoryItem.update({ where: { id }, data });
  }

  async softDelete(id: number, userId: number): Promise<InventoryItem> {
    return this.db.inventoryItem.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId }
    });
  }
}

export class InventoryMovementRepository extends BaseRepository<InventoryMovement> {
  async findAll(): Promise<InventoryMovement[]> {
    return this.db.inventoryMovement.findMany({
      include: { item: true, user: true }
    });
  }

  async findById(id: number): Promise<InventoryMovement | null> {
    return this.db.inventoryMovement.findUnique({
      where: { id },
      include: { item: true, user: true }
    });
  }
}
