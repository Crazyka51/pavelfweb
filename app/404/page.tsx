"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  useEffect(() => {
    // Track 404 error
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "page_view", {
        page_title: "404 - Stránka nenalezena",
        page_location: window.location.href,
        custom_parameter: "error_404",
      })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="text-4xl font-bold text-slate-400">404</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Stránka nenalezena</CardTitle>
          <CardDescription className="text-slate-600">
            Omlouváme se, ale stránka kterou hledáte neexistuje nebo byla přesunuta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Domů
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex items-center gap-2 bg-transparent">
              <Link href="javascript:history.back()">
                <ArrowLeft className="w-4 h-4" />
                Zpět
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-slate-500 mb-3">Nebo zkuste vyhledat:</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/aktuality">Aktuality</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/#services">Služby</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/#contact">Kontakt</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
