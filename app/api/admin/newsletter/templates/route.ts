import { NextResponse } from "next/server"
import {
  getNewsletterTemplates,
  createNewsletterTemplate,
  updateNewsletterTemplate,
  deleteNewsletterTemplate,
} from "@/lib/services/newsletter-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const templates = await getNewsletterTemplates()
    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching newsletter templates:", error)
    return NextResponse.json({ message: "Error fetching templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const newTemplate = await createNewsletterTemplate({ ...body, created_by: authResult.user?.username || "admin" })
    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    console.error("Error creating newsletter template:", error)
    return NextResponse.json({ message: "Error creating template" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  try {
    const body = await request.json()
    const updatedTemplate = await updateNewsletterTemplate(id, body)
    if (!updatedTemplate) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }
    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error("Error updating newsletter template:", error)
    return NextResponse.json({ message: "Error updating template" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = params
  try {
    const success = await deleteNewsletterTemplate(id)
    if (!success) {
      return NextResponse.json({ message: "Template not found or failed to delete" }, { status: 404 })
    }
    return NextResponse.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("Error deleting newsletter template:", error)
    return NextResponse.json({ message: "Error deleting template" }, { status: 500 })
  }
}
