// Cookie consent management with Google Consent Mode v2
export interface ConsentState {
  analytics_storage: "granted" | "denied"
  ad_storage: "granted" | "denied"
  ad_user_data: "granted" | "denied"
  ad_personalization: "granted" | "denied"
  functionality_storage: "granted" | "denied"
  personalization_storage: "granted" | "denied"
  security_storage: "granted" | "denied"
}

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const COOKIE_NAME = "cookie-consent"
const CONSENT_VERSION = "1.0"

// Default consent state (denied by default for GDPR compliance)
const DEFAULT_CONSENT: ConsentState = {
  analytics_storage: "denied",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  functionality_storage: "granted", // Usually granted for basic functionality
  personalization_storage: "denied",
  security_storage: "granted", // Always granted for security
}

export function initializeGoogleConsent() {
  if (typeof window !== "undefined" && window.gtag) {
    // Set default consent state
    window.gtag("consent", "default", DEFAULT_CONSENT)
  }
}

export function updateGoogleConsent(preferences: CookiePreferences) {
  if (typeof window !== "undefined" && window.gtag) {
    const consentUpdate: ConsentState = {
      analytics_storage: preferences.analytics ? "granted" : "denied",
      ad_storage: preferences.marketing ? "granted" : "denied",
      ad_user_data: preferences.marketing ? "granted" : "denied",
      ad_personalization: preferences.marketing ? "granted" : "denied",
      functionality_storage: "granted",
      personalization_storage: preferences.preferences ? "granted" : "denied",
      security_storage: "granted",
    }

    window.gtag("consent", "update", consentUpdate)
  }
}

export function saveCookiePreferences(preferences: CookiePreferences) {
  const consentData = {
    preferences,
    timestamp: Date.now(),
    version: CONSENT_VERSION,
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(COOKIE_NAME, JSON.stringify(consentData))
    updateGoogleConsent(preferences)
  }
}

export function getCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(COOKIE_NAME)
    if (!stored) return null

    const data = JSON.parse(stored)
    if (data.version !== CONSENT_VERSION) return null

    return data.preferences
  } catch {
    return null
  }
}

export function hasConsentBeenGiven(): boolean {
  return getCookiePreferences() !== null
}

export function clearCookiePreferences() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(COOKIE_NAME)
  }
}

// Cookie utility functions
export function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const nameEQ = name + "="
  const ca = document.cookie.split(";")

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }

  return null
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}
