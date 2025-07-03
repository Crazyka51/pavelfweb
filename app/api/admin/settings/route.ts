import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const SETTINGS_FILE = path.join(process.cwd(), "data", "cms-settings.json")

interface CMSSettings {
  siteName: string
  siteDescription: string
  adminEmail: string
  language: string
  timezone: string
  defaultCategory: string
  autoSaveInterval: number
  allowImageUpload: boolean
  maxFileSize: number
  requireApproval: boolean
  defaultVisibility: "public" | "draft"
  enableScheduling: boolean
  emailNotifications: boolean
  newArticleNotification: boolean
  primaryColor: string
  darkMode: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  updatedAt?: string
}

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

// Helper function to ensure data directory exists
async function ensureDataDirectory(): Promise<void> {
  const dataDir = path.dirname(SETTINGS_FILE)
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }
}

// Helper function to get default settings
function getDefaultSettings(): CMSSettings {
  return {
    siteName: "Pavel Fišer - Praha 4",
    siteDescription: "Oficiální web zastupitele Prahy 4",
    adminEmail: "pavel@praha4.cz",
    language: "cs",
    timezone: "Europe/Prague",
    defaultCategory: "Aktuality",
    autoSaveInterval: 3000,
    allowImageUpload: true,
    maxFileSize: 5,
    requireApproval: false,
    defaultVisibility: "draft",
    enableScheduling: true,
    emailNotifications: true,
    newArticleNotification: true,
    primaryColor: "#3B82F6",
    darkMode: false,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
  }
}

// Helper function to read settings
async function readSettings(): Promise<CMSSettings> {
  try {
    await ensureDataDirectory()
    const data = await fs.readFile(SETTINGS_FILE, "utf8")
    const settings = JSON.parse(data)

    // Merge with defaults to ensure all properties exist
    return { ...getDefaultSettings(), ...settings }
  } catch (error) {
    console.log("Settings file not found, creating with defaults")
    const defaultSettings = getDefaultSettings()
    await writeSettings(defaultSettings)
    return defaultSettings
  }
}

// Helper function to write settings
async function writeSettings(settings: CMSSettings): Promise<void> {
  try {
    await ensureDataDirectory()
    const tempFile = SETTINGS_FILE + ".tmp"

    // Add timestamp
    const settingsWithTimestamp = {
      ...settings,
      updatedAt: new Date().toISOString(),
    }

    // Write to temporary file first
    await fs.writeFile(tempFile, JSON.stringify(settingsWithTimestamp, null, 2))

    // Atomic rename
    await fs.rename(tempFile, SETTINGS_FILE)

    console.log("Settings saved successfully")
  } catch (error) {
    console.error("Error writing settings file:", error)
    throw new Error("Failed to save settings")
  }
}

// GET - Get current settings
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const settings = await readSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      {
        message: "Chyba při načítání nastavení",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const newSettings = await request.json()

    // Validate required fields
    const requiredFields = ["siteName", "adminEmail"]
    for (const field of requiredFields) {
      if (!newSettings[field] || newSettings[field].trim() === "") {
        return NextResponse.json(
          {
            message: `Pole ${field} je povinné`,
          },
          { status: 400 },
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newSettings.adminEmail)) {
      return NextResponse.json(
        {
          message: "Neplatný formát e-mailové adresy",
        },
        { status: 400 },
      )
    }

    // Validate numeric fields
    if (newSettings.autoSaveInterval && (newSettings.autoSaveInterval < 1000 || newSettings.autoSaveInterval > 60000)) {
      return NextResponse.json(
        {
          message: "Interval automatického ukládání musí být mezi 1000-60000 ms",
        },
        { status: 400 },
      )
    }

    if (newSettings.maxFileSize && (newSettings.maxFileSize < 1 || newSettings.maxFileSize > 100)) {
      return NextResponse.json(
        {
          message: "Maximální velikost souboru musí být mezi 1-100 MB",
        },
        { status: 400 },
      )
    }

    if (newSettings.sessionTimeout && (newSettings.sessionTimeout < 1 || newSettings.sessionTimeout > 168)) {
      return NextResponse.json(
        {
          message: "Timeout relace musí být mezi 1-168 hodin",
        },
        { status: 400 },
      )
    }

    // Get current settings and merge with new ones
    const currentSettings = await readSettings()
    const updatedSettings: CMSSettings = {
      ...currentSettings,
      ...newSettings,
    }

    await writeSettings(updatedSettings)

    return NextResponse.json({
      message: "Nastavení bylo úspěšně uloženo",
      settings: updatedSettings,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      {
        message: "Chyba při ukládání nastavení",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Reset settings to default
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Neautorizovaný přístup" }, { status: 401 })
  }

  try {
    const defaultSettings = getDefaultSettings()
    await writeSettings(defaultSettings)

    return NextResponse.json({
      message: "Nastavení bylo obnoveno na výchozí hodnoty",
      settings: defaultSettings,
    })
  } catch (error) {
    console.error("Error resetting settings:", error)
    return NextResponse.json(
      {
        message: "Chyba při obnovování nastavení",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
