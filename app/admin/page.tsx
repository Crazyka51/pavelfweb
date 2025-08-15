"use client"

import { AdminAuthLayout } from "@/components/auth/admin-auth-layout"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LogOut, Settings, FileText, Mail, BarChart3 } from "lucide-react"

export default function AdminDashboard() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <AdminAuthLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-slate-900">Administrace</h1>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  Přihlášen jako: <span className="font-medium">{user?.username}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-transparent"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Odhlásit</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Vítejte v administraci</h2>
            <p className="text-slate-600">Spravujte obsah webu, články a newsletter</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Články</CardTitle>
                <FileText className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-slate-600">+2 tento měsíc</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
                <Mail className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">248</div>
                <p className="text-xs text-slate-600">odběratelů</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Návštěvy</CardTitle>
                <BarChart3 className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-slate-600">tento měsíc</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Systém</CardTitle>
                <Settings className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">OK</div>
                <p className="text-xs text-slate-600">Vše funguje</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rychlé akce</CardTitle>
                <CardDescription>Nejčastěji používané funkce</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Nový článek
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Newsletter kampaň
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Nastavení
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Poslední aktivita</CardTitle>
                <CardDescription>Nedávné změny v systému</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Článek publikován:</span> "Nová iniciativa pro Praha 4"
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Newsletter odeslán:</span> 248 příjemců
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-medium">Systém aktualizován:</span> Verze 2.1.0
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AdminAuthLayout>
  )
}
