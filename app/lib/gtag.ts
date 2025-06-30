declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-LNF9PDP1RH"

// Funkce pro sledování page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

// Funkce pro sledování eventů
export const event = (action: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, parameters)
  }
}

// Specifické event funkce
export const trackButtonClick = (buttonName: string) => {
  event("click", {
    event_category: "engagement",
    event_label: buttonName,
  })
}

export const trackFormSubmit = (formName: string) => {
  event("form_submit", {
    event_category: "engagement",
    event_label: formName,
  })
}

export const trackDownload = (fileName: string) => {
  event("file_download", {
    event_category: "engagement",
    event_label: fileName,
  })
}

export const trackOutboundLink = (url: string) => {
  event("click", {
    event_category: "outbound",
    event_label: url,
    transport_type: "beacon",
  })
}
