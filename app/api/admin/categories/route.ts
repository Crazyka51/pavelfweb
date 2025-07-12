import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { categoryService } from "@/lib/category-service"
import type { Category } from "@/lib/database" // Import Category interface

// GET - Get all categories
export async function GET(request: NextRequest) {
  const authResponse = requireAuth(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { searchParams } = new URL(request.url)
    const includeArticleCount = searchParams.get("includeArticleCount") === "true"
    const activeOnly = searchParams.get("activeOnly") === "true"

    const categories = await categoryService.getAllCategories(includeArticleCount, activeOnly)

    return NextResponse.json({
      categories,
      total: categories.length,
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      {
        message: "Chyba při načítání kategorií",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  const authResponse = requireAuth(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { name, description, color, icon, parentId, displayOrder, isActive } = await request.json()

    if (!name || name.trim() === "") {
      return NextResponse.json({ message: "Název kategorie je povinný" }, { status: 400 })
    }

    const newCategory = await categoryService.createCategory({
      name: name.trim(),
      description: description?.trim(),
      color: color,
      icon: icon?.trim(),
      parentId: parentId,
      displayOrder: displayOrder,
      isActive: isActive,
    })

    return NextResponse.json(
      {
        message: "Kategorie byla úspěšně vytvořena",
        category: newCategory,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Chyba při vytváření kategorie",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT - Update categories order (or other bulk updates)
export async function PUT(request: NextRequest) {
  const authResponse = requireAuth(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const { categories: categoryUpdates } = await request.json()

    if (!Array.isArray(categoryUpdates)) {
      return NextResponse.json({ message: "Neplatný formát dat" }, { status: 400 })
    }

    const updatedCategories: Category[] = []
    for (const update of categoryUpdates) {
      const updatedCategory = await categoryService.updateCategory(update.id, {
        display_order: update.display_order,
        // Add other fields if they can be bulk updated
      })
      if (updatedCategory) {
        updatedCategories.push(updatedCategory)
      }
    }

    return NextResponse.json({
      message: "Pořadí kategorií bylo aktualizováno",
      categories: updatedCategories.sort((a, b) => a.display_order - b.display_order),
    })
  } catch (error) {
    console.error("Error updating category order:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Chyba při aktualizaci pořadí kategorií",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
