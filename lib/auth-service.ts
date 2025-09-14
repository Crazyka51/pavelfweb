'use client';

/**
 * Klientská služba pro práci s autentizací
 * Používá access token uložený v localStorage a refresh token v HTTP-only cookie
 */
export class AuthService {
  private static readonly ACCESS_TOKEN_KEY = 'adminToken';
  private static readonly TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minut
  private refreshInterval: number | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Přihlásí uživatele
   * @param username Uživatelské jméno
   * @param password Heslo
   * @returns Informace o přihlášení
   */
  async login(username: string, password: string): Promise<{
    success: boolean;
    message: string;
    user?: {
      id: string;
      username: string;
      displayName?: string;
      role: string;
    }
  }> {
    try {
      const response = await fetch('/api/admin/auth/v2/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Důležité pro cookies
        body: JSON.stringify({ username, password }), // Používáme username přímo
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.token) {
        // Uložení tokenu do localStorage
        localStorage.setItem(AuthService.ACCESS_TOKEN_KEY, data.token);
        
        // Nastavení automatického obnovování tokenu
        this.startTokenRefresh();
        
        // Upravení struktury uživatele pro kompatibilitu
        const user = {
          id: data.user.id,
          username: data.user.username,
          displayName: data.user.displayName || data.user.username,
          role: data.user.role
        };
        
        // Informování posluchačů o přihlášení
        this.notify('login', { user });
        
        return {
          success: true,
          message: data.message || 'Přihlášení proběhlo úspěšně',
          user
        };
      }
      
      return {
        success: false,
        message: data.message || 'Přihlášení selhalo',
      };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: `Přihlášení selhalo: ${error.message || 'Neznámá chyba'}`,
      };
    }
  }

  /**
   * Odhlásí uživatele
   * @returns Informace o odhlášení
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      // Zastavení obnovování tokenu
      this.stopTokenRefresh();
      
      // Odstranění tokenu z localStorage
      localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
      
      // Volání API pro odstranění refresh tokenu cookie
      const response = await fetch('/api/admin/auth/v2/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      // Informování posluchačů o odhlášení
      this.notify('logout', {});
      
      return {
        success: true,
        message: data.message || 'Odhlášení proběhlo úspěšně',
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: `Odhlášení selhalo: ${error.message || 'Neznámá chyba'}`,
      };
    }
  }

  /**
   * Ověří, zda je uživatel přihlášen
   * @returns Informace o přihlášení
   */
  async checkAuth(): Promise<{
    isAuthenticated: boolean;
    user?: {
      userId: string;
      username: string;
      displayName?: string;
      role: string;
    }
  }> {
    try {
      // Kontrola parametru v URL - pokud obsahuje force=true, přeskočíme automatické přihlášení
      if (typeof window !== 'undefined') {
        const urlPath = window.location.pathname;
        const urlSearch = window.location.search;
        
        // Pokud jsme na přihlašovací stránce nebo máme force=true, zastavíme automatické přihlášení
        if (urlPath === '/admin/login' || urlSearch.includes('force=true')) {
          console.log('Vynucené odhlášení - přihlašovací stránka nebo force=true parametr');
          
          // Vždy vymažeme token, když jsme na přihlašovací stránce
          localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
          return { isAuthenticated: false };
        }
      }

      // Nejdříve zkontrolujeme localStorage
      const token = localStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
      
      if (!token) {
        // Pokud nemáme token v localStorage, zkusíme obnovit token z cookies
        return await this.refreshToken();
      }
      
      // Ověříme platnost token u serveru
      const response = await fetch('/api/admin/auth/v2/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Pokud byl token obnoven, aktualizujeme localStorage
        if (data.token) {
          localStorage.setItem(AuthService.ACCESS_TOKEN_KEY, data.token);
        }
        
        // Pokud ještě nemáme nastavené obnovování tokenu, nastavíme ho
        if (!this.refreshInterval) {
          this.startTokenRefresh();
        }
        
        return {
          isAuthenticated: true,
          user: data.user
        };
      }
      
      // Pokud server vrátil 200, ale success: false, token je neplatný - vyčistíme
      if (response.ok && !data.success) {
        localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
        return { isAuthenticated: false };
      }
      
      // Pokud ověření selhalo, zkusíme obnovit token
      if (!response.ok) {
        const refreshResult = await this.refreshToken();
        
        // Pokud se nepodařilo obnovit token, vyčistíme localStorage
        if (!refreshResult.isAuthenticated) {
          localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
        }
        
        return refreshResult;
      }
      
      return { isAuthenticated: false };
    } catch (error) {
      console.error('Auth check error:', error);
      // Při chybě odstraníme token z localStorage
      localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
      return { isAuthenticated: false };
    }
  }

  /**
   * Obnoví přístupový token pomocí refresh tokenu
   * @returns Informace o přihlášení
   */
  async refreshToken(): Promise<{
    isAuthenticated: boolean;
    user?: {
      userId: string;
      username: string;
      displayName?: string;
      role: string;
    }
  }> {
    try {
      const response = await fetch('/api/admin/auth/v2/refresh', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.token) {
        // Uložení nového tokenu do localStorage
        localStorage.setItem(AuthService.ACCESS_TOKEN_KEY, data.token);
        
        return {
          isAuthenticated: true,
          user: data.user
        };
      }
      
      // Když je response.ok ale nemáme token, tak je pravděpodobně token neplatný
      // Provedeme čištění, aby uživatel musel zadat přihlášení znovu
      if (response.ok && !data.success) {
        localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
      }
      
      return { isAuthenticated: false };
    } catch (error) {
      console.error('Token refresh error:', error);
      // Při chybě také odstraníme token, aby nedocházelo k opakovaným pokusům
      localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
      return { isAuthenticated: false };
    }
  }

  /**
   * Vrátí aktuální token
   * @returns Access token nebo null
   */
  getToken(): string | null {
    return localStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
  }

  /**
   * Spustí automatické obnovování tokenu
   */
  private startTokenRefresh(): void {
    // Zastavit případné existující obnovování
    this.stopTokenRefresh();
    
    // Nastavit nový interval
    this.refreshInterval = window.setInterval(
      () => this.refreshToken(),
      AuthService.TOKEN_REFRESH_INTERVAL
    );
  }

  /**
   * Zastaví automatické obnovování tokenu
   */
  private stopTokenRefresh(): void {
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Přidá posluchače události
   * @param event Název události (login, logout)
   * @param callback Funkce, která se zavolá při události
   */
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  /**
   * Odstraní posluchače události
   * @param event Název události (login, logout)
   * @param callback Funkce, která se má odstranit
   */
  removeEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      return;
    }
    const callbacks = this.eventListeners.get(event) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Informuje posluchače o události
   * @param event Název události (login, logout)
   * @param data Data události
   */
  private notify(event: string, data: any): void {
    const callbacks = this.eventListeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

// Vytvoříme singleton instanci
const authService = new AuthService();
export default authService;
