import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD
import { categoryService } from "@/lib/category-service"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/admin/categories
export const GET = requireAuth(
  async (request: NextRequest) => {
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
  async (request: NextRequest) => {
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
=======
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
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
