import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Force dynamic rendering pro API autentifikaci
export const dynamic = 'force-dynamic'

// Administrátoři systému
const ADMINS = [
  {
    username: 'pavel',
    passwordHash: '$2b$10$Ua30vjJV8WvSARr8JtrGdekdEGyFNKke3H5PhCt8NjbPCIdlpKGeO', // test123
    role: 'admin'
  },
  {
    username: 'Crazyk',
    passwordHash: '$2b$10$RqADi2XQr6vpuQ1629KYieO3p/dRRCV8eklStzL0PJMIjRiatuNS.', // kILhQO9h3@NY
    role: 'admin'
  }
]

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

    // Najdi admina podle username
    const admin = ADMINS.find(a => a.username === username)
    if (!admin) {
      return NextResponse.json(
        { message: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({ 
      token, 
      message: 'Přihlášení úspěšné',
      user: { username: admin.username, role: admin.role }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Chyba při přihlašování' },
      { status: 500 }
    )
  }
}
