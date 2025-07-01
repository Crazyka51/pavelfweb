import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { DataManager } from "@/lib/data-persistence"

interface Subscriber {
  id: string
  email: string
  name?: string
  active: boolean
  source: string
  subscribedAt: string
  preferences: {
    newsletter: boolean
    announcements: boolean
    events: boolean
  }
}

const subscribersManager = new DataManager<Subscriber>("newsletter-subscribers.json")

export async function GET(request: NextRequest) {
  try {
    requireAuth(request)

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const active = searchParams.get("active")
    const search = searchParams.get("search")
    const source = searchParams.get("source")

    let subscribers = await subscribersManager.read()

    // Filtrování
    if (active !== null && active !== undefined) {
      const isActive = active === "true"
      subscribers = subscribers.filter((sub) => sub.active === isActive)
    }

    if (source && source !== "all") {
      subscribers = subscribers.filter((sub) => sub.source === source)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      subscribers = subscribers.filter(
        (sub) =>
          sub.email.toLowerCase().includes(searchLower) || (sub.name && sub.name.toLowerCase().includes(searchLower)),
      )
    }

    // Řazení podle data přihlášení (nejnovější první)
    subscribers.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime())

    // Paginace
    const total = subscribers.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSubscribers = subscribers.slice(startIndex, endIndex)

    // Statistiky
    const stats = {
      total: subscribers.length,
      active: subscribers.filter((s) => s.active).length,
      inactive: subscribers.filter((s) => !s.active).length,
      sources: subscribers.reduce(
        (acc, sub) => {
          acc[sub.source] = (acc[sub.source] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    }

    return NextResponse.json({
      subscribers: paginatedSubscribers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error("Subscribers GET error:", error)
    return NextResponse.json({ error: "Chyba při načítání odběratelů" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAuth(request)

    const subscriberData = await request.json()

    // Validace
    if (!subscriberData.email) {
      return NextResponse.json({ error: "E-mail je povinný" }, { status: 400 })
    }

    // Kontrola duplicity
    const existingSubscribers = await subscribersManager.read()
    const existingSubscriber = existingSubscribers.find((s) => s.email === subscriberData.email)

    if (existingSubscriber) {
      return NextResponse.json({ error: "Tento e-mail je již registrován" }, { status: 400 })
    }

    // Vytvoření nového odběratele
    const newSubscriber: Subscriber = {
      id: `subscriber_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: subscriberData.email,
      name: subscriberData.name,
      active: subscriberData.active !== false,
      source: subscriberData.source || "admin",
      subscribedAt: new Date().toISOString(),
      preferences: {
        newsletter: true,
        announcements: true,
        events: true,
        ...subscriberData.preferences,
      },
    }

    const savedSubscriber = await subscribersManager.create(newSubscriber)

    return NextResponse.json({
      success: true,
      subscriber: savedSubscriber,
    })
  } catch (error) {
    console.error("Subscribers POST error:", error)
    return NextResponse.json({ error: "Chyba při vytváření odběratele" }, { status: 500 })
  }
}
