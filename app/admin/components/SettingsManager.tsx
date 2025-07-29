"use client"

import { useState, useEffect } from "react"
import { Save, RefreshCw, Globe, Mail, FileText, Shield, Bell, Palette, Database } from "lucide-react"

interface CMSSettings {
  // Obecné nastavení
  siteName: string
  siteDescription: string
  adminEmail: string
  language: string
  timezone: string

  // Editor nastavení
  defaultCategory: string | null // Now stores category ID
  autoSaveInterval: number
  allowImageUpload: boolean
  maxFileSize: number

  // Publikování
  requireApproval: boolean
  defaultVisibility: "public" | "draft"
  enableScheduling: boolean

  // Notifikace
  emailNotifications: boolean
  newArticleNotification: boolean

  // Vzhled
  primaryColor: string
  darkMode: boolean

  // Bezpečnost
  sessionTimeout: number
  maxLoginAttempts: number
  updatedAt?: string
}

interface CategoryOption {
  id: string
  name: string
}

export default function SettingsManager() {
  const [settings, setSettings] = useState<CMSSettings>({
    siteName: "Pavel Fišer - Praha 4",
    siteDescription: "Oficiální web zastupitele Prahy 4",
    adminEmail: "pavel@praha4.cz",
    language: "cs",
    timezone: "Europe/Prague",

    defaultCategory: null, // Default to null, will be populated from DB
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
  })

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("general")
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])

  const colorOptions = [
    { value: "#3B82F6", label: "Modrá", preview: "bg-blue-500" },
    { value: "#EF4444", label: "Červená", preview: "bg-red-500" },
    { value: "#10B981", label: "Zelená", preview: "bg-green-500" },
    { value: "#F59E0B", label: "Oranžová", preview: "bg-yellow-500" },
    { value: "#8B5CF6", label: "Fialová", preview: "bg-purple-500" },
    { value: "#06B6D4", label: "Azurová", preview: "bg-cyan-500" },
  ]

  useEffect(() => {
    loadSettings()
    loadCategoriesForOptions()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        if (data.updatedAt) {
          setLastSaved(new Date(data.updatedAt).toLocaleString("cs-CZ"))
        }
      } else {
        console.error("Failed to load settings", response.status, await response.text())
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const loadCategoriesForOptions = async () => {
    try {
      const response = await fetch("/api/admin/categories?activeOnly=true")
      if (response.ok) {
        const data = await response.json()
        setCategoryOptions(data.categories.map((cat: any) => ({ id: cat.id, name: cat.name })))
      } else {
        console.error("Failed to load categories for settings", response.status, await response.text())
      }
    } catch (error) {
      console.error("Error loading categories for settings:", error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings) // Update with potentially normalized data from backend
        setLastSaved(new Date(data.settings.updatedAt).toLocaleString("cs-CZ"))
        alert("Nastavení úspěšně uloženo!")
      } else {
        const errorData = await response.json()
        alert(`Chyba při ukládání nastavení: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Chyba při ukládání nastavení!")
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm("Opravdu chcete obnovit výchozí nastavení? Všechny změny budou ztraceny.")) {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "POST", // POST for reset
        })

        if (response.ok) {
          const data = await response.json()
          setSettings(data.settings)
          setLastSaved(new Date(data.settings.updatedAt).toLocaleString("cs-CZ"))
          alert("Nastavení bylo obnoveno na výchozí hodnoty")
        } else {
          const errorData = await response.json()
          alert(`Chyba při obnovování nastavení: ${errorData.message || response.statusText}`)
        }
      } catch (error) {
        console.error("Error resetting settings:", error)
        alert("Chyba při obnovování nastavení!")
      }
    }
  }

  const tabs = [
    { id: "general", label: "Obecné", icon: Globe },
    { id: "editor", label: "Editor", icon: FileText },
    { id: "notifications", label: "Notifikace", icon: Bell },
    { id: "appearance", label: "Vzhled", icon: Palette },
    { id: "security", label: "Bezpečnost", icon: Shield },
    { id: "backup", label: "Zálohy", icon: Database },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Název webu</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings((prev) => ({ ...prev, siteName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin email</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings((prev) => ({ ...prev, adminEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popis webu</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings((prev) => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jazyk</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cs">Čeština</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Časové pásmo</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings((prev) => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Europe/Prague">Europe/Prague</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>
        )

      case "editor":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Výchozí kategorie</label>
                <select
                  value={settings.defaultCategory || ""} // Use empty string for null
                  onChange={(e) => setSettings((prev) => ({ ...prev, defaultCategory: e.target.value || null }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Vyberte kategorii --</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interval auto-uložení (ms)</label>
                <input
                  type="number"
                  min="1000"
                  max="60000"
                  step="1000"
                  value={settings.autoSaveInterval}
                  onChange={(e) => setSettings((prev) => ({ ...prev, autoSaveInterval: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximální velikost souboru (MB)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxFileSize: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Výchozí viditelnost článků</label>
                <select
                  value={settings.defaultVisibility}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, defaultVisibility: e.target.value as "public" | "draft" }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="draft">Koncept</option>
                  <option value="public">Publikováno</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowImageUpload"
                  checked={settings.allowImageUpload}
                  onChange={(e) => setSettings((prev) => ({ ...prev, allowImageUpload: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowImageUpload" className="ml-2 block text-sm text-gray-700">
                  Povolit upload obrázků
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableScheduling"
                  checked={settings.enableScheduling}
                  onChange={(e) => setSettings((prev) => ({ ...prev, enableScheduling: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enableScheduling" className="ml-2 block text-sm text-gray-700">
                  Povolit plánování publikování
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApproval"
                  checked={settings.requireApproval}
                  onChange={(e) => setSettings((prev) => ({ ...prev, requireApproval: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-700">
                  Vyžadovat schválení před publikováním
                </label>
              </div>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings((prev) => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                  Povolit emailové notifikace
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="newArticleNotification"
                  checked={settings.newArticleNotification}
                  onChange={(e) => setSettings((prev) => ({ ...prev, newArticleNotification: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!settings.emailNotifications}
                />
                <label
                  htmlFor="newArticleNotification"
                  className={`ml-2 block text-sm ${settings.emailNotifications ? "text-gray-700" : "text-gray-400"}`}
                >
                  Notifikace při publikování nového článku
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Emailové notifikace</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Notifikace budou odesílány na email: <strong>{settings.adminEmail}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hlavní barva</label>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSettings((prev) => ({ ...prev, primaryColor: color.value }))}
                    className={`w-12 h-12 rounded-lg ${color.preview} border-2 ${
                      settings.primaryColor === color.value ? "border-gray-900" : "border-gray-300"
                    } hover:scale-110 transition-transform flex items-center justify-center`}
                    title={color.label}
                  >
                    {settings.primaryColor === color.value && <span className="text-white text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="darkMode"
                checked={settings.darkMode}
                onChange={(e) => setSettings((prev) => ({ ...prev, darkMode: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="darkMode" className="ml-2 block text-sm text-gray-700">
                Tmavý režim (bude implementován v budoucí verzi)
              </label>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Palette className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900">Poznámka k vzhledu</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Změny barev se projeví v celém admin rozhraní. Hlavní web má své vlastní CSS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeout relace (hodiny)</label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings((prev) => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max. pokusů o přihlášení</label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => setSettings((prev) => ({ ...prev, maxLoginAttempts: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-900">Bezpečnostní upozornění</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Změny bezpečnostních nastavení se projeví při příštím přihlášení. Doporučujeme používat silné heslo
                    a pravidelně měnit přihlašovací údaje.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case "backup":
        return (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export dat</h3>
              <p className="text-gray-600 mb-4">Stáhněte zálohu všech dat z CMS systému.</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Stáhnout zálohu
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Import dat</h3>
              <p className="text-gray-600 mb-4">Nahrajte zálohu pro obnovení dat.</p>
              <input
                type="file"
                accept=".json"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-900">Poznámka k zálohám</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Funkce zálohování bude plně implementována v budoucí verzi. Aktuálně jsou data ukládána v databázi
                    Neon.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nastavení systému</h1>
          <p className="text-gray-600 mt-1">Konfigurace CMS systému a preferencí</p>
          {lastSaved && <p className="text-sm text-green-600 mt-1">Naposledy uloženo: {lastSaved}</p>}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Obnovit výchozí
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Ukládání..." : "Uložit nastavení"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">{renderTabContent()}</div>
    </div>
  )
}
