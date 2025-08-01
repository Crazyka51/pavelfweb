import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to verify authentication
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Neplatný token')
  }

  const token = authHeader.substring(7)
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('Chyba konfigurace serveru')
  }

  try {
    return jwt.verify(token, jwtSecret)
  } catch (error) {
    throw new Error('Neplatný token')
  }
}

// GET /api/admin/categories/[id] - Get a single category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })
    
    if (!category) {
      return NextResponse.json({ message: 'Kategorie nenalezena' }, { status: 404 })
    }
    
    return NextResponse.json(category)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při načítání kategorie'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

// PUT /api/admin/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request)
    const categoryData = await request.json()

    if (!categoryData.name) {
      return NextResponse.json({ message: 'Název je povinný' }, { status: 400 })
    }

    const updatedCategory = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: categoryData.name,
      },
    })
    
    return NextResponse.json(updatedCategory)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při aktualizaci kategorie'
    const status = errorMessage === 'Neplatný token' ? 401 : 500
    return NextResponse.json({ message: errorMessage }, { status })
  }
}

// DELETE /api/admin/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    verifyAuth(request)

    // Optional: Check if any articles are using this category before deleting
    const articlesInCategory = await prisma.article.count({
      where: { categoryId: params.id },
    })

    if (articlesInCategory > 0) {
      return NextResponse.json(
        { message: 'Nelze smazat kategorii, která je přiřazena k článkům. Nejprve změňte kategorii u daných článků.' },
        { status: 409 } // 409 Conflict
      )
    }

    await prisma.category.delete({
      where: { id: params.id },
    })
    
    return NextResponse.json({ message: 'Kategorie byla smazána' })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při mazání kategorie'
    const status = errorMessage === 'Neplatný token' ? 401 : 500
    return NextResponse.json({ message: errorMessage }, { status })
  }
}
