"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface LoginFormProps {
  onLogin: (token: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
<<<<<<< HEAD
=======

>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
<<<<<<< HEAD
        const data = await response.json();
=======
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
        toast({
          title: "Přihlášení úspěšné",
          description: "Vítejte v administraci!",
          variant: "default",
        })
<<<<<<< HEAD
        onLogin(data.token || "");
      } else {
        let errorMessage = "Chyba při přihlašování."
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (jsonError) {
          // If response is not JSON, use a generic error message
          errorMessage = `Chyba při přihlašování: ${response.statusText || "Neznámá chyba"}.`
          console.error("Failed to parse JSON response:", jsonError)
        }
        toast({
          title: "Chyba přihlášení",
          description: errorMessage,
=======
        router.push("/admin") // Přesměrování na základní URL administrace
      } else {
        let errorData
        try {
          errorData = await response.json()
        } catch (jsonError) {
          // If response is not JSON, read as text
          const textError = await response.text()
          console.error("Failed to parse JSON response:", textError)
          toast({
            title: "Chyba přihlášení",
            description: `Neočekávaná odpověď ze serveru: ${response.status} ${response.statusText}. Zkuste to prosím znovu.`,
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        toast({
          title: "Chyba přihlášení",
          description: errorData.message || "Nesprávné uživatelské jméno nebo heslo.",
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Chyba sítě",
        description: "Nepodařilo se připojit k serveru. Zkontrolujte své připojení.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Přihlášení do administrace</CardTitle>
          <CardDescription>Zadejte své uživatelské jméno a heslo pro přístup k CMS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
=======
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Přihlášení do administrace</CardTitle>
          <CardDescription>Zadejte své přihlašovací údaje pro přístup k CMS.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
              <Label htmlFor="username">Uživatelské jméno</Label>
              <Input
                id="username"
                type="text"
                placeholder="Pavel"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
<<<<<<< HEAD
            <div className="space-y-2">
=======
            <div className="grid gap-2">
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
<<<<<<< HEAD
              {loading ? "Přihlašuji se..." : "Přihlásit se"}
=======
              {loading ? "Přihlašování..." : "Přihlásit se"}
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
