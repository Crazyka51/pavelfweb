import { sql, type Category } from "@/lib/database"
import { categories } from "@/lib/schema"
import { eq } from "drizzle-orm"

export class CategoryService {
  constructor(private db: typeof sql) {}

  async getAllCategories(): Promise<Category[]> {
    try {
      const result = await this.db.query.categories.findMany()
      return result as Category[]
    } catch (error) {
      console.error("Error fetching all categories:", error)
      return []
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const result = await this.db.query.categories.findFirst({
        where: eq(categories.id, id),
      })
      return result as Category | null
    } catch (error) {
      console.error(`Error fetching category with ID ${id}:`, error)
      return null
    }
  }

  async createCategory(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category | null> {
    try {
      const [newCategory] = await this.db
        .insert(categories)
        .values({
          ...data,
          id: crypto.randomUUID(), // Assuming UUID for categories
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      return newCategory as Category
    } catch (error) {
      console.error("Error creating category:", error)
      return null
    }
  }

  async updateCategory(id: string, data: Partial<Omit<Category, "id" | "createdAt">>): Promise<Category | null> {
    try {
      const [updatedCategory] = await this.db
        .update(categories)
        .set({
          ...data,
          updatedAt: new Date(),
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
      const result = await this.db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id })
      return result.length > 0
    } catch (error) {
      console.error(`Error deleting category with ID ${id}:`, error)
      return false
    }
  }
}

// Export an instance of the service
export const categoryService = new CategoryService(sql)
