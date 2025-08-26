'use client'

import { useAuth } from './auth-context'
import authService from './auth-service'

/**
 * Hook pro provedení autorizovaného API volání 
 * Automaticky přidává token k požadavkům a zajišťuje správu případných chyb autentizace
 */
export function useAuthenticatedFetch() {
  const { isAuthenticated } = useAuth()
  
  /**
   * Provede fetch požadavek s autentizačním tokenem v hlavičce
   */
  const authFetch = async (url: string, options: RequestInit = {}) => {
    // Získání aktuálního tokenu
    const token = authService.getToken()
    
    if (!token) {
      console.error('Nelze provést autentizovaný požadavek - chybí token')
      throw new Error('Nejste přihlášeni')
    }
    
    // Příprava hlaviček s tokenem
    const headers = new Headers(options.headers || {})
    headers.set('Authorization', `Bearer ${token}`)
    
    // Provedení požadavku
    const response = await fetch(url, {
      ...options,
      headers,
    })
    
    // Kontrola odpovědi
    if (response.status === 401) {
      // Pokus o obnovení tokenu
      const refreshed = await authService.refreshToken()
      if (refreshed.isAuthenticated) {
        // Opakování požadavku s novým tokenem
        const newToken = authService.getToken()
        headers.set('Authorization', `Bearer ${newToken}`)
        
        return fetch(url, {
          ...options,
          headers,
        })
      } else {
        throw new Error('Relace vypršela, přihlaste se znovu')
      }
    }
    
    return response
  }
  
  return { authFetch, isAuthenticated }
}
