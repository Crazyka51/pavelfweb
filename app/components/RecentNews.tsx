"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ArrowRight, Eye, Clock } from "lucide-react"

interface Article {
  id: number
  title: string
  excerpt: string
  content: string
  category: string
  published_at: string
  image_url?: string
  slug: string
  views?: number
}

export default function RecentNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data pro případ, že API nefunguje
  const mockArticles: Article[] = [
    {
      id: 1,
      title: "Nové dětské hřiště na Pankráci je hotové",
      excerpt:
        "Po měsících příprav a stavebních prací je konečně dokončena rekonstrukce dětského hřiště na Pankráci. Investice ve výši 2,5 milionu korun přinesla moderní herní prvky a bezpečný prostor pro děti.",
      content: "",
      category: "Investice",
      published_at: "2024-01-15T10:00:00Z",
      image_url: "/placeholder.svg",
      slug: "nove-detske-hriste-pankrac",
      views: 245,
    },
    {
      id: 2,
      title: "Rozšíření cyklostezek mezi Pankrácí a Michle",
      excerpt:
        "Představujeme plány na propojení stávajících cyklostezek, které zlepší bezpečnost a pohodlí cyklistů. Projekt za 4,2 milionu korun začne v listopadu.",
      content: "",
      category: "Doprava",
      published_at: "2024-01-12T14:30:00Z",
      image_url: "/placeholder.svg",
      slug: "rozsireni-cyklostezek",
      views: 189,
    },
    {
      id: 3,
      title: "Konzultační hodiny v lednu",
      excerpt:
        "Zvu vás na pravidelné konzultační hodiny, které se konají každý první čtvrtek v měsíci. Přijďte s vašimi podněty a nápady pro zlepšení naší městské části.",
      content: "",
      category: "Oznámení",
      published_at: "2024-01-08T09:00:00Z",
      image_url: "/placeholder.svg",
      slug: "konzultacni-hodiny-leden",
      views: 156,
    },
    {
      id: 4,
      title: "Úspěšné spuštění projektu třídění odpadu",
      excerpt:
        "Pilotní projekt chytrého třídění odpadu překonal všechna očekávání. Občané třídí o 40% více odpadu než před spuštěním projektu.",
      content: "",
      category: "Životní prostředí",
      published_at: "2024-01-05T16:15:00Z",
      image_url: "/placeholder.svg",
      slug: "projekt-trideni-odpadu",
      views: 203,
    },
  ]

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch("/api/admin/public/articles?limit=4")
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles || mockArticles)
        } else {
          setArticles(mockArticles)
        }
      } catch (error) {
        console.error("Error fetching articles:", error)
        setArticles(mockArticles)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const getCategoryColor = (category: string) => {
    const colors = {
      Investice: "bg-blue-100 text-blue-800",
      Doprava: "bg-green-100 text-green-800",
      Oznámení: "bg-purple-100 text-purple-800",
      "Životní prostředí": "bg-emerald-100 text-emerald-800",
      Kultura: "bg-pink-100 text-pink-800",
      Bezpečnost: "bg-red-100 text-red-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Včera"
    if (diffDays < 7) return `Před ${diffDays} dny`

    return date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Načítání aktualit...</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <Clock className="w-4 h-4 mr-2" />
              Nejnovější aktuality
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Co se <span className="text-blue-600">děje nového</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Sledujte nejnovější informace o mé práci, dokončených projektech a plánovaných aktivitách
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {articles.slice(0, 4).map((article, index) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={article.image_url || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <Badge className={getCategoryColor(article.category)}>{article.category}</Badge>
                  </div>
                  {article.views && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {article.views}
                    </div>
                  )}
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(article.published_at)}
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight hover:text-blue-600 transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-600 leading-relaxed mb-4">{truncateText(article.excerpt, 150)}</p>

                  <Button variant="outline" className="w-full group bg-transparent">
                    Číst celý článek
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Card className="bg-blue-50 border-blue-200 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Chcete být v obraze?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Přihlaste se k odběru novinek a buďte první, kdo se dozví o nových projektech, dokončených investicích
                  a důležitých událostech v naší městské části.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Všechny aktuality
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Odběr novinek
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
