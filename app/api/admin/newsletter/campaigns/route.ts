import { type NextRequest, NextResponse } from "next/server"
import { NewsletterService } from "@/lib/services/newsletter-service"

const newsletterService = new NewsletterService()

// Helper function to verify admin token
function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const token = authHeader.substring(7)
  try {
    const decoded = Buffer.from(token, "base64").toString()
    const [username, timestamp] = decoded.split(":")
    const tokenAge = Date.now() - Number.parseInt(timestamp)
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    return tokenAge <= maxAge
  } catch (error) {
    return false
  }
}

// Helper function to calculate campaign stats
function calculateCampaignStats(campaign: Campaign): CampaignStats {
  const { recipientCount, openCount, clickCount, bounceCount, unsubscribeCount } = campaign

  return {
    openRate: recipientCount > 0 ? (openCount / recipientCount) * 100 : 0,
    clickRate: recipientCount > 0 ? (clickCount / recipientCount) * 100 : 0,
    bounceRate: recipientCount > 0 ? (bounceCount / recipientCount) * 100 : 0,
    unsubscribeRate: recipientCount > 0 ? (unsubscribeCount / recipientCount) * 100 : 0,
  }
}

// GET - Get all campaigns
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""

    let campaigns = await campaignManager.read()

    // Filter by status
    if (status && status !== "all") {
      campaigns = campaigns.filter((campaign) => campaign.status === status)
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      campaigns = campaigns.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchLower) ||
          campaign.subject.toLowerCase().includes(searchLower) ||
          campaign.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Sort by creation date (newest first)
    campaigns.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedCampaigns = campaigns.slice(startIndex, endIndex)

    // Add stats to each campaign
    const campaignsWithStats = paginatedCampaigns.map((campaign) => ({
      ...campaign,
      stats: calculateCampaignStats(campaign),
    }))

    // Calculate overall stats
    const totalCampaigns = campaigns.length
    const sentCampaigns = campaigns.filter((c) => c.status === "sent")
    const totalRecipients = sentCampaigns.reduce((sum, c) => sum + c.recipientCount, 0)
    const totalOpens = sentCampaigns.reduce((sum, c) => sum + c.openCount, 0)
    const totalClicks = sentCampaigns.reduce((sum, c) => sum + c.clickCount, 0)

    const overallStats = {
      totalCampaigns,
      sentCampaigns: sentCampaigns.length,
      totalRecipients,
      averageOpenRate: totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0,
      averageClickRate: totalRecipients > 0 ? (totalClicks / totalRecipients) * 100 : 0,
    }

    return NextResponse.json({
      campaigns: campaignsWithStats,
      pagination: {
        page,
        limit,
        total: campaigns.length,
        pages: Math.ceil(campaigns.length / limit),
      },
      stats: overallStats,
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      {
        message: "Chyba při načítání kampaní",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const campaignData = await request.json()
    const { name, subject, content, htmlContent, textContent, templateId, scheduledAt, tags, segmentId } = campaignData

    if (!name || !subject || !content) {
      return NextResponse.json({ message: "Název, předmět a obsah kampaně jsou povinné" }, { status: 400 })
    }

    // Validate scheduled date if provided
    if (scheduledAt) {
      const scheduledDate = new Date(scheduledAt)
      if (scheduledDate <= new Date()) {
        return NextResponse.json({ message: "Datum plánování musí být v budoucnosti" }, { status: 400 })
      }
    }

    const newCampaign: Campaign = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      subject: subject.trim(),
      content: content.trim(),
      htmlContent: htmlContent || content,
      textContent: textContent,
      templateId,
      status: scheduledAt ? "scheduled" : "draft",
      scheduledAt,
      recipientCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      unsubscribeCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "admin", // Would be actual user ID in real implementation
      tags: tags || [],
      segmentId,
    }

    await campaignManager.create(newCampaign)

    return NextResponse.json(
      {
        message: "Kampaň byla úspěšně vytvořena",
        campaign: {
          ...newCampaign,
          stats: calculateCampaignStats(newCampaign),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      {
        message: "Chyba při vytváření kampaně",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
