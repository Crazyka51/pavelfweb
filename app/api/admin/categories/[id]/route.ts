import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { categoryService } from "@/lib/category-service"

// GET - Získat jednu kategorii podle ID
export const GET = requireAuth(
  async (request: NextRequest, authResult: any, { params }: { params: { id: string } }) => {
    try {
      const category = await categoryService.getCategoryById(params.id)

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
  },
  ["admin", "editor"]
)

// PUT - Aktualizovat kategorii
export const PUT = requireAuth(
  async (request: NextRequest, authResult: any, { params }: { params: { id: string } }) => {
    try {
      const updateData = await request.json()
      // Ensure that the `order` property is mapped to `display_order` for the service
      if (updateData.order !== undefined) {
        updateData.display_order = updateData.order
        delete updateData.order
      }
      if (updateData.parentId !== undefined) {
        updateData.parent_id = updateData.parentId
        delete updateData.parentId
      }
      if (updateData.isActive !== undefined) {
        updateData.is_active = updateData.isActive
        delete updateData.isActive
      }

      const updatedCategory = await categoryService.updateCategory(params.id, updateData)

      if (!updatedCategory) {
        return NextResponse.json({ message: "Kategorie nebyla nalezena" }, { status: 404 })
      }

      return NextResponse.json({
        message: "Kategorie byla aktualizována",
        category: updatedCategory,
      })
    } catch (error) {
      console.error("Error updating category:", error)
      return NextResponse.json(
        {
          message: error instanceof Error ? error.message : "Chyba při aktualizaci kategorie",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  },
  ["admin"]
)

// DELETE - Smazat kategorii
export const DELETE = requireAuth(
  async (request: NextRequest, authResult: any, { params }: { params: { id: string } }) => {
    try {
      const deleted = await categoryService.deleteCategory(params.id)

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
          message: error instanceof Error ? error.message : "Chyba při mazání kategorie",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  },
  ["admin"]
)
