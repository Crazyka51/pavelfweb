import { sql } from "@/lib/database"
import type { Article } from "@/lib/types"

/* -------------------------------------------------------------------------- */
/*                          Mapování DB <-> JS                                */
/* -------------------------------------------------------------------------- */

type DbArticle = {
  id: string
  title: string
  content: string
  excerpt: string | null
  category: string
  tags: string[]
  published: boolean
  image_url: string | null
  published_at: Date | null
  created_at: Date
  updated_at: Date
  created_by: string
}

function mapDbToArticle(row: DbArticle): Article {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt,
    category: row.category,
    tags: row.tags,
    published: row.published,
    imageUrl: row.image_url,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  }
}

/* -------------------------------------------------------------------------- */
/*                            Service třída                                   */
/* -------------------------------------------------------------------------- */

export class ArticleService {
  /* ---- veřejné metody ---------------------------------------------------- */

  async getArticles(
    opts: {
      limit?: number
      offset?: number
      category?: string
      published?: boolean
      search?: string
    } = {},
  ): Promise<Article[]> {
    const { limit, offset, category, published, search } = opts

    // Dynamicky skládáme WHERE podmínky
    const whereParts: string[] = []
    const params: any[] = []
    let p = 1

    if (category && category !== "all") {
      whereParts.push(`category = $${p++}`)
      params.push(category)
    }
    if (published !== undefined) {
      whereParts.push(`published = $${p++}`)
      params.push(published)
    }
    if (search) {
      whereParts.push(`(title ILIKE $${p} OR content ILIKE $${p} OR tags::text ILIKE $${p})`)
      params.push(`%${search}%`)
      p++
    }

    let query = `SELECT * FROM articles`
    if (whereParts.length) {
      query += ` WHERE ${whereParts.join(" AND ")}`
    }
    query += ` ORDER BY created_at DESC`
    if (limit !== undefined) {
      query += ` LIMIT $${p++}`
      params.push(limit)
    }
    if (offset !== undefined) {
      query += ` OFFSET $${p++}`
      params.push(offset)
    }

    const rows = (await sql(query, params)) as DbArticle[]
    return rows.map(mapDbToArticle)
  }

  async getArticleById(id: string): Promise<Article | null> {
    const rows = (await sql(`SELECT * FROM articles WHERE id = $1 LIMIT 1`, [id])) as DbArticle[]
    return rows.length ? mapDbToArticle(rows[0]) : null
  }

  async createArticle(articleData: Omit<Article, "id" | "createdAt" | "updatedAt">): Promise<Article> {
    const rows = (await sql(
      `
      INSERT INTO articles (title, content, excerpt, category, tags, published, image_url, published_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [
        articleData.title,
        articleData.content,
        articleData.excerpt || null,
        articleData.category,
        JSON.stringify(articleData.tags),
        articleData.published,
        articleData.imageUrl || null,
        articleData.publishedAt || null,
        articleData.createdBy,
      ],
    )) as DbArticle[]

    return mapDbToArticle(rows[0])
  }

  async updateArticle(id: string, updates: Partial<Omit<Article, "id" | "createdAt">>): Promise<Article | null> {
    const setParts: string[] = []
    const params: any[] = []
    let p = 1

    if (updates.title !== undefined) {
      setParts.push(`title = $${p++}`)
      params.push(updates.title)
    }
    if (updates.content !== undefined) {
      setParts.push(`content = $${p++}`)
      params.push(updates.content)
    }
    if (updates.excerpt !== undefined) {
      setParts.push(`excerpt = $${p++}`)
      params.push(updates.excerpt)
    }
    if (updates.category !== undefined) {
      setParts.push(`category = $${p++}`)
      params.push(updates.category)
    }
    if (updates.tags !== undefined) {
      setParts.push(`tags = $${p++}`)
      params.push(JSON.stringify(updates.tags))
    }
    if (updates.published !== undefined) {
      setParts.push(`published = $${p++}`)
      params.push(updates.published)
    }
    if (updates.imageUrl !== undefined) {
      setParts.push(`image_url = $${p++}`)
      params.push(updates.imageUrl)
    }
    if (updates.publishedAt !== undefined) {
      setParts.push(`published_at = $${p++}`)
      params.push(updates.publishedAt)
    }

    setParts.push(`updated_at = NOW()`)
    params.push(id)

    const query = `
      UPDATE articles 
      SET ${setParts.join(", ")}
      WHERE id = $${p}
      RETURNING *
    `

    const rows = (await sql(query, params)) as DbArticle[]
    return rows.length ? mapDbToArticle(rows[0]) : null
  }

  async deleteArticle(id: string): Promise<boolean> {
    const rows = await sql(`DELETE FROM articles WHERE id = $1 RETURNING id`, [id])
    return rows.length > 0
  }

  async getPublishedArticles(limit = 10): Promise<Article[]> {
    return this.getArticles({ published: true, limit })
  }

  async searchArticles(searchTerm: string, published = true): Promise<Article[]> {
    return this.getArticles({ search: searchTerm, published })
  }

  async getArticlesByCategory(category: string, published = true): Promise<Article[]> {
    return this.getArticles({ category, published })
  }
}

/* -------------------------------------------------------------------------- */
/*              Singleton + pomocné funkce, které importuje zbytek kódu       */
/* -------------------------------------------------------------------------- */

export const articleService = new ArticleService()

/**
 * Vrátí pouze publikované články s jednoduchou stránkovací logikou.
 */
export async function getPublishedArticles(
  page = 1,
  limit = 10,
): Promise<{ articles: Article[]; total: number; hasMore: boolean }> {
  const offset = (page - 1) * limit

  // Data
  const articles = await articleService.getArticles({
    limit,
    offset,
    published: true,
  })

  // Celkový počet
  const rows = (await sql(`SELECT COUNT(*) FROM articles WHERE published = true`)) as { count: string }[]
  const total = Number.parseInt(rows[0].count, 10)
  const hasMore = page * limit < total

  return { articles, total, hasMore }
}

// Export all the functions that might be imported elsewhere
export async function getArticles(
  filters: {
    published?: boolean
    category?: string
    limit?: number
    offset?: number
    search?: string
  } = {},
): Promise<Article[]> {
  return articleService.getArticles(filters)
}

export async function getArticleById(id: string): Promise<Article | null> {
  return articleService.getArticleById(id)
}

export async function createArticle(articleData: Omit<Article, "id" | "createdAt" | "updatedAt">): Promise<Article> {
  return articleService.createArticle(articleData)
}

export async function updateArticle(
  id: string,
  updates: Partial<Omit<Article, "id" | "createdAt">>,
): Promise<Article | null> {
  return articleService.updateArticle(id, updates)
}

export async function deleteArticle(id: string): Promise<boolean> {
  return articleService.deleteArticle(id)
}

export async function searchArticles(searchTerm: string, published = true): Promise<Article[]> {
  return articleService.searchArticles(searchTerm, published)
}

export async function getArticlesByCategory(category: string, published = true): Promise<Article[]> {
  return articleService.getArticlesByCategory(category, published)
}
