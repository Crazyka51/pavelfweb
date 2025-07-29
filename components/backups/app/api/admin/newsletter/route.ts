import { type NextRequest, NextResponse } from "next/server"
import { requireAuth, verifyAuth } from "@/lib/auth-utils"
import { NewsletterService } from "@/lib/services/newsletter-service"

const newsletterService = new NewsletterService();

// POST - Add new subscriber (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ message: "Neplatná e-mailová adresa" }, { status: 400 })
    }

    try {
      const newSubscriber = await newsletterService.subscribeEmail(email.toLowerCase(), "web")
      return NextResponse.json({
        message: "Děkujeme za přihlášení k odběru novinek!",
        subscriber: newSubscriber,
      })
    } catch (error: any) {
      if (error.message.includes("existuje")) {
        // Check for specific error message from service
        return NextResponse.json({ message: "Tato e-mailová adresa je již přihlášena k odběru" }, { status: 400 })
      }
      console.error("Error adding subscriber:", error)
      return NextResponse.json({ message: "Chyba při přihlašování k odběru" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error adding subscriber:", error)
    return NextResponse.json({ message: "Chyba při přihlašování k odběru" }, { status: 500 })
  }
}

// GET - Get all subscribers (admin only)
export const GET = requireAuth(async (request: NextRequest, authResult: any) => {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("activeOnly") === "true"

    const subscribers = await newsletterService.getSubscribers(activeOnly)
    const stats = await newsletterService.getSubscriberStats()

    return NextResponse.json({
      subscribers: subscribers,
      stats: stats,
    })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ message: "Chyba při načítání odběratelů" }, { status: 500 })
  }
})

// DELETE - Unsubscribe (public endpoint with token OR admin endpoint)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokenParam = searchParams.get("token")

    // Check if this is admin request by trying to verify auth
    const authResult = await verifyAuth(request)
    const isAdminRequest = !(authResult instanceof NextResponse) // Not unauthorized

    let targetEmail: string | null = null

    if (isAdminRequest) {
      // Admin request - get email from body
      try {
        const body = await request.json()
        targetEmail = body.email
      } catch (error) {
        return NextResponse.json({ message: "Chybí email v požadavku pro odhlášení administrátorem" }, { status: 400 })
      }
    } else {
      // Public unsubscribe request - use URL parameters
      if (!tokenParam) {
        return NextResponse.json({ message: "Chybí token pro odhlášení" }, { status: 400 })
      }

      try {
        // In a real app, you'd verify the token to get the email
        // For now, we'll assume the token directly contains the email or is a simple ID
        // For this example, let's assume the token is the email for simplicity,
        // but in production, it should be a signed JWT or a lookup ID.
        targetEmail = tokenParam // This is a simplification!
        // If using JWT: const decoded = jwt.verify(tokenParam, JWT_SECRET) as { email: string }; targetEmail = decoded.email;
      } catch (error) {
        return NextResponse.json({ message: "Neplatný token pro odhlášení" }, { status: 400 })
      }
    }

    if (!targetEmail) {
      return NextResponse.json({ message: "Chybí email pro odhlášení" }, { status: 400 })
    }

    const unsubscribed = await newsletterService.unsubscribeEmail(targetEmail)

    if (!unsubscribed) {
      return NextResponse.json({ message: "E-mailová adresa nebyla nalezena nebo již byla odhlášena" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Odběr novinek byl úspěšně zrušen",
    })
  } catch (error) {
    console.error("Error unsubscribing:", error)
    return NextResponse.json({ message: "Chyba při rušení odběru" }, { status: 500 })
  }
}
