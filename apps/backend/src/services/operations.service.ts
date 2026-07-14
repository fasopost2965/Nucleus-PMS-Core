import { MaintenanceRepository } from '../repositories/maintenance.repository';
import { RoomRepository } from '../repositories/room.repository';
import { NotFoundError } from '../utils/errors';
import { MaintenanceTicket, Room, CleaningStatus } from '@prisma/client';

export class OperationsService {
  private maintenanceRepo: MaintenanceRepository;
  private roomRepo: RoomRepository;

  constructor() {
    this.maintenanceRepo = new MaintenanceRepository();
    this.roomRepo = new RoomRepository();
  }

  // --- HOUSEKEEPING ---
  async updateRoomCleaningStatus(roomId: number, status: CleaningStatus): Promise<Room> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new NotFoundError('Chambre introuvable');

    return this.roomRepo.update(roomId, { cleaningStatus: status });
  }

  // --- MAINTENANCE ---
  async getMaintenanceTickets(): Promise<MaintenanceTicket[]> {
    return this.maintenanceRepo.findAll();
  }

  async getMaintenanceTicketById(id: number): Promise<MaintenanceTicket> {
    const ticket = await this.maintenanceRepo.findById(id);
    if (!ticket) throw new NotFoundError('Ticket de maintenance introuvable');
    return ticket;
  }

  async createMaintenanceTicket(data: any): Promise<MaintenanceTicket> {
    const room = await this.roomRepo.findById(data.roomId);
    if (!room) throw new NotFoundError('Chambre introuvable');

    return this.maintenanceRepo.create(data);
  }

  async updateMaintenanceTicket(id: number, data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    const ticket = await this.maintenanceRepo.findById(id);
    if (!ticket) throw new NotFoundError('Ticket de maintenance introuvable');

    return this.maintenanceRepo.update(id, data);
  }
}
