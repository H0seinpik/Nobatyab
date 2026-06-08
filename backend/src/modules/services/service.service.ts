import { ApiError, parsePagination, paginationMeta } from "../../shared/utils/apiError.js";
import { serviceRepository } from "./service.repository.js";

export class ServiceCatalogService {
  private repo = serviceRepository;

  async listPublic(query: { categoryId?: string; q?: string; page?: string; limit?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await this.repo.findMany({
      categoryId: query.categoryId,
      q: query.q,
      activeOnly: true,
      skip,
      take: limit,
    });
    return { items, meta: paginationMeta(page, limit, total) };
  }

  async listAdmin(query: { categoryId?: string; q?: string; page?: string; limit?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await this.repo.findMany({
      categoryId: query.categoryId,
      q: query.q,
      activeOnly: false,
      skip,
      take: limit,
    });
    return { items, meta: paginationMeta(page, limit, total) };
  }

  async getById(id: string) {
    const service = await this.repo.findById(id);
    if (!service || !service.isActive) throw ApiError.notFound("Service not found");
    return service;
  }

  create(input: {
    categoryId: string;
    name: string;
    description?: string;
    defaultDuration: number;
    basePrice: number;
    isActive?: boolean;
  }) {
    return this.repo.create(input);
  }

  async update(
    id: string,
    input: Partial<{
      categoryId: string;
      name: string;
      description: string;
      defaultDuration: number;
      basePrice: number;
      isActive: boolean;
    }>,
  ) {
    const existing = await this.repo.findById(id);
    if (!existing) throw ApiError.notFound("Service not found");
    return this.repo.update(id, input);
  }

  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw ApiError.notFound("Service not found");
    await this.repo.delete(id);
    return { message: "Service deleted" };
  }
}

export const serviceCatalogService = new ServiceCatalogService();
