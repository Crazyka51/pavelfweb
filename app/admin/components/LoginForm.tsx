"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        let errorData: { error?: string; message?: string } = {}
        try {
          // Attempt to parse JSON error, but be robust to non-JSON responses
          errorData = await response.json()
        } catch (jsonError) {
          console.error("Failed to parse JSON error response:", jsonError)
          // If parsing fails, use a generic error message
          errorData.error = `Server error: ${response.statusText || "Unknown error"}`
        }

        toast({
          title: "Chyba přihlášení",
          description: errorData.error || errorData.message || "Nastala neznámá chyba.",
          variant: "destructive",
        })
        return
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Přihlášení úspěšné",
          description: "Vítejte v administraci!",
        })
        router.push("/admin")
      } else {
        toast({
          title: "Chyba přihlášení",
          description: data.error || "Neplatné uživatelské jméno nebo heslo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Chyba sítě",
        description: "Nepodařilo se připojit k serveru. Zkuste to prosím znovu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Přihlášení do administrace</CardTitle>
        <CardDescription>Zadejte své uživatelské jméno a heslo pro přístup k CMS.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Uživatelské jméno</Label>
            <Input
              id="username"
              type="text"
              placeholder="Pavel"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Heslo</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Přihlašování...
              </>
            ) : (
              "Přihlásit se"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">Pouze autorizovaní uživatelé mají přístup.</p>
      </CardFooter>
    </Card>
  )
}
