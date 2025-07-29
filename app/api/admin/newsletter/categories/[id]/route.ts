import { type NextRequest, NextResponse } from "next/server"
import { DataManager } from "@/lib/data-persistence"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  parentId?: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const categoryManager = new DataManager<Category>("categories.json")

// Helper function to verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const token = authHeader.substring(7)
  try {
    const decoded = Buffer.from(token, "base64").toString()
    const [username, timestamp] = decoded.split(":")
    const tokenAge = Date.now() - Number.parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    return tokenAge <= maxAge
  } catch (error) {
    return false
  }
}

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

// GET - Get single category
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const category = await categoryManager.findById(params.id)

    if (!category) {
      return NextResponse.json({ message: "Kategorie nebyla nalezena" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json(
      {
        message: "Chyba při načítání kategorie",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT - Update category
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const updateData = await request.json()
    const { name, description, color, icon, parentId, order, isActive } = updateData

    const categories = await categoryManager.read()
    const existingCategory = categories.find((cat) => cat.id === params.id)

    if (!existingCategory) {
      return NextResponse.json({ message: "Kategorie nebyla nalezena" }, { status: 404 })
    }

    // Validate name if being updated
    if (name !== undefined) {
      if (!name || name.trim() === "") {
        return NextResponse.json({ message: "Název kategorie je povinný" }, { status: 400 })
      }

      const slug = generateSlug(name)

      // Check for duplicate name/slug (excluding current category)
      const duplicateCategory = categories.find(
        (cat) => cat.id !== params.id && (cat.name.toLowerCase() === name.toLowerCase() || cat.slug === slug),
      )

      if (duplicateCategory) {
        return NextResponse.json({ message: "Kategorie s tímto názvem již existuje" }, { status: 400 })
      }

      updateData.slug = slug
    }

    // Validate parent category if provided
    if (parentId !== undefined && parentId !== null) {
      if (parentId === params.id) {
        return NextResponse.json({ message: "Kategorie nemůže být nadřazená sama sobě" }, { status: 400 })
      }

      const parentCategory = categories.find((cat) => cat.id === parentId)
      if (!parentCategory) {
        return NextResponse.json({ message: "Nadřazená kategorie nebyla nalezena" }, { status: 400 })
      }

      // Check for circular reference
      let currentParent = parentCategory
      while (currentParent?.parentId) {
        if (currentParent.parentId === params.id) {
          return NextResponse.json({ message: "Nelze vytvořit cyklickou závislost kategorií" }, { status: 400 })
        }
        currentParent = categories.find((cat) => cat.id === currentParent!.parentId)
        if (!currentParent) break
      }
    }

    const updatedCategory = await categoryManager.update(params.id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      message: "Kategorie byla aktualizována",
      category: updatedCategory,
    })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      {
        message: "Chyba při aktualizaci kategorie",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const categories = await categoryManager.read()
    const categoryToDelete = categories.find((cat) => cat.id === params.id)

    if (!categoryToDelete) {
      return NextResponse.json({ message: "Kategorie nebyla nalezena" }, { status: 404 })
    }

    // Check if category has child categories
    const childCategories = categories.filter((cat) => cat.parentId === params.id)
    if (childCategories.length > 0) {
      return NextResponse.json(
        {
          message: "Nelze smazat kategorii, která má podkategorie",
          childCategories: childCategories.map((cat) => ({ id: cat.id, name: cat.name })),
        },
        { status: 400 },
      )
    }

    // Check if category is used by articles
    try {
      const articleManager = new DataManager<any>("articles.json")
      const articles = await articleManager.read()
      const articlesInCategory = articles.filter((article) => article.category === categoryToDelete.name)

      if (articlesInCategory.length > 0) {
        return NextResponse.json(
          {
            message: "Nelze smazat kategorii, která obsahuje články",
            articleCount: articlesInCategory.length,
          },
          { status: 400 },
        )
      }
    } catch (error) {
      console.error("Error checking articles:", error)
    }

    const deleted = await categoryManager.delete(params.id)

    if (!deleted) {
      return NextResponse.json({ message: "Kategorie nebyla nalezena" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Kategorie byla úspěšně smazána",
    })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      {
        message: "Chyba při mazání kategorie",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
