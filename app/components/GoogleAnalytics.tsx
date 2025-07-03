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
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export function handleConsentChange(consent: ConsentSettings) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cookie-consent", JSON.stringify(consent))

    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: consent.analytics ? "granted" : "denied",
        ad_storage: consent.marketing ? "granted" : "denied",
        functionality_storage: consent.functional ? "granted" : "denied",
      })
    }
  }
}

export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, parameters)
  }
}

export function shouldShowConsentBanner(): boolean {
  if (typeof window === "undefined") return false
  return !localStorage.getItem("cookie-consent")
}

export function getCurrentConsentPreferences(): ConsentSettings {
  if (typeof window === "undefined") {
    return { analytics: false, marketing: false, functional: true }
  }

  const stored = localStorage.getItem("cookie-consent")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { analytics: false, marketing: false, functional: true }
    }
  }

  return { analytics: false, marketing: false, functional: true }
}

export default GoogleAnalytics
