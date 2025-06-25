"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, ExternalLink, MessageCircle, Heart, Share2, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FacebookPost {
  id: string
  message?: string
  story?: string
  created_time: string
  permalink_url?: string
  full_picture?: string
  type?: string
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
  shares?: {
    count: number
  }
}

interface FacebookPostsProps {
  maxPosts?: number
}

export default function FacebookPosts({ 
  maxPosts = 6 
}: FacebookPostsProps) {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Použití našeho API endpoint
        const url = `/api/facebook-posts?limit=${maxPosts}`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`API chyba: ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        setPosts(data.data || [])
      } catch (err) {
        console.error("Chyba při načítání Facebook příspěvků:", err)
        setError("Nepodařilo se načíst příspěvky z Facebooku")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [maxPosts])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const getPostTypeIcon = (type?: string) => {
    switch (type) {
      case "photo":
        return "📸"
      case "video":
        return "🎥"
      case "link":
        return "🔗"
      default:
        return "📝"
    }
  }

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Načítám příspěvky z Facebooku...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Aktuality z Facebooku</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sledujte mé nejnovější aktivity a postřehy ze zastupitelstva
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
              <p className="text-red-600">{error}</p>
            </div>
          </motion.div>
        )}

        {posts.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-gray-600">Žádné příspěvky k zobrazení</p>
          </motion.div>
        )}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="card-light hover-lift h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {getPostTypeIcon(post.type)} {post.type || "příspěvek"}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.created_time)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  {post.full_picture && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={post.full_picture}
                        alt="Facebook post"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    {post.message && (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {truncateText(post.message)}
                      </p>
                    )}
                    
                    {post.story && !post.message && (
                      <p className="text-gray-600 mb-4 italic">
                        {truncateText(post.story)}
                      </p>
                    )}
                  </div>

                  {/* Statistiky příspěvku */}
                  <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {post.reactions?.summary.total_count && (
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.reactions.summary.total_count}
                        </div>
                      )}
                      {post.comments?.summary.total_count && (
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments.summary.total_count}
                        </div>
                      )}
                      {post.shares?.count && (
                        <div className="flex items-center">
                          <Share2 className="h-4 w-4 mr-1" />
                          {post.shares.count}
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={post.permalink_url || `https://facebook.com/61574874071299`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Zobrazit na Facebooku
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Button
            variant="outline"
            size="lg"
            asChild
            className="apple-button"
          >
            <a
              href={`https://facebook.com/61574874071299`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              Sledovat na Facebooku
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
