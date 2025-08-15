"use client"

import type { AuthUser } from "./auth-utils"

export interface LoginCredentials {
  emailOrUsername: string
  password: string
}

export interface AuthResponse {
  success: boolean
  accessToken?: string
  user?: AuthUser
  error?: string
}

class AuthService {
  private baseUrl = "/api/admin/auth/v2"
  private tokenKey = "accessToken"
  private refreshInterval: NodeJS.Timeout | null = null

  // Přihlášení uživatele
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Pro cookies
      })

      if (!response.ok) {
        // Pokud response není OK, zkusíme přečíst jako text
        const text = await response.text()
        let errorMessage = "Login failed"

        try {
          const errorData = JSON.parse(text)
          errorMessage = errorData.error || errorMessage
        } catch {
          // Pokud není JSON, použijeme status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }

        return { success: false, error: errorMessage }
      }

      const data = await response.json()

      if (data.success && data.accessToken) {
        this.setAccessToken(data.accessToken)
        this.startTokenRefresh()
        return data
      }

      return { success: false, error: data.error || "Login failed" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error or server unavailable" }
    }
  }

  // Odhlášení uživatele
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      this.clearTokens()
      this.stopTokenRefresh()
    }
  }

  // Obnovení access tokenu
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: "POST",
        credentials: "include",
      })

      const data = await response.json()

      if (data.success && data.accessToken) {
        this.setAccessToken(data.accessToken)
        return data
      }

      // Pokud refresh selže, odhlásíme uživatele
      this.clearTokens()
      this.stopTokenRefresh()
      return { success: false, error: data.error || "Token refresh failed" }
    } catch (error) {
      console.error("Token refresh error:", error)
      this.clearTokens()
      this.stopTokenRefresh()
      return { success: false, error: "Network error" }
    }
  }

  // Ověření současného tokenu
  async verifyToken(): Promise<AuthResponse> {
    const token = this.getAccessToken()
    if (!token) {
      return { success: false, error: "No token found" }
    }

    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        return data
      }

      // Token je neplatný, zkusíme refresh
      return await this.refreshToken()
    } catch (error) {
      console.error("Token verification error:", error)
      return { success: false, error: "Network error" }
    }
  }

  // Získání současného uživatele
  async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getAccessToken()
    if (!token) {
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        return data.user
      }

      return null
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  // Správa access tokenu v localStorage
  private setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token)
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey)
    }
    return null
  }

  private clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey)
    }
  }

  // Automatické obnovování tokenu každých 10 minut
  private startTokenRefresh(): void {
    this.stopTokenRefresh()
    this.refreshInterval = setInterval(
      async () => {
        await this.refreshToken()
      },
      10 * 60 * 1000,
    ) // 10 minut
  }

  private stopTokenRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  // Kontrola, zda je uživatel přihlášen
  isAuthenticated(): boolean {
    return !!this.getAccessToken()
  }
}

export const authService = new AuthService()
