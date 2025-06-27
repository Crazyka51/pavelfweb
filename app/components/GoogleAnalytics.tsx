'use client'

import { useEffect } from 'react'
import Script from 'next/script'

const GA_TRACKING_ID = 'G-LNF9PDP1RH'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export interface ConsentSettings {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  personalization: boolean
}

// Google Consent Mode v2 default settings - stricter defaults per GDPR
const setDefaultConsentState = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied',
      'functionality_storage': 'granted', // Necessary for website functionality
      'personalization_storage': 'denied',
      'security_storage': 'granted', // Necessary for security
      'wait_for_update': 500, // Wait 500ms for user consent
      'region': ['CZ', 'EU'], // Apply to Czech Republic and EU
    })
    
    // Set additional privacy-focused defaults
    window.gtag('set', {
      'anonymize_ip': true,
      'allow_ad_personalization_signals': false,
      'restricted_data_processing': true,
    })
  }
}

// Granular consent update based on specific user preferences
const updateConsentState = (preferences: ConsentSettings) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      'ad_storage': preferences.marketing ? 'granted' : 'denied',
      'ad_user_data': preferences.marketing ? 'granted' : 'denied',
      'ad_personalization': preferences.personalization ? 'granted' : 'denied',
      'analytics_storage': preferences.analytics ? 'granted' : 'denied',
      'functionality_storage': 'granted', // Always granted for necessary functions
      'personalization_storage': preferences.personalization ? 'granted' : 'denied',
      'security_storage': 'granted', // Always granted for security
    })
    
    // Update additional settings based on consent
    window.gtag('set', {
      'allow_ad_personalization_signals': preferences.personalization,
      'restricted_data_processing': !preferences.marketing,
    })
  }
}

// Configure ads data redaction - enhanced for GDPR compliance
const gtagSetAdsDataRedaction = (preferences: ConsentSettings) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Enable redaction if marketing consent is denied
    const shouldRedact = !preferences.marketing
    
    window.gtag('set', 'ads_data_redaction', shouldRedact)
    
    // Additional privacy measures
    if (shouldRedact) {
      window.gtag('set', {
        'client_storage': 'none',
        'anonymize_ip': true,
        'allow_google_signals': false,
      })
    }
  }
}

export function GoogleAnalytics() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      const gtag = (...args: any[]) => {
        window.dataLayer.push(args)
      }
      window.gtag = gtag
      
      // Set default consent before any other gtag calls - GDPR compliance
      setDefaultConsentState()
      
      gtag('js', new Date())
      gtag('config', GA_TRACKING_ID, {
        'anonymize_ip': true,
        'cookie_flags': 'SameSite=None;Secure',
        'cookie_expires': 63072000, // 2 years (max allowed)
        'send_page_view': false, // Controlled sending based on consent
        'allow_google_signals': false, // Disabled by default for privacy
      })

      // Check for existing consent and update accordingly
      const storedPreferences = localStorage.getItem('cookiePreferences')
      const cookieConsent = localStorage.getItem('cookieConsent')
      
      if (storedPreferences) {
        try {
          const preferences: ConsentSettings = JSON.parse(storedPreferences)
          updateConsentState(preferences)
          gtagSetAdsDataRedaction(preferences)
          
          // Send initial page view if analytics consent is granted
          if (preferences.analytics) {
            gtag('event', 'page_view', {
              page_title: document.title,
              page_location: window.location.href,
            })
          }
        } catch (error) {
          console.warn('Error parsing stored cookie preferences:', error)
          // Fall back to denied state
          const deniedPreferences: ConsentSettings = {
            necessary: true,
            analytics: false,
            marketing: false,
            personalization: false
          }
          updateConsentState(deniedPreferences)
          gtagSetAdsDataRedaction(deniedPreferences)
        }
      } else if (cookieConsent === 'accepted') {
        // Legacy support - convert old consent to new format
        const legacyPreferences: ConsentSettings = {
          necessary: true,
          analytics: true,
          marketing: true,
          personalization: true
        }
        updateConsentState(legacyPreferences)
        gtagSetAdsDataRedaction(legacyPreferences)
        localStorage.setItem('cookiePreferences', JSON.stringify(legacyPreferences))
      } else {
        // Default to strictest privacy settings
        const deniedPreferences: ConsentSettings = {
          necessary: true,
          analytics: false,
          marketing: false,
          personalization: false
        }
        updateConsentState(deniedPreferences)
        gtagSetAdsDataRedaction(deniedPreferences)
      }
    }
  }, [])

  return (
    <>
      <Script
        strategy="beforeInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
      />
    </>
  )
}

// Export consent management functions for use in other components
export { setDefaultConsentState, updateConsentState, gtagSetAdsDataRedaction }

// Enhanced event tracking with consent awareness
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Check if analytics consent is granted
    const storedPreferences = localStorage.getItem('cookiePreferences')
    if (storedPreferences) {
      try {
        const preferences: ConsentSettings = JSON.parse(storedPreferences)
        if (preferences.analytics) {
          window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
            anonymize_ip: true,
          })
        }
      } catch (error) {
        console.warn('Error checking analytics consent for event tracking:', error)
      }
    }
  }
}

// Enhanced page view tracking with consent awareness
export const trackPageView = (url: string, title: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const storedPreferences = localStorage.getItem('cookiePreferences')
    if (storedPreferences) {
      try {
        const preferences: ConsentSettings = JSON.parse(storedPreferences)
        if (preferences.analytics) {
          window.gtag('config', GA_TRACKING_ID, {
            page_title: title,
            page_location: url,
            anonymize_ip: true,
          })
        }
      } catch (error) {
        console.warn('Error checking analytics consent for page view:', error)
      }
    }
  }
}

// Consent change handler - call this when user updates preferences
export const handleConsentChange = (newPreferences: ConsentSettings) => {
  if (typeof window !== 'undefined') {
    // Update Google Consent Mode
    updateConsentState(newPreferences)
    gtagSetAdsDataRedaction(newPreferences)
    
    // Store preferences
    localStorage.setItem('cookiePreferences', JSON.stringify(newPreferences))
    localStorage.setItem('cookieConsent', 
      (newPreferences.analytics || newPreferences.marketing || newPreferences.personalization) 
        ? 'accepted' : 'declined'
    )
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    
    // Track consent change
    trackEvent('consent_update', 'privacy', 'preferences_updated')
    
    // If analytics was just enabled, send current page view
    if (newPreferences.analytics) {
      setTimeout(() => {
        trackPageView(window.location.href, document.title)
      }, 100)
    }
  }
}

// Get current consent preferences
export const getCurrentConsentPreferences = (): ConsentSettings | null => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cookiePreferences')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.warn('Error parsing stored consent preferences:', error)
      }
    }
  }
  return null
}

// Check if consent banner should be shown
export const shouldShowConsentBanner = (): boolean => {
  if (typeof window !== 'undefined') {
    const consent = localStorage.getItem('cookieConsent')
    return !consent
  }
  return true
}
