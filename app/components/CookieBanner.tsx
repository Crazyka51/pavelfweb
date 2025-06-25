'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie, Shield } from 'lucide-react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Zkontrolujeme, zda uživatel již udělil souhlas
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setIsVisible(false)
  }

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined')
    localStorage.setItem('cookieConsentDate', new Date().toISOString())
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3 flex-1">
            <Cookie className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Používáme cookies pro lepší uživatelský zážitek
              </h3>
              <p className="text-gray-700 text-sm">
                Tyto webové stránky používají cookies k zajištění základní funkčnosti 
                a analýze návštěvnosti. Více informací najdete v našich{' '}
                <Link 
                  href="/privacy-policy" 
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  zásadách ochrany osobních údajů
                </Link>. Můžete také{' '}
                <Link 
                  href="/data-deletion" 
                  className="text-red-600 hover:text-red-700 underline"
                >
                  požádat o smazání vašich údajů
                </Link>.
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={declineCookies}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Odmítnout
            </button>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Přijmout
            </button>
            <button
              onClick={declineCookies}
              className="p-2 text-gray-400 hover:text-gray-600"
              aria-label="Zavřít"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
