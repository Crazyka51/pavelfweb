import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Force dynamic rendering pro API autentifikaci
export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided', valid: false },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    return NextResponse.json({ 
      valid: true, 
      username: decoded.username 
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Neplatný token', valid: false },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { message: 'Token je povinný' },
        { status: 400 }
      )
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    return NextResponse.json({ 
      valid: true, 
      user: { username: decoded.username, role: decoded.role } 
    })
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: 'Neplatný token' },
      { status: 401 }
    )
  }
}
