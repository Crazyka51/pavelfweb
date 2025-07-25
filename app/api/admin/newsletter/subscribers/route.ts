import { NextResponse } from "next/server"
import {
  getNewsletterSubscribers,
  addNewsletterSubscriber,
  updateNewsletterSubscriber,
  deleteNewsletterSubscriber,
} from "@/lib/services/newsletter-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const activeOnly = searchParams.get("activeOnly") === "true"

  try {
    const subscribers = await getNewsletterSubscribers(activeOnly)
    return NextResponse.json(subscribers)
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error)
    return NextResponse.json({ message: "Error fetching subscribers" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const newSubscriber = await addNewsletterSubscriber(body.email, body.source || "manual")
    return NextResponse.json(newSubscriber, { status: 201 })
  } catch (error) {
    console.error("Error adding newsletter subscriber:", error)
    return NextResponse.json({ message: "Error adding subscriber" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ message: "Subscriber ID is required" }, { status: 400 })
    }
    const updatedSubscriber = await updateNewsletterSubscriber(body.id, body)
    if (!updatedSubscriber) {
      return NextResponse.json({ message: "Subscriber not found" }, { status: 404 })
    }
    return NextResponse.json(updatedSubscriber)
  } catch (error) {
    console.error("Error updating newsletter subscriber:", error)
    return NextResponse.json({ message: "Error updating subscriber" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body.id) {
      return NextResponse.json({ message: "Subscriber ID is required for deletion" }, { status: 400 })
    }
    const success = await deleteNewsletterSubscriber(body.id)
    if (!success) {
      return NextResponse.json({ message: "Subscriber not found or failed to delete" }, { status: 404 })
    }
    return NextResponse.json({ message: "Subscriber deleted successfully" })
  } catch (error) {
    console.error("Error deleting newsletter subscriber:", error)
    return NextResponse.json({ message: "Error deleting subscriber" }, { status: 500 })
  }
}
