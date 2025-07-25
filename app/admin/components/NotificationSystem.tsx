"use client"

import { useState, useEffect } from "react"
import { Bell, XCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  message: string
  timestamp: Date
  read: boolean
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    // Simulate fetching notifications
    const fetchedNotifications: Notification[] = [
      {
        id: "1",
        type: "success",
        message: "Článek 'Novinky z radnice' byl úspěšně publikován.",
        timestamp: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: "2",
        type: "error",
        message: "Chyba při odesílání newsletteru: Neplatná adresa příjemce.",
        timestamp: new Date(Date.now() - 7200000),
        read: false,
      },
      {
        id: "3",
        type: "info",
        message: "Systémová aktualizace je naplánována na zítra v 02:00.",
        timestamp: new Date(Date.now() - 10800000),
        read: true,
      },
      {
        id: "4",
        type: "warning",
        message: "Nízké místo na disku: Zbývá méně než 10% volného místa.",
        timestamp: new Date(Date.now() - 14400000),
        read: false,
      },
    ]
    setNotifications(fetchedNotifications)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getBackgroundColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "info":
        return "bg-blue-50 border-blue-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const displayedNotifications = showAll ? notifications : notifications.filter((n) => !n.read)

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifikace</h1>
          <p className="text-gray-600 mt-1">Přehled systémových upozornění a událostí</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowAll(!showAll)} className="text-sm text-blue-600 hover:text-blue-700">
            {showAll ? "Zobrazit jen nepřečtené" : `Zobrazit všechny (${notifications.length})`}
          </button>
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {displayedNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 text-gray-500"
            >
              <Bell className="h-12 w-12 mx-auto mb-4" />
              <p>Žádné notifikace k zobrazení.</p>
            </motion.div>
          ) : (
            displayedNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-4 p-4 rounded-lg border ${getBackgroundColor(notification.type)} ${
                  notification.read ? "opacity-70" : ""
                }`}
              >
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <p className={`font-medium ${notification.read ? "text-gray-600" : "text-gray-900"}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{notification.timestamp.toLocaleString("cs-CZ")}</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      title="Označit jako přečtené"
                    >
                      Označit jako přečtené
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    title="Smazat notifikaci"
                  >
                    Smazat
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
