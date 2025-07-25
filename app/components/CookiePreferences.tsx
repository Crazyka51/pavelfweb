"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getConsentSettings, updateConsentSettings, type ConsentSettings } from "@/lib/cookie-consent"

interface CookiePreferencesProps {
  isOpen: boolean
  onClose: () => void
}

export default function CookiePreferences({ isOpen, onClose }: CookiePreferencesProps) {
  const [consent, setConsent] = useState<ConsentSettings>({
    analytics: "denied",
    personalization: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  })

  useEffect(() => {
    if (isOpen) {
      const currentConsent = getConsentSettings()
      setConsent(currentConsent)
    }
  }, [isOpen])

  const handleSavePreferences = () => {
    updateConsentSettings(consent)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nastavení souborů cookie</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-gray-500">
            Spravujte svá nastavení souborů cookie. Můžete povolit nebo zakázat různé typy souborů cookie.
          </p>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="analytics-cookies">Analytické cookies</Label>
            <Switch
              id="analytics-cookies"
              checked={consent.analytics === "granted"}
              onCheckedChange={(checked) =>
                setConsent((prev) => ({ ...prev, analytics: checked ? "granted" : "denied" }))
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="personalization-cookies">Personalizační cookies</Label>
            <Switch
              id="personalization-cookies"
              checked={consent.personalization === "granted"}
              onCheckedChange={(checked) =>
                setConsent((prev) => ({ ...prev, personalization: checked ? "granted" : "denied" }))
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="ad-storage-cookies">Reklamní úložiště</Label>
            <Switch
              id="ad-storage-cookies"
              checked={consent.ad_storage === "granted"}
              onCheckedChange={(checked) =>
                setConsent((prev) => ({ ...prev, ad_storage: checked ? "granted" : "denied" }))
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="ad-user-data-cookies">Data uživatelů pro reklamy</Label>
            <Switch
              id="ad-user-data-cookies"
              checked={consent.ad_user_data === "granted"}
              onCheckedChange={(checked) =>
                setConsent((prev) => ({ ...prev, ad_user_data: checked ? "granted" : "denied" }))
              }
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="ad-personalization-cookies">Personalizace reklam</Label>
            <Switch
              id="ad-personalization-cookies"
              checked={consent.ad_personalization === "granted"}
              onCheckedChange={(checked) =>
                setConsent((prev) => ({ ...prev, ad_personalization: checked ? "granted" : "denied" }))
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSavePreferences}>
            Uložit preference
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
