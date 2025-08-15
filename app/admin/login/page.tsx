"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, User } from "lucide-react"

export default function AdminLoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await login({ emailOrUsername, password })

      if (result.success) {
        router.push("/admin")
      } else {
        setError(result.error || "Přihlášení se nezdařilo")
      }
    } catch (error) {
      setError("Došlo k neočekávané chybě")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-slate-900">Administrace</CardTitle>
              <CardDescription className="text-slate-600">Přihlaste se do administračního rozhraní</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername" className="text-sm font-medium text-slate-700">
                  Email nebo uživatelské jméno
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="admin@example.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Heslo
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Přihlašuji...
                  </>
                ) : (
                  "Přihlásit se"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs text-slate-500">Zabezpečené přihlášení pro administrátory</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">Pavel Fišer - Zastupitel Praha 4</p>
        </div>
      </div>
    </div>
  )
}
