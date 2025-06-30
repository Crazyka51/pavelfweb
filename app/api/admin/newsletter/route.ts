import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
  source: string // 'web', 'admin', etc.
  unsubscribeToken?: string
}

// Helper function to read subscribers
async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading subscribers file:', error)
    return []
  }
}

// Helper function to write subscribers
async function writeSubscribers(subscribers: Subscriber[]): Promise<void> {
  try {
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2))
  } catch (error) {
    console.error('Error writing subscribers file:', error)
    throw error
  }
}

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

// POST - Add new subscriber (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: 'Neplatná e-mailová adresa' },
        { status: 400 }
      )
    }

    const subscribers = await readSubscribers()

    // Check if email already exists
    const existingSubscriber = subscribers.find(sub => sub.email.toLowerCase() === email.toLowerCase())
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { message: 'Tato e-mailová adresa je již přihlášena k odběru' },
          { status: 400 }
        )
      } else {
        // Reactivate inactive subscriber
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date().toISOString()
        await writeSubscribers(subscribers)
        
        return NextResponse.json({
          message: 'Odběr novinek byl úspěšně obnoven!'
        })
      }
    }

    // Create new subscriber
    const newSubscriber: Subscriber = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
      isActive: true,
      source: 'web',
      unsubscribeToken: jwt.sign({ email: email.toLowerCase() }, JWT_SECRET)
    }

    subscribers.push(newSubscriber)
    await writeSubscribers(subscribers)

    // TODO: Send welcome email via Resend API

    return NextResponse.json({
      message: 'Děkujeme za přihlášení k odběru novinek!'
    })

  } catch (error) {
    console.error('Error adding subscriber:', error)
    return NextResponse.json(
      { message: 'Chyba při přihlašování k odběru' },
      { status: 500 }
    )
  }
}

// GET - Get all subscribers (admin only)
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request)
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Neautorizovaný přístup' },
      { status: 401 }
    )
  }

  try {
    const subscribers = await readSubscribers()
    
    // Filter active subscribers for stats
    const activeSubscribers = subscribers.filter(sub => sub.isActive)
    
    return NextResponse.json({
      subscribers: activeSubscribers,
      stats: {
        total: activeSubscribers.length,
        thisMonth: activeSubscribers.filter(sub => {
          const subDate = new Date(sub.subscribedAt)
          const now = new Date()
          return subDate.getMonth() === now.getMonth() && subDate.getFullYear() === now.getFullYear()
        }).length
      }
    })

  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání odběratelů' },
      { status: 500 }
    )
  }
}

// DELETE - Unsubscribe (public endpoint with token OR admin endpoint)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenParam = searchParams.get('token')
    const emailParam = searchParams.get('email')

    // Check if this is admin request
    const isAdminRequest = await verifyAdminToken(request)
    
    let targetEmail: string | null = null

    if (isAdminRequest) {
      // Admin request - get email from body
      try {
        const body = await request.json()
        targetEmail = body.email
      } catch (error) {
        return NextResponse.json(
          { message: 'Chybí email v požadavku' },
          { status: 400 }
        )
      }
    } else {
      // Public unsubscribe request - use URL parameters
      if (!tokenParam && !emailParam) {
        return NextResponse.json(
          { message: 'Chybí parametry pro odhlášení' },
          { status: 400 }
        )
      }

      targetEmail = emailParam

      // If token provided, verify it
      if (tokenParam) {
        try {
          const decoded = jwt.verify(tokenParam, JWT_SECRET) as { email: string }
          targetEmail = decoded.email
        } catch (error) {
          return NextResponse.json(
            { message: 'Neplatný token pro odhlášení' },
            { status: 400 }
          )
        }
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        { message: 'Chybí email pro odhlášení' },
        { status: 400 }
      )
    }

    const subscribers = await readSubscribers()

    // Find and deactivate subscriber
    const subscriberIndex = subscribers.findIndex(sub => sub.email === targetEmail)
    if (subscriberIndex === -1) {
      return NextResponse.json(
        { message: 'E-mailová adresa nebyla nalezena' },
        { status: 404 }
      )
    }

    subscribers[subscriberIndex].isActive = false
    await writeSubscribers(subscribers)

    return NextResponse.json({
      message: 'Odběr novinek byl úspěšně zrušen'
    })

  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json(
      { message: 'Chyba při rušení odběru' },
      { status: 500 }
    )
  }
}
