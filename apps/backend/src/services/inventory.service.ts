import { InventoryItemRepository, InventoryMovementRepository } from '../repositories/inventory.repository';
import { executeInTransaction } from '../repositories/prisma';
import { NotFoundError, BusinessRuleError } from '../utils/errors';
import { InventoryItem, InventoryMovement } from '@prisma/client';

// DTO pour la mise à jour d'un article (number au lieu de Decimal pour compatibilité Zod)
export interface UpdateInventoryItemDto {
  name?: string;
  unit?: string;
  alertThreshold?: number;
  averagePurchasePrice?: number;
}

export class InventoryService {
  private itemRepo: InventoryItemRepository;
  private movementRepo: InventoryMovementRepository;

  constructor() {
    this.itemRepo = new InventoryItemRepository();
    this.movementRepo = new InventoryMovementRepository();
  }

  // --- ITEMS ---
  async getItems(): Promise<InventoryItem[]> {
    return this.itemRepo.findAll();
  }

  async getItemById(id: number): Promise<InventoryItem> {
    const item = await this.itemRepo.findById(id);
    if (!item) throw new NotFoundError('Article d\'inventaire introuvable');
    return item;
  }

  async createItem(data: any): Promise<InventoryItem> {
    return this.itemRepo.create(data);
  }

  async updateItem(id: number, data: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.itemRepo.findById(id);
    if (!item) throw new NotFoundError('Article d\'inventaire introuvable');
    return this.itemRepo.update(id, data as any);
  }

  // --- MOVEMENTS ---
  async getMovements(): Promise<InventoryMovement[]> {
    return this.movementRepo.findAll();
  }

  async createMovement(data: { itemId: number, type: 'IN' | 'OUT', quantity: number, reason?: string, userId: number }): Promise<InventoryMovement> {
    return executeInTransaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({ where: { id: data.itemId, deletedAt: null } });
      if (!item) throw new NotFoundError('Article d\'inventaire introuvable');

      if (data.type === 'OUT' && Number(item.quantity) < data.quantity) {
        throw new BusinessRuleError('Stock insuffisant pour cette sortie');
      }

      const movement = await tx.inventoryMovement.create({
        data: {
          itemId: data.itemId,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          userId: data.userId
        }
      });

      // ✅ Sprint 3 — Mise à jour atomique du stock (évite les race conditions)
      await tx.inventoryItem.update({
        where: { id: item.id },
        data: data.type === 'IN'
          ? { quantity: { increment: data.quantity } }
          : { quantity: { decrement: data.quantity } }
      });

      return movement;
    });
  }
}
