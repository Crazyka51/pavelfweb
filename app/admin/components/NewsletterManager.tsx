"use client"

import { useState, useEffect } from "react"
import { Users, Mail, TrendingUp, Download, Send, History, Plus, Eye } from "lucide-react"

interface Subscriber {
  id: string
  email: string
  subscribedAt: string
  isActive: boolean
  source: string
}

interface NewsletterStats {
  total: number
  thisMonth: number
  activeSubscribers: number
  totalCampaigns: number
}

interface Campaign {
  id: string
  subject: string
  content: string
  sentAt: string
  recipientCount: number
  openRate: number
  clickRate: number
}

interface NewsletterManagerProps {
  token: string
}

export default function NewsletterManager({ token }: NewsletterManagerProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    thisMonth: 0,
    activeSubscribers: 0,
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
    try {
      // Mock data pro demonstraci
      const mockSubscribers: Subscriber[] = [
        {
          id: "1",
          email: "jan.novak@email.cz",
          subscribedAt: "2024-01-15T10:30:00Z",
          isActive: true,
          source: "web",
        },
        {
          id: "2",
          email: "marie.svoboda@email.cz",
          subscribedAt: "2024-01-20T14:15:00Z",
          isActive: true,
          source: "web",
        },
        {
          id: "3",
          email: "petr.dvorak@email.cz",
          subscribedAt: "2024-02-01T09:45:00Z",
          isActive: true,
          source: "manual",
        },
      ]

      const mockCampaigns: Campaign[] = [
        {
          id: "1",
          subject: "Měsíční přehled aktualit",
          content: "<p>Vážení občané, zde je přehled nejdůležitějších událostí...</p>",
          sentAt: "2024-02-15T10:00:00Z",
          recipientCount: 127,
          openRate: 68.5,
          clickRate: 12.3,
        },
        {
          id: "2",
          subject: "Nové dopravní opatření",
          content: "<p>Informujeme vás o nových dopravních opatřeních...</p>",
          sentAt: "2024-02-01T15:30:00Z",
          recipientCount: 125,
          openRate: 72.1,
          clickRate: 15.8,
        },
      ]

      setSubscribers(mockSubscribers)
      setCampaigns(mockCampaigns)
      setStats({
        total: mockSubscribers.length,
        thisMonth: mockSubscribers.filter(
          (s) => new Date(s.subscribedAt) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        ).length,
        activeSubscribers: mockSubscribers.filter((s) => s.isActive).length,
        totalCampaigns: mockCampaigns.length,
      })
    } catch (error) {
      console.error("Error loading newsletter data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedEmails.length === subscribers.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(subscribers.map((s) => s.email))
    }
  }

  const handleSelectEmail = (email: string) => {
    setSelectedEmails((prev) => (prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]))
  }

  const handleUnsubscribe = async (email: string) => {
    if (confirm(`Opravdu chcete odhlásit ${email}?`)) {
      setSubscribers((prev) => prev.filter((s) => s.email !== email))
      alert("Odběratel byl odhlášen")
    }
  }

  const handleSendCampaign = async () => {
    if (!newCampaign.subject.trim() || !newCampaign.content.trim()) {
      alert("Vyplňte předmět a obsah kampaně")
      return
    }

    const recipients = selectedEmails.length > 0 ? selectedEmails : subscribers.map((s) => s.email)

    if (recipients.length === 0) {
      alert("Nejsou žádní příjemci")
      return
    }

    if (confirm(`Odeslat kampaň "${newCampaign.subject}" na ${recipients.length} adres?`)) {
      const newCampaignData: Campaign = {
        id: Date.now().toString(),
        subject: newCampaign.subject,
        content: newCampaign.content,
        sentAt: new Date().toISOString(),
        recipientCount: recipients.length,
        openRate: 0,
        clickRate: 0,
      }

      setCampaigns((prev) => [newCampaignData, ...prev])
      setNewCampaign({ subject: "", content: "" })
      setActiveTab("campaigns")
      alert("Kampaň byla odeslána!")
    }
  }

  const exportSubscribers = () => {
    const csvContent = [
      ["Email", "Datum přihlášení", "Zdroj", "Aktivní"],
      ...subscribers.map((sub) => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleDateString("cs-CZ"),
        sub.source === "web" ? "Webová stránka" : "Manuální",
        sub.isActive ? "Ano" : "Ne",
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
              <p className="text-sm font-medium text-gray-600">Nových tento měsíc</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscribers}</p>
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
                      checked={selectedEmails.length === subscribers.length && subscribers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Vybrat vše</span>
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
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{subscriber.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(subscriber.subscribedAt)}</td>
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
                          <button
                            onClick={() => handleUnsubscribe(subscriber.email)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Odhlásit
                          </button>
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
                            Odesláno: {formatDate(campaign.sentAt)} • {campaign.recipientCount} příjemců
                          </p>
                          <div className="flex gap-6 mt-3">
                            <div className="text-sm">
                              <span className="text-gray-500">Otevřeno:</span>
                              <span className="font-medium text-gray-900 ml-1">{campaign.openRate}%</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Kliknuto:</span>
                              <span className="font-medium text-gray-900 ml-1">{campaign.clickRate}%</span>
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
                    : `Všichni odběratelé (${subscribers.length})`}
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
