import { ApiError } from "../../shared/utils/apiError.js";
import { settingsRepository } from "./settings.repository.js";
import { PUBLIC_SETTING_KEYS, type UpdateSettingsInput } from "./settings.schema.js";

export class SettingsService {
  private repo = settingsRepository;

  async listAdmin() {
    const settings = await this.repo.findAll();
    const grouped = settings.reduce<Record<string, typeof settings>>((acc, s) => {
      if (!acc[s.group]) acc[s.group] = [];
      acc[s.group].push(s);
      return acc;
    }, {});
    return { settings, grouped };
  }

  async updateBulk(input: UpdateSettingsInput) {
    const existing = await this.repo.findAll();
    const keys = new Set(existing.map((s) => s.key));
    for (const item of input.settings) {
      if (!keys.has(item.key)) throw ApiError.badRequest(`Unknown setting key: ${item.key}`);
    }
    return this.repo.upsertMany(input.settings);
  }

  async getPublic() {
    const settings = await this.repo.findByKeys([...PUBLIC_SETTING_KEYS]);
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }
}

export const settingsService = new SettingsService();
