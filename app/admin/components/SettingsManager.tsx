"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { getSettings, updateSettings, type Settings } from "@/lib/services/settings-service"

export function SettingsManager() {
  const [settings, setSettings] = useState<Settings>({
    siteTitle: "",
    siteDescription: "",
    contactEmail: "",
    googleAnalyticsId: "",
    facebookPageId: "",
    newsletterEnabled: false,
    adminUsername: "",
    adminPassword: "", // This will not be displayed or fetched
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    const fetchSettingsData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getSettings()
        setSettings(data)
      } catch (err: any) {
        console.error("Error fetching settings:", err)
        setError(err.message || "Nepodařilo se načíst nastavení.")
        toast({
          title: "Chyba",
          description: err.message || "Nepodařilo se načíst nastavení.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSettingsData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      await updateSettings(settings)

      toast({
        title: "Úspěch",
        description: "Nastavení bylo úspěšně uloženo.",
        variant: "default",
      })
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Chyba",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Načítám nastavení...</div>
  }

  if (error && !loading) {
    return <div className="text-center py-8 text-red-500">Chyba: {error}</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Obecná nastavení</h2>
      <div>
        <Label htmlFor="siteTitle">Název webu</Label>
        <Input
          id="siteTitle"
          value={settings.siteTitle}
          onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="siteDescription">Popis webu</Label>
        <Textarea
          id="siteDescription"
          value={settings.siteDescription}
          onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
          rows={3}
        />
      </div>
      <div>
        <Label htmlFor="contactEmail">Kontaktní e-mail</Label>
        <Input
          id="contactEmail"
          type="email"
          value={settings.contactEmail}
          onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
        />
      </div>

      <h2 className="text-2xl font-bold pt-6">Integrace</h2>
      <div>
        <Label htmlFor="googleAnalyticsId">Google Analytics ID (G-XXXXXXXXXX)</Label>
        <Input
          id="googleAnalyticsId"
          value={settings.googleAnalyticsId}
          onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="facebookPageId">Facebook Page ID</Label>
        <Input
          id="facebookPageId"
          value={settings.facebookPageId}
          onChange={(e) => setSettings({ ...settings, facebookPageId: e.target.value })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="newsletterEnabled"
          checked={settings.newsletterEnabled}
          onCheckedChange={(checked) => setSettings({ ...settings, newsletterEnabled: checked })}
        />
        <Label htmlFor="newsletterEnabled">Povolit newsletter</Label>
      </div>

      <h2 className="text-2xl font-bold pt-6">Nastavení administrátora</h2>
      <div>
        <Label htmlFor="adminUsername">Uživatelské jméno administrátora</Label>
        <Input
          id="adminUsername"
          value={settings.adminUsername}
          onChange={(e) => setSettings({ ...settings, adminUsername: e.target.value })}
          disabled // Username is typically not changed via settings manager
        />
        <p className="text-sm text-gray-500 mt-1">
          Uživatelské jméno administrátora je nastaveno v proměnných prostředí.
        </p>
      </div>
      {/* Password is not displayed or fetched for security reasons */}
      <div>
        <Label htmlFor="adminPassword">Změnit heslo administrátora</Label>
        <Input
          id="adminPassword"
          type="password"
          placeholder="Zadejte nové heslo (ponechte prázdné pro zachování stávajícího)"
          value={settings.adminPassword}
          onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
        />
        <p className="text-sm text-gray-500 mt-1">Pokud zadáte nové heslo, bude hašováno a uloženo.</p>
      </div>

      <Button type="submit" disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Uložit nastavení
      </Button>
    </form>
  )
}
