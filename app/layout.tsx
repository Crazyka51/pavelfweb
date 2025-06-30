import "./globals.css"
import { Inter } from "next/font/google"
import Header from "./components/Header"
import Footer from "./components/Footer"
import CookieBanner from "./components/CookieBanner"
import CookieManager from "./components/CookieManager"
import { GoogleAnalytics } from "./components/GoogleAnalytics"
import StructuredData from "./components/StructuredData"
import type React from "react"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Bc. Pavel Fišer | Zastupitel MČ Praha 4",
  description: "Oficiální stránky Bc. Pavla Fišera, zastupitele MČ Praha 4 a manažera s vášní pro komunitní rozvoj",
  generator: "v0.dev",
  metadataBase: new URL("https://fiserpavel.cz"),
  openGraph: {
    title: "Bc. Pavel Fišer | Zastupitel MČ Praha 4",
    description: "Oficiální stránky Bc. Pavla Fišera, zastupitele MČ Praha 4 a manažera s vášní pro komunitní rozvoj",
    url: "https://fiserpavel.cz",
    siteName: "Pavel Fišer - Zastupitel MČ Praha 4",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Bc. Pavel Fišer - Zastupitel MČ Praha 4",
      },
    ],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bc. Pavel Fišer | Zastupitel MČ Praha 4",
    description: "Oficiální stránky Bc. Pavla Fišera, zastupitele MČ Praha 4 a manažera s vášní pro komunitní rozvoj",
    images: ["/og-image.svg"],
  },
  other: {
    "facebook-domain-verification": "84zli94h1aqmrsxj4u3bgxzuum7kzd",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <meta name="facebook-domain-verification" content="84zli94h1aqmrsxj4u3bgxzuum7kzd" />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-900 text-gray-100 dark`}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <StructuredData
            type="person"
            title="Bc. Pavel Fišer"
            description="Zastupitel MČ Praha 4 a manažer s vášní pro komunitní rozvoj"
            url="https://fiserpavel.cz"
            image="https://fiserpavel.cz/og-image.svg"
          />
        </Suspense>

        <Header />
        <main>{children}</main>
        <Footer />

        <Suspense fallback={null}>
          <CookieBanner />
          <CookieManager />
        </Suspense>
      </body>
    </html>
  )
}
