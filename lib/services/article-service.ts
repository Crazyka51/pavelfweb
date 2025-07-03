import { sql, Article } from '../database';

export class ArticleService {
  
  // Get all articles with optional filtering
  async getArticles(filters: {
    published?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Article[]> {
    try {
      if (filters.published !== undefined && filters.category) {
        const result = await sql`
          SELECT id, title, content, excerpt, category, tags, published, 
                 image_url, published_at, created_at, updated_at, created_by
          FROM articles
          WHERE published = ${filters.published} AND category = ${filters.category}
          ORDER BY created_at DESC
          LIMIT ${filters.limit || 50}
          OFFSET ${filters.offset || 0}
        `;
        return result as Article[];
      } else if (filters.published !== undefined) {
        const result = await sql`
          SELECT id, title, content, excerpt, category, tags, published, 
                 image_url, published_at, created_at, updated_at, created_by
          FROM articles
          WHERE published = ${filters.published}
          ORDER BY created_at DESC
          LIMIT ${filters.limit || 50}
          OFFSET ${filters.offset || 0}
        `;
        return result as Article[];
      } else if (filters.category) {
        const result = await sql`
          SELECT id, title, content, excerpt, category, tags, published, 
                 image_url, published_at, created_at, updated_at, created_by
          FROM articles
          WHERE category = ${filters.category}
          ORDER BY created_at DESC
          LIMIT ${filters.limit || 50}
          OFFSET ${filters.offset || 0}
        `;
        return result as Article[];
      } else {
        const result = await sql`
          SELECT id, title, content, excerpt, category, tags, published, 
                 image_url, published_at, created_at, updated_at, created_by
          FROM articles
          ORDER BY created_at DESC
          LIMIT ${filters.limit || 50}
          OFFSET ${filters.offset || 0}
        `;
        return result as Article[];
      }
    } catch (error) {
      console.error('Failed to get articles:', error);
      throw new Error('Failed to fetch articles');
    }
  }

  // Get single article by ID
  async getArticleById(id: string): Promise<Article | null> {
    try {
      const result = await sql`
        SELECT id, title, content, excerpt, category, tags, published, 
               image_url, published_at, created_at, updated_at, created_by
        FROM articles 
        WHERE id = ${id}
      `;
      
      return result.length > 0 ? result[0] as Article : null;
    } catch (error) {
      console.error('Failed to get article by ID:', error);
      return null;
    }
  }

  // Create new article
  async createArticle(articleData: Omit<Article, 'id' | 'created_at' | 'updated_at'>): Promise<Article> {
    try {
      const result = await sql`
        INSERT INTO articles (
          title, content, excerpt, category, tags, published,
          image_url, published_at, created_by
        ) VALUES (
          ${articleData.title},
          ${articleData.content},
          ${articleData.excerpt || null},
          ${articleData.category},
          ${JSON.stringify(articleData.tags)},
          ${articleData.published},
          ${articleData.image_url || null},
          ${articleData.published_at || null},
          ${articleData.created_by}
        )
        RETURNING id, title, content, excerpt, category, tags, published, 
                  image_url, published_at, created_at, updated_at, created_by
      `;
      
      return result[0] as Article;
    } catch (error) {
      console.error('Failed to create article:', error);
      throw new Error('Failed to create article');
    }
  }

  // Update existing article
  async updateArticle(id: string, updates: Partial<Omit<Article, 'id' | 'created_at'>>): Promise<Article | null> {
    try {
      const result = await sql`
        UPDATE articles SET
          title = COALESCE(${updates.title}, title),
          content = COALESCE(${updates.content}, content),
          excerpt = COALESCE(${updates.excerpt}, excerpt),
          category = COALESCE(${updates.category}, category),
          tags = COALESCE(${updates.tags ? JSON.stringify(updates.tags) : null}, tags),
          published = COALESCE(${updates.published}, published),
          image_url = COALESCE(${updates.image_url}, image_url),
          published_at = COALESCE(${updates.published_at}, published_at),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, title, content, excerpt, category, tags, published, 
                  image_url, published_at, created_at, updated_at, created_by
      `;
      
      return result.length > 0 ? result[0] as Article : null;
    } catch (error) {
      console.error('Failed to update article:', error);
      throw new Error('Failed to update article');
    }
  }

  // Delete article
  async deleteArticle(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM articles WHERE id = ${id}`;
      return result.length > 0;
    } catch (error) {
      console.error('Failed to delete article:', error);
      return false;
    }
  }

  // Get published articles for public display
  async getPublishedArticles(limit: number = 10): Promise<Article[]> {
    return this.getArticles({ published: true, limit });
  }

  // Search articles by title or content
  async searchArticles(searchTerm: string, published: boolean = true): Promise<Article[]> {
    try {
      const result = await sql`
        SELECT id, title, content, excerpt, category, tags, published, 
               image_url, published_at, created_at, updated_at, created_by
        FROM articles 
        WHERE published = ${published}
          AND (title ILIKE ${'%' + searchTerm + '%'} OR content ILIKE ${'%' + searchTerm + '%'})
        ORDER BY created_at DESC
      `;
      
      return result as Article[];
    } catch (error) {
      console.error('Failed to search articles:', error);
      return [];
    }
  }

  // Get articles by category
  async getArticlesByCategory(category: string, published: boolean = true): Promise<Article[]> {
    return this.getArticles({ category, published });
  }
}

export const articleService = new ArticleService();
