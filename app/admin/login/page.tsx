'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import LoadingScreen from '../components/LoadingScreen'

export default function LoginPage() {
  const { isLoading, isAuthenticated, login, logout } = useAuth()
  const router = useRouter()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Detekce force parametru v URL
  const [forceLogin, setForceLogin] = useState(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const forceParam = urlParams.get('force');
      setForceLogin(forceParam === 'true');
      
      if (forceParam === 'true') {
        // Vyčistit localStorage, aby se uživatel musel přihlásit znovu
        localStorage.removeItem('adminToken');
        // Odhlásit uživatele
        logout();
      }
    }
  }, [logout]);

  // Pokud jsme již přihlášeni, přesměrujeme na dashboard (pokud není force=true)
  if (isAuthenticated && !isLoading && !forceLogin) {
    router.push('/admin')
    return null
  }

  // Pokud stále načítáme autentizační stav, zobrazíme načítací obrazovku
  if (isLoading) {
    return <LoadingScreen />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username || !password) {
      setError('Zadejte prosím uživatelské jméno a heslo')
      return
    }

    try {
      setError(null)
      setIsSubmitting(true)
      
      const result = await login(username, password)
      
      if (!result.success) {
        setError(result.message || 'Neplatné přihlašovací údaje')
      } else {
        // Přesměrování na dashboard po úspěšném přihlášení zajistí komponenta AdminAuthLayout
      }
    } catch (err: any) {
      setError(`Chyba přihlášení: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Přihlášení do administrace</CardTitle>
          <CardDescription className="text-center">
            Zadejte své přihlašovací údaje pro přístup do administračního rozhraní
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Uživatelské jméno</Label>
                <Input
                  id="username"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Heslo</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Přihlašování...' : 'Přihlásit se'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-center text-gray-500 mt-4">
            Administrační rozhraní je určeno pouze pro oprávněné osoby.
          </p>
          <p className="text-xs text-center text-gray-500 mt-2">
            <button 
              onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login?force=true';
              }}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Vynutit nové přihlášení
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
