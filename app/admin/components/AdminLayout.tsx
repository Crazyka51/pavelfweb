'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Edit3, 
  Tags, 
  Settings, 
  BarChart3,
  Users,
  Database,
  Download,
  Upload,
  Trash2,
  Eye,
  ExternalLink,
  Menu,
  X,
  LogOut,
  Mail
} from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
  currentSection: string
  onSectionChange: (section: string) => void
  onLogout: () => void
  currentUser: {username: string, displayName: string} | null
}

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Přehled a statistiky'
  },
  {
    id: 'articles',
    label: 'Správa článků',
    icon: FileText,
    description: 'Všechny publikované a koncepty'
  },
  {
    id: 'editor',
    label: 'Nový článek',
    icon: Edit3,
    description: 'Vytvořit nový článek'
  },
  {
    id: 'categories',
    label: 'Kategorie',
    icon: Tags,
    description: 'Správa kategorií a štítků'
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    icon: Mail,
    description: 'Odběratelé a e-mailové kampaně'
  },
  {
    id: 'analytics',
    label: 'Statistiky',
    icon: BarChart3,
    description: 'Lokální přehledy'
  },
  {
    id: 'backup',
    label: 'Zálohy',
    icon: Database,
    description: 'Export a import dat'
  },
  {
    id: 'settings',
    label: 'Nastavení',
    icon: Settings,
    description: 'Konfigurace systému'
  }
]

export default function AdminLayout({ children, currentSection, onSectionChange, onLogout, currentUser }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentMenuItem = menuItems.find(item => item.id === currentSection)

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className="text-xl font-bold">Pavel Fišer CMS</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-blue-500 transition-colors"
          >
            <X className="w-5 h-5" />
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
                onClick={() => {
                  onSectionChange(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                <div className="flex-1">
                  <div className={`font-medium ${isActive ? 'text-blue-700' : ''}`}>
                    {item.label}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Quick actions */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="space-y-2">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Zobrazit web
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
            <a
              href="http://localhost:3002/api/public/articles"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Database className="w-4 h-4 mr-2" />
              Public API
              <ExternalLink className="w-3 h-3 ml-auto" />
            </a>
          </div>
        </div>

        {/* User section */}
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {currentUser?.displayName || 'Neznámý uživatel'}
              </div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Odhlásit se
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {currentMenuItem?.label || 'CMS'}
            </h1>
            <div className="w-9"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentMenuItem?.label || 'Dashboard'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentMenuItem?.description || 'Vítejte v administraci'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('cs-CZ', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {currentUser?.displayName || 'Neznámý uživatel'}
                  </span>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
