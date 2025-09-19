import { PrismaClient } from '@prisma/client';
import { ArticleListOptions, CreateArticleInput, UpdateArticleInput, ArticleStatus } from '@/types/cms';

// Singleton instance pro celý projekt
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Prevent multiple instances of Prisma Client in development
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

/* -------------------------------------------------------------------------- */
/*                        Hlavní třída pro práci s články                     */
/* -------------------------------------------------------------------------- */

export class ArticleService {
  /**
   * Získá seznam článků s možností filtrování a stránkování.
   */
  async getArticles(options: ArticleListOptions = {}) {
    try {
      const { limit = 10, offset = 0, status, search, category } = options;
      
      const whereClause: any = {};
      
      if (category && category !== "all") {
        whereClause.categoryId = category;
      }
      
      if (status) {
        whereClause.status = status;
      }
      
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      return await prisma.article.findMany({
        where: whereClause,
        include: {
          author: true,
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });
      
    } catch (error) {
      console.error("Error getting articles:", error);
      throw new Error("Failed to fetch articles");
    }
  }

  /**
   * Získá celkový počet článků s možností filtrování.
   */
  async getTotalArticleCount(options: { 
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    search?: string;
    category?: string;
  } = {}): Promise<number> {
    try {
      const { status, search, category } = options;
      
      const whereClause: any = {};
      
      if (category && category !== "all") {
        whereClause.categoryId = category;
      }
      
      if (status) {
        whereClause.status = status;
      }
      
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }
      
      return await prisma.article.count({
        where: whereClause,
      });
      
    } catch (error) {
      console.error("Error getting total article count:", error);
      return 0;
    }
  }

  /**
   * Získá článek podle ID.
   */
  async getArticleById(id: string) {
    try {
      return await prisma.article.findUnique({
        where: { id },
        include: {
          author: true,
          category: true,
        },
      });
      
    } catch (error) {
      console.error(`Error getting article with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Vytvoří nový článek.
   */
  async createArticle(input: CreateArticleInput) {
    try {
      console.log("Creating article with input:", JSON.stringify(input, null, 2));
      
      // Validace vstupních dat
      if (!input.title) throw new Error("Title is required");
      if (!input.content) throw new Error("Content is required");
      if (!input.categoryId) throw new Error("Category ID is required");
      if (!input.authorId) throw new Error("Author ID is required");
      
      // Vytvoření článku
      const result = await prisma.article.create({
        data: {
          title: input.title,
          slug: input.slug,
          content: input.content,
          excerpt: input.excerpt,
          categoryId: input.categoryId,
          authorId: input.authorId,
          tags: input.tags || [],
          imageUrl: input.imageUrl,
          status: input.status || 'DRAFT',
          isFeatured: input.isFeatured || false,
          metaTitle: input.metaTitle,
          metaDescription: input.metaDescription,
          publishedAt: input.publishedAt,
        },
        include: {
          author: true,
          category: true,
        },
      });
      
      console.log("Article created successfully:", result);
      return result;
      
    } catch (error) {
      console.error("Error creating article:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      
      // Lepší chybové zprávy
      if (error instanceof Error && 'code' in error) {
        if (error.code === 'P2003') {
          throw new Error("Referenced category or author does not exist");
        } else if (error.code === 'P2002') {
          throw new Error("Article with this slug already exists");
        }
      }
      
      throw error; // Throw original error for other cases
    }
  }

  /**
   * Aktualizuje existující článek.
   */
  async updateArticle(id: string, input: UpdateArticleInput) {
    try {
      return await prisma.article.update({
        where: { id },
        data: input,
        include: {
          author: true,
          category: true,
        },
      });
      
    } catch (error) {
      console.error(`Error updating article with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Smaže článek podle ID.
   */
  async deleteArticle(id: string): Promise<boolean> {
    try {
      await prisma.article.delete({
        where: { id },
      });
      
      return true;
      
    } catch (error) {
      console.error(`Error deleting article with ID ${id}:`, error);
      return false;
    }
  }
}

/* -------------------------------------------------------------------------- */
/*              Singleton + pomocné funkce, které importuje zbytek kódu       */
/* -------------------------------------------------------------------------- */

export const articleService = new ArticleService();

/**
 * Vrátí pouze publikované články s jednoduchou stránkovací logikou.
 */
export async function getPublishedArticles(
  page = 1,
  limit = 10,
) {
  const offset = (page - 1) * limit;
  
  const articles = await articleService.getArticles({
    limit,
    offset,
    status: ArticleStatus.PUBLISHED
  });
  
  const total = await articleService.getTotalArticleCount({
    status: ArticleStatus.PUBLISHED
  });
  
  // Určíme, zda existují další stránky
  const hasMore = (page * limit) < total;
  
  return { articles, total, hasMore };
}
