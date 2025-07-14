import { sql, type CMSSettings } from "@/lib/database"
import { cmsSettings } from "@/lib/schema"
import { eq } from "drizzle-orm"

export class SettingsService {
  constructor(private db: typeof sql) {}

  async getSettings(): Promise<CMSSettings | null> {
    try {
      const result = await this.db.query.cmsSettings.findFirst()
      return result as CMSSettings | null
    } catch (error) {
      console.error("Error fetching settings:", error)
      return null
    }
  }

  async updateSettings(data: Partial<Omit<CMSSettings, "id" | "createdAt">>): Promise<CMSSettings | null> {
    try {
      // Assuming there's only one settings entry, or we update by a known ID
      const [updatedSettings] = await this.db
        .update(cmsSettings)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(cmsSettings.id, "default-settings-id"))
        .returning() // Use a fixed ID or fetch the existing one
      return updatedSettings as CMSSettings
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

      const defaultSettings: CMSSettings = {
        id: "default-settings-id", // Fixed ID for the single settings entry
        siteName: "Pavel Fišer CMS",
        siteDescription: "Content Management System for Pavel Fišer's website.",
        adminEmail: "admin@example.com",
        language: "cs",
        timezone: "Europe/Prague",
        defaultCategoryId: null,
        autoSaveInterval: 30000, // 30 seconds
        allowImageUpload: true,
        maxFileSize: 5 * 1024 * 1024, // 5 MB
        requireApproval: false,
        defaultVisibility: "public",
        enableScheduling: true,
        emailNotifications: true,
        newArticleNotification: true,
        primaryColor: "#3b82f6",
        darkMode: false,
        sessionTimeout: 3600000, // 1 hour
        maxLoginAttempts: 5,
        updatedAt: new Date(),
      }

      const [newSettings] = await this.db.insert(cmsSettings).values(defaultSettings).returning()
      console.log("Default settings initialized.")
      return newSettings as CMSSettings
    } catch (error) {
      console.error("Error initializing default settings:", error)
      return null
    }
  }
}

export const settingsService = new SettingsService(sql)
