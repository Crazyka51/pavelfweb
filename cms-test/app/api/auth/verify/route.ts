import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { valid: false, message: 'Token není poskytnut' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return NextResponse.json(
        { valid: false, message: 'Chyba konfigurace serveru' },
        { status: 500 }
      )
    }

    // Verify JWT token
    const decoded = jwt.verify(token, jwtSecret) as any

    return NextResponse.json({
      valid: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { valid: false, message: 'Neplatný token' },
      { status: 401 }
    )
  }
}
