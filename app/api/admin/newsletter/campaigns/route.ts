import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
const CAMPAIGNS_FILE = path.join(process.cwd(), 'data', 'newsletter-campaigns.json')

interface Campaign {
  id: string
  subject: string
  content: string
  sentAt: string
  recipientCount: number
  openRate: number
  clickRate: number
  status?: 'draft' | 'sent' | 'scheduled'
  createdAt?: string
  updatedAt?: string
}

// Helper function to verify admin token
function verifyAdminToken(request: NextRequest): boolean {
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
    await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2))
  } catch (error) {
    console.error('Error writing campaigns file:', error)
    throw error
  }
}

// GET - Get all campaigns
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const campaigns = await readCampaigns()
    
    // Sort by creation date (newest first)
    campaigns.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

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
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const campaignData = await request.json()
    const { subject, content, recipients } = campaignData

    if (!subject || !content) {
      return NextResponse.json({ message: "Předmět a obsah kampaně jsou povinné" }, { status: 400 })
    }

    const campaigns = await readCampaigns()

    const newCampaign: Campaign = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      subject: subject.trim(),
      content: content.trim(),
      sentAt: new Date().toISOString(),
      recipientCount: recipients?.length || 0,
      openRate: 0,
      clickRate: 0,
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    campaigns.push(newCampaign)
    await writeCampaigns(campaigns)

    return NextResponse.json(
      {
        message: "Kampaň byla úspěšně vytvořena",
        campaign: newCampaign,
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

export const dynamic = "force-dynamic"
