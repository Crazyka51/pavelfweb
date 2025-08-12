import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CategoryListOptions {
  limit?: number;
  offset?: number;
  search?: string;
  includeArticleCount?: boolean;
}

/**
 * Tato funkce by generovala slug z názvu kategorie, ale momentálně není použita,
 * protože pole slug neexistuje v aktuálním schématu databáze.
 * @param name Název kategorie
 * @returns Vygenerovaný slug
 */
// Funkce pro generování slugu byla odstraněna, protože v aktuálním schématu databáze pole slug neexistuje

export class CategoryService {
  /**
   * Získá seznam kategorií s možností filtrování a stránkování.
   */
  async getCategories(options: CategoryListOptions = {}) {
    try {
      const { limit, offset, search, includeArticleCount } = options;
      
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
          createdAt: 'desc' // Použijeme pouze dostupné pole pro řazení
        },
      };
      
      if (limit) {
        queryOptions.take = limit;
      }
      
      if (offset) {
        queryOptions.skip = offset;
      }
      
      if (includeArticleCount) {
        queryOptions.include = {
          articles: {
            select: {
              id: true
            }
          }
        };
        
        // Získáme kategorie s články
        const categoriesWithArticles = await prisma.category.findMany(queryOptions);
        
        // Transformujeme výsledky a přidáme počet článků
        return categoriesWithArticles.map((category: any) => {
          const { articles, ...rest } = category;
          return {
            ...rest,
            articleCount: articles ? articles.length : 0
          };
        });
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
  async createCategory(data: { 
    name: string, 
    description?: string,
    color?: string,
    display_order?: number,
    is_active?: boolean,
    parent_id?: string
  }) {
    try {
      // V aktuálním schématu databáze máme pouze pole name
      return await prisma.category.create({
        data: {
          name: data.name,
          // Další pole nejsou v databázi k dispozici, takže je nepoužíváme
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
  async updateCategory(id: string, data: { 
    name?: string,
    description?: string,
    color?: string,
    display_order?: number,
    is_active?: boolean,
    parent_id?: string
  }) {
    try {
      const updateData: any = {};
      
      // V aktuálním schématu databáze máme pouze pole name
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      
      // Ostatní pole nejsou v databázi k dispozici
      
      return await prisma.category.update({
        where: { id },
        data: updateData,
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
