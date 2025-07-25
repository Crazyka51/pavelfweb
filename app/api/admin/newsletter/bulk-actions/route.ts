import { NextResponse } from "next/server"
import { updateNewsletterSubscriber, deleteNewsletterSubscriber } from "@/lib/services/newsletter-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function POST(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { action, subscriberIds } = await request.json()

    if (!Array.isArray(subscriberIds) || subscriberIds.length === 0) {
      return NextResponse.json({ message: "No subscriber IDs provided" }, { status: 400 })
    }

    const results: any[] = []

    switch (action) {
      case "unsubscribe":
        for (const id of subscriberIds) {
          const updated = await updateNewsletterSubscriber(id, { is_active: false, unsubscribed_at: new Date() })
          results.push({ id, success: !!updated, action: "unsubscribe" })
        }
        break
      case "delete":
        for (const id of subscriberIds) {
          const success = await deleteNewsletterSubscriber(id)
          results.push({ id, success, action: "delete" })
        }
        break
      default:
        return NextResponse.json({ message: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error("Error performing bulk action on subscribers:", error)
    return NextResponse.json({ message: "Error performing bulk action" }, { status: 500 })
  }
}
