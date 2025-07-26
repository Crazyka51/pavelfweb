"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  HomeIcon,
  NewspaperIcon,
  MailIcon,
  BarChartIcon,
  SettingsIcon,
  MenuIcon,
  LayoutGridIcon,
  LogOutIcon,
} from "lucide-react"
import { signOut } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/admin/login")
      toast({
        title: "Odhlášení úspěšné",
        description: "Byli jste úspěšně odhlášeni z administrace.",
        variant: "default",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Chyba při odhlášení",
        description: "Nepodařilo se odhlásit. Zkuste to prosím znovu.",
        variant: "destructive",
      })
    }
  }

  const navItems = [
    { href: "/admin", icon: HomeIcon, label: "Přehled" },
    { href: "/admin?tab=articles", icon: NewspaperIcon, label: "Články" },
    { href: "/admin?tab=newsletter", icon: MailIcon, label: "Newsletter" },
    { href: "/admin?tab=analytics", icon: BarChartIcon, label: "Analytika" },
    { href: "/admin?tab=categories", icon: LayoutGridIcon, label: "Kategorie" },
    { href: "/admin?tab=settings", icon: SettingsIcon, label: "Nastavení" },
  ]

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-gray-100/40 md:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link className="flex items-center gap-2 font-semibold" href="/admin">
              <span className="text-lg">Admin Panel</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50 ${
                    pathname === item.href.split("?")[0] &&
                    (pathname === "/admin" || pathname.includes(item.href.split("?")[0]))
                      ? "bg-gray-200 dark:bg-gray-700"
                      : ""
                  }`}
                  href={item.href}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50 w-full justify-start mt-4"
              >
                <LogOutIcon className="h-4 w-4" />
                Odhlásit se
              </Button>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-gray-100/40 px-4 lg:h-[60px] lg:px-6 dark:bg-gray-800/40">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button className="shrink-0 md:hidden bg-transparent" size="icon" variant="outline">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-900 hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50 ${
                      pathname === item.href.split("?")[0] &&
                      (pathname === "/admin" || pathname.includes(item.href.split("?")[0]))
                        ? "bg-gray-200 dark:bg-gray-700"
                        : ""
                    }`}
                    href={item.href}
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
                <Button
                  onClick={() => {
                    handleSignOut()
                    setIsSheetOpen(false)
                  }}
                  variant="ghost"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-gray-900 hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50 w-full justify-start mt-4"
                >
                  <LogOutIcon className="h-5 w-5" />
                  Odhlásit se
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">{/* Search or other header content can go here */}</div>
        </header>
        <ScrollArea className="flex-1 overflow-auto">
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
        </ScrollArea>
      </div>
    </div>
  )
}
