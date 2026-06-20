import { ApiError, parsePagination, paginationMeta } from "../../shared/utils/apiError.js";
import { publicProviderRepository } from "./provider.repository.js";

export class PublicProviderService {
  private repo = publicProviderRepository;

  async listPublic(query: {
    serviceId?: string;
    categoryId?: string;
    q?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    page?: string;
    limit?: string;
  }) {
    const { page, limit, skip } = parsePagination(query);
    const [items, total] = await this.repo.findMany({
      serviceId: query.serviceId,
      categoryId: query.categoryId,
      q: query.q,
      lat: query.lat,
      lng: query.lng,
      radiusKm: query.radiusKm,
      skip,
      take: limit,
    });
    return { items, meta: paginationMeta(page, limit, total) };
  }

  async getById(id: string) {
    const provider = await this.repo.findById(id);
    if (!provider) throw ApiError.notFound("Provider not found");
    return provider;
  }
}

export const publicProviderService = new PublicProviderService();
