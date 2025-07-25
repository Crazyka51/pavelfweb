import { sql } from "@/lib/database"
import type { Settings } from "@/lib/types"

export class SettingsService {
  async getAllSettings(): Promise<Settings[]> {
    try {
      const settings = await sql<Settings[]>`SELECT * FROM settings ORDER BY key ASC;`
      return settings
    } catch (error) {
      console.error("Error fetching all settings:", error)
      throw new Error("Failed to fetch settings.")
    }
  }

  async getSettingByKey(key: string): Promise<Settings | null> {
    try {
      const [setting] = await sql<Settings[]>`SELECT * FROM settings WHERE key = ${key};`
      return setting || null
    } catch (error) {
      console.error(`Error fetching setting with key ${key}:`, error)
      throw new Error(`Failed to fetch setting with key ${key}.`)
    }
  }

  async createSetting(settingData: Omit<Settings, "id" | "created_at" | "updated_at">): Promise<Settings> {
    try {
      const [newSetting] = await sql<Settings[]>`
        INSERT INTO settings (key, value, description)
        VALUES (${settingData.key}, ${settingData.value}, ${settingData.description})
        RETURNING *;
      `
      return newSetting
    } catch (error) {
      console.error("Error creating setting:", error)
      throw new Error("Failed to create setting.")
    }
  }

  async updateSetting(key: string, value: string, description?: string): Promise<Settings | null> {
    try {
      const [updatedSetting] = await sql<Settings[]>`
        UPDATE settings
        SET
          value = ${value},
          description = COALESCE(${description}, description),
          updated_at = NOW()
        WHERE key = ${key}
        RETURNING *;
      `
      return updatedSetting || null
    } catch (error) {
      console.error(`Error updating setting with key ${key}:`, error)
      throw new Error(`Failed to update setting with key ${key}.`)
    }
  }

  async deleteSetting(key: string): Promise<boolean> {
    try {
      const result = await sql`DELETE FROM settings WHERE key = ${key};`
      return result.count > 0
    } catch (error) {
      console.error(`Error deleting setting with key ${key}:`, error)
      throw new Error(`Failed to delete setting with key ${key}.`)
    }
  }
}

export const settingsService = new SettingsService()
