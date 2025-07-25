import { sql } from "@/lib/database"
import type { Category } from "@/lib/types"

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    try {
      const categories = await sql<Category[]>`SELECT * FROM categories ORDER BY name ASC;`
      return categories
    } catch (error) {
      console.error("Error fetching all categories:", error)
      throw new Error("Failed to fetch categories.")
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const [category] = await sql<Category[]>`SELECT * FROM categories WHERE id = ${id};`
      return category || null
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error)
      throw new Error(`Failed to fetch category with ID ${id}.`)
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const [category] = await sql<Category[]>`SELECT * FROM categories WHERE slug = ${slug};`
      return category || null
    } catch (error) {
      console.error(`Error fetching category with slug ${slug}:`, error)
      throw new Error(`Failed to fetch category with slug ${slug}.`)
    }
  }

  async createCategory(categoryData: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category> {
    try {
      const [newCategory] = await sql<Category[]>`
        INSERT INTO categories (name, slug, description)
        VALUES (${categoryData.name}, ${categoryData.slug}, ${categoryData.description})
        RETURNING *;
      `
      return newCategory
    } catch (error) {
      console.error("Error creating category:", error)
      throw new Error("Failed to create category.")
    }
  }

  async updateCategory(
    id: string,
    categoryData: Partial<Omit<Category, "id" | "created_at" | "updated_at">>,
  ): Promise<Category | null> {
    try {
      const [updatedCategory] = await sql<Category[]>`
        UPDATE categories
        SET
          name = COALESCE(${categoryData.name}, name),
          slug = COALESCE(${categoryData.slug}, slug),
          description = COALESCE(${categoryData.description}, description),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `
      return updatedCategory || null
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error)
      throw new Error(`Failed to update category with ID ${id}.`)
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM categories WHERE id = ${id};`
      return result.count > 0
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error)
      throw new Error(`Failed to delete category with ID ${id}.`)
    }
  }
}

export const categoryService = new CategoryService()
