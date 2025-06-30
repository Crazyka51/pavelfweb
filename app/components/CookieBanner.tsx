'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Cookie, Shield, Settings, Check, Info } from 'lucide-react'
import { 
  ConsentSettings,
  handleConsentChange, 
  trackEvent, 
  shouldShowConsentBanner,
  getCurrentConsentPreferences 
} from './GoogleAnalytics'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    necessary: true, // Always true, cannot be changed
    analytics: false,
    marketing: false,
    personalization: false
  })

  useEffect(() => {
    // Check if consent banner should be displayed
    if (shouldShowConsentBanner()) {
      setIsVisible(true)
    }
    
    // Load existing preferences if available
    const currentPreferences = getCurrentConsentPreferences()
    if (currentPreferences) {
      setConsentSettings(currentPreferences)
    }
  }, [])

  const saveConsentPreferences = (preferences: ConsentSettings) => {
    handleConsentChange(preferences)
    setIsVisible(false)
    
    // Track the specific consent decision
    const grantedCategories = Object.entries(preferences)
      .filter(([key, value]) => key !== 'necessary' && value)
      .map(([key]) => key)
    
    trackEvent('consent_update', 'cookie_banner', 
      grantedCategories.length > 0 ? grantedCategories.join(',') : 'declined'
    )
  }

  const acceptAllCookies = () => {
    const allAccepted: ConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    }
    setConsentSettings(allAccepted)
    saveConsentPreferences(allAccepted)
  }

  const acceptNecessaryOnly = () => {
    const necessaryOnly: ConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    }
    setConsentSettings(necessaryOnly)
    saveConsentPreferences(necessaryOnly)
  }

  const acceptSelectedCookies = () => {
    saveConsentPreferences(consentSettings)
  }

  const toggleSetting = (key: keyof ConsentSettings) => {
    if (key === 'necessary') return // Cannot toggle necessary cookies
    
    setConsentSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Cookie className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Nastavení cookies a ochrany soukromí
            </h2>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-300"
            aria-label="Zavřít"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-300 leading-relaxed">
              Tato webová stránka používá cookies k zajištění nejlepšího uživatelského zážitku. 
              Můžete si vybrat, které typy cookies nám dovolíte používat. Vaše volba bude 
              respektována a uložena po dobu 2 let.
            </p>
            <div className="mt-4 flex items-center space-x-1 text-sm text-gray-400">
              <Info className="h-4 w-4" />
              <span>
                Více informací najdete v našich{' '}
                <Link href="/privacy-policy" className="text-blue-400 hover:underline">
                  Zásadách ochrany osobních údajů
                </Link>
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          {!showSettings && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={acceptAllCookies}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 
                           transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Check className="h-5 w-5" />
                  <span>Přijmout vše</span>
                </button>
                <button
                  onClick={acceptNecessaryOnly}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 
                           transition-colors font-medium"
                >
                  Pouze nezbytné
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex-1 border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg 
                           hover:bg-blue-50 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Settings className="h-5 w-5" />
                  <span>Nastavit</span>
                </button>
              </div>
            </div>
          )}

          {/* Detailed Settings */}
          {showSettings && (
            <div className="space-y-6">
              {/* Necessary Cookies */}
              <div className="border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-400" />
                    <h3 className="font-semibold text-white">Nezbytné cookies</h3>
                  </div>
                  <div className="bg-green-800 text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    Vždy aktivní
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Tyto cookies jsou nezbytné pro základní funkčnost webu, včetně bezpečnosti 
                  a přístupnosti. Nelze je deaktivovat.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Analytické cookies</h3>
                  <button
                    onClick={() => toggleSetting('analytics')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      consentSettings.analytics ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        consentSettings.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Pomáhají nám pochopit, jak návštěvníci používají web, abychom mohli 
                  zlepšovat jeho výkon a obsah. Používáme Google Analytics s anonymizací IP.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Marketingové cookies</h3>
                  <button
                    onClick={() => toggleSetting('marketing')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      consentSettings.marketing ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        consentSettings.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Umožňují nám zobrazovat relevantní reklamy a měřit efektivitu reklamních kampaní. 
                  Mohou být používány třetími stranami.
                </p>
              </div>

              {/* Personalization Cookies */}
              <div className="border border-slate-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white">Personalizace</h3>
                  <button
                    onClick={() => toggleSetting('personalization')}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      consentSettings.personalization ? 'bg-blue-600' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        consentSettings.personalization ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-400">
                  Umožňují přizpůsobit obsah a funkce vašim preferencím a zájmům 
                  na základě vaší aktivity na webu.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-600">
                <button
                  onClick={acceptSelectedCookies}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 
                           transition-colors font-medium"
                >
                  Uložit nastavení
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 bg-slate-600 text-gray-200 px-6 py-3 rounded-lg hover:bg-slate-700 
                           transition-colors font-medium"
                >
                  Zpět
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-700 px-6 py-4 rounded-b-lg">
          <div className="text-xs text-gray-400 space-y-1">
            <p>
              Tento web je v souladu s GDPR a používá Google Consent Mode v2 pro maximální 
              ochranu vašeho soukromí.
            </p>
            <p>
              Nastavení můžete kdykoli změnit v patičce stránky. 
              <Link href="/privacy-policy" className="text-blue-400 hover:underline ml-1">
                Více informací o cookies
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
