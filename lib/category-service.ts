import { db } from "@/lib/database"
import { categories } from "@/lib/schema"
import { eq, desc } from "drizzle-orm"

export type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  color?: string | null
  icon?: string | null
  parent_id?: string | null
  display_order: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export class CategoryService {
  async getCategories(): Promise<Category[]> {
    const result = await db.select().from(categories).orderBy(desc(categories.created_at))
    return result as Category[]
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
    return (result[0] as Category) ?? null
  }

  async createCategory(data: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category | null> {
    try {
      const [newCategory] = await db
        .insert(categories)
        .values({
          id: crypto.randomUUID(),
          created_at: new Date(),
          updated_at: new Date(),
          ...data,
        })
        .returning()
      return newCategory as Category
    } catch (error) {
      console.error("Error creating category:", error)
      return null
    }
  }

  async updateCategory(id: string, data: Partial<Omit<Category, "id" | "created_at">>): Promise<Category | null> {
    try {
      const [updatedCategory] = await db
        .update(categories)
        .set({
          updated_at: new Date(),
          ...data,
        })
        .where(eq(categories.id, id))
        .returning()
      return updatedCategory as Category
    } catch (error) {
      console.error(`Error updating category with ID ${id}:`, error)
      return null
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const result = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id })
      return result.length > 0
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error)
      return false
    }
  }
}

export const categoryService = new CategoryService()
