"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Home, ArrowLeft, Search } from "lucide-react"
import { trackEvent } from "@/app/components/GoogleAnalytics"

export default function NotFound() {
  useEffect(() => {
    // Track 404 page views
    trackEvent("page_view_404", {
      event_category: "error",
      event_label: window.location.pathname,
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Stránka nenalezena</h2>
          <p className="text-gray-600 mb-8">Omlouváme se, ale stránka kterou hledáte neexistuje nebo byla přesunuta.</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Zpět na hlavní stránku
          </Link>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět
            </button>

            <Link
              href="/aktuality"
              className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Procházet články
            </Link>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Pokud problém přetrvává, kontaktujte nás na</p>
          <a href="mailto:info@pavelfiser.cz" className="text-blue-600 hover:underline">
            info@pavelfiser.cz
          </a>
        </div>
      </div>
    </div>
  )
}
