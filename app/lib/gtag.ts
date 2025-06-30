export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-LNF9PDP1RH"

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

/**
 * Send a page view event to Google Analytics
 */
export function pageview(url: string, title?: string) {
  if (typeof window === "undefined" || !window.gtag) return

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
  })
}

/**
 * Send a custom event to Google Analytics
 */
interface EventProps {
  action: string
  category?: string
  label?: string
  value?: number
}

export function event({ action, category, label, value }: EventProps) {
  if (typeof window === "undefined" || !window.gtag) return

  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

/**
 * Track conversion events
 */
export function trackConversion(conversionId: string, value?: number) {
  if (typeof window === "undefined" || !window.gtag) return

  window.gtag("event", "conversion", {
    send_to: conversionId,
    value: value,
  })
}

/**
 * Track custom events with additional parameters
 */
export function trackCustomEvent(eventName: string, parameters: Record<string, any> = {}) {
  if (typeof window === "undefined" || !window.gtag) return

  window.gtag("event", eventName, parameters)
}
