// Použijeme definici gtag z types/gtag.d.ts
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-LNF9PDP1RH"

export function pageview(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

export function event(action: string, parameters?: {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: any;
}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, parameters || {})
  }
}
