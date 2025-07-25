import { sql } from "@/lib/database"
import type { CMSSettings } from "@/lib/types"

export class SettingsService {
  async getSettings(): Promise<CMSSettings | null> {
    try {
      const rows = (await sql(`
        SELECT id, site_name, site_description, admin_email, language, timezone, 
               default_category_id, auto_save_interval, allow_image_upload, max_file_size,
               require_approval, default_visibility, enable_scheduling, email_notifications,
               new_article_notification, primary_color, dark_mode, session_timeout,
               max_login_attempts, updated_at
        FROM cms_settings
        LIMIT 1
      `)) as CMSSettings[]

      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error("Error fetching settings:", error)
      return null
    }
  }

  async updateSettings(data: Partial<Omit<CMSSettings, "id">>): Promise<CMSSettings | null> {
    try {
      const setParts: string[] = []
      const params: any[] = []
      let p = 1

      if (data.site_name !== undefined) {
        setParts.push(`site_name = $${p++}`)
        params.push(data.site_name)
      }
      if (data.site_description !== undefined) {
        setParts.push(`site_description = $${p++}`)
        params.push(data.site_description)
      }
      if (data.admin_email !== undefined) {
        setParts.push(`admin_email = $${p++}`)
        params.push(data.admin_email)
      }
      if (data.language !== undefined) {
        setParts.push(`language = $${p++}`)
        params.push(data.language)
      }
      if (data.timezone !== undefined) {
        setParts.push(`timezone = $${p++}`)
        params.push(data.timezone)
      }
      if (data.default_category_id !== undefined) {
        setParts.push(`default_category_id = $${p++}`)
        params.push(data.default_category_id)
      }
      if (data.auto_save_interval !== undefined) {
        setParts.push(`auto_save_interval = $${p++}`)
        params.push(data.auto_save_interval)
      }
      if (data.allow_image_upload !== undefined) {
        setParts.push(`allow_image_upload = $${p++}`)
        params.push(data.allow_image_upload)
      }
      if (data.max_file_size !== undefined) {
        setParts.push(`max_file_size = $${p++}`)
        params.push(data.max_file_size)
      }
      if (data.require_approval !== undefined) {
        setParts.push(`require_approval = $${p++}`)
        params.push(data.require_approval)
      }
      if (data.default_visibility !== undefined) {
        setParts.push(`default_visibility = $${p++}`)
        params.push(data.default_visibility)
      }
      if (data.enable_scheduling !== undefined) {
        setParts.push(`enable_scheduling = $${p++}`)
        params.push(data.enable_scheduling)
      }
      if (data.email_notifications !== undefined) {
        setParts.push(`email_notifications = $${p++}`)
        params.push(data.email_notifications)
      }
      if (data.new_article_notification !== undefined) {
        setParts.push(`new_article_notification = $${p++}`)
        params.push(data.new_article_notification)
      }
      if (data.primary_color !== undefined) {
        setParts.push(`primary_color = $${p++}`)
        params.push(data.primary_color)
      }
      if (data.dark_mode !== undefined) {
        setParts.push(`dark_mode = $${p++}`)
        params.push(data.dark_mode)
      }
      if (data.session_timeout !== undefined) {
        setParts.push(`session_timeout = $${p++}`)
        params.push(data.session_timeout)
      }
      if (data.max_login_attempts !== undefined) {
        setParts.push(`max_login_attempts = $${p++}`)
        params.push(data.max_login_attempts)
      }

      setParts.push(`updated_at = NOW()`)

      const query = `
        UPDATE cms_settings SET
          ${setParts.join(", ")}
        WHERE id = (SELECT id FROM cms_settings LIMIT 1)
        RETURNING id, site_name, site_description, admin_email, language, timezone, 
                  default_category_id, auto_save_interval, allow_image_upload, max_file_size,
                  require_approval, default_visibility, enable_scheduling, email_notifications,
                  new_article_notification, primary_color, dark_mode, session_timeout,
                  max_login_attempts, updated_at
      `

      const rows = (await sql(query, params)) as CMSSettings[]
      return rows.length > 0 ? rows[0] : null
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

      const rows = (await sql(`
        INSERT INTO cms_settings (
          site_name, site_description, admin_email, language, timezone,
          auto_save_interval, allow_image_upload, max_file_size, require_approval,
          default_visibility, enable_scheduling, email_notifications, new_article_notification,
          primary_color, dark_mode, session_timeout, max_login_attempts
        ) VALUES (
          'Pavel Fišer CMS',
          'Content Management System for Pavel Fišer''s website.',
          'admin@example.com',
          'cs',
          'Europe/Prague',
          30000,
          true,
          5242880,
          false,
          'public',
          true,
          true,
          true,
          '#3b82f6',
          false,
          3600000,
          5
        )
        RETURNING id, site_name, site_description, admin_email, language, timezone, 
                  default_category_id, auto_save_interval, allow_image_upload, max_file_size,
                  require_approval, default_visibility, enable_scheduling, email_notifications,
                  new_article_notification, primary_color, dark_mode, session_timeout,
                  max_login_attempts, updated_at
      `)) as CMSSettings[]

      console.log("Default settings initialized.")
      return rows.length > 0 ? rows[0] : null
    } catch (error) {
      console.error("Error initializing default settings:", error)
      return null
    }
  }
}

export const settingsService = new SettingsService()

// Export individual functions for convenience
export async function getSettings(): Promise<CMSSettings | null> {
  return settingsService.getSettings()
}

export async function updateSettings(data: Partial<Omit<CMSSettings, "id">>): Promise<CMSSettings | null> {
  return settingsService.updateSettings(data)
}

export async function initializeDefaultSettings(): Promise<CMSSettings | null> {
  return settingsService.initializeDefaultSettings()
}
