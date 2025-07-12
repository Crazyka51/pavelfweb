import { type NextRequest, NextResponse } from "next/server"
import { settingsService } from "@/lib/services/settings-service"
import { requireAuth } from "@/lib/auth-utils"

export async function GET(req: NextRequest) {
  try {
    const settings = await settingsService.getSettings()
    if (settings) {
      return NextResponse.json(settings, { status: 200 })
    } else {
      // If no settings exist, try to initialize them
      const newSettings = await settingsService.initializeDefaultSettings()
      if (newSettings) {
        return NextResponse.json(newSettings, { status: 200 })
      }
      return NextResponse.json({ message: "Settings not found and could not be initialized." }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ message: "Failed to fetch settings." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newSettingData = await request.json()
    const newSetting = await settingsService.createSetting(newSettingData)
    if (newSetting) {
      return NextResponse.json({ data: newSetting }, { status: 201 })
    } else {
      return NextResponse.json({ error: "Failed to create setting" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error creating setting:", error)
    return NextResponse.json({ error: "Failed to create setting" }, { status: 500 })
  }
}

const updateSettings = async (req: NextRequest) => {
  try {
    const data = await req.json()
    const updatedSettings = await settingsService.updateSettings(data)
    if (updatedSettings) {
      return NextResponse.json(updatedSettings, { status: 200 })
    } else {
      return NextResponse.json({ message: "Failed to update settings." }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ message: "Failed to update settings." }, { status: 500 })
  }
}

export const PUT = requireAuth(updateSettings)
