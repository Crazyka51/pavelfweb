"use client"

import { useEffect } from "react"
import Script from "next/script"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-LNF9PDP1RH"

export function GoogleAnalytics() {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || []

    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }

    window.gtag = gtag

    // Configure Google Analytics
    gtag("js", new Date())
    gtag("config", GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }, [])

  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
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

// Consent management
export interface ConsentSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  personalization: boolean
}

export function handleConsentChange(consent: ConsentSettings) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cookie-consent", JSON.stringify(consent))

    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: consent.analytics ? "granted" : "denied",
        ad_storage: consent.marketing ? "granted" : "denied",
        ad_user_data: consent.marketing ? "granted" : "denied",
        ad_personalization: consent.personalization ? "granted" : "denied",
        personalization_storage: consent.personalization ? "granted" : "denied",
        functionality_storage: "granted", // Always granted for necessary cookies
        security_storage: "granted", // Always granted for necessary cookies
      })
    }
  }
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export function shouldShowConsentBanner(): boolean {
  if (typeof window === "undefined") return false
  return !localStorage.getItem("cookie-consent")
}

export function getCurrentConsentPreferences(): ConsentSettings {
  if (typeof window === "undefined") {
    return { necessary: true, analytics: false, marketing: false, personalization: false }
  }

  const stored = localStorage.getItem("cookie-consent")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { necessary: true, analytics: false, marketing: false, personalization: false }
    }
  }

  return { necessary: true, analytics: false, marketing: false, personalization: false }
}

export default GoogleAnalytics
