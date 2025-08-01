import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/* -------------------------------------------------------------------------- */
/*                            Interface a typy                                */
/* -------------------------------------------------------------------------- */

export interface ArticleListOptions {
  limit?: number;
  offset?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  search?: string;
  category?: string;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId: string;
  authorId: string;
  tags?: string[];
  imageUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date | null;
}

export interface UpdateArticleInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  imageUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: Date | null;
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
      return await prisma.article.create({
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
      
    } catch (error) {
      console.error("Error creating article:", error);
      throw new Error("Failed to create article");
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
    status: 'PUBLISHED'
  });
  
  const total = await articleService.getTotalArticleCount({
    status: 'PUBLISHED'
  });
  
  // Určíme, zda existují další stránky
  const hasMore = (page * limit) < total;
  
  return { articles, total, hasMore };
}
