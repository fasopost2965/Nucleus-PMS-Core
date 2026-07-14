import { RoomRepository } from '../repositories/room.repository';
import { RoomCategoryRepository } from '../repositories/roomCategory.repository';
import { BusinessRuleError, NotFoundError, ConflictError } from '../utils/errors';
import { Room, RoomCategory, RoomStatus } from '@prisma/client';

// DTOs avec number au lieu de Decimal pour compatibilité avec les données JSON/Zod
export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  basePrice?: number;
  capacity?: number;
}

export interface UpdateRoomDto {
  number?: string;
  floor?: string;
  categoryId?: number;
  status?: RoomStatus;
}

export class RoomService {
  private roomRepo: RoomRepository;
  private categoryRepo: RoomCategoryRepository;

  constructor() {
    this.roomRepo = new RoomRepository();
    this.categoryRepo = new RoomCategoryRepository();
  }

  // --- Categories ---
  async getCategories(): Promise<RoomCategory[]> {
    return this.categoryRepo.findAll();
  }

  async createCategory(data: any): Promise<RoomCategory> {
    return this.categoryRepo.create(data);
  }

  async updateCategory(id: number, data: UpdateCategoryDto): Promise<RoomCategory> {
    const cat = await this.categoryRepo.findById(id);
    if (!cat) throw new NotFoundError('Catégorie introuvable');
    return this.categoryRepo.update(id, data as any);
  }

  async deleteCategory(id: number, userId: number): Promise<void> {
    const cat = await this.categoryRepo.findById(id);
    if (!cat) throw new NotFoundError('Catégorie introuvable');

    const roomsCount = await this.roomRepo.countByCategoryId(id);
    if (roomsCount > 0) {
      throw new BusinessRuleError('Impossible de supprimer une catégorie contenant des chambres', 'CATEGORY_HAS_ROOMS');
    }

    await this.categoryRepo.softDelete(id, userId);
  }

  // --- Rooms ---
  async getRooms(): Promise<Room[]> {
    return this.roomRepo.findAll();
  }

  async createRoom(data: any): Promise<Room> {
    const existingRoom = await this.roomRepo.findByNumber(data.number);
    if (existingRoom) {
      throw new ConflictError('Ce numéro de chambre existe déjà');
    }

    const category = await this.categoryRepo.findById(data.categoryId);
    if (!category) {
      throw new NotFoundError('Catégorie introuvable');
    }

    return this.roomRepo.create(data);
  }

  async updateRoom(id: number, data: UpdateRoomDto): Promise<Room> {
    const room = await this.roomRepo.findById(id);
    if (!room) throw new NotFoundError('Chambre introuvable');

    if (data.number && data.number !== room.number) {
      const existingRoom = await this.roomRepo.findByNumber(data.number);
      if (existingRoom) {
        throw new ConflictError('Ce numéro de chambre existe déjà');
      }
    }

    if (data.categoryId && data.categoryId !== room.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) {
        throw new NotFoundError('Catégorie introuvable');
      }
    }

    return this.roomRepo.update(id, data as any);
  }

  async changeRoomStatus(id: number, status: RoomStatus): Promise<Room> {
    const room = await this.roomRepo.findById(id);
    if (!room) throw new NotFoundError('Chambre introuvable');
    
    // Règle métier : seule la réservation ou le check-in peut mettre à OCCUPIED ou RESERVED
    // Pour le moment on autorise la modif directe pour le MVP si c'est pour MAINTENANCE ou AVAILABLE
    if (status === 'OCCUPIED' || status === 'RESERVED') {
      // Dans une V2 on bloquera ici pour forcer de passer par la réservation
    }

    return this.roomRepo.update(id, { status });
  }

  async deleteRoom(id: number, userId: number): Promise<void> {
    const room = await this.roomRepo.findById(id);
    if (!room) throw new NotFoundError('Chambre introuvable');

    if (room.status === 'OCCUPIED' || room.status === 'RESERVED') {
      throw new BusinessRuleError('Impossible de supprimer une chambre occupée ou réservée', 'ROOM_NOT_AVAILABLE');
    }

    await this.roomRepo.softDelete(id, userId);
  }
}
