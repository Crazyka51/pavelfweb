import { db } from "@/lib/database" // Import the Drizzle instance
import { articles } from "@/lib/schema" // Import the articles table schema
import { eq, and, or, ilike, desc, count, sql } from "drizzle-orm" // Import Drizzle helpers

/* -------------------------------------------------------------------------- */
/*                            Interface a typy                                */
/* -------------------------------------------------------------------------- */

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  category: string;
  tags: string[];
  published: boolean; // was isPublished, changed to match database.ts
  image_url?: string | null; // was imageUrl, changed to match database.ts
  published_at?: Date | null; // was publishedAt, changed to match database.ts
  created_at: Date; // was createdAt, changed to match database.ts
  updated_at: Date; // was updatedAt, changed to match database.ts
  created_by: string; // was createdBy, changed to match database.ts
}

export interface ArticleListOptions {
  limit?: number;
  offset?: number;
  isPublished?: boolean; // keep this as is, it's an option parameter not database field
  search?: string;
  category?: string;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  excerpt?: string | null;
  image_url?: string | null; // was imageUrl
  published?: boolean; // was isPublished
  created_by: string; // was createdBy
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  excerpt?: string | null;
  image_url?: string | null; // was imageUrl
  published?: boolean; // was isPublished
}

/* -------------------------------------------------------------------------- */
/*                        Hlavní třída pro práci s články                     */
/* -------------------------------------------------------------------------- */

export class ArticleService {
  /**
   * Získá seznam článků s možností filtrování a stránkování.
   */
  async getArticles(options: ArticleListOptions = {}): Promise<Article[]> {
    try {
      const { limit = 10, offset = 0, isPublished, search, category } = options;
      
      // Sestavení SQL dotazu pro větší kontrolu nad generovaným SQL
      let sqlQuery = "SELECT * FROM articles WHERE 1=1";
      const sqlParams: any[] = [];
      
      // Přidání podmínek
      if (category && category !== "all") {
        sqlParams.push(category);
        sqlQuery += ` AND category = $${sqlParams.length}`;
      }
      
      if (typeof isPublished === "boolean") {
        sqlParams.push(isPublished);
        sqlQuery += ` AND is_published = $${sqlParams.length}`;
      }
      
      if (search) {
        sqlParams.push(`%${search}%`);
        sqlQuery += ` AND (title ILIKE $${sqlParams.length} OR content ILIKE $${sqlParams.length})`;
      }
      
      // Řazení a limit
      sqlQuery += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
      
      // Spustíme dotaz
      const result = await db.execute(sql.raw(sqlQuery));
      
      // Převedeme výsledky na typ Article
      return Array.isArray(result) ? result.map(this.mapDatabaseRecordToArticle) : [];
      
    } catch (error) {
      console.error("Error getting articles:", error);
      return [];
    }
  }

  /**
   * Získá celkový počet článků s možností filtrování.
   */
  async getTotalArticleCount(options: { 
    isPublished?: boolean, 
    search?: string,
    category?: string
  } = {}): Promise<number> {
    try {
      const { isPublished, search, category } = options;
      
      // Sestavíme SQL dotaz ručně
      let sqlQuery = "SELECT COUNT(*) FROM articles WHERE 1=1";
      const sqlParams: any[] = [];
      
      // Přidání podmínek
      if (category && category !== "all") {
        sqlParams.push(category);
        sqlQuery += ` AND category = $${sqlParams.length}`;
      }
      
      if (typeof isPublished === "boolean") {
        sqlParams.push(isPublished);
        sqlQuery += ` AND is_published = $${sqlParams.length}`;
      }
      
      if (search) {
        sqlParams.push(`%${search}%`);
        sqlQuery += ` AND (title ILIKE $${sqlParams.length} OR content ILIKE $${sqlParams.length})`;
      }
      
      // Spustíme dotaz
      const result = await db.execute(sql.raw(sqlQuery));
      
      // Vrátíme počet
      if (result && Array.isArray(result) && result.length > 0) {
        return parseInt(result[0].count as string, 10) || 0;
      }
      
      return 0;
      
    } catch (error) {
      console.error("Error getting total article count:", error);
      return 0;
    }
  }

  /**
   * Získá článek podle ID.
   */
  async getArticleById(id: string): Promise<Article | null> {
    try {
      // Použijeme prepared statement pro bezpečnější dotaz
      const result = await db.execute(
        sql`SELECT * FROM articles WHERE id = ${id} LIMIT 1`
      );
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        return null;
      }
      
      return this.mapDatabaseRecordToArticle(result[0]);
      
    } catch (error) {
      console.error(`Error getting article with ID ${id}:`, error);
      return null;
    }
  }

  /**
   * Vytvoří nový článek.
   */
  async createArticle(input: CreateArticleInput): Promise<Article | null> {
    try {
      const now = new Date();
      
      const result = await db.execute(
        sql`
          INSERT INTO articles (
            title, content, excerpt, category, tags, 
            is_published, image_url, published_at, 
            created_at, updated_at, created_by
          ) 
          VALUES (
            ${input.title}, 
            ${input.content}, 
            ${input.excerpt || null}, 
            ${input.category}, 
            ${input.tags || []}, 
            ${input.published || false}, 
            ${input.image_url || null}, 
            ${input.published ? now : null}, 
            ${now}, 
            ${now}, 
            ${input.created_by}
          )
          RETURNING *
        `
      );
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        return null;
      }
      
      return this.mapDatabaseRecordToArticle(result[0]);
      
    } catch (error) {
      console.error("Error creating article:", error);
      return null;
    }
  }

  /**
   * Aktualizuje existující článek.
   */
  async updateArticle(id: string, input: UpdateArticleInput): Promise<Article | null> {
    try {
      // Získáme aktuální článek
      const currentArticle = await this.getArticleById(id);
      if (!currentArticle) return null;
      
      // Sestavíme dynamický update dotaz
      let setClause = "updated_at = NOW()";
      const params: any[] = [id];
      
      // Přidáme pouze ta pole, která jsou definována
      if (input.title !== undefined) {
        params.push(input.title);
        setClause += `, title = $${params.length}`;
      }
      
      if (input.content !== undefined) {
        params.push(input.content);
        setClause += `, content = $${params.length}`;
      }
      
      if (input.excerpt !== undefined) {
        params.push(input.excerpt);
        setClause += `, excerpt = $${params.length}`;
      }
      
      if (input.category !== undefined) {
        params.push(input.category);
        setClause += `, category = $${params.length}`;
      }
      
      if (input.tags !== undefined) {
        params.push(input.tags);
        setClause += `, tags = $${params.length}`;
      }
      
      if (input.published !== undefined) {
        params.push(input.published);
        setClause += `, is_published = $${params.length}`;
        
        // Nastavíme datum publikace, pokud publikujeme poprvé
        if (input.published && !currentArticle.published_at) {
          params.push(new Date());
          setClause += `, published_at = $${params.length}`;
        }
      }
      
      if (input.image_url !== undefined) {
        params.push(input.image_url);
        setClause += `, image_url = $${params.length}`;
      }
      
      // Sestavíme finální dotaz
      const queryText = `
        UPDATE articles 
        SET ${setClause} 
        WHERE id = $1
        RETURNING *
      `;
      
      // Provedeme dotaz
      const result = await db.execute(sql.raw(queryText));
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        return null;
      }
      
      return this.mapDatabaseRecordToArticle(result[0]);
      
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
      const result = await db.execute(
        sql`DELETE FROM articles WHERE id = ${id} RETURNING id`
      );
      
      return result && Array.isArray(result) && result.length > 0;
      
    } catch (error) {
      console.error(`Error deleting article with ID ${id}:`, error);
      return false;
    }
  }

  /**
   * Převede databázový záznam na objekt Article.
   * Zajišťuje konzistentní převod mezi DB sloupci (snake_case) a TS rozhraním (camelCase).
   */
  private mapDatabaseRecordToArticle(record: any): Article {
    return {
      id: record.id,
      title: record.title,
      content: record.content,
      excerpt: record.excerpt,
      category: record.category,
      tags: record.tags || [],
      published: record.is_published,
      image_url: record.image_url,
      published_at: record.published_at,
      created_at: record.created_at,
      updated_at: record.updated_at,
      created_by: record.created_by
    };
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
): Promise<{ articles: Article[]; total: number; hasMore: boolean }> {
  const offset = (page - 1) * limit;
  
  const articles = await articleService.getArticles({
    limit,
    offset,
    isPublished: true
  });
  
  const total = await articleService.getTotalArticleCount({
    isPublished: true
  });
  
  // Určíme, zda existují další stránky
  const hasMore = (page * limit) < total;
  
  return { articles, total, hasMore };
}
