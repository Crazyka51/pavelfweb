"use client"

import { useState, useEffect } from "react"
import { Users, Mail, TrendingUp, Download, Send, History, Plus, Eye } from "lucide-react"

interface Subscriber {
  id: string
  email: string
  subscribed_at: string // Matches DB column name
  is_active: boolean // Matches DB column name
  source: string
}

interface NewsletterStats {
  total: number
  recent: number // Changed from thisMonth to recent (last 30 days)
  active: number // Changed from activeSubscribers
  totalCampaigns: number
}

interface Campaign {
  id: string
  subject: string
  content: string
  sent_at: string // Matches DB column name
  recipient_count: number // Matches DB column name
  open_count: number // Matches DB column name
  click_count: number // Matches DB column name
}

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    recent: 0,
    active: 0,
    totalCampaigns: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"subscribers" | "campaigns" | "create">("subscribers")
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [newCampaign, setNewCampaign] = useState({
    subject: "",
    content: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [subscribersResponse, campaignsResponse] = await Promise.all([
        fetch("/api/admin/newsletter?activeOnly=false"), // Fetch all subscribers to get full stats
        fetch("/api/admin/newsletter/campaigns"),
      ])

      if (subscribersResponse.ok) {
        const subscribersData = await subscribersResponse.json()
        setSubscribers(subscribersData.subscribers || [])
        setStats((prev) => ({
          ...prev,
          total: subscribersData.stats.total,
          recent: subscribersData.stats.recent,
          active: subscribersData.stats.active,
        }))
      } else {
        console.error("Chyba při načítání odběratelů:", subscribersResponse.status, await subscribersResponse.text())
        setSubscribers([])
        setStats((prev) => ({ ...prev, total: 0, recent: 0, active: 0 }))
      }

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json()
        setCampaigns(campaignsData || [])
        setStats((prev) => ({ ...prev, totalCampaigns: campaignsData.length }))
      } else {
        console.error("Chyba při načítání kampaní:", campaignsResponse.status, await campaignsResponse.text())
        setCampaigns([])
        setStats((prev) => ({ ...prev, totalCampaigns: 0 }))
      }
    } catch (error) {
      console.error("Error loading newsletter data:", error)
      setSubscribers([])
      setCampaigns([])
      setStats({
        total: 0,
        recent: 0,
        active: 0,
        totalCampaigns: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedEmails.length === subscribers.filter((s) => s.is_active).length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(subscribers.filter((s) => s.is_active).map((s) => s.email))
    }
  }

  const handleSelectEmail = (email: string) => {
    setSelectedEmails((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]))
  }

  const handleUnsubscribe = async (email: string) => {
    if (!confirm(`Opravdu chcete odhlásit ${email} z newsletteru?`)) return

    try {
      const response = await fetch("/api/admin/newsletter", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Admin unsubscribe uses email in body
      })

      if (response.ok) {
        await loadData() // Reload all data to reflect changes
        alert("Odběratel byl úspěšně odhlášen")
      } else {
        const errorData = await response.json()
        alert(`Chyba při odhlašování: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Error unsubscribing:", error)
      alert("Chyba při odhlašování odběratele")
    }
  }

  const handleSendCampaign = async () => {
    if (!newCampaign.subject.trim() || !newCampaign.content.trim()) {
      alert("Vyplňte předmět a obsah kampaně")
      return
    }

    const recipients =
      selectedEmails.length > 0 ? selectedEmails : subscribers.filter((s) => s.is_active).map((s) => s.email)

    if (recipients.length === 0) {
      alert("Nejsou žádní aktivní příjemci")
      return
    }

    if (confirm(`Odeslat kampaň "${newCampaign.subject}" na ${recipients.length} adres?`)) {
      try {
        const response = await fetch("/api/admin/newsletter/campaigns", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: newCampaign.subject,
            content: newCampaign.content,
            htmlContent: newCampaign.content, // Assuming content is HTML for now
            recipients: recipients, // This will be used by the send endpoint, not stored in DB directly
            status: "sent", // Mark as sent immediately for this mock
            createdBy: "admin", // Replace with actual user ID
          }),
        })

        if (response.ok) {
          await loadData() // Reload data to show new campaign
          setNewCampaign({ subject: "", content: "" })
          setActiveTab("campaigns")
          alert("Kampaň byla odeslána!")
        } else {
          const errorData = await response.json()
          alert(`Chyba při odesílání kampaně: ${errorData.message || response.statusText}`)
        }
      } catch (error) {
        console.error("Error sending campaign:", error)
        alert("Chyba při odesílání kampaně")
      }
    }
  }

  const exportSubscribers = () => {
    const csvContent = [
      ["Email", "Datum přihlášení", "Zdroj", "Aktivní"],
      ...subscribers.map((sub) => [
        sub.email,
        new Date(sub.subscribed_at).toLocaleDateString("cs-CZ"),
        sub.source === "web" ? "Webová stránka" : "Manuální",
        sub.is_active ? "Ano" : "Ne",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600">Správa odběratelů a e-mailových kampaní</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportSubscribers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Celkem odběratelů</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nových (30 dní)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktivní odběratelé</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Send className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Odeslaných kampaní</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "subscribers", label: "Odběratelé", icon: Users },
              { id: "campaigns", label: "Kampaně", icon: History },
              { id: "create", label: "Nová kampaň", icon: Plus },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "subscribers" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedEmails.length === subscribers.filter((s) => s.is_active).length &&
                        subscribers.filter((s) => s.is_active).length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Vybrat vše (aktivní)</span>
                  </label>
                  {selectedEmails.length > 0 && (
                    <span className="text-sm text-blue-600">Vybráno: {selectedEmails.length}</span>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Výběr</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Datum přihlášení
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zdroj</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stav</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {subscribers.map((subscriber) => (
                      <tr key={subscriber.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedEmails.includes(subscriber.email)}
                            onChange={() => handleSelectEmail(subscriber.email)}
                            className="rounded border-gray-300"
                            disabled={!subscriber.is_active} // Disable checkbox for inactive subscribers
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{subscriber.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(subscriber.subscribed_at)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subscriber.source === "web" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {subscriber.source === "web" ? "Web" : "Manuální"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subscriber.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subscriber.is_active ? "Aktivní" : "Odhlášen"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {subscriber.is_active && (
                            <button
                              onClick={() => handleUnsubscribe(subscriber.email)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Odhlásit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {subscribers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Zatím nemáte žádné odběratele</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "campaigns" && (
            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Zatím nebyly odeslány žádné kampaně</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{campaign.subject}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Odesláno: {formatDate(campaign.sent_at)} • {campaign.recipient_count} příjemců
                          </p>
                          <div className="flex gap-6 mt-3">
                            <div className="text-sm">
                              <span className="text-gray-500">Otevřeno:</span>
                              <span className="font-medium text-gray-900 ml-1">{campaign.open_count}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Kliknuto:</span>
                              <span className="font-medium text-gray-900 ml-1">{campaign.click_count}%</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "create" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Předmět e-mailu</label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zadejte předmět e-mailu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Obsah e-mailu</label>
                <textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign((prev) => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zadejte obsah e-mailu (HTML je podporováno)"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Příjemci:</strong>{" "}
                  {selectedEmails.length > 0
                    ? `${selectedEmails.length} vybraných odběratelů`
                    : `Všichni aktivní odběratelé (${subscribers.filter((s) => s.is_active).length})`}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSendCampaign}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Odeslat kampaň
                </button>
                <button
                  onClick={() => setNewCampaign({ subject: "", content: "" })}
                  className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Vymazat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
