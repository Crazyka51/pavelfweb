"use client"

export interface ConsentSettings {
  analytics: "granted" | "denied"
  personalization: "granted" | "denied"
  ad_storage: "granted" | "denied"
  ad_user_data: "granted" | "denied"
  ad_personalization: "granted" | "denied"
}

const CONSENT_STORAGE_KEY = "cookie_consent_settings"

const DEFAULT_CONSENT: ConsentSettings = {
  analytics: "denied",
  personalization: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
}

export function getConsentSettings(): ConsentSettings {
  if (typeof window === "undefined") {
    return DEFAULT_CONSENT
  }

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_CONSENT, ...parsed }
    }
  } catch (error) {
    console.error("Error reading consent settings:", error)
  }

  return DEFAULT_CONSENT
}

export function updateConsentSettings(settings: ConsentSettings): void {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(settings))

    // Update Google Analytics consent if gtag is available
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: settings.analytics,
        ad_storage: settings.ad_storage,
        ad_user_data: settings.ad_user_data,
        ad_personalization: settings.ad_personalization,
        personalization_storage: settings.personalization,
      })
    }

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent("consentUpdated", { detail: settings }))
  } catch (error) {
    console.error("Error saving consent settings:", error)
  }
}

export function hasConsentBeenSet(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return localStorage.getItem(CONSENT_STORAGE_KEY) !== null
}

export function resetConsent(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(CONSENT_STORAGE_KEY)
}

// Initialize Google Consent Mode v2
export function initializeConsentMode(): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return
  }

  const currentSettings = getConsentSettings()

  // Set default consent state
  window.gtag("consent", "default", {
    analytics_storage: currentSettings.analytics,
    ad_storage: currentSettings.ad_storage,
    ad_user_data: currentSettings.ad_user_data,
    ad_personalization: currentSettings.ad_personalization,
    personalization_storage: currentSettings.personalization,
    wait_for_update: 500,
  })
}
