import { prisma } from '../../lib/prisma.js';
import type { AppSettingsConfig } from './admin-settings.schema.js';

const SINGLETON_ID = 'singleton';

const DEFAULT_CONFIG: AppSettingsConfig = {
  maintenanceMode: false,
  maintenanceMessage: 'Sistema em manutenção. Voltaremos em breve.',
  newRegistrationsEnabled: true,
  defaultPlanSlug: 'free',
  aiGloballyEnabled: true,
};

export class AdminSettingsService {
  async get() {
    const settings = await prisma.appSettings.findUnique({ where: { id: SINGLETON_ID } });

    if (!settings) {
      return { config: DEFAULT_CONFIG };
    }

    return { config: { ...DEFAULT_CONFIG, ...(settings.config as AppSettingsConfig) } };
  }

  async update(data: AppSettingsConfig) {
    const current = await this.get();
    const merged = { ...current.config, ...data };

    const settings = await prisma.appSettings.upsert({
      where: { id: SINGLETON_ID },
      update: { config: merged },
      create: { id: SINGLETON_ID, config: merged },
    });

    return { config: settings.config as AppSettingsConfig };
  }
}
