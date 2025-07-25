"use client"

import { useState, useEffect } from "react"
import { Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CampaignEditor } from "./CampaignEditor"
import { CampaignHistory } from "./CampaignHistory"
import { TemplateManager } from "./TemplateManager"
import { MailIcon, UsersIcon, HistoryIcon, FileTextIcon } from "lucide-react"
import { getNewsletterSubscribers, type NewsletterSubscriber } from "@/lib/services/newsletter-service"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

export function NewsletterManager() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    "subscribers" | "campaigns" | "create" | "new-campaign" | "campaign-history" | "templates"
  >("new-campaign")
  const { toast } = useToast()

  useEffect(() => {
    loadSubscribers()
  }, [])

  const loadSubscribers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getNewsletterSubscribers()
      setSubscribers(data)
    } catch (err: any) {
      console.error("Error loading subscribers:", err)
      setError(err.message || "Nepodařilo se načíst odběratele.")
      toast({
        title: "Chyba",
        description: err.message || "Nepodařilo se načíst odběratele.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCampaignSaveSuccess = () => {
    setActiveTab("campaign-history") // Switch to history after saving a campaign
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

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-campaign">
            <MailIcon className="mr-2 h-4 w-4" /> Nová kampaň
          </TabsTrigger>
          <TabsTrigger value="campaign-history">
            <HistoryIcon className="mr-2 h-4 w-4" /> Historie kampaní
          </TabsTrigger>
          <TabsTrigger value="subscribers">
            <UsersIcon className="mr-2 h-4 w-4" /> Odběratelé
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileTextIcon className="mr-2 h-4 w-4" /> Šablony
          </TabsTrigger>
        </TabsList>
        <TabsContent value="new-campaign">
          <Card>
            <CardHeader>
              <CardTitle>Vytvořit novou kampaň</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignEditor onSaveSuccess={handleCampaignSaveSuccess} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="campaign-history">
          <Card>
            <CardHeader>
              <CardTitle>Historie odeslaných kampaní</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignHistory />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Správa odběratelů</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
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
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{subscriber.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(subscriber.subscribed_at).toLocaleDateString("cs-CZ")}
                          </td>
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
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Implement unsubscribe logic here
                                  toast({
                                    title: "Odhlášení",
                                    description: `Odhlášení ${subscriber.email} (simulováno)`,
                                  })
                                }}
                              >
                                Odhlásit
                              </Button>
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
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Správa šablon newsletteru</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplateManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
