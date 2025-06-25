import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "./components/Header"
import Footer from "./components/Footer"
import CookieBanner from "./components/CookieBanner"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Bc. Pavel Fišer | Zastupitel MČ Praha 4",
  description: "Oficiální stránky Bc. Pavla Fišera, zastupitele MČ Praha 4 a manažera s vášní pro komunitní rozvoj",
  generator: 'v0.dev',
  other: {
    'facebook-domain-verification': '84zli94h1aqmrsxj4u3bgxzuum7kzd',
  }
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
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
        </ThemeProvider>
      </body>
    </html>
  )
}