import { NextResponse } from "next/server"
import { getNewsletterSubscribers } from "@/lib/services/newsletter-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const subscribers = await getNewsletterSubscribers()

    const csvRows = [
      ["id", "email", "subscribed_at", "is_active", "source", "unsubscribed_at"],
      ...subscribers.map((s) => [
        s.id,
        s.email,
        s.subscribed_at.toISOString(),
        s.is_active ? "true" : "false",
        s.source,
        s.unsubscribed_at ? s.unsubscribed_at.toISOString() : "",
      ]),
    ]

    const csvContent = csvRows.map((row) => row.join(",")).join("\n")

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="newsletter_subscribers_${new Date().toISOString()}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting subscribers:", error)
    return NextResponse.json({ message: "Error exporting subscribers" }, { status: 500 })
  }
}
