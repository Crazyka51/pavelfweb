import { sql, type CMSSettings } from "../database"

class SettingsService {
  private defaultSettings: CMSSettings = {
    id: "default-settings", // A fixed ID for the single settings entry
    site_name: "Pavel Fišer - Praha 4",
    site_description: "Oficiální web zastupitele Prahy 4",
    admin_email: "pavel@praha4.cz",
    language: "cs",
    timezone: "Europe/Prague",
    default_category_id: null, // Will be set to an actual ID later
    auto_save_interval: 3000,
    allow_image_upload: true,
    max_file_size: 5,
    require_approval: false,
    default_visibility: "draft",
    enable_scheduling: true,
    email_notifications: true,
    new_article_notification: true,
    primary_color: "#3B82F6",
    dark_mode: false,
    session_timeout: 24,
    max_login_attempts: 5,
    updated_at: new Date(),
  }

  async getSettings(): Promise<CMSSettings> {
    try {
      const result = await sql`
        SELECT 
          id, site_name, site_description, admin_email, language, timezone, 
          default_category_id, auto_save_interval, allow_image_upload, max_file_size, 
          require_approval, default_visibility, enable_scheduling, email_notifications, 
          new_article_notification, primary_color, dark_mode, session_timeout, 
          max_login_attempts, updated_at
        FROM cms_settings
        WHERE id = ${this.defaultSettings.id}
      `

      if (result.length > 0) {
        // Merge with defaults to ensure all properties exist and handle potential nulls
        return { ...this.defaultSettings, ...(result[0] as CMSSettings) }
      } else {
        // If no settings found, create default ones
        console.log("No CMS settings found, creating default settings.")
        return await this.createDefaultSettings()
      }
    } catch (error) {
      console.error("Failed to get settings:", error)
      // If database error, return default settings as a fallback
      return this.defaultSettings
    }
  }

  async createDefaultSettings(): Promise<CMSSettings> {
    try {
      const result = await sql`
        INSERT INTO cms_settings (
          id, site_name, site_description, admin_email, language, timezone, 
          default_category_id, auto_save_interval, allow_image_upload, max_file_size, 
          require_approval, default_visibility, enable_scheduling, email_notifications, 
          new_article_notification, primary_color, dark_mode, session_timeout, 
          max_login_attempts, updated_at
        ) VALUES (
          ${this.defaultSettings.id},
          ${this.defaultSettings.site_name},
          ${this.defaultSettings.site_description},
          ${this.defaultSettings.admin_email},
          ${this.defaultSettings.language},
          ${this.defaultSettings.timezone},
          ${this.defaultSettings.default_category_id},
          ${this.defaultSettings.auto_save_interval},
          ${this.defaultSettings.allow_image_upload},
          ${this.defaultSettings.max_file_size},
          ${this.defaultSettings.require_approval},
          ${this.defaultSettings.default_visibility},
          ${this.defaultSettings.enable_scheduling},
          ${this.defaultSettings.email_notifications},
          ${this.defaultSettings.new_article_notification},
          ${this.defaultSettings.primary_color},
          ${this.defaultSettings.dark_mode},
          ${this.defaultSettings.session_timeout},
          ${this.defaultSettings.max_login_attempts},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET updated_at = NOW() -- In case it was partially created
        RETURNING *
      `
      return result[0] as CMSSettings
    } catch (error) {
      console.error("Failed to create default settings:", error)
      throw new Error("Failed to create default settings")
    }
  }

  async updateSettings(updates: Partial<Omit<CMSSettings, "id" | "updated_at">>): Promise<CMSSettings> {
    try {
      const currentSettings = await this.getSettings() // Get current settings to merge
      const updatedSettings = { ...currentSettings, ...updates }

      const result = await sql`
        UPDATE cms_settings SET
          site_name = ${updatedSettings.site_name},
          site_description = ${updatedSettings.site_description},
          admin_email = ${updatedSettings.admin_email},
          language = ${updatedSettings.language},
          timezone = ${updatedSettings.timezone},
          default_category_id = ${updatedSettings.default_category_id},
          auto_save_interval = ${updatedSettings.auto_save_interval},
          allow_image_upload = ${updatedSettings.allow_image_upload},
          max_file_size = ${updatedSettings.max_file_size},
          require_approval = ${updatedSettings.require_approval},
          default_visibility = ${updatedSettings.default_visibility},
          enable_scheduling = ${updatedSettings.enable_scheduling},
          email_notifications = ${updatedSettings.email_notifications},
          new_article_notification = ${updatedSettings.new_article_notification},
          primary_color = ${updatedSettings.primary_color},
          dark_mode = ${updatedSettings.dark_mode},
          session_timeout = ${updatedSettings.session_timeout},
          max_login_attempts = ${updatedSettings.max_login_attempts},
          updated_at = NOW()
        WHERE id = ${this.defaultSettings.id}
        RETURNING *
      `
      return result[0] as CMSSettings
    } catch (error) {
      console.error("Failed to update settings:", error)
      throw new Error("Failed to update settings")
    }
  }

  async resetSettings(): Promise<CMSSettings> {
    try {
      // Delete existing settings and re-create defaults
      await sql`DELETE FROM cms_settings WHERE id = ${this.defaultSettings.id}`
      return await this.createDefaultSettings()
    } catch (error) {
      console.error("Failed to reset settings:", error)
      throw new Error("Failed to reset settings")
    }
  }
}

export const settingsService = new SettingsService()
