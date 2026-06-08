import { ApiError } from "../../shared/utils/apiError.js";
import { categoryRepository } from "./category.repository.js";

export class CategoryService {
  private repo = categoryRepository;

  listPublic() {
    return this.repo.findMany(true);
  }

  listAdmin() {
    return this.repo.findMany(false);
  }

  async create(input: { name: string; slug: string; description?: string; isActive?: boolean }) {
    try {
      return await this.repo.create(input);
    } catch {
      throw ApiError.conflict("Category slug already exists");
    }
  }

  async update(id: string, input: Partial<{ name: string; slug: string; description: string; isActive: boolean }>) {
    const existing = await this.repo.findById(id);
    if (!existing) throw ApiError.notFound("Category not found");
    try {
      return await this.repo.update(id, input);
    } catch {
      throw ApiError.conflict("Category slug already exists");
    }
  }

  async remove(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw ApiError.notFound("Category not found");
    await this.repo.delete(id);
    return { message: "Category deleted" };
  }
}

export const categoryService = new CategoryService();
