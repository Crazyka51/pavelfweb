import { type NextRequest, NextResponse } from "next/server"
import { categoryService } from "@/lib/category-service"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/admin/categories
export const GET = requireAuth(
  async (request: NextRequest, authResult: any) => {
    try {
      const categories = await categoryService.getCategories()
      return NextResponse.json(categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 })
    }
  },
  ["admin", "editor"],
)

// POST /api/admin/categories
export const POST = requireAuth(
  async (request: NextRequest, authResult: any) => {
    try {
      const data = await request.json()
      const newCategory = await categoryService.createCategory(data)
      if (!newCategory) {
        return NextResponse.json({ message: "Failed to create category" }, { status: 500 })
      }
      return NextResponse.json(newCategory, { status: 201 })
    } catch (error) {
      console.error("Error creating category:", error)
      return NextResponse.json({ message: "Failed to create category" }, { status: 500 })
    }
  },
  ["admin"],
)
