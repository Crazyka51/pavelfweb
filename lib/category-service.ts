import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CategoryListOptions {
  limit?: number;
  offset?: number;
  search?: string;
  includeArticleCount?: boolean;
}

export class CategoryService {
  /**
   * Získá seznam kategorií s možností filtrování a stránkování.
   */
  async getCategories(options: CategoryListOptions = {}) {
    try {
      const { limit, offset, search } = options;
      
      const whereClause: any = {};
      
      if (search) {
        whereClause.name = {
          contains: search,
          mode: 'insensitive'
        };
      }
      
      const queryOptions: any = {
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
      };
      
      if (limit) {
        queryOptions.take = limit;
      }
      
      if (offset) {
        queryOptions.skip = offset;
      }
      
      return await prisma.category.findMany(queryOptions);
      
    } catch (error) {
      console.error("Error getting categories:", error);
      throw new Error("Failed to fetch categories");
    }
  }

  /**
   * Získá kategorii podle ID.
   */
  async getCategoryById(id: string) {
    try {
      return await prisma.category.findUnique({
        where: { id },
        include: {
          articles: true,
        },
      });
      
    } catch (error) {
      console.error(`Error getting category with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Vytvoří novou kategorii.
   */
  async createCategory(data: { name: string }) {
    try {
      return await prisma.category.create({
        data: {
          name: data.name,
        },
      });
      
    } catch (error) {
      console.error("Error creating category:", error);
      throw new Error("Failed to create category");
    }
  }

  /**
   * Aktualizuje existující kategorii.
   */
  async updateCategory(id: string, data: { name?: string }) {
    try {
      return await prisma.category.update({
        where: { id },
        data: { name: data.name },
      });
      
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Smaže kategorii podle ID.
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      await prisma.category.delete({
        where: { id },
      });
      
      return true;
      
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Získá celkový počet kategorií.
   */
  async getTotalCategoryCount(options: { search?: string } = {}): Promise<number> {
    try {
      const { search } = options;
      
      const whereClause: any = {};
      
      if (search) {
        whereClause.name = {
          contains: search,
          mode: 'insensitive'
        };
      }
      
      return await prisma.category.count({
        where: whereClause,
      });
      
    } catch (error) {
      console.error("Error getting total category count:", error);
      return 0;
    }
  }
}

export const categoryService = new CategoryService();
