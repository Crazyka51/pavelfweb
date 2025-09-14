'use client';

/**
 * Rozhraní pro rozšířené možnosti fetch
 */
export interface AuthFetchOptions extends RequestInit {
  debug?: boolean;
  tokenKey?: string;
}

/**
 * Pomocná funkce pro vytváření autorizovaných fetch požadavků
 * 
 * @param url URL požadavku
 * @param options Možnosti pro fetch včetně rozšířených možností
 * @returns Promise s výsledkem fetch
 */
export async function authorizedFetch(url: string, options: AuthFetchOptions = {}) {
  const { debug = false, tokenKey = 'adminToken', ...fetchOptions } = options;
  
  // Získání tokenu z localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;
  
  if (debug) {
    console.log(`[auth-fetch] Requesting: ${url}`);
    console.log(`[auth-fetch] Token exists: ${!!token}`);
  }
  
  // Vytvoření nových options s Authorization hlavičkou, pokud máme token
  const updatedOptions = { ...fetchOptions };
  
  // Ujistíme se, že máme hlavičky
  if (!updatedOptions.headers) {
    updatedOptions.headers = {};
  }
  
  // Přidáme Authorization header, pokud máme token
  if (token) {
    // Převedeme headers na objekt, pokud je to instance Headers
    const headersObj = updatedOptions.headers instanceof Headers 
      ? Object.fromEntries(updatedOptions.headers.entries())
      : { ...updatedOptions.headers as Record<string, string> };
    
    // Přidáme Authorization header
    headersObj['Authorization'] = `Bearer ${token}`;
    
    // Aktualizujeme headers v options
    updatedOptions.headers = headersObj;
    
    if (debug) {
      console.log(`[auth-fetch] Authorization header added`);
    }
  } else if (debug) {
    console.warn(`[auth-fetch] No token available for authorization`);
  }
  
  // Vždy přidáme credentials: 'include' pro cookie podporu
  updatedOptions.credentials = 'include';
  
  try {
    // Provedení fetch požadavku
    const response = await fetch(url, updatedOptions);
    
    if (debug) {
      console.log(`[auth-fetch] Response: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    if (debug) {
      console.error(`[auth-fetch] Fetch error:`, error);
    }
    throw error;
  }
}

/**
 * Pomocné wrapper funkce pro běžné API operace s autorizací
 */

// GET požadavek
export async function authGet(url: string, options: AuthFetchOptions = {}) {
  return authorizedFetch(url, { method: 'GET', ...options });
}

// POST požadavek
export async function authPost(url: string, data: any, options: AuthFetchOptions = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  return authorizedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
    headers
  });
}

// PUT požadavek
export async function authPut(url: string, data: any, options: AuthFetchOptions = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  return authorizedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
    headers
  });
}

// DELETE požadavek
export async function authDelete(url: string, options: AuthFetchOptions = {}) {
  return authorizedFetch(url, { method: 'DELETE', ...options });
}

/**
 * Funkce pro kontrolu stavu API a tokenu
 * @returns true pokud je API dostupné a token platný, jinak false
 */
export async function checkApiStatus(apiEndpoint: string = '/api/admin/articles'): Promise<boolean> {
  try {
    // Získání tokenu z localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    
    // Základní kontrola tokenu
    if (!token) {
      console.warn('[auth-fetch] checkApiStatus: No token found');
      return false;
    }
    
    // Kontrola expirace tokenu
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        const expiry = payload.exp;
        const now = Math.floor(Date.now() / 1000);
        
        if (expiry < now) {
          console.warn('[auth-fetch] checkApiStatus: Token is expired');
          return false;
        }
      }
    } catch (e) {
      console.error('[auth-fetch] checkApiStatus: Error decoding token', e);
    }
    
    // Kontrola dostupnosti API
    const response = await authorizedFetch(apiEndpoint, { 
      method: 'HEAD',
      debug: true 
    });
    
    return response.ok;
  } catch (error) {
    console.error('[auth-fetch] checkApiStatus: API check failed', error);
    return false;
  }
}
