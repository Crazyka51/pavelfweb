"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Typy pro consent
export interface ConsentSettings {
  analytics: boolean
  marketing: boolean
  functional: boolean
}

// Hlavní komponenta
export function GoogleAnalytics() {
  const [consentGiven, setConsentGiven] = useState(false)
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-LNF9PDP1RH"

  useEffect(() => {
    // Zkontroluj uložený consent
    const consent = localStorage.getItem("cookie-consent")
    if (consent) {
      const consentData = JSON.parse(consent)
      setConsentGiven(consentData.analytics === true)
    }
  }, [])

  const handleScriptLoad = () => {
    if (consentGiven) {
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_title: document.title,
        page_location: window.location.href,
      })
    }
  }

  if (!consentGiven) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onLoad={handleScriptLoad}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />
    </>
  )
}

// Export funkcí pro consent management
export const handleConsentChange = (consent: ConsentSettings) => {
  localStorage.setItem("cookie-consent", JSON.stringify(consent))

  if (consent.analytics) {
    // Reload stránku pro načtení GA
    window.location.reload()
  }
}

export const shouldShowConsentBanner = (): boolean => {
  if (typeof window === "undefined") return false
  return !localStorage.getItem("cookie-consent")
}

export const getCurrentConsentPreferences = (): ConsentSettings | null => {
  if (typeof window === "undefined") return null
  const consent = localStorage.getItem("cookie-consent")
  return consent ? JSON.parse(consent) : null
}

// Funkce pro tracking eventů
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Export default komponenty
export default GoogleAnalytics
