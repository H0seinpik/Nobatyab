import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database.js";

export class ServiceRepository {
  findMany(filters: {
    where?: Prisma.ServiceWhereInput;
    orderBy?: Prisma.ServiceOrderByWithRelationInput | Prisma.ServiceOrderByWithRelationInput[];
    skip?: number;
    take?: number;
    categoryId?: string;
    q?: string;
    activeOnly?: boolean;
  }) {
    const legacyWhere: Prisma.ServiceWhereInput = {
      ...(filters.activeOnly ? { isActive: true } : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q, mode: "insensitive" as const } },
              { description: { contains: filters.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const where = filters.where
      ? Object.keys(legacyWhere).length
        ? { AND: [filters.where, legacyWhere] }
        : filters.where
      : legacyWhere;

    return Promise.all([
      prisma.service.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: filters.orderBy ?? { name: "asc" },
        include: { category: true },
      }),
      prisma.service.count({ where }),
    ]);
  }

  findById(id: string) {
    return prisma.service.findUnique({ where: { id }, include: { category: true } });
  }

  create(data: {
    categoryId: string;
    name: string;
    description?: string;
    defaultDuration: number;
    basePrice: number;
    isActive?: boolean;
  }) {
    return prisma.service.create({ data, include: { category: true } });
  }

  update(
    id: string,
    data: Partial<{
      categoryId: string;
      name: string;
      description: string;
      defaultDuration: number;
      basePrice: number;
      isActive: boolean;
    }>,
  ) {
    return prisma.service.update({ where: { id }, data, include: { category: true } });
  }

  delete(id: string) {
    return prisma.service.delete({ where: { id } });
  }
}

export const serviceRepository = new ServiceRepository();
