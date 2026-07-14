import { RestaurantItemRepository, RestaurantOrderRepository } from '../repositories/restaurant.repository';
import { executeInTransaction } from '../repositories/prisma';
import { NotFoundError, BusinessRuleError } from '../utils/errors';
import { RestaurantItem, RestaurantOrder } from '@prisma/client';

export class RestaurantService {
  private itemRepo: RestaurantItemRepository;
  private orderRepo: RestaurantOrderRepository;

  constructor() {
    this.itemRepo = new RestaurantItemRepository();
    this.orderRepo = new RestaurantOrderRepository();
  }

  // --- MENU ITEMS ---
  async getItems(): Promise<RestaurantItem[]> {
    return this.itemRepo.findAll();
  }

  async createItem(data: any): Promise<RestaurantItem> {
    return this.itemRepo.create(data);
  }

  // --- ORDERS ---
  async getOrders(): Promise<RestaurantOrder[]> {
    return this.orderRepo.findAll();
  }

  async getOrderById(id: number): Promise<RestaurantOrder> {
    const order = await this.orderRepo.findById(id);
    if (!order) throw new NotFoundError('Commande introuvable');
    return order;
  }

  async createOrder(data: { items: { itemId: number, quantity: number }[], folioId?: number, status?: any }): Promise<RestaurantOrder> {
    return executeInTransaction(async (tx) => {
      // ✅ Sprint 6 — Récupérer tous les articles en UNE SEULE requête (évite N+1)
      const itemIds = data.items.map(i => i.itemId);
      const menuItems = await tx.restaurantItem.findMany({
        where: { id: { in: itemIds }, deletedAt: null, isAvailable: true }
      });

      // Vérifier que tous les articles demandés existent et sont disponibles
      if (menuItems.length !== itemIds.length) {
        const foundIds = new Set(menuItems.map(i => i.id));
        const missingId = itemIds.find(id => !foundIds.has(id));
        throw new NotFoundError(`L'article ${missingId} est indisponible ou introuvable`);
      }

      // Construire un Map pour accès O(1)
      const menuItemMap = new Map(menuItems.map(item => [item.id, item]));

      let totalAmount = 0;
      const orderItemsData = [];

      for (const orderItem of data.items) {
        const item = menuItemMap.get(orderItem.itemId)!;
        const price = Number(item.price);
        totalAmount += price * orderItem.quantity;

        orderItemsData.push({
          itemId: item.id,
          quantity: orderItem.quantity,
          priceAtTime: price
        });
      }

      // Check folio if status is BILLED_TO_ROOM
      if (data.status === 'BILLED_TO_ROOM') {
        if (!data.folioId) throw new BusinessRuleError('Un folioId est requis pour facturer sur la chambre');
        
        const folio = await tx.folio.findUnique({ where: { id: data.folioId } });
        if (!folio) throw new NotFoundError('Folio introuvable');
        if (folio.status === 'CLOSED') throw new BusinessRuleError('Impossible de facturer sur un Folio fermé');

        // Add FolioItem
        await tx.folioItem.create({
          data: {
            folioId: folio.id,
            description: `Commande Restaurant POS`,
            amount: totalAmount,
            quantity: 1
          }
        });

        // ✅ Sprint 3 — Mise à jour atomique du solde du Folio
        await tx.folio.update({
          where: { id: folio.id },
          data: { balance: { increment: totalAmount } }
        });
      }

      // Create Order
      const order = await tx.restaurantOrder.create({
        data: {
          totalAmount,
          status: data.status || 'PENDING',
          folioId: data.folioId || null,
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });

      return order;
    });
  }
}
