import { ApiError } from "../../shared/utils/apiError.js";
import { userAvailabilityRepository } from "./user-availability.repository.js";
import type { replaceAvailabilitySchema } from "./user-availability.schema.js";
import type { z } from "zod";

type ReplaceInput = z.infer<typeof replaceAvailabilitySchema>;

export class UserAvailabilityService {
  private repo = userAvailabilityRepository;

  getForUser(userId: string) {
    return this.repo.findByUserId(userId);
  }

  replaceForUser(userId: string, input: ReplaceInput) {
    return this.repo.replaceAll(userId, input.entries);
  }

  async deleteForUser(userId: string, id: string) {
    const existing = await this.repo.findByIdForUser(userId, id);
    if (!existing) throw ApiError.notFound("Availability entry not found");

    await this.repo.deleteById(userId, id);
    return this.repo.findByUserId(userId);
  }
}

export const userAvailabilityService = new UserAvailabilityService();
