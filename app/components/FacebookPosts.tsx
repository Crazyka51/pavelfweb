"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { FacebookIcon } from "lucide-react"
import { getFacebookPosts, type FacebookPost } from "@/lib/services/facebook-service"

export function FacebookPosts() {
  const [posts, setPosts] = useState<FacebookPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      setError(null)
      try {
        const { posts: fetchedPosts, isMockData, message } = await getFacebookPosts(3)
        setPosts(fetchedPosts)
        if (isMockData) {
          console.warn("Using mock Facebook data:", message)
        }
      } catch (err: any) {
        console.error("Error fetching Facebook posts:", err)
        setError(err.message || "Nepodařilo se načíst Facebook příspěvky.")
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  if (loading) {
    return (
      <section id="facebook-posts" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Naše Facebook příspěvky</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Načítání nejnovějších příspěvků z Facebooku...
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-1">
                  <Skeleton className="h-20 w-full mb-4" />
                  <Skeleton className="h-48 w-full rounded-md" />
                </CardContent>
                <div className="p-6 pt-0">
                  <Skeleton className="h-10 w-full" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="facebook-posts" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Chyba při načítání Facebook příspěvků</h2>
              <p className="max-w-[900px] text-red-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-red-400">
                {error}
              </p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Zkusit znovu
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="facebook-posts" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Naše Facebook příspěvky</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Sledujte nás na Facebooku a buďte v obraze.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="flex flex-col">
                {post.full_picture && (
                  <img
                    src={post.full_picture || "/placeholder.svg"}
                    alt="Facebook post image"
                    width={400}
                    height={225}
                    className="aspect-video object-cover rounded-t-lg"
                  />
                )}
                <CardHeader>
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {post.message || "Příspěvek z Facebooku"}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.created_time).toLocaleDateString("cs-CZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-4">{post.message}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <a href={post.permalink_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full bg-transparent">
                      Zobrazit na Facebooku
                      <FacebookIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 dark:text-gray-400">Žádné příspěvky k zobrazení.</p>
          )}
        </div>
        {posts.length > 0 && (
          <div className="flex justify-center mt-8">
            <a
              href={`https://www.facebook.com/${process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>Zobrazit celou stránku na Facebooku</Button>
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
