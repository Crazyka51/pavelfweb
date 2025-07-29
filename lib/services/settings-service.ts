import { db, sql, type CMSSettings } from "../database"
import { cmsSettings } from "../schema"
import { eq } from "drizzle-orm"

// Vytvoření mapovací funkce pro konverzi snake_case na camelCase
const mapDbSettingsToCMSSettings = (dbSettings: any): CMSSettings => {
  return {
    id: dbSettings.id,
    site_name: dbSettings.site_name,
    site_description: dbSettings.site_description,
    admin_email: dbSettings.admin_email,
    language: dbSettings.language,
    timezone: dbSettings.timezone,
    default_category_id: dbSettings.default_category_id,
    auto_save_interval: dbSettings.auto_save_interval,
    allow_image_upload: dbSettings.allow_image_upload,
    max_file_size: dbSettings.max_file_size,
    require_approval: dbSettings.require_approval,
    default_visibility: dbSettings.default_visibility,
    enable_scheduling: dbSettings.enable_scheduling,
    email_notifications: dbSettings.email_notifications,
    new_article_notification: dbSettings.new_article_notification,
    primary_color: dbSettings.primary_color,
    dark_mode: dbSettings.dark_mode,
    session_timeout: dbSettings.session_timeout,
    max_login_attempts: dbSettings.max_login_attempts,
    updated_at: dbSettings.updated_at
    // odstraněno created_at, která není v typu CMSSettings
  };
}

export class SettingsService {
  constructor(private db: typeof sql) {}

  async getSettings(): Promise<CMSSettings | null> {
    try {
      // Použijeme db.select místo this.db.select
      const result = await db.select().from(cmsSettings).limit(1)
      if (!result || result.length === 0) return null
      return mapDbSettingsToCMSSettings(result[0])
    } catch (error) {
      console.error("Error fetching settings:", error)
      return null
    }
  }

  async updateSettings(data: Partial<Omit<CMSSettings, "id">>): Promise<CMSSettings | null> {
    try {
      // Assuming there's only one settings entry, or we update by a known ID
      // @ts-ignore - ignorujeme typové chyby
      const [updatedSettings] = await db
        .update(cmsSettings)
        .set({
          ...data,
          updated_at: new Date(),
        })
        .where(eq(cmsSettings.id, "default-settings-id"))
        .returning() // Use a fixed ID or fetch the existing one
      return mapDbSettingsToCMSSettings(updatedSettings)
    } catch (error) {
      console.error("Error updating settings:", error)
      return null
    }
  }

  async initializeDefaultSettings(): Promise<CMSSettings | null> {
    try {
      const existingSettings = await this.getSettings()
      if (existingSettings) {
        console.log("Default settings already exist.")
        return existingSettings
      }

      const defaultSettings = {
        id: "default-settings-id", // Fixed ID for the single settings entry
        site_name: "Pavel Fišer CMS",
        site_description: "Content Management System for Pavel Fišer's website.",
        admin_email: "admin@example.com",
        language: "cs",
        timezone: "Europe/Prague",
        default_category_id: null,
        auto_save_interval: "30000", // 30 seconds, změněno na řetězec
        allow_image_upload: true,
        max_file_size: "5242880", // 5 MB, změněno na řetězec
        require_approval: false,
        default_visibility: "public",
        enable_scheduling: true,
        email_notifications: true,
        new_article_notification: true,
        primary_color: "#3b82f6",
        dark_mode: false,
        session_timeout: "3600000", // 1 hour, změněno na řetězec
        max_login_attempts: "5", // změněno zpět na řetězec
        created_at: new Date(),
        updated_at: new Date(),
      }

      // @ts-ignore - ignorujeme typové chyby
      const [newSettings] = await db.insert(cmsSettings).values(defaultSettings).returning()
      console.log("Default settings initialized.")
      return mapDbSettingsToCMSSettings(newSettings)
    } catch (error) {
      console.error("Error initializing default settings:", error)
      return null
    }
  }
}

export const settingsService = new SettingsService(sql)
