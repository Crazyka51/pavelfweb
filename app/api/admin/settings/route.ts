import { type NextRequest, NextResponse } from "next/server"
import { settingsService } from "@/lib/settings-service"
import { requireAuth } from "@/lib/auth-utils"

// GET /api/admin/settings
export const GET = requireAuth(
  async (request: NextRequest) => {
    try {
      const settings = await settingsService.getAllSettings()
      return NextResponse.json(settings)
    } catch (error) {
      console.error("Error fetching settings:", error)
      return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 })
    }
  },
  ["admin", "editor"],
)

// POST /api/admin/settings
export const POST = requireAuth(
  async (request: NextRequest) => {
    try {
      const { key, value } = await request.json()
      if (!key) {
        return NextResponse.json({ message: "Key is required" }, { status: 400 })
      }
      const updatedSetting = await settingsService.setSetting(key, value)
      if (!updatedSetting) {
        return NextResponse.json({ message: "Failed to update setting" }, { status: 500 })
      }
      return NextResponse.json(updatedSetting, { status: 200 })
    } catch (error) {
      console.error("Error updating setting:", error)
      return NextResponse.json({ message: "Failed to update setting" }, { status: 500 })
    }
  },
  ["admin"],
)
