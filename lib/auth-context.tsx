'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import authService from './auth-service'

export type AuthUser = {
  userId: string
  username: string
  displayName?: string
  role: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: AuthUser | null
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AuthUser | null>(null)

  // Kontrola přihlášení při načtení stránky
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true)
      try {
        const authState = await authService.checkAuth()
        setIsAuthenticated(authState.isAuthenticated)
        setUser(authState.user || null)
      } catch (error) {
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()

    // Nasloucháme na události přihlášení/odhlášení
    const loginHandler = (data: { user: AuthUser }) => {
      setIsAuthenticated(true)
      setUser(data.user)
    }

    const logoutHandler = () => {
      setIsAuthenticated(false)
      setUser(null)
    }

    authService.addEventListener('login', loginHandler)
    authService.addEventListener('logout', logoutHandler)

    return () => {
      authService.removeEventListener('login', loginHandler)
      authService.removeEventListener('logout', logoutHandler)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const result = await authService.login(username, password)
    return result
  }

  const logout = async () => {
    await authService.logout()
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
