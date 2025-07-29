import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { NewsletterService } from "@/lib/services/newsletter-service"

const newsletterService = new NewsletterService()

export const GET = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const active = searchParams.get("active")
    const search = searchParams.get("search")
    const source = searchParams.get("source")

    // Získání všech odběratelů
    const activeOnly = active === "true" || active === null
    let subscribers = await newsletterService.getSubscribers(!activeOnly)

    // Client-side filtrování (v budoucnu přesunout do DB)
    if (source && source !== "all") {
      subscribers = subscribers.filter((sub) => sub.source === source)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      subscribers = subscribers.filter(
        (sub) =>
          sub.email.toLowerCase().includes(searchLower)
      )
    }

    // Paginace
    const total = subscribers.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSubscribers = subscribers.slice(startIndex, endIndex)

    // Statistiky
    const stats = {
      total: subscribers.length,
      active: subscribers.filter((s) => s.is_active).length,
      inactive: subscribers.filter((s) => !s.is_active).length,
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

export const POST = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    const subscriberData = await request.json()

    // Validace
    if (!subscriberData.email) {
      return NextResponse.json({ error: "Email je povinný" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(subscriberData.email)) {
      return NextResponse.json({ error: "Neplatný formát emailu" }, { status: 400 })
    }

    try {
      const savedSubscriber = await newsletterService.subscribeEmail(
        subscriberData.email,
        subscriberData.source || "admin"
      )

      return NextResponse.json({
        success: true,
        subscriber: savedSubscriber,
      })
    } catch (error: any) {
      // Duplicitní email
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        return NextResponse.json({ error: "Email je již registrován" }, { status: 409 })
      }
      throw error
    }
  } catch (error) {
    console.error("Subscribers POST error:", error)
    return NextResponse.json({ error: "Chyba při vytváření odběratele" }, { status: 500 })
  }
})
