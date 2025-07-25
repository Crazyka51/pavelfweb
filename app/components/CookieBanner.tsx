"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { getConsentSettings, updateConsentSettings, type ConsentSettings } from "@/lib/cookie-consent"
import { cn } from "@/lib/utils"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = getConsentSettings()
    // If consent is not explicitly set (i.e., it's the default 'denied' for all), show the banner
    const allDenied = Object.values(consent).every((status) => status === "denied")
    if (allDenied) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const newConsent: ConsentSettings = {
      analytics: "granted",
      personalization: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    }
    updateConsentSettings(newConsent)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const newConsent: ConsentSettings = {
      analytics: "denied",
      personalization: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    }
    updateConsentSettings(newConsent)
    setIsVisible(false)
  }

  const handleManagePreferences = () => {
    // Dispatch a custom event to open the CookieManager dialog
    window.dispatchEvent(new CustomEvent("openCookiePreferences"))
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-gray-900 text-white p-4 shadow-lg",
        "flex flex-col md:flex-row items-center justify-between gap-4",
      )}
    >
      <div className="text-sm text-center md:text-left">
        <p>
          Používáme soubory cookie k personalizaci obsahu, poskytování funkcí sociálních médií a analýze naší
          návštěvnosti.
        </p>
        <p className="mt-1">
          Více informací naleznete v našich{" "}
          <a href="/privacy-policy" className="underline hover:no-underline">
            Zásadách ochrany osobních údajů
          </a>
          .
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <Button onClick={handleAcceptAll} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
          Přijmout vše
        </Button>
        <Button onClick={handleRejectAll} className="w-full sm:w-auto bg-gray-700 hover:bg-gray-800 text-white">
          Odmítnout vše
        </Button>
        <Button
          onClick={handleManagePreferences}
          variant="outline"
          className="w-full sm:w-auto text-white border-white hover:bg-gray-700 bg-transparent"
        >
          Spravovat preference
        </Button>
      </div>
    </div>
  )
}
