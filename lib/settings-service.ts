import { db } from "@/lib/database"
import { cmsSettings } from "@/lib/schema"
import { eq } from "drizzle-orm"

export type Setting = {
  id: string
  key: string
  value: string | null
  createdAt: Date
  updatedAt: Date
}

export class SettingsService {
  async getSetting(key: string): Promise<Setting | null> {
    const result = await db.select().from(cmsSettings).where(eq(cmsSettings.key, key)).limit(1)
    return (result[0] as Setting) ?? null
  }

  async setSetting(key: string, value: string | null): Promise<Setting | null> {
    try {
      const existingSetting = await this.getSetting(key)
      if (existingSetting) {
        const [updatedSetting] = await db
          .update(cmsSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(cmsSettings.key, key))
          .returning()
        return updatedSetting as Setting
      } else {
        const [newSetting] = await db
          .insert(cmsSettings)
          .values({
            id: crypto.randomUUID(),
            key,
            value,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning()
        return newSetting as Setting
      }
    } catch (error) {
      console.error(`Error setting setting for key ${key}:`, error)
      return null
    }
  }

  async getAllSettings(): Promise<Setting[]> {
    const result = await db.select().from(cmsSettings)
    return result as Setting[]
  }
}

export const settingsService = new SettingsService()
