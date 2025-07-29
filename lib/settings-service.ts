import { db, sql } from "@/lib/database"
import { cmsSettings } from "@/lib/schema"
import { eq } from "drizzle-orm"

export type CMSSettings = {
  id: string
  key: string
  value: string | null
  siteName: string | null
  siteDescription: string | null
  adminEmail: string | null
  language: string
  timezone: string
  defaultCategoryId: string | null
  autoSaveInterval: string
  allowImageUpload: boolean
  maxFileSize: string
  requireApproval: boolean
  defaultVisibility: string
  enableScheduling: boolean
  emailNotifications: boolean
  newArticleNotification: boolean
}

// Mapování z snake_case DB polí na camelCase pro TypeScript
export type CMSSettingsDB = {
  id: string
  key: string
  value: string | null
  site_name: string | null
  site_description: string | null
  admin_email: string | null
  language: string
  timezone: string
  default_category_id: string | null
  auto_save_interval: string
  allow_image_upload: boolean
  max_file_size: string
  require_approval: boolean
  default_visibility: string
  enable_scheduling: boolean
  email_notifications: boolean
  new_article_notification: boolean
}

export class SettingsService {
  // Pomocná funkce pro konverzi z DB formátu na aplikační
  private mapToAppFormat(settings: CMSSettingsDB): CMSSettings {
    return {
      id: settings.id,
      key: settings.key,
      value: settings.value,
      siteName: settings.site_name,
      siteDescription: settings.site_description,
      adminEmail: settings.admin_email,
      language: settings.language,
      timezone: settings.timezone,
      defaultCategoryId: settings.default_category_id,
      autoSaveInterval: settings.auto_save_interval,
      allowImageUpload: settings.allow_image_upload,
      maxFileSize: settings.max_file_size,
      requireApproval: settings.require_approval,
      defaultVisibility: settings.default_visibility,
      enableScheduling: settings.enable_scheduling,
      emailNotifications: settings.email_notifications,
      newArticleNotification: settings.new_article_notification
    }
  }

  async getSetting(key: string): Promise<CMSSettings | null> {
    const result = await db.select().from(cmsSettings).where(eq(cmsSettings.key, key)).limit(1)
    if (!result[0]) return null
    return this.mapToAppFormat(result[0] as CMSSettingsDB)
  }

  async setSetting(key: string, value: string | null): Promise<CMSSettings | null> {
    try {
      const existingSetting = await this.getSetting(key)
      if (existingSetting) {
        const [updatedSetting] = await db
          .update(cmsSettings)
          .set({ value })
          .where(eq(cmsSettings.key, key))
          .returning()
        return this.mapToAppFormat(updatedSetting as CMSSettingsDB)
      } else {
        const [newSetting] = await db
          .insert(cmsSettings)
          .values({
            key,
            value
          })
          .returning()
        return this.mapToAppFormat(newSetting as CMSSettingsDB)
      }
    } catch (error) {
      console.error(`Error setting setting for key ${key}:`, error)
      return null
    }
  }

  async getAllSettings(): Promise<CMSSettings[]> {
    const result = await db.select().from(cmsSettings)
    return result.map(setting => this.mapToAppFormat(setting as CMSSettingsDB))
  }
}

export const settingsService = new SettingsService()
