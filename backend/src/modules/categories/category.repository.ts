import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";

export class CategoryRepository {
  findMany(activeOnly = false) {
    return prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { name: "asc" },
      include: { _count: { select: { services: true } } },
    });
  }

  findManyPaginated(filters: {
    where?: Prisma.CategoryWhereInput;
    orderBy?: Prisma.CategoryOrderByWithRelationInput | Prisma.CategoryOrderByWithRelationInput[];
    skip?: number;
    take?: number;
  }) {
    const where = filters.where ?? {};
    return Promise.all([
      prisma.category.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.orderBy ?? { name: "asc" },
        include: { _count: { select: { services: true } } },
      }),
      prisma.category.count({ where }),
    ]);
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
