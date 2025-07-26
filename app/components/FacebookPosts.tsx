"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Facebook, ExternalLink, Heart, MessageCircle, Calendar } from "lucide-react"

interface FacebookPost {
  id: string
  message: string
  created_time: string
  permalink_url?: string
  attachments?: {
    data: Array<{
      media?: {
        image?: {
          src: string
        }
      }
      title?: string
      description?: string
    }>
  }
  reactions?: {
    summary: {
      total_count: number
    }
  }
  comments?: {
    summary: {
      total_count: number
    }
  }
}

export default function FacebookPosts() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fallback mock data pro případ, že API nefunguje
  const mockPosts: FacebookPost[] = [
    {
      id: "1",
      message:
        "Dnes jsem se zúčastnil zasedání dopravní komise, kde jsme projednávali nové cyklostezky v Praze 4. Těším se, že brzy budeme moci představit konkrétní plány! 🚴‍♂️ #Praha4 #Cyklostezky #Doprava",
      created_time: "2024-01-15T10:30:00Z",
      permalink_url: "https://facebook.com/example",
      reactions: { summary: { total_count: 24 } },
      comments: { summary: { total_count: 8 } },
    },
    {
      id: "2",
      message:
        "Skvělá návštěva nového komunitního centra na Pankráci! Děkuji všem dobrovolníkům za jejich úžasnou práci. Místa jako toto dělají z naší čtvrti skutečnou komunitu. ❤️ #KomunitníCentrum #Pankrác #Dobrovolníci",
      created_time: "2024-01-12T14:15:00Z",
      permalink_url: "https://facebook.com/example",
      reactions: { summary: { total_count: 42 } },
      comments: { summary: { total_count: 15 } },
    },
    {
      id: "3",
      message:
        "Konzultační hodiny tento čtvrtek 17-19h v komunitním centru. Přijďte s vašimi podněty a nápady! Společně můžeme udělat Prahu 4 ještě lepším místem pro život. 🏛️ #KonzultačníHodiny #Praha4 #Zastupitel",
      created_time: "2024-01-10T09:00:00Z",
      permalink_url: "https://facebook.com/example",
      reactions: { summary: { total_count: 18 } },
      comments: { summary: { total_count: 5 } },
    },
  ]

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/facebook-posts")
        if (response.ok) {
          const data = await response.json()
          setPosts(data.posts || mockPosts)
        } else {
          // Použijeme mock data pokud API nefunguje
          setPosts(mockPosts)
        }
      } catch (err) {
        console.error("Error fetching Facebook posts:", err)
        // Použijeme mock data při chybě
        setPosts(mockPosts)
        setError("Nepodařilo se načíst příspěvky z Facebooku")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const truncateMessage = (message: string, maxLength = 200) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Aktuality z Facebooku</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Facebook className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">Aktuality z Facebooku</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sledujte moje nejnovější příspěvky a aktuality z práce zastupitele
            </p>
            {error && (
              <Badge variant="outline" className="mt-2 text-orange-600 border-orange-200">
                {error}
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.slice(0, 6).map((post) => (
              <Card key={post.id} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Pavel Fišer</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(post.created_time)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-4 leading-relaxed">{truncateMessage(post.message)}</p>

                  {post.attachments?.data?.[0]?.media?.image && (
                    <div className="mb-4">
                      <img
                        src={post.attachments.data[0].media.image.src || "/placeholder.svg"}
                        alt="Facebook post attachment"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {post.reactions?.summary.total_count || 0}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {post.comments?.summary.total_count || 0}
                      </span>
                    </div>
                  </div>

                  {post.permalink_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => window.open(post.permalink_url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Zobrazit na Facebooku
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Card className="bg-blue-50 border-blue-200 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <Facebook className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Sledujte mě na Facebooku</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Pro nejnovější aktuality a možnost diskuze mě sledujte na mé oficiální Facebook stránce
                </p>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open("https://facebook.com/pavel.fiser.praha4", "_blank")}
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Sledovat na Facebooku
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
