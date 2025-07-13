import { sql } from "@/lib/database"

/* -------------------------------------------------------------------------- */
/*                                Typy                                        */
/* -------------------------------------------------------------------------- */

export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string | null
  category: string
  tags: string[]
  published: boolean
  imageUrl?: string | null
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

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

  async getArticles(opts: {
    limit?: number
    offset?: number
    category?: string
    published?: boolean
    search?: string
  }): Promise<Article[]> {
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

    const { rows } = await sql<DbArticle[]>(query, params)
    return rows.map(mapDbToArticle)
  }

  async getArticleById(id: string): Promise<Article | null> {
    const { rows } = await sql<DbArticle[]>(`SELECT * FROM articles WHERE id = $1 LIMIT 1`, [id])
    return rows.length ? mapDbToArticle(rows[0]) : null
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
  const { rows } = await sql<{ count: string }[]>(`SELECT COUNT(*) FROM articles WHERE published = true`)
  const total = Number.parseInt(rows[0].count, 10)
  const hasMore = page * limit < total

  return { articles, total, hasMore }
}
