"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { authService, type LoginCredentials } from "./auth-service"
import type { AuthUser } from "./auth-utils"

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Inicializace - kontrola přihlášení při načtení
  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await authService.verifyToken()
        if (result.success && result.user) {
          setUser(result.user)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Přihlášení
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const result = await authService.login(credentials)
      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      }
      return { success: false, error: result.error }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Přihlášení se nezdařilo" }
    } finally {
      setIsLoading(false)
    }
  }

  // Odhlášení
  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Obnovení informací o uživateli
  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Refresh user error:", error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook pro použití auth contextu
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
