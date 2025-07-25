import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import jwt from "jsonwebtoken"
import { Resend } from "resend"
import { createNewsletterCampaign } from "@/lib/services/newsletter-service"
import { verifyAuth } from "@/lib/auth-utils"

const SUBSCRIBERS_FILE = path.join(process.cwd(), "data", "newsletter-subscribers.json")
const CAMPAIGNS_FILE = path.join(process.cwd(), "data", "newsletter-campaigns.json")
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const resend = new Resend(process.env.RESEND_API_KEY)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
  source: string
  unsubscribeToken?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  createdAt: string
  updatedAt: string
}

interface Campaign {
  id: string
  templateId: string
  name: string
  subject: string
  recipients: string[]
  sentAt: string
  status: "sent" | "failed" | "sending"
  stats: {
    sent: number
    delivered: number
    failed: number
  }
}

async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading subscribers file:", error)
    return []
  }
}

async function readCampaigns(): Promise<Campaign[]> {
  try {
    const data = await fs.readFile(CAMPAIGNS_FILE, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Error reading campaigns file:", error)
    return []
  }
}

async function writeCampaigns(campaigns: Campaign[]): Promise<void> {
  try {
    const dataDir = path.dirname(CAMPAIGNS_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2))
  } catch (error) {
    console.error("Error writing campaigns file:", error)
    throw error
  }
}

async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false
    }

    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

async function sendNewsletterEmail(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  unsubscribeToken?: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined)
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL není nastavena. Nastavte ji na https://fiserpavel.cz v prostředí Vercelu.")
  }
  const unsubscribeUrl = `${baseUrl}/api/admin/newsletter?token=${unsubscribeToken}`

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
          background-color: #f4f4f4;
        }
        .email-container {
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
          text-align: center;
        }
        .footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 20px;
          margin-top: 30px;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
        }
        .unsubscribe {
          color: #6b7280;
          text-decoration: none;
        }
        h2 { color: #1f2937; }
        h3 { color: #374151; }
        a { color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 style="color: #2563eb; margin: 0;">Pavel Fišer - Praha 4</h1>
          <p style="margin: 5px 0 0 0; color: #6b7280;">Radní pro místní rozvoj</p>
        </div>
        
        ${htmlContent}
        
        <div class="footer">
          <p>Tento e-mail byl odeslán z adresy no-reply@pavelfiser.cz</p>
          <p><a href="${unsubscribeUrl}" class="unsubscribe">Odhlásit se z odběru</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "test-key") {
    try {
      const result = await resend.emails.send({
        from: "Pavel Fišer <no-reply@pavelfiser.cz>",
        to: [to],
        subject: subject,
        html: emailHtml,
        text: textContent + `\n\nOdhlásit se z odběru: ${unsubscribeUrl}`,
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      })

      if (result.data) {
        console.log(`✅ E-mail úspěšně odeslán na: ${to} (ID: ${result.data.id})`)
        return {
          success: true,
          messageId: result.data.id,
        }
      } else {
        throw new Error(result.error?.message || "Unknown error")
      }
    } catch (error: any) {
      console.error(`❌ Chyba při odesílání na ${to}:`, error.message)
      return {
        success: false,
        error: error.message,
      }
    }
  } else {
    console.log(`📧 [MOCK] Sending newsletter to: ${to}`)
    console.log(`📧 [MOCK] Subject: ${subject}`)

    await new Promise((resolve) => setTimeout(resolve, 100))

    const success = Math.random() > 0.05

    if (success) {
      return {
        success: true,
        messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }
    } else {
      return {
        success: false,
        error: "Mock email delivery failed",
      }
    }
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { subject, content, htmlContent, recipients, createdBy, templateId, tags, segmentId } = await request.json()

    if (!subject || !content || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { message: "Missing required fields: subject, content, and recipients" },
        { status: 400 },
      )
    }

    // Send emails via Resend
    const { data, error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: recipients,
      subject: subject,
      html: htmlContent || content,
      text: content, // Fallback to text content if htmlContent is not provided
    })

    if (error) {
      console.error("Resend email error:", error)
      // Record campaign as failed if Resend fails
      await createNewsletterCampaign({
        name: subject, // Using subject as name for simplicity
        subject,
        content,
        html_content: htmlContent || content,
        text_content: content,
        template_id: templateId,
        status: "failed",
        scheduled_at: null,
        sent_at: new Date(),
        recipient_count: recipients.length,
        open_count: 0, // Resend webhooks would update these later
        click_count: 0,
        bounce_count: 0,
        unsubscribe_count: 0,
        created_by: createdBy || "system",
        tags: tags || [],
        segment_id: segmentId,
      })
      return NextResponse.json({ message: "Failed to send emails", error: error.message }, { status: 500 })
    }

    // Record campaign as sent in the database
    const newCampaign = await createNewsletterCampaign({
      name: subject, // Using subject as name for simplicity
      subject,
      content,
      html_content: htmlContent || content,
      text_content: content,
      template_id: templateId,
      status: "sent",
      scheduled_at: null,
      sent_at: new Date(),
      recipient_count: recipients.length,
      open_count: 0, // Resend webhooks would update these later
      click_count: 0,
      bounce_count: 0,
      unsubscribe_count: 0,
      created_by: createdBy || "system",
      tags: tags || [],
      segment_id: segmentId,
    })

    return NextResponse.json({ message: "Emails sent successfully", data, campaign: newCampaign }, { status: 200 })
  } catch (error) {
    console.error("Error in newsletter send API:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request)
  if (!isAdmin) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const campaigns = await readCampaigns()
    const safeCampaigns = Array.isArray(campaigns) ? campaigns : []
    return NextResponse.json({
      campaigns: safeCampaigns.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()),
    })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ campaigns: [] }, { status: 500 })
  }
}
