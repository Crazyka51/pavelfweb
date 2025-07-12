import { sql, type Category, type Article } from "../database"

class CategoryService {
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim()
  }

  async getAllCategories(includeArticleCount = false, activeOnly = false): Promise<Category[]> {
    try {
      let query = sql`
        SELECT id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
        FROM categories
      `

      if (activeOnly) {
        query = sql`${query} WHERE is_active = true`
      }

      query = sql`${query} ORDER BY display_order ASC, name ASC`

      const categories = (await query) as Category[]

      if (includeArticleCount) {
        const articles = (await sql`SELECT category FROM articles`) as Pick<Article, "category">[]
        const articleCounts: Record<string, number> = {}
        articles.forEach((article) => {
          if (article.category) {
            articleCounts[article.category] = (articleCounts[article.category] || 0) + 1
          }
        })

        return categories.map((cat) => ({
          ...cat,
          articleCount: articleCounts[cat.name] || 0,
        }))
      }

      return categories
    } catch (error) {
      console.error("Failed to get categories:", error)
      throw new Error("Failed to fetch categories")
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const result = await sql`
        SELECT id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
        FROM categories
        WHERE id = ${id}
      `
      return result.length > 0 ? (result[0] as Category) : null
    } catch (error) {
      console.error("Failed to get category by ID:", error)
      throw new Error("Failed to fetch category")
    }
  }

  async createCategory(data: {
    name: string
    description?: string
    color?: string
    icon?: string
    parentId?: string
    displayOrder?: number
    isActive?: boolean
  }): Promise<Category> {
    try {
      const slug = this.generateSlug(data.name)

      // Check for duplicate name or slug
      const existing = await sql`SELECT id FROM categories WHERE name = ${data.name} OR slug = ${slug}`
      if (existing.length > 0) {
        throw new Error("Kategorie s tímto názvem nebo slugem již existuje")
      }

      const result = await sql`
        INSERT INTO categories (name, slug, description, color, icon, parent_id, display_order, is_active)
        VALUES (
          ${data.name},
          ${slug},
          ${data.description || null},
          ${data.color || "#3B82F6"},
          ${data.icon || null},
          ${data.parentId || null},
          ${data.displayOrder || 0},
          ${data.isActive ?? true}
        )
        RETURNING id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
      `
      return result[0] as Category
    } catch (error) {
      console.error("Failed to create category:", error)
      throw error // Re-throw to be caught by API route
    }
  }

  async updateCategory(
    id: string,
    updates: Partial<Omit<Category, "id" | "created_at" | "slug">>,
  ): Promise<Category | null> {
    try {
      const currentCategory = await this.getCategoryById(id)
      if (!currentCategory) {
        throw new Error("Kategorie nebyla nalezena")
      }

      let slug = currentCategory.slug
      if (updates.name && updates.name !== currentCategory.name) {
        slug = this.generateSlug(updates.name)
        // Check for duplicate slug if name is changed
        const existing = await sql`SELECT id FROM categories WHERE slug = ${slug} AND id != ${id}`
        if (existing.length > 0) {
          throw new Error("Kategorie s tímto názvem již existuje")
        }
      }

      const result = await sql`
        UPDATE categories SET
          name = COALESCE(${updates.name}, name),
          slug = ${slug},
          description = COALESCE(${updates.description === undefined ? null : updates.description}, description),
          color = COALESCE(${updates.color}, color),
          icon = COALESCE(${updates.icon === undefined ? null : updates.icon}, icon),
          parent_id = COALESCE(${updates.parent_id === undefined ? null : updates.parent_id}, parent_id),
          display_order = COALESCE(${updates.display_order}, display_order),
          is_active = COALESCE(${updates.is_active}, is_active),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
      `
      return result.length > 0 ? (result[0] as Category) : null
    } catch (error) {
      console.error("Failed to update category:", error)
      throw error
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      // Check for child categories
      const childCategories = await sql`SELECT id FROM categories WHERE parent_id = ${id}`
      if (childCategories.length > 0) {
        throw new Error("Nelze smazat kategorii, která má podkategorie")
      }

      // Check for articles in this category
      const articlesInCategory =
        await sql`SELECT id FROM articles WHERE category = (SELECT name FROM categories WHERE id = ${id})`
      if (articlesInCategory.length > 0) {
        throw new Error("Nelze smazat kategorii, která obsahuje články")
      }

      const result = await sql`DELETE FROM categories WHERE id = ${id} RETURNING id`
      return result.length > 0
    } catch (error) {
      console.error("Failed to delete category:", error)
      throw error
    }
  }
}

export const categoryService = new CategoryService()
