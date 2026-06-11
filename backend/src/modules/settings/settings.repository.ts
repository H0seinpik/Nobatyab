import { prisma } from "../../config/database.js";

export class SettingsRepository {
  findAll() {
    return prisma.appSetting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
  }

  findByKeys(keys: string[]) {
    return prisma.appSetting.findMany({ where: { key: { in: keys } } });
  }

  upsertMany(items: { key: string; value: string }[]) {
    return prisma.$transaction(
      items.map((item) =>
        prisma.appSetting.update({
          where: { key: item.key },
          data: { value: item.value },
        }),
      ),
    );
  }
}

export const settingsRepository = new SettingsRepository();
