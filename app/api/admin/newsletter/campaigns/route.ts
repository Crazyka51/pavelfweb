import { NextResponse } from "next/server"
import { getNewsletterCampaigns, createNewsletterCampaign } from "@/lib/services/newsletter-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const campaigns = await getNewsletterCampaigns()
    return NextResponse.json(campaigns)
  } catch (error) {
    console.error("Error fetching newsletter campaigns:", error)
    return NextResponse.json({ message: "Error fetching campaigns" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const newCampaign = await createNewsletterCampaign({ ...body, created_by: authResult.user?.username || "admin" })
    return NextResponse.json(newCampaign, { status: 201 })
  } catch (error) {
    console.error("Error creating newsletter campaign:", error)
    return NextResponse.json({ message: "Error creating campaign" }, { status: 500 })
  }
}
