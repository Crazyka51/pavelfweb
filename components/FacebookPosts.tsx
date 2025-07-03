"use client"

import { useState, useEffect } from "react"
import { ExternalLink, Heart, MessageCircle, Share2, AlertCircle, Info } from "lucide-react"

interface FacebookPost {
  id: string
  message: string
  created_time: string
  likes: { summary: { total_count: number } }
  comments: { summary: { total_count: number } }
  shares: { count: number }
  permalink_url: string
  full_picture?: string
}

interface FacebookResponse {
  data: FacebookPost[]
  isMockData: boolean
  message: string
}

export default function FacebookPosts() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)
  const [apiMessage, setApiMessage] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/facebook-posts")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: FacebookResponse = await response.json()

      setPosts(result.data || [])
      setIsMockData(result.isMockData)
      setApiMessage(result.message)
    } catch (err) {
      console.error("Error fetching Facebook posts:", err)
      setError("Nepodařilo se načíst Facebook příspěvky")

      // Fallback mock data
      setPosts([
        {
          id: "fallback-1",
          message: "Ukázkový příspěvek - systém momentálně nemůže načíst reálná data z Facebooku.",
          created_time: new Date().toISOString(),
          likes: { summary: { total_count: 0 } },
          comments: { summary: { total_count: 0 } },
          shares: { count: 0 },
          permalink_url: "#",
        },
      ])
      setIsMockData(true)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Aktuality z Facebooku</h2>
            <div className="animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Aktuality z Facebooku</h2>
          <p className="text-xl text-gray-600">Sledujte nejnovější informace a aktuality</p>

          {/* Status indikátor */}
          {isMockData && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-800">{apiMessage}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Upozornění</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              {post.full_picture && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={post.full_picture || "/placeholder.svg"}
                    alt="Facebook post"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}

              <div className="p-6">
                <p className="text-gray-800 mb-4 leading-relaxed">{post.message}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <time dateTime={post.created_time}>{formatDate(post.created_time)}</time>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes?.summary?.total_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.summary?.total_count || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-4 h-4" />
                      <span>{post.shares?.count || 0}</span>
                    </div>
                  </div>

                  {post.permalink_url && post.permalink_url !== "#" && (
                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>Zobrazit</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Žádné příspěvky k zobrazení</p>
          </div>
        )}
      </div>
    </section>
  )
}
