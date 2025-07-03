'use client'

import { useState, useEffect } from 'react'
import { X, Cookie, Shield, Settings, Check, Info } from 'lucide-react'
import { 
  ConsentSettings,
  handleConsentChange, 
  trackEvent, 
  getCurrentConsentPreferences 
} from './GoogleAnalytics'

interface CookiePreferencesProps {
  isOpen: boolean
  onClose: () => void
}

export default function CookiePreferences({ isOpen, onClose }: CookiePreferencesProps) {
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>({
    necessary: true, // Always true, cannot be changed
    analytics: false,
    marketing: false,
    personalization: false
  })

  useEffect(() => {
    // Load existing preferences if available
    const currentPreferences = getCurrentConsentPreferences()
    if (currentPreferences) {
      setConsentSettings(currentPreferences)
    }
  }, [])

  const saveConsentPreferences = (preferences: ConsentSettings) => {
    handleConsentChange(preferences)
    onClose()
    
    // Track the specific consent decision
    const grantedCategories = Object.entries(preferences)
      .filter(([key, value]) => key !== 'necessary' && value)
      .map(([key]) => key)
    
    trackEvent('consent_update', 'cookie_preferences', 
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Nastavení cookies
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cookie Categories */}
          <div className="space-y-4">
            {/* Necessary Cookies */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Nezbytné cookies
                </h3>
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  Vždy aktivní
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Tyto cookies jsou nezbytné pro základní fungování webu a nelze je vypnout.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  Analytické cookies
                </h3>
                <button
                  onClick={() => toggleSetting('analytics')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consentSettings.analytics ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consentSettings.analytics ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Pomáhají nám pochopit, jak návštěvníci používají náš web prostřednictvím Google Analytics.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  Marketingové cookies
                </h3>
                <button
                  onClick={() => toggleSetting('marketing')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consentSettings.marketing ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consentSettings.marketing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Používají se pro cílené zobrazování reklam a měření jejich účinnosti.
              </p>
            </div>

            {/* Personalization Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">
                  Personalizační cookies
                </h3>
                <button
                  onClick={() => toggleSetting('personalization')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    consentSettings.personalization ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      consentSettings.personalization ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Umožňují personalizaci obsahu a funkcí na základě vašich preferencí.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={acceptAllCookies}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Přijmout vše
            </button>
            <button
              onClick={acceptSelectedCookies}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Uložit nastavení
            </button>
            <button
              onClick={acceptNecessaryOnly}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Pouze nezbytné
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
