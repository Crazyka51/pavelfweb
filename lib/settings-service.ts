import { db, sql } from "@/lib/database";
import { cmsSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";

// Interface odpovídající formátu v SettingsManager.tsx
export interface SettingsObject {
  siteName: string
  siteDescription: string
  adminEmail: string
  language: string
  timezone: string
  defaultCategory: string | null // Kategorie ID
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

// Výchozí nastavení pro reset
const DEFAULT_SETTINGS: SettingsObject = {
  siteName: "Pavel Fišer - Praha 4",
  siteDescription: "Oficiální web zastupitele Prahy 4",
  adminEmail: "pavel@praha4.cz",
  language: "cs",
  timezone: "Europe/Prague",
  defaultCategory: null,
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
};

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
  primary_color?: string
  dark_mode?: boolean
  session_timeout?: string
  max_login_attempts?: string
  updated_at?: string
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
  primary_color?: string
  dark_mode?: boolean
  session_timeout?: string
  max_login_attempts?: string
  updated_at?: string
}

export class SettingsService {
  // Pomocná funkce pro konverzi z DB formátu na aplikační
  private mapToAppFormat(settings: any): CMSSettings {
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
      newArticleNotification: settings.new_article_notification,
      primary_color: settings.primary_color,
      dark_mode: settings.dark_mode,
      session_timeout: settings.session_timeout,
      max_login_attempts: settings.max_login_attempts,
      updated_at: settings.updated_at instanceof Date 
        ? settings.updated_at.toISOString() 
        : settings.updated_at
    };
  }

  async getSetting(key: string): Promise<CMSSettings | null> {
    const result = await db.select().from(cmsSettings).where(eq(cmsSettings.key, key)).limit(1);
    if (!result[0]) return null;
    return this.mapToAppFormat(result[0]);
  }

  async setSetting(key: string, value: string | null): Promise<CMSSettings | null> {
    try {
      const existingSetting = await this.getSetting(key);
      if (existingSetting) {
        const [updatedSetting] = await db
          .update(cmsSettings)
          .set({ value })
          .where(eq(cmsSettings.key, key))
          .returning();
        return this.mapToAppFormat(updatedSetting);
      } else {
        const [newSetting] = await db
          .insert(cmsSettings)
          .values({
            key,
            value
          })
          .returning();
        return this.mapToAppFormat(newSetting);
      }
    } catch (error) {
      return null;
    }
  }

  async getAllSettings(): Promise<CMSSettings[]> {
    const result = await db.select().from(cmsSettings);
    return result.map(setting => this.mapToAppFormat(setting));
  }

  /**
   * Získání nastavení jako jeden objekt vhodný pro SettingsManager
   */
  async getSettingsObject(): Promise<SettingsObject> {
    try {
      // Získáme záznam z tabulky - měl by existovat pouze jeden záznam
      const result = await db.select().from(cmsSettings).limit(1);
      
      // Pokud není žádný záznam, vrátíme výchozí nastavení
      if (!result || result.length === 0) {
        return DEFAULT_SETTINGS;
      }
      
      const settings = result[0];
      
      // Převedeme na formát očekávaný v UI
      return {
        siteName: settings.site_name || DEFAULT_SETTINGS.siteName,
        siteDescription: settings.site_description || DEFAULT_SETTINGS.siteDescription,
        adminEmail: settings.admin_email || DEFAULT_SETTINGS.adminEmail,
        language: settings.language || DEFAULT_SETTINGS.language,
        timezone: settings.timezone || DEFAULT_SETTINGS.timezone,
        defaultCategory: settings.default_category_id || DEFAULT_SETTINGS.defaultCategory,
        autoSaveInterval: parseInt(settings.auto_save_interval || "3000"),
        allowImageUpload: settings.allow_image_upload ?? DEFAULT_SETTINGS.allowImageUpload,
        maxFileSize: parseInt(settings.max_file_size || "5"),
        requireApproval: settings.require_approval ?? DEFAULT_SETTINGS.requireApproval,
        defaultVisibility: (settings.default_visibility || DEFAULT_SETTINGS.defaultVisibility) as "public" | "draft",
        enableScheduling: settings.enable_scheduling ?? DEFAULT_SETTINGS.enableScheduling,
        emailNotifications: settings.email_notifications ?? DEFAULT_SETTINGS.emailNotifications,
        newArticleNotification: settings.new_article_notification ?? DEFAULT_SETTINGS.newArticleNotification,
        primaryColor: settings.primary_color || DEFAULT_SETTINGS.primaryColor,
        darkMode: settings.dark_mode ?? DEFAULT_SETTINGS.darkMode,
        sessionTimeout: parseInt(settings.session_timeout || "24"),
        maxLoginAttempts: parseInt(settings.max_login_attempts || "5"),
        updatedAt: settings.updated_at instanceof Date 
          ? settings.updated_at.toISOString() 
          : (settings.updated_at || new Date().toISOString()),
      };
    } catch (error) {
      return DEFAULT_SETTINGS;
    }
  }
  
  /**
   * Aktualizace všech nastavení
   */
  async updateAllSettings(settingsData: SettingsObject): Promise<SettingsObject> {
    try {
      // Kontrola, zda už máme nějaký záznam
      const existingSettings = await db.select().from(cmsSettings).limit(1);
      
      // Pro aktualizaci potřebujeme zajistit, že máme všechny povinné vlastnosti
      // a především klíč pro dokument v databázi
      if (existingSettings && existingSettings.length > 0) {
        // Aktualizace existujícího záznamu
        await db.update(cmsSettings)
          .set({
            site_name: settingsData.siteName,
            site_description: settingsData.siteDescription,
            admin_email: settingsData.adminEmail,
            language: settingsData.language,
            timezone: settingsData.timezone,
            default_category_id: settingsData.defaultCategory,
            auto_save_interval: String(settingsData.autoSaveInterval),
            allow_image_upload: settingsData.allowImageUpload,
            max_file_size: String(settingsData.maxFileSize),
            require_approval: settingsData.requireApproval,
            default_visibility: settingsData.defaultVisibility,
            enable_scheduling: settingsData.enableScheduling,
            email_notifications: settingsData.emailNotifications,
            new_article_notification: settingsData.newArticleNotification,
            primary_color: settingsData.primaryColor,
            dark_mode: settingsData.darkMode,
            session_timeout: String(settingsData.sessionTimeout),
            max_login_attempts: String(settingsData.maxLoginAttempts),
            updated_at: new Date(),  // Zde použijeme přímo objekt Date
          })
          .where(eq(cmsSettings.id, existingSettings[0].id));
      } else {
        // Vytvoření nového záznamu - musíme mít key jako povinné pole
        await db.insert(cmsSettings)
          .values({
            key: "cms_settings", // Potřebujeme nějaký klíč pro dokument
            site_name: settingsData.siteName,
            site_description: settingsData.siteDescription,
            admin_email: settingsData.adminEmail,
            language: settingsData.language,
            timezone: settingsData.timezone,
            default_category_id: settingsData.defaultCategory,
            auto_save_interval: String(settingsData.autoSaveInterval),
            allow_image_upload: settingsData.allowImageUpload,
            max_file_size: String(settingsData.maxFileSize),
            require_approval: settingsData.requireApproval,
            default_visibility: settingsData.defaultVisibility,
            enable_scheduling: settingsData.enableScheduling,
            email_notifications: settingsData.emailNotifications,
            new_article_notification: settingsData.newArticleNotification,
            primary_color: settingsData.primaryColor,
            dark_mode: settingsData.darkMode,
            session_timeout: String(settingsData.sessionTimeout),
            max_login_attempts: String(settingsData.maxLoginAttempts),
            updated_at: new Date(), // Zde použijeme přímo objekt Date
          });
      }
      
      // Vrátíme aktualizovaná data
      return {
        ...settingsData,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Reset všech nastavení na výchozí hodnoty
   */
  async resetSettings(): Promise<SettingsObject> {
    try {
      const existingSettings = await db.select().from(cmsSettings).limit(1);
      
      if (existingSettings && existingSettings.length > 0) {
        // Aktualizace existujícího záznamu na výchozí hodnoty
        await db.update(cmsSettings)
          .set({
            site_name: DEFAULT_SETTINGS.siteName,
            site_description: DEFAULT_SETTINGS.siteDescription,
            admin_email: DEFAULT_SETTINGS.adminEmail,
            language: DEFAULT_SETTINGS.language,
            timezone: DEFAULT_SETTINGS.timezone,
            default_category_id: DEFAULT_SETTINGS.defaultCategory,
            auto_save_interval: String(DEFAULT_SETTINGS.autoSaveInterval),
            allow_image_upload: DEFAULT_SETTINGS.allowImageUpload,
            max_file_size: String(DEFAULT_SETTINGS.maxFileSize),
            require_approval: DEFAULT_SETTINGS.requireApproval,
            default_visibility: DEFAULT_SETTINGS.defaultVisibility,
            enable_scheduling: DEFAULT_SETTINGS.enableScheduling,
            email_notifications: DEFAULT_SETTINGS.emailNotifications,
            new_article_notification: DEFAULT_SETTINGS.newArticleNotification,
            primary_color: DEFAULT_SETTINGS.primaryColor,
            dark_mode: DEFAULT_SETTINGS.darkMode,
            session_timeout: String(DEFAULT_SETTINGS.sessionTimeout),
            max_login_attempts: String(DEFAULT_SETTINGS.maxLoginAttempts),
            updated_at: new Date(), // Zde použijeme přímo objekt Date
          })
          .where(eq(cmsSettings.id, existingSettings[0].id));
      } else {
        // Vytvoření nového záznamu s výchozími hodnotami
        await db.insert(cmsSettings)
          .values({
            key: "cms_settings", // Potřebujeme nějaký klíč pro dokument
            site_name: DEFAULT_SETTINGS.siteName,
            site_description: DEFAULT_SETTINGS.siteDescription,
            admin_email: DEFAULT_SETTINGS.adminEmail,
            language: DEFAULT_SETTINGS.language,
            timezone: DEFAULT_SETTINGS.timezone,
            default_category_id: DEFAULT_SETTINGS.defaultCategory,
            auto_save_interval: String(DEFAULT_SETTINGS.autoSaveInterval),
            allow_image_upload: DEFAULT_SETTINGS.allowImageUpload,
            max_file_size: String(DEFAULT_SETTINGS.maxFileSize),
            require_approval: DEFAULT_SETTINGS.requireApproval,
            default_visibility: DEFAULT_SETTINGS.defaultVisibility,
            enable_scheduling: DEFAULT_SETTINGS.enableScheduling,
            email_notifications: DEFAULT_SETTINGS.emailNotifications,
            new_article_notification: DEFAULT_SETTINGS.newArticleNotification,
            primary_color: DEFAULT_SETTINGS.primaryColor,
            dark_mode: DEFAULT_SETTINGS.darkMode,
            session_timeout: String(DEFAULT_SETTINGS.sessionTimeout),
            max_login_attempts: String(DEFAULT_SETTINGS.maxLoginAttempts),
            updated_at: new Date(), // Zde použijeme přímo objekt Date
          });
      }
      
      return {
        ...DEFAULT_SETTINGS,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
