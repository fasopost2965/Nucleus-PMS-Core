import { BaseRepository } from './base.repository';
import { RestaurantItem, RestaurantOrder } from '@prisma/client';

export class RestaurantItemRepository extends BaseRepository<RestaurantItem> {
  async findAll(): Promise<RestaurantItem[]> {
    return this.db.restaurantItem.findMany({
      where: { deletedAt: null }
    });
  }

  async findById(id: number): Promise<RestaurantItem | null> {
    return this.db.restaurantItem.findFirst({
      where: { id, deletedAt: null }
    });
  }

  async create(data: Omit<RestaurantItem, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'deletedBy'>): Promise<RestaurantItem> {
    return this.db.restaurantItem.create({ data });
  }

  async update(id: number, data: Partial<RestaurantItem>): Promise<RestaurantItem> {
    return this.db.restaurantItem.update({ where: { id }, data });
  }

  async softDelete(id: number, userId: number): Promise<RestaurantItem> {
    return this.db.restaurantItem.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId }
    });
  }
}

export class RestaurantOrderRepository extends BaseRepository<RestaurantOrder> {
  async findAll(): Promise<RestaurantOrder[]> {
    return this.db.restaurantOrder.findMany({
      include: { items: { include: { item: true } }, folio: true }
    });
  }

  async findById(id: number): Promise<RestaurantOrder | null> {
    return this.db.restaurantOrder.findUnique({
      where: { id },
      include: { items: { include: { item: true } }, folio: true }
    });
  }

  // Not implementing standard create/update here since order logic is complex and should be in transaction
}
