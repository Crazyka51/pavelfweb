import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Force dynamic rendering pro API autentifikaci
export const dynamic = 'force-dynamic'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'pavel'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2b$10$Ua30vjJV8WvSARr8JtrGdekdEGyFNKke3H5PhCt8NjbPCIdlpKGeO' // test123
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Uživatelské jméno a heslo jsou povinné' },
        { status: 400 }
      )
    }

    if (username !== ADMIN_USERNAME) {
      return NextResponse.json(
        { message: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({ token, message: 'Přihlášení úspěšné' })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Chyba při přihlašování' },
      { status: 500 }
    )
  }
}
