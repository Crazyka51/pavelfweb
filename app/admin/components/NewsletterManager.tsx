'use client'

import { useState, useEffect } from 'react'
import { Users, Mail, TrendingUp, Download, Upload, Trash2, Eye, Send, History } from 'lucide-react'
import CampaignEditor from './CampaignEditor'
import CampaignHistory from './CampaignHistory'

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
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  createdAt: string
  updatedAt: string
}

interface NewsletterManagerProps {
  token: string
}

export default function NewsletterManager({ token }: NewsletterManagerProps) {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<NewsletterStats>({ total: 0, thisMonth: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])
  const [showCampaignEditor, setShowCampaignEditor] = useState(false)
  const [showCampaignHistory, setShowCampaignHistory] = useState(false)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])

  useEffect(() => {
    loadSubscribers()
    loadTemplates()
  }, [token])

  const loadSubscribers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/newsletter', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Chyba při načítání odběratelů')
      }

      const data = await response.json()
      setSubscribers(data.subscribers)
      setStats(data.stats)
      setError(null)
    } catch (error) {
      console.error('Error loading subscribers:', error)
      setError('Nepodařilo se načíst seznam odběratelů')
    } finally {
      setIsLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleSaveTemplate = async (template: EmailTemplate) => {
    try {
      const response = await fetch('/api/admin/newsletter/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template)
      })

      if (response.ok) {
        loadTemplates()
        setShowCampaignEditor(false)
        alert('Šablona byla úspěšně uložena!')
      } else {
        throw new Error('Chyba při ukládání šablony')
      }
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Chyba při ukládání šablony')
    }
  }

  const handleSendCampaign = async (template: EmailTemplate, recipients: string[]) => {
    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
          recipients: recipients.length > 0 ? recipients : subscribers.map(s => s.email)
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setShowCampaignEditor(false)
      } else {
        throw new Error('Chyba při odesílání newsletteru')
      }
    } catch (error) {
      console.error('Error sending campaign:', error)
      throw error
    }
  }

  const handleUnsubscribe = async (email: string) => {
    if (!confirm(`Opravdu chcete odhlásit ${email} z newsletteru?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        // Reload subscribers to update the list
        loadSubscribers()
        alert('Odběratel byl úspěšně odhlášen')
      } else {
        throw new Error('Chyba při odhlašování')
      }
    } catch (error) {
      console.error('Error unsubscribing:', error)
      alert('Chyba při odhlašování odběratele')
    }
  }

  const handleSelectAll = () => {
    if (selectedEmails.length === subscribers.length) {
      setSelectedEmails([])
    } else {
      setSelectedEmails(subscribers.map(sub => sub.email))
    }
  }

  const handleSelectEmail = (email: string) => {
    setSelectedEmails(prev => 
      prev.includes(email) 
        ? prev.filter(e => e !== email)
        : [...prev, email]
    )
  }

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Datum přihlášení', 'Zdroj'],
      ...subscribers.map(sub => [
        sub.email,
        new Date(sub.subscribedAt).toLocaleDateString('cs-CZ'),
        sub.source
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show campaign history if open
  if (showCampaignHistory) {
    return (
      <CampaignHistory
        token={token}
        onBack={() => setShowCampaignHistory(false)}
      />
    )
  }

  // Show campaign editor if open
  if (showCampaignEditor) {
    return (
      <CampaignEditor
        template={null}
        onSave={handleSaveTemplate}
        onCancel={() => setShowCampaignEditor(false)}
        onSendCampaign={handleSendCampaign}
        subscriberCount={subscribers.length}
        token={token}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Načítání odběratelů...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
          <p className="text-gray-600">Správa odběratelů a newsletter kampaní</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportSubscribers}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowCampaignHistory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <History className="w-4 h-4" />
            Historie kampaní
          </button>
          <button
            onClick={() => setShowCampaignEditor(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Nová kampaň
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celkem odběratelů</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nových tento měsíc</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Označeno</p>
              <p className="text-2xl font-bold text-gray-900">{selectedEmails.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Seznam odběratelů</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedEmails.length === subscribers.length && subscribers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
                Vybrat vše
              </label>
              {selectedEmails.length > 0 && (
                <button className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm">
                  <Trash2 className="w-4 h-4" />
                  Smazat vybrané ({selectedEmails.length})
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Výběr
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  E-mail
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum přihlášení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zdroj
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(subscriber.email)}
                      onChange={() => handleSelectEmail(subscriber.email)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formatDate(subscriber.subscribedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      subscriber.source === 'web' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {subscriber.source === 'web' ? 'Webová stránka' : subscriber.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleUnsubscribe(subscriber.email)}
                      className="text-red-600 hover:text-red-900 mr-3"
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
            <p className="text-sm text-gray-400 mt-1">
              Odběratelé se zobrazí po přihlášení k odběru na hlavní stránce
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
