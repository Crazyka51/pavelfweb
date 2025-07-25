import { sql } from "@/lib/database"
import type { Category } from "@/lib/types"

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    try {
      const rows = (await sql(`
        SELECT id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
        FROM categories
        WHERE is_active = true
        ORDER BY display_order ASC, name ASC
      `)) as Category[]

      return rows
    } catch (error) {
      console.error("Error fetching all categories:", error)
      return []
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const rows = (await sql(
        `
        SELECT id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
        FROM categories
        WHERE id = $1
      `,
        [id],
      )) as Category[]

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error)
      return null
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const rows = (await sql(
        `
        SELECT id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
        FROM categories
        WHERE slug = $1 AND is_active = true
      `,
        [slug],
      )) as Category[]

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error(`Error fetching category with slug ${slug}:`, error)
      return null
    }
  }

  async createCategory(data: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category | null> {
    try {
      const rows = (await sql(
        `
        INSERT INTO categories (name, slug, description, color, icon, parent_id, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
      `,
        [
          data.name,
          data.slug,
          data.description || null,
          data.color || null,
          data.icon || null,
          data.parent_id || null,
          data.display_order,
          data.is_active,
        ],
      )) as Category[]

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error("Error creating category:", error)
      return null
    }
  }

  async updateCategory(id: string, data: Partial<Omit<Category, "id" | "created_at">>): Promise<Category | null> {
    try {
      const setParts: string[] = []
      const params: any[] = []
      let p = 1

      if (data.name !== undefined) {
        setParts.push(`name = $${p++}`)
        params.push(data.name)
      }
      if (data.slug !== undefined) {
        setParts.push(`slug = $${p++}`)
        params.push(data.slug)
      }
      if (data.description !== undefined) {
        setParts.push(`description = $${p++}`)
        params.push(data.description)
      }
      if (data.color !== undefined) {
        setParts.push(`color = $${p++}`)
        params.push(data.color)
      }
      if (data.icon !== undefined) {
        setParts.push(`icon = $${p++}`)
        params.push(data.icon)
      }
      if (data.parent_id !== undefined) {
        setParts.push(`parent_id = $${p++}`)
        params.push(data.parent_id)
      }
      if (data.display_order !== undefined) {
        setParts.push(`display_order = $${p++}`)
        params.push(data.display_order)
      }
      if (data.is_active !== undefined) {
        setParts.push(`is_active = $${p++}`)
        params.push(data.is_active)
      }

      setParts.push(`updated_at = NOW()`)
      params.push(id)

      const query = `
        UPDATE categories 
        SET ${setParts.join(", ")}
        WHERE id = $${p}
        RETURNING id, name, slug, description, color, icon, parent_id, display_order, is_active, created_at, updated_at
      `

      const rows = (await sql(query, params)) as Category[]
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error)
      return null
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const rows = await sql(`DELETE FROM categories WHERE id = $1 RETURNING id`, [id])
      return rows.length > 0
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error)
      return false
    }
  }
}

// Export an instance of the service
export const categoryService = new CategoryService()

// Export individual functions for convenience
export async function getAllCategories(): Promise<Category[]> {
  return categoryService.getAllCategories()
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return categoryService.getCategoryById(id)
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categoryService.getCategoryBySlug(slug)
}

export async function createCategory(
  data: Omit<Category, "id" | "created_at" | "updated_at">,
): Promise<Category | null> {
  return categoryService.createCategory(data)
}

export async function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "created_at">>,
): Promise<Category | null> {
  return categoryService.updateCategory(id, data)
}

export async function deleteCategory(id: string): Promise<boolean> {
  return categoryService.deleteCategory(id)
}
