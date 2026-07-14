import { GuestRepository } from '../repositories/guest.repository';
import { NotFoundError, ConflictError } from '../utils/errors';
import { Guest } from '@prisma/client';

export class GuestService {
  private guestRepo: GuestRepository;

  constructor() {
    this.guestRepo = new GuestRepository();
  }

  async getGuests(): Promise<Guest[]> {
    return this.guestRepo.findAll();
  }

  async getGuestById(id: number): Promise<Guest> {
    const guest = await this.guestRepo.findById(id);
    if (!guest) throw new NotFoundError('Client introuvable');
    return guest;
  }

  async createGuest(data: any): Promise<Guest> {
    // Check if guest with same email or phone exists (optional, could just be a warning, but let's enforce unique if provided)
    if (data.email || data.phone) {
      const existing = await this.guestRepo.findByEmailOrPhone(data.email, data.phone);
      if (existing) {
        throw new ConflictError('Un client avec cet email ou ce téléphone existe déjà');
      }
    }
    return this.guestRepo.create(data);
  }

  async updateGuest(id: number, data: Partial<Guest>): Promise<Guest> {
    const guest = await this.guestRepo.findById(id);
    if (!guest) throw new NotFoundError('Client introuvable');

    if ((data.email && data.email !== guest.email) || (data.phone && data.phone !== guest.phone)) {
      const existing = await this.guestRepo.findByEmailOrPhone(data.email || undefined, data.phone || undefined);
      if (existing && existing.id !== id) {
        throw new ConflictError('Un autre client utilise déjà cet email ou ce téléphone');
      }
    }

    return this.guestRepo.update(id, data);
  }

  async deleteGuest(id: number, userId: number): Promise<void> {
    const guest = await this.guestRepo.findById(id);
    if (!guest) throw new NotFoundError('Client introuvable');
    await this.guestRepo.softDelete(id, userId);
  }
}
