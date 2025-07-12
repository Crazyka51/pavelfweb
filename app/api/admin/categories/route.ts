import { type NextRequest, NextResponse } from "next/server"
import { categoryService } from "@/lib/services/category-service"
import { requireAuth } from "@/lib/auth-utils" // Assuming requireAuth is for API routes

// GET /api/admin/categories
const getCategories = async (req: NextRequest) => {
  try {
    const categories = await categoryService.getAllCategories()
    return NextResponse.json(categories, { status: 200 })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ message: "Failed to fetch categories." }, { status: 500 })
  }
}

// POST /api/admin/categories
const createCategory = async (req: NextRequest) => {
  try {
    const data = await req.json()
    const newCategory = await categoryService.createCategory(data)
    if (newCategory) {
      return NextResponse.json(newCategory, { status: 201 })
    } else {
      return NextResponse.json({ message: "Failed to create category." }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ message: "Failed to create category." }, { status: 500 })
  }
}

export const GET = requireAuth(getCategories)
export const POST = requireAuth(createCategory)
