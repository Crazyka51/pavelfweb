import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

const TEMPLATES_FILE = path.join(process.cwd(), 'data', 'newsletter-templates.json')
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  createdAt: string
  updatedAt: string
}

// Helper function to read templates
async function readTemplates(): Promise<EmailTemplate[]> {
  try {
    const data = await fs.readFile(TEMPLATES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading templates file:', error)
    return []
  }
}

// Helper function to write templates
async function writeTemplates(templates: EmailTemplate[]): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(TEMPLATES_FILE)
    await fs.mkdir(dataDir, { recursive: true })
    
    await fs.writeFile(TEMPLATES_FILE, JSON.stringify(templates, null, 2))
  } catch (error) {
    console.error('Error writing templates file:', error)
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

// GET - Get all templates (admin only)
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request)
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Neautorizovaný přístup' },
      { status: 401 }
    )
  }

  try {
    const templates = await readTemplates()
    
    return NextResponse.json({
      templates: templates
    })

  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { message: 'Chyba při načítání šablon' },
      { status: 500 }
    )
  }
}

// POST - Create or update template (admin only)
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request)
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Neautorizovaný přístup' },
      { status: 401 }
    )
  }

  try {
    const templateData: EmailTemplate = await request.json()

    if (!templateData.name || !templateData.subject || !templateData.htmlContent) {
      return NextResponse.json(
        { message: 'Chybí povinné údaje' },
        { status: 400 }
      )
    }

    const templates = await readTemplates()

    // Check if updating existing template
    const existingIndex = templates.findIndex(t => t.id === templateData.id)
    
    if (existingIndex >= 0) {
      // Update existing template
      templates[existingIndex] = {
        ...templateData,
        updatedAt: new Date().toISOString()
      }
    } else {
      // Create new template
      const newTemplate: EmailTemplate = {
        ...templateData,
        id: templateData.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      templates.push(newTemplate)
    }

    await writeTemplates(templates)

    return NextResponse.json({
      message: 'Šablona byla úspěšně uložena',
      template: templates[existingIndex] || templates[templates.length - 1]
    })

  } catch (error) {
    console.error('Error saving template:', error)
    return NextResponse.json(
      { message: 'Chyba při ukládání šablony' },
      { status: 500 }
    )
  }
}

// DELETE - Delete template (admin only)
export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdminToken(request)
  if (!isAdmin) {
    return NextResponse.json(
      { message: 'Neautorizovaný přístup' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')

    if (!templateId) {
      return NextResponse.json(
        { message: 'ID šablony je povinné' },
        { status: 400 }
      )
    }

    const templates = await readTemplates()
    const filteredTemplates = templates.filter(t => t.id !== templateId)
    
    if (filteredTemplates.length === templates.length) {
      return NextResponse.json(
        { message: 'Šablona nebyla nalezena' },
        { status: 404 }
      )
    }

    await writeTemplates(filteredTemplates)

    return NextResponse.json({
      message: 'Šablona byla úspěšně smazána'
    })

  } catch (error) {
    console.error('Error deleting template:', error)
    return NextResponse.json(
      { message: 'Chyba při mazání šablony' },
      { status: 500 }
    )
  }
}
