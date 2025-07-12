import { sql, type Article } from "@/lib/database"
import { articles } from "@/lib/schema"
import { eq } from "drizzle-orm"

export class ArticleService {
  constructor(private db: typeof sql) {}

  async getAllArticles(): Promise<Article[]> {
    try {
      const result = await this.db.query.articles.findMany()
      return result as Article[]
    } catch (error) {
      console.error("Error fetching all articles:", error)
      return []
    }
  }

  async getArticleById(id: string): Promise<Article | null> {
    try {
      const result = await this.db.query.articles.findFirst({
        where: eq(articles.id, id),
      })
      return result as Article | null
    } catch (error) {
      console.error(`Error fetching article with ID ${id}:`, error)
      return null
    }
  }

  async createArticle(data: Omit<Article, "id" | "createdAt" | "updatedAt">): Promise<Article | null> {
    try {
      const [newArticle] = await this.db
        .insert(articles)
        .values({
          ...data,
          id: crypto.randomUUID(), // Generate UUID for new article
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return newArticle as Article
    } catch (error) {
      console.error("Error creating article:", error)
      return null
    }
  }

  async updateArticle(id: string, data: Partial<Omit<Article, "id" | "createdAt">>): Promise<Article | null> {
    try {
      const [updatedArticle] = await this.db
        .update(articles)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(articles.id, id))
        .returning()
      return updatedArticle as Article
    } catch (error) {
      console.error(`Error updating article with ID ${id}:`, error)
      return null
    }
  }

  async deleteArticle(id: string): Promise<boolean> {
    try {
      const result = await this.db.delete(articles).where(eq(articles.id, id)).returning({ id: articles.id })
      return result.length > 0
    } catch (error) {
      console.error(`Error deleting article with ID ${id}:`, error)
      return false
    }
  }
}

// Export an instance of the service
export const articleService = new ArticleService(sql)

// Function to get only published articles
export async function getPublishedArticles(
  page = 1,
  limit = 10,
): Promise<{ articles: Article[]; total: number; hasMore: boolean }> {
  try {
    const offset = (page - 1) * limit
    const publishedArticles = await sql.query.articles.findMany({
      where: eq(articles.isPublished, true),
      limit: limit,
      offset: offset,
      orderBy: (articles, { desc }) => [desc(articles.publishedAt)],
    })

    const totalResult = await sql.select({ count: sql.fn.count() }).from(articles).where(eq(articles.isPublished, true))
    const total = totalResult[0]?.count || 0
    const hasMore = page * limit < total

    return {
      articles: publishedArticles as Article[],
      total,
      hasMore,
    }
  } catch (error) {
    console.error("Error fetching published articles:", error)
    return { articles: [], total: 0, hasMore: false }
  }
}
