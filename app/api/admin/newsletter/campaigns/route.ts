import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { newsletterService } from "@/lib/services/newsletter-service"
import type { NewsletterCampaign } from "@/lib/database"

// GET - Get all campaigns
export const GET = requireAuth(async (request: NextRequest, authData: any) => {

  try {
    const campaigns = await newsletterService.getCampaigns()

    return NextResponse.json(campaigns)
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
})

// POST - Create new campaign
export const POST = requireAuth(async (request: NextRequest, authData: any) => {

  try {
    const campaignData = await request.json()
    const { subject, content, htmlContent, textContent, templateId, status, scheduledAt, createdBy, tags, segmentId } =
      campaignData

    if (!subject || !content) {
      return NextResponse.json({ message: "Předmět a obsah kampaně jsou povinné" }, { status: 400 })
    }

    // For simplicity, recipientCount, openRate, clickRate are set to 0 initially
    // In a real system, these would be updated after sending.
    const newCampaign: Omit<
      NewsletterCampaign,
      | "id"
      | "created_at"
      | "updated_at"
      | "recipient_count"
      | "open_count"
      | "click_count"
      | "bounce_count"
      | "unsubscribe_count"
    > = {
      name: campaignData.name || subject, // Use subject as name if not provided
      subject: subject.trim(),
      content: content.trim(),
      html_content: htmlContent || content.trim(), // Assume HTML content is same as content if not provided
      text_content: textContent || null,
      template_id: templateId || null,
      status: status || "draft", // Default to draft
      scheduled_at: scheduledAt ? new Date(scheduledAt) : undefined,
      created_by: createdBy || "admin", // Replace with actual user ID
      tags: tags || [],
      segment_id: segmentId || null,
    }

    const createdCampaign = await newsletterService.createCampaign(newCampaign)

    return NextResponse.json(
      {
        message: "Kampaň byla úspěšně vytvořena",
        campaign: createdCampaign,
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
})

export const dynamic = "force-dynamic"
