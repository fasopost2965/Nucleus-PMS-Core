import { BaseRepository } from './base.repository';
import { Settings } from '@prisma/client';

export class SettingsRepository extends BaseRepository<Settings> {
  async getSettings(): Promise<Settings | null> {
    // Dans le cadre du MVP (1 seul hôtel), on récupère les paramètres de l'hôtel 1
    return this.db.settings.findFirst({
      where: { hotelId: 1 }
    });
  }

  async updateSettings(data: Partial<Settings>): Promise<Settings> {
    return this.db.settings.update({
      where: { hotelId: 1 },
      data
    });
  }
}
