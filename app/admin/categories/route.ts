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

// GET /api/admin/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Auth might not be needed for public reading of categories
    // verifyAuth(request) 
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(categories)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při načítání kategorií'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    verifyAuth(request)
    const categoryData = await request.json()

    // Validate required fields
    if (!categoryData.name) {
      return NextResponse.json(
        { message: 'Název kategorie je povinný' },
        { status: 400 }
      )
    }

    const newCategory = await prisma.category.create({
      data: {
        name: categoryData.name,
      },
    })

    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Chyba při vytváření kategorie'
    const status = errorMessage === 'Neplatný token' ? 401 : 500
    return NextResponse.json({ message: errorMessage }, { status })
  }
}
