import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CategoryListOptions {
  limit?: number;
  offset?: number;
  search?: string;
  includeArticleCount?: boolean;
}

/**
 * Generuje URL-friendly slug z názvu kategorie.
 * @param name Název kategorie
 * @returns Vygenerovaný slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Normalizace diakritiky
    .replace(/[\u0300-\u036f]/g, '') // Odstranění diakritiky
    .replace(/[^a-z0-9]+/g, '-') // Nahrazení nealfanumerických znaků pomlčkou
    .replace(/^-+|-+$/g, '') // Odstranění pomlček na začátku a konci
    .trim();
}

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
    parent_id?: string,
    slug?: string // Přidáno volitelné pole slug - pokud není zadáno, bude vygenerováno automaticky
  }) {
    try {
      // Připravíme data pro vytvoření kategorie
      const createData = {
        name: data.name,
        slug: data.slug || generateSlug(data.name), // Použijeme zadaný slug nebo vygenerujeme nový
        description: data.description,
        color: data.color,
        display_order: data.display_order,
        is_active: data.is_active,
        parent_id: data.parent_id
      };

      return await prisma.category.create({
        data: createData,
      });
      
    } catch (error) {
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
      
      if (data.name !== undefined) {
        updateData.name = data.name;
        // Pokud se změní název, aktualizujeme i slug
        updateData.slug = generateSlug(data.name);
      }
      
      if (data.description !== undefined) {
        updateData.description = data.description;
      }
      
      if (data.color !== undefined) {
        updateData.color = data.color;
      }
      
      if (data.display_order !== undefined) {
        updateData.display_order = data.display_order;
      }
      
      if (data.is_active !== undefined) {
        updateData.is_active = data.is_active;
      }
      
      if (data.parent_id !== undefined) {
        updateData.parent_id = data.parent_id;
      }
      
      return await prisma.category.update({
        where: { id },
        data: updateData,
      });
      
    } catch (error) {
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
      return 0;
    }
  }
}

export const categoryService = new CategoryService();
