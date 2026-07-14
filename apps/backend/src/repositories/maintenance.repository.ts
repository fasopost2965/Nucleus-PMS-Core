import { BaseRepository } from './base.repository';
import { MaintenanceTicket } from '@prisma/client';

export class MaintenanceRepository extends BaseRepository<MaintenanceTicket> {
  async findAll(): Promise<MaintenanceTicket[]> {
    return this.db.maintenanceTicket.findMany({
      include: { room: true, assignee: true }
    });
  }

  async findById(id: number): Promise<MaintenanceTicket | null> {
    return this.db.maintenanceTicket.findUnique({
      where: { id },
      include: { room: true, assignee: true }
    });
  }

  async create(data: Omit<MaintenanceTicket, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenanceTicket> {
    return this.db.maintenanceTicket.create({ data });
  }

  async update(id: number, data: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> {
    return this.db.maintenanceTicket.update({ where: { id }, data });
  }

  async softDelete(id: number, userId: number): Promise<MaintenanceTicket> {
    throw new Error('Les tickets de maintenance ne peuvent pas être supprimés');
  }
}
