import { sql } from "@/lib/database"
import type { Article } from "@/lib/types"

export class ArticleService {
  async getAllArticles(): Promise<Article[]> {
    try {
      const articles = await sql<Article[]>`SELECT * FROM articles ORDER BY created_at DESC;`
      return articles
    } catch (error) {
      console.error("Error fetching all articles:", error)
      throw new Error("Failed to fetch articles.")
    }
  }

  async getArticleById(id: string): Promise<Article | null> {
    try {
      const [article] = await sql<Article[]>`SELECT * FROM articles WHERE id = ${id};`
      return article || null
    } catch (error) {
      console.error(`Error fetching article with ID ${id}:`, error)
      throw new Error(`Failed to fetch article with ID ${id}.`)
    }
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const [article] = await sql<Article[]>`SELECT * FROM articles WHERE slug = ${slug};`
      return article || null
    } catch (error) {
      console.error(`Error fetching article with slug ${slug}:`, error)
      throw new Error(`Failed to fetch article with slug ${slug}.`)
    }
  }

  async createArticle(articleData: Omit<Article, "id" | "created_at" | "updated_at">): Promise<Article> {
    try {
      const [newArticle] = await sql<Article[]>`
        INSERT INTO articles (title, slug, content, category_id, published_at, author_id, status, seo_title, seo_description, featured_image_url, tags)
        VALUES (${articleData.title}, ${articleData.slug}, ${articleData.content}, ${articleData.category_id}, ${articleData.published_at}, ${articleData.author_id}, ${articleData.status}, ${articleData.seo_title}, ${articleData.seo_description}, ${articleData.featured_image_url}, ${JSON.stringify(articleData.tags)})
        RETURNING *;
      `
      return newArticle
    } catch (error) {
      console.error("Error creating article:", error)
      throw new Error("Failed to create article.")
    }
  }

  async updateArticle(
    id: string,
    articleData: Partial<Omit<Article, "id" | "created_at" | "updated_at">>,
  ): Promise<Article | null> {
    try {
      const [updatedArticle] = await sql<Article[]>`
        UPDATE articles
        SET
          title = COALESCE(${articleData.title}, title),
          slug = COALESCE(${articleData.slug}, slug),
          content = COALESCE(${articleData.content}, content),
          category_id = COALESCE(${articleData.category_id}, category_id),
          published_at = COALESCE(${articleData.published_at}, published_at),
          author_id = COALESCE(${articleData.author_id}, author_id),
          status = COALESCE(${articleData.status}, status),
          seo_title = COALESCE(${articleData.seo_title}, seo_title),
          seo_description = COALESCE(${articleData.seo_description}, seo_description),
          featured_image_url = COALESCE(${articleData.featured_image_url}, featured_image_url),
          tags = COALESCE(${articleData.tags ? JSON.stringify(articleData.tags) : undefined}, tags),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
      return updatedArticle || null
    } catch (error) {
      console.error(`Error updating article with ID ${id}:`, error)
      throw new Error(`Failed to update article with ID ${id}.`)
    }
  }

  async deleteArticle(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM articles WHERE id = ${id};`
      return result.count > 0
    } catch (error) {
      console.error(`Error deleting article with ID ${id}:`, error)
      throw new Error(`Failed to delete article with ID ${id}.`)
    }
  }

  async getPublishedArticles(): Promise<Article[]> {
    try {
      const articles = await sql<
        Article[]
      >`SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC;`
      return articles
    } catch (error) {
      console.error("Error fetching published articles:", error)
      throw new Error("Failed to fetch published articles.")
    }
  }

  async getDraftArticles(): Promise<Article[]> {
    try {
      const articles = await sql<Article[]>`SELECT * FROM articles WHERE status = 'draft' ORDER BY created_at DESC;`
      return articles
    } catch (error) {
      console.error("Error fetching draft articles:", error)
      throw new Error("Failed to fetch draft articles.")
    }
  }

  async bulkDeleteArticles(ids: string[]): Promise<number> {
    try {
      const result = await sql`DELETE FROM articles WHERE id IN (${sql.array(ids)});`
      return result.count
    } catch (error) {
      console.error("Error bulk deleting articles:", error)
      throw new Error("Failed to bulk delete articles.")
    }
  }

  async bulkUpdateArticleStatus(ids: string[], status: "draft" | "published" | "archived"): Promise<number> {
    try {
      const result = await sql`
        UPDATE articles
        SET status = ${status}, updated_at = NOW()
        WHERE id IN (${sql.array(ids)});
      `
      return result.count
    } catch (error) {
      console.error(`Error bulk updating article status to ${status}:`, error)
      throw new Error(`Failed to bulk update article status to ${status}.`)
    }
  }
}

export const articleService = new ArticleService()
