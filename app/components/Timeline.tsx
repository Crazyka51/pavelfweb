"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle } from "lucide-react"

export default function Timeline() {
  const timelineEvents = [
    {
      date: "Říjen 2024",
      title: "Schválení rekonstrukce dětského hřiště",
      description: "Prosadil jsem rekonstrukci dětského hřiště na Pankráci za 2,5 mil. Kč",
      status: "completed",
      category: "Investice",
    },
    {
      date: "Září 2024",
      title: "Nová pravidla pro parkování rezidentů",
      description: "Podařilo se zjednodušit proces získání rezidentních karet",
      status: "completed",
      category: "Doprava",
    },
    {
      date: "Srpen 2024",
      title: "Spuštění projektu třídění odpadu",
      description: "Inicioval jsem pilotní projekt chytrého třídění odpadu",
      status: "completed",
      category: "Životní prostředí",
    },
    {
      date: "Červenec 2024",
      title: "Podpora místních kulturních akcí",
      description: "Zajistil jsem dotace pro 5 místních kulturních organizací",
      status: "completed",
      category: "Kultura",
    },
    {
      date: "Červen 2024",
      title: "Zlepšení MHD spojení",
      description: "Vyjednal jsem posílení autobusových linek v ranních hodinách",
      status: "completed",
      category: "Doprava",
    },
    {
      date: "Listopad 2024",
      title: "Nové cyklostezky",
      description: "Připravuji projekt propojení cyklostezek mezi Pankrácí a Michle",
      status: "in-progress",
      category: "Doprava",
    },
    {
      date: "Prosinec 2024",
      title: "Modernizace veřejného osvětlení",
      description: "Plánuji výměnu osvětlení za LED technologie",
      status: "planned",
      category: "Investice",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "planned":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Dokončeno"
      case "in-progress":
        return "Probíhá"
      case "planned":
        return "Plánováno"
      default:
        return "Neznámý"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Doprava":
        return "bg-blue-500"
      case "Životní prostředí":
        return "bg-green-500"
      case "Kultura":
        return "bg-purple-500"
      case "Investice":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Moje činnost v zastupitelstvu</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Přehled klíčových projektů a iniciativ, které jsem prosadil nebo na kterých aktuálně pracuji
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <div key={index} className="relative flex items-start space-x-6">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white border-4 border-gray-200 rounded-full">
                    {event.status === "completed" ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Calendar className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {event.date}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Badge variant="outline" className={getStatusColor(event.status)}>
                              {getStatusText(event.status)}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <div className={`w-3 h-3 rounded-full ${getCategoryColor(event.category)}`}></div>
                              <span className="text-xs text-gray-600">{event.category}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{event.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Máte nápad na zlepšení?</h3>
                <p className="text-gray-700 mb-4">
                  Pokud máte návrh na projekt nebo zlepšení v naší městské části, neváhejte se na mě obrátit. Společně
                  můžeme udělat Prahu 4 lepším místem pro život.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-600">
                  <span>📧 pavel.fiser@praha4.cz</span>
                  <span>📱 +420 123 456 789</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
