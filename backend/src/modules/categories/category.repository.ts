import { prisma } from "../../config/database.js";

export class CategoryRepository {
  findMany(activeOnly = false) {
    return prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
      include: { _count: { select: { services: true } } },
    });
  }

  findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }

  create(data: { name: string; slug: string; description?: string; isActive?: boolean }) {
    return prisma.category.create({ data });
  }

  update(id: string, data: Partial<{ name: string; slug: string; description: string; isActive: boolean }>) {
    return prisma.category.update({ where: { id }, data });
  }

  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}

export const categoryRepository = new CategoryRepository();
