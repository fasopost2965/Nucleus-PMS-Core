import { SettingsRepository } from '../repositories/settings.repository';
import { NotFoundError } from '../utils/errors';
import { Settings } from '@prisma/client';

// DTO avec number au lieu de Decimal pour compatibilité avec les données JSON/Zod
export interface UpdateSettingsDto {
  currency?: string;
  timezone?: string;
  vatRate?: number;
  tourismTaxRate?: number;
  invoicePrefix?: string;
}

export class SettingsService {
  private settingsRepository: SettingsRepository;

  constructor() {
    this.settingsRepository = new SettingsRepository();
  }

  async getSettings(): Promise<Settings> {
    const settings = await this.settingsRepository.getSettings();
    if (!settings) {
      throw new NotFoundError('Paramètres non trouvés');
    }
    return settings;
  }

  async updateSettings(data: UpdateSettingsDto): Promise<Settings> {
    // Vérifier si les paramètres existent
    await this.getSettings();
    return this.settingsRepository.updateSettings(data as any);
  }
}
