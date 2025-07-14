import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import { Resend } from 'resend'

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'newsletter-subscribers.json')
const CAMPAIGNS_FILE = path.join(process.cwd(), 'data', 'newsletter-campaigns.json')
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

// Initialize Resend (it will use mock if no API key provided)
const resend = new Resend(process.env.RESEND_API_KEY || 'test-key')

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
  status: 'sent' | 'failed' | 'sending'
  stats: {
    sent: number
    delivered: number
    failed: number
  }
}

// Helper function to read subscribers
async function readSubscribers(): Promise<Subscriber[]> {
  try {
    const data = await fs.readFile(SUBSCRIBERS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading subscribers file:', error)
    return []
  }
}

// Helper function to read campaigns
async function readCampaigns(): Promise<Campaign[]> {
  try {
    const data = await fs.readFile(CAMPAIGNS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading campaigns file:', error)
    return []
  }
}

// Helper function to write campaigns
async function writeCampaigns(campaigns: Campaign[]): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(CAMPAIGNS_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    
    await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2))
  } catch (error) {
    console.error('Error writing campaigns file:', error)
    throw error
  }
}

// Helper function to verify admin token
async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.substring(7)
    jwt.verify(token, JWT_SECRET)
    return true
  } catch (error) {
    return false
  }
}

// Function for sending emails with Resend or mock
async function sendNewsletterEmail(
  to: string, 
  subject: string, 
  htmlContent: string, 
  textContent: string,
  unsubscribeToken?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  // Add unsubscribe link to content
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined);
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_BASE_URL není nastavena. Nastavte ji na https://fiserpavel.cz v prostředí Vercelu.");
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
  
  // Try to send with Resend API if key is available
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'test-key') {
    try {
      const result = await resend.emails.send({
        from: 'Pavel Fišer <no-reply@pavelfiser.cz>',
        to: [to],
        subject: subject,
        html: emailHtml,
        text: textContent + `\n\nOdhlásit se z odběru: ${unsubscribeUrl}`,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      })
      
      if (result.data) {
        console.log(`✅ E-mail úspěšně odeslán na: ${to} (ID: ${result.data.id})`)
        return { 
          success: true, 
          messageId: result.data.id 
        }
      } else {
        throw new Error(result.error?.message || 'Unknown error')
      }
    } catch (error: any) {
      console.error(`❌ Chyba při odesílání na ${to}:`, error.message)
      return { 
        success: false, 
        error: error.message 
      }
    }
  } else {
    // Mock sending for development/testing
    console.log(`📧 [MOCK] Sending newsletter to: ${to}`)
    console.log(`📧 [MOCK] Subject: ${subject}`)
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05
    
    if (success) {
      return { 
        success: true, 
        messageId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      }
    } else {
      return { 
        success: false, 
        error: 'Mock email delivery failed' 
      }
    }
  }
}

// POST - Send newsletter campaign (admin only)
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request)
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Neautorizovaný přístup' },
      { status: 401 }
    )
  }

  try {
    const { template, recipients }: { 
      template: EmailTemplate, 
      recipients: string[] 
    } = await request.json()

    if (!template || !template.subject || !template.htmlContent) {
      return NextResponse.json(
        { message: 'Neplatná šablona e-mailu' },
        { status: 400 }
      )
    }

    // Get active subscribers if no specific recipients provided
    let targetRecipients = recipients
    if (!recipients || recipients.length === 0) {
      const subscribers = await readSubscribers()
      targetRecipients = subscribers
        .filter(sub => sub.isActive)
        .map(sub => sub.email)
    }

    if (targetRecipients.length === 0) {
      return NextResponse.json(
        { message: 'Žádní odběratelé k odeslání' },
        { status: 400 }
      )
    }

    // Create campaign record
    const campaign: Campaign = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      templateId: template.id,
      name: template.name,
      subject: template.subject,
      recipients: targetRecipients,
      sentAt: new Date().toISOString(),
      status: 'sending',
      stats: {
        sent: 0,
        delivered: 0,
        failed: 0
      }
    }

    // Save campaign
    const campaigns = await readCampaigns()
    campaigns.push(campaign)
    await writeCampaigns(campaigns)

    // Send emails (in production, this should be done in background/queue)
    const subscribers = await readSubscribers()
    const sendResults = await Promise.allSettled(
      targetRecipients.map(async (email) => {
        const subscriber = subscribers.find(sub => sub.email === email)
        const result = await sendNewsletterEmail(
          email,
          template.subject,
          template.htmlContent,
          template.textContent,
          subscriber?.unsubscribeToken
        )
        
        if (result.success) {
          campaign.stats.delivered++
        } else {
          campaign.stats.failed++
        }
        
        campaign.stats.sent++
        return result
      })
    )

    // Update campaign status
    campaign.status = campaign.stats.failed === 0 ? 'sent' : 'sent'
    
    // Update campaigns file
    const updatedCampaigns = campaigns.map(c => 
      c.id === campaign.id ? campaign : c
    )
    await writeCampaigns(updatedCampaigns)

    const successCount = sendResults.filter(
      result => result.status === 'fulfilled' && result.value.success
    ).length

    return NextResponse.json({
      message: `Newsletter byl odeslán! Úspěšně doručeno: ${successCount}/${targetRecipients.length}`,
      campaign: {
        id: campaign.id,
        sent: campaign.stats.sent,
        delivered: campaign.stats.delivered,
        failed: campaign.stats.failed
      }
    })

  } catch (error) {
    console.error('Error sending newsletter:', error)
    return NextResponse.json(
      { message: 'Chyba při odesílání newsletteru' },
      { status: 500 }
    )
  }
}

// GET - Get campaign history (admin only)
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request)
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Neautorizovaný přístup' },
      { status: 401 }
    )
  }

  try {
    const campaigns = await readCampaigns();
    const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
    return NextResponse.json({
      campaigns: safeCampaigns.sort((a, b) => 
        new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      )
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { campaigns: [] },
      { status: 500 }
    );
  }
}
