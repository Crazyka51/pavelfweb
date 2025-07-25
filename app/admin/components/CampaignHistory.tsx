"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, EyeIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getNewsletterCampaigns, type NewsletterCampaign } from "@/lib/services/newsletter-service"

export function CampaignHistory() {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getNewsletterCampaigns()
        setCampaigns(data)
      } catch (err: any) {
        console.error("Error fetching campaigns:", err)
        setError(err.message || "Nepodařilo se načíst historii kampaní.")
        toast({
          title: "Chyba",
          description: err.message || "Nepodařilo se načíst historii kampaní.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchCampaigns()
  }, [toast])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-2">Načítám historii kampaní...</p>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Zatím nebyly odeslány žádné kampaně.</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Předmět</TableHead>
            <TableHead>Odesláno</TableHead>
            <TableHead>Příjemci</TableHead>
            <TableHead>Otevření (%)</TableHead>
            <TableHead>Kliknutí (%)</TableHead>
            <TableHead>Stav</TableHead>
            <TableHead className="text-right">Akce</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell className="font-medium">{campaign.subject}</TableCell>
              <TableCell>{formatDate(campaign.sent_at)}</TableCell>
              <TableCell>{campaign.recipient_count}</TableCell>
              <TableCell>{campaign.open_count}%</TableCell>
              <TableCell>{campaign.click_count}%</TableCell>
              <TableCell>
                <Badge variant={campaign.status === "sent" ? "default" : "secondary"}>{campaign.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <EyeIcon className="h-4 w-4 text-gray-500" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
