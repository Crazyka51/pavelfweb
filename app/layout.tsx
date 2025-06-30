import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { GoogleAnalytics } from "./components/GoogleAnalytics"
import { CookieBanner } from "./components/CookieBanner"
import { StructuredData } from "./components/StructuredData"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Pavel Fišer - Webový vývojář a designér",
    template: "%s | Pavel Fišer",
  },
  description:
    "Profesionální webový vývojář a designér Pavel Fišer. Specializuji se na moderní webové aplikace, e-commerce řešení a digitální marketing.",
  keywords: [
    "webový vývojář",
    "web developer",
    "Pavel Fišer",
    "webdesign",
    "e-commerce",
    "digitální marketing",
    "React",
    "Next.js",
    "TypeScript",
  ],
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
    type: "website",
    locale: "cs_CZ",
    url: "https://pavelfiser.cz",
    title: "Pavel Fišer - Webový vývojář a designér",
    description:
      "Profesionální webový vývojář a designér Pavel Fišer. Specializuji se na moderní webové aplikace, e-commerce řešení a digitální marketing.",
    siteName: "Pavel Fišer",
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
      "Profesionální webový vývojář a designér Pavel Fišer. Specializuji se na moderní webové aplikace, e-commerce řešení a digitální marketing.",
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
      <head>
        <StructuredData />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Toaster />
          <CookieBanner />
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  )
}
