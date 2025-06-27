import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Uživatelské jméno a heslo jsou povinné' },
        { status: 400 }
      )
    }

    // Get credentials from environment
    const adminUsername = process.env.ADMIN_USERNAME || 'pavel'
    const adminPassword = process.env.ADMIN_PASSWORD || 'test123'
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      console.error('JWT_SECRET is not set')
      return NextResponse.json(
        { message: 'Chyba konfigurace serveru' },
        { status: 500 }
      )
    }

    // Check credentials
    if (username !== adminUsername) {
      return NextResponse.json(
        { message: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      )
    }

    // For development, we can use plain text password comparison
    // In production, you should hash the password in environment
    const isValidPassword = password === adminPassword

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Neplatné přihlašovací údaje' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: adminUsername,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      message: 'Přihlášení úspěšné',
      token,
      user: {
        username: adminUsername,
        role: 'admin'
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Chyba při přihlašování' },
      { status: 500 }
    )
  }
}
