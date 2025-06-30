"use client"

/**
 * GoogleAnalytics component + helpers
 * – Uses the global gtag.js snippet
 * – Exports helpers expected elsewhere in the CMS
 */

import { useEffect } from "react"
import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { pageview, event as gtagEvent } from "@/app/lib/gtag"

/* ------------------------------------------------------------------ */
/*  CONFIGURATION & CONSENT                                           */
/* ------------------------------------------------------------------ */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-LNF9PDP1RH"

/** Keys used in localStorage so we have a single source of truth */
const CONSENT_KEY = "ga_consent" as const
type ConsentStatus = "granted" | "denied" | "unset"

export interface ConsentSettings {
  /** current user consent for GA tracking */
  analytics: ConsentStatus
}

/**
 * Reads saved preferences from localStorage (client-side only)
 */
export function getCurrentConsentPreferences(): ConsentSettings {
  if (typeof window === "undefined") return { analytics: "unset" }
  const raw = window.localStorage.getItem(CONSENT_KEY)
  if (raw === "granted" || raw === "denied") return { analytics: raw }
  return { analytics: "unset" }
}

/** Should we show the consent banner? */
export function shouldShowConsentBanner(): boolean {
  return getCurrentConsentPreferences().analytics === "unset"
}

/** Save consent & inform gtag */
export function handleConsentChange(status: ConsentStatus) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CONSENT_KEY, status)
  if (status === "granted") {
    window.gtag?.("consent", "update", { analytics_storage: "granted" })
  } else if (status === "denied") {
    window.gtag?.("consent", "update", { analytics_storage: "denied" })
  }
}

/* ------------------------------------------------------------------ */
/*  EVENT TRACKING WRAPPER                                            */
/* ------------------------------------------------------------------ */

interface TrackEventProps {
  action: string
  category?: string
  label?: string
  value?: number
}

export function trackEvent({ action, category, label, value }: TrackEventProps) {
  gtagEvent({
    action,
    category,
    label,
    value,
  })
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                    */
/* ------------------------------------------------------------------ */

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams() // wrapped in suspense via loading.tsx

  // Track page-views on route change
  useEffect(() => {
    if (!pathname) return
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    pageview(url)
  }, [pathname, searchParams])

  // Inject only once
  return (
    <>
      {/* Global site tag (gtag.js) */}
      <Script id="gtag-loader" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} async />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          // Respect initial consent
          const consent = localStorage.getItem('${CONSENT_KEY}');
          if (consent === 'granted') {
            gtag('consent', 'update', { analytics_storage: 'granted' });
          } else if (consent === 'denied') {
            gtag('consent', 'update', { analytics_storage: 'denied' });
          }

          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
