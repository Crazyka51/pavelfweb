import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import GoogleAnalytics from "./components/GoogleAnalytics"
import CookieBanner from "./components/CookieBanner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pavel Fišer - Webový vývojář a designér",
  description: "Profesionální webové stránky, e-shopy a aplikace. Moderní design, rychlé načítání a SEO optimalizace.",
  keywords: "webový vývojář, web design, e-shop, aplikace, SEO, Pavel Fišer",
  authors: [{ name: "Pavel Fišer" }],
  creator: "Pavel Fišer",
  publisher: "Pavel Fišer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://pavelfiser.cz"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pavel Fišer - Webový vývojář a designér",
    description:
      "Profesionální webové stránky, e-shopy a aplikace. Moderní design, rychlé načítání a SEO optimalizace.",
    url: "https://pavelfiser.cz",
    siteName: "Pavel Fišer",
    locale: "cs_CZ",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Pavel Fišer - Webový vývojář a designér",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pavel Fišer - Webový vývojář a designér",
    description:
      "Profesionální webové stránky, e-shopy a aplikace. Moderní design, rychlé načítání a SEO optimalizace.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google4f5dc87ffdafdc6a",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={<div>Loading...</div>}>
            <GoogleAnalytics />
            {children}
            <CookieBanner />
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
