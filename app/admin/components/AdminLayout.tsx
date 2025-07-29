"use client"

import type React from "react"

import { useState } from "react"
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Tag,
  Mail,
  BarChart3,
  Archive,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  currentSection: string
  onSectionChange: (section: string) => void
  onLogout: () => void
  currentUser?: { username: string; displayName: string } | null
}

export default function AdminLayout({
  children,
  currentSection,
  onSectionChange,
  onLogout,
  currentUser,
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Přehled a statistiky" },
    { id: "articles", label: "Správa článků", icon: FileText, description: "Všechny publikované a koncepty" },
    { id: "new-article", label: "Nový článek", icon: PlusCircle, description: "Vytvořit nový článek" },
    { id: "categories", label: "Kategorie", icon: Tag, description: "Správa kategorií a štítků" },
    { id: "newsletter", label: "Newsletter", icon: Mail, description: "Odběratelé a e-mailové kampaně" },
    { id: "analytics", label: "Statistiky", icon: BarChart3, description: "Lokální přehledy" },
    { id: "backup", label: "Zálohy", icon: Archive, description: "Export a import dat" },
    { id: "settings", label: "Nastavení", icon: Settings, description: "Konfigurace systému" },
  ]

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId)
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h1 className="text-xl font-bold text-gray-900">CMS Admin</h1>
              <p className="text-sm text-gray-600">Pavel Fišer</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentSection === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`
                    w-full flex items-start p-3 rounded-lg text-left transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${isActive ? "text-blue-700" : "text-gray-400"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentUser?.displayName || "Pavel Fišer"}
                </p>
                <p className="text-xs text-gray-500 truncate">{currentUser?.username || "admin"}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Odhlásit se
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <h2 className="text-lg font-semibold text-gray-900">
                  {menuItems.find((item) => item.id === currentSection)?.label || "Dashboard"}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-500">
                Poslední přihlášení: {new Date().toLocaleDateString("cs-CZ")}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
