import { NextResponse } from "next/server"
import { getSettings, updateSettings } from "@/lib/services/settings-service"
import { verifyAuth } from "@/lib/auth-utils"

export async function GET(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ message: "Error fetching settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const authResult = await verifyAuth(request)
  if (!authResult.isAuthenticated) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const updatedSettings = await updateSettings(body)
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ message: "Error updating settings" }, { status: 500 })
  }
}
