import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth-utils"
import { settingsService } from "@/lib/settings-service"

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

// GET - Get current settings
export async function GET(request: NextRequest) {
  const authResponse = requireAuth(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const settings = await settingsService.getSettings()
    // Map DB names to frontend names if necessary
    const frontendSettings = {
      siteName: settings.site_name,
      siteDescription: settings.site_description,
      adminEmail: settings.admin_email,
      language: settings.language,
      timezone: settings.timezone,
      defaultCategory: settings.default_category_id, // Will need to map ID to name on frontend
      autoSaveInterval: settings.auto_save_interval,
      allowImageUpload: settings.allow_image_upload,
      maxFileSize: settings.max_file_size,
      requireApproval: settings.require_approval,
      defaultVisibility: settings.default_visibility,
      enableScheduling: settings.enable_scheduling,
      emailNotifications: settings.email_notifications,
      newArticleNotification: settings.new_article_notification,
      primaryColor: settings.primary_color,
      darkMode: settings.dark_mode,
      sessionTimeout: settings.session_timeout,
      maxLoginAttempts: settings.max_login_attempts,
      updatedAt: settings.updated_at.toISOString(),
    }
    return NextResponse.json(frontendSettings)
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
  const authResponse = requireAuth(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const newSettings = await request.json()

    // Map frontend names to DB names
    const dbSettings = {
      site_name: newSettings.siteName,
      site_description: newSettings.siteDescription,
      admin_email: newSettings.adminEmail,
      language: newSettings.language,
      timezone: newSettings.timezone,
      default_category_id: newSettings.defaultCategory, // Assuming this is an ID now
      auto_save_interval: newSettings.autoSaveInterval,
      allow_image_upload: newSettings.allowImageUpload,
      max_file_size: newSettings.maxFileSize,
      require_approval: newSettings.requireApproval,
      default_visibility: newSettings.defaultVisibility,
      enable_scheduling: newSettings.enableScheduling,
      email_notifications: newSettings.emailNotifications,
      new_article_notification: newSettings.newArticleNotification,
      primary_color: newSettings.primaryColor,
      dark_mode: newSettings.darkMode,
      session_timeout: newSettings.sessionTimeout,
      max_login_attempts: newSettings.maxLoginAttempts,
    }

    // Validate required fields
    const requiredFields = ["site_name", "admin_email"]
    for (const field of requiredFields) {
      if (!dbSettings[field] || dbSettings[field].trim() === "") {
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
    if (!emailRegex.test(dbSettings.admin_email)) {
      return NextResponse.json(
        {
          message: "Neplatný formát e-mailové adresy",
        },
        { status: 400 },
      )
    }

    // Validate numeric fields
    if (
      dbSettings.auto_save_interval &&
      (dbSettings.auto_save_interval < 1000 || dbSettings.auto_save_interval > 60000)
    ) {
      return NextResponse.json(
        {
          message: "Interval automatického ukládání musí být mezi 1000-60000 ms",
        },
        { status: 400 },
      )
    }

    if (dbSettings.max_file_size && (dbSettings.max_file_size < 1 || dbSettings.max_file_size > 100)) {
      return NextResponse.json(
        {
          message: "Maximální velikost souboru musí být mezi 1-100 MB",
        },
        { status: 400 },
      )
    }

    if (dbSettings.session_timeout && (dbSettings.session_timeout < 1 || dbSettings.session_timeout > 168)) {
      return NextResponse.json(
        {
          message: "Timeout relace musí být mezi 1-168 hodin",
        },
        { status: 400 },
      )
    }

    const updatedSettings = await settingsService.updateSettings(dbSettings)

    // Map DB names back to frontend names for response
    const frontendResponseSettings = {
      siteName: updatedSettings.site_name,
      siteDescription: updatedSettings.site_description,
      adminEmail: updatedSettings.admin_email,
      language: updatedSettings.language,
      timezone: updatedSettings.timezone,
      defaultCategory: updatedSettings.default_category_id,
      autoSaveInterval: updatedSettings.auto_save_interval,
      allowImageUpload: updatedSettings.allow_image_upload,
      maxFileSize: updatedSettings.max_file_size,
      requireApproval: updatedSettings.require_approval,
      defaultVisibility: updatedSettings.default_visibility,
      enableScheduling: updatedSettings.enable_scheduling,
      emailNotifications: updatedSettings.email_notifications,
      newArticleNotification: updatedSettings.new_article_notification,
      primaryColor: updatedSettings.primary_color,
      darkMode: updatedSettings.dark_mode,
      sessionTimeout: updatedSettings.session_timeout,
      maxLoginAttempts: updatedSettings.max_login_attempts,
      updatedAt: updatedSettings.updated_at.toISOString(),
    }

    return NextResponse.json({
      message: "Nastavení bylo úspěšně uloženo",
      settings: frontendResponseSettings,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Chyba při ukládání nastavení",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// POST - Reset settings to default
export async function POST(request: NextRequest) {
  const authResponse = requireAuth(request)
  if (authResponse) {
    return authResponse
  }

  try {
    const defaultSettings = await settingsService.resetSettings()
    // Map DB names back to frontend names for response
    const frontendResponseSettings = {
      siteName: defaultSettings.site_name,
      siteDescription: defaultSettings.site_description,
      adminEmail: defaultSettings.admin_email,
      language: defaultSettings.language,
      timezone: defaultSettings.timezone,
      defaultCategory: defaultSettings.default_category_id,
      autoSaveInterval: defaultSettings.auto_save_interval,
      allowImageUpload: defaultSettings.allow_image_upload,
      maxFileSize: defaultSettings.max_file_size,
      requireApproval: defaultSettings.require_approval,
      defaultVisibility: defaultSettings.default_visibility,
      enableScheduling: defaultSettings.enable_scheduling,
      emailNotifications: defaultSettings.email_notifications,
      newArticleNotification: defaultSettings.new_article_notification,
      primaryColor: defaultSettings.primary_color,
      darkMode: defaultSettings.dark_mode,
      sessionTimeout: defaultSettings.session_timeout,
      maxLoginAttempts: defaultSettings.max_login_attempts,
      updatedAt: defaultSettings.updated_at.toISOString(),
    }
    return NextResponse.json({
      message: "Nastavení bylo obnoveno na výchozí hodnoty",
      settings: frontendResponseSettings,
    })
  } catch (error) {
    console.error("Error resetting settings:", error)
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Chyba při obnovování nastavení",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
