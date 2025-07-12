import { sql, type Article as DbArticle } from "@/lib/database"

// Rozšířený typ pro článek, který může obsahovat i pole, která nejsou přímo v DB
export interface Article {
  id: string
  title: string
  content: string
  excerpt?: string | null
  category: string
  tags: string[]
  published: boolean
  imageUrl?: string | null // Mapped from image_url
  publishedAt?: Date | null // Mapped from published_at
  createdAt: Date // Mapped from created_at
  updatedAt: Date // Mapped from updated_at
  createdBy: string // Mapped from created_by
}

// Helper pro mapování z DB formátu na JS objekt
const mapDbArticleToArticle = (dbArticle: DbArticle): Article => ({
  id: dbArticle.id,
  title: dbArticle.title,
  content: dbArticle.content,
  excerpt: dbArticle.excerpt,
  category: dbArticle.category,
  tags: dbArticle.tags,
  published: dbArticle.published,
  imageUrl: dbArticle.image_url,
  publishedAt: dbArticle.published_at,
  createdAt: dbArticle.created_at,
  updatedAt: dbArticle.updated_at,
  createdBy: dbArticle.created_by,
})

// Helper pro mapování z JS objektu na DB formát
const mapArticleToDbArticle = (article: Partial<Article>): Partial<DbArticle> => ({
  title: article.title,
  content: article.content,
  excerpt: article.excerpt,
  category: article.category,
  tags: article.tags,
  published: article.published,
  image_url: article.imageUrl,
  published_at: article.publishedAt,
  created_by: article.createdBy,
})

export class ArticleService {
  async getArticles(filters: {
    limit?: number
    offset?: number
    category?: string
    published?: boolean
    search?: string
  }): Promise<Article[]> {
    let query = sql`SELECT * FROM articles`
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.category && filters.category !== "all") {
      conditions.push(`category = $${paramIndex++}`)
      params.push(filters.category)
    }

    if (filters.published !== undefined) {
      conditions.push(`published = $${paramIndex++}`)
      params.push(filters.published)
    }

    if (filters.search) {
      conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR tags::text ILIKE $${paramIndex})`)
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, " AND ")}`
    }

    query = sql`${query} ORDER BY created_at DESC`

    if (filters.limit !== undefined) {
      query = sql`${query} LIMIT $${paramIndex++}`
      params.push(filters.limit)
    }
    if (filters.offset !== undefined) {
      query = sql`${query} OFFSET $${paramIndex++}`
      params.push(filters.offset)
    }

    const dbArticles = (await query.apply(null, params)) as DbArticle[]
    return dbArticles.map(mapDbArticleToArticle)
  }

  async getArticleById(id: string): Promise<Article | null> {
    const dbArticles = (await sql`SELECT * FROM articles WHERE id = ${id} LIMIT 1`) as DbArticle[]
    if (dbArticles.length === 0) {
      return null
    }
    return mapDbArticleToArticle(dbArticles[0])
  }

  async createArticle(articleData: Omit<Article, "id" | "createdAt" | "updatedAt">): Promise<Article> {
    const now = new Date()
    const dbArticleData = mapArticleToDbArticle({
      ...articleData,
      createdAt: now,
      updatedAt: now,
      publishedAt: articleData.published ? articleData.publishedAt || now : null,
    })

    const [newArticle] = (await sql`
      INSERT INTO articles 
        (title, content, excerpt, category, tags, published, image_url, published_at, created_by, created_at, updated_at)
      VALUES 
        (${dbArticleData.title}, ${dbArticleData.content}, ${dbArticleData.excerpt}, ${dbArticleData.category}, ${sql.array(dbArticleData.tags || [], "text")}, ${dbArticleData.published}, ${dbArticleData.image_url}, ${dbArticleData.published_at}, ${dbArticleData.created_by}, ${now}, ${now})
      RETURNING *
    `) as DbArticle[]
    return mapDbArticleToArticle(newArticle)
  }

  async updateArticle(
    id: string,
    updates: Partial<Omit<Article, "id" | "createdAt" | "createdBy">>,
  ): Promise<Article | null> {
    const now = new Date()
    const dbUpdates = mapArticleToDbArticle({ ...updates, updatedAt: now })

    const updateFields: string[] = []
    const updateValues: any[] = []
    let paramIndex = 1

    if (dbUpdates.title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`)
      updateValues.push(dbUpdates.title)
    }
    if (dbUpdates.content !== undefined) {
      updateFields.push(`content = $${paramIndex++}`)
      updateValues.push(dbUpdates.content)
    }
    if (dbUpdates.excerpt !== undefined) {
      updateFields.push(`excerpt = $${paramIndex++}`)
      updateValues.push(dbUpdates.excerpt)
    }
    if (dbUpdates.category !== undefined) {
      updateFields.push(`category = $${paramIndex++}`)
      updateValues.push(dbUpdates.category)
    }
    if (dbUpdates.tags !== undefined) {
      updateFields.push(`tags = $${paramIndex++}`)
      updateValues.push(sql.array(dbUpdates.tags, "text"))
    }
    if (dbUpdates.published !== undefined) {
      updateFields.push(`published = $${paramIndex++}`)
      updateValues.push(dbUpdates.published)
    }
    if (dbUpdates.image_url !== undefined) {
      updateFields.push(`image_url = $${paramIndex++}`)
      updateValues.push(dbUpdates.image_url)
    }
    if (dbUpdates.published_at !== undefined) {
      updateFields.push(`published_at = $${paramIndex++}`)
      updateValues.push(dbUpdates.published_at)
    }

    updateFields.push(`updated_at = $${paramIndex++}`)
    updateValues.push(now)

    if (updateFields.length === 0) {
      return this.getArticleById(id) // No updates provided
    }

    const [updatedArticle] = (await sql`
      UPDATE articles
      SET ${sql.join(
        updateFields.map((f, i) => sql`${sql.identifier([f.split(" ")[0]])} = ${updateValues[i]}`),
        ", ",
      )}
      WHERE id = ${id}
      RETURNING *
    `) as DbArticle[]

    if (!updatedArticle) {
      return null
    }
    return mapDbArticleToArticle(updatedArticle)
  }

  async deleteArticle(id: string): Promise<boolean> {
    const result = await sql`DELETE FROM articles WHERE id = ${id} RETURNING id`
    return result.length > 0
  }

  async getTotalArticleCount(filters: {
    category?: string
    published?: boolean
    search?: string
  }): Promise<number> {
    let query = sql`SELECT COUNT(*) FROM articles`
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.category && filters.category !== "all") {
      conditions.push(`category = $${paramIndex++}`)
      params.push(filters.category)
    }

    if (filters.published !== undefined) {
      conditions.push(`published = $${paramIndex++}`)
      params.push(filters.published)
    }

    if (filters.search) {
      conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR tags::text ILIKE $${paramIndex})`)
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, " AND ")}`
    }

    const result = (await query.apply(null, params)) as { count: string }[]
    return Number.parseInt(result[0].count, 10)
  }
}
