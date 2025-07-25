import { NextResponse } from "next/server"
import { getCategories, createCategory } from "@/lib/services/category-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const activeOnly = searchParams.get("activeOnly") === "true"

  try {
    const { categories, total, hasMore } = await getCategories({ page, limit, activeOnly })
    return NextResponse.json({ categories, total, hasMore })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ message: "Error fetching categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const newCategory = await createCategory({ ...body, created_by: authResult.user?.username || "admin" })
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ message: "Error creating category" }, { status: 500 })
  }
}
