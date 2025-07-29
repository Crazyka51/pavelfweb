'use client'

import { useState, useEffect } from 'react'
import CookiePreferences from './CookiePreferences'

export default function CookieManager() {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  useEffect(() => {
    const handleOpenPreferences = () => {
      setIsPreferencesOpen(true)
    }

    // Listen for the custom event from Footer
    window.addEventListener('openCookiePreferences', handleOpenPreferences)

    return () => {
      window.removeEventListener('openCookiePreferences', handleOpenPreferences)
    }
  }, [])

  return (
    <CookiePreferences 
      isOpen={isPreferencesOpen} 
      onClose={() => setIsPreferencesOpen(false)} 
    />
  )
}
