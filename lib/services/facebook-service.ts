export interface FacebookPost {
  id: string
  message?: string
  full_picture?: string
  created_time: string
  permalink_url: string
}

export interface FacebookPostsResponse {
  posts: FacebookPost[]
  isMockData: boolean
  message?: string
}

export async function getFacebookPosts(limit = 5): Promise<FacebookPostsResponse> {
  const pageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN

  if (!pageId || !accessToken) {
    console.warn("Facebook credentials not configured, using mock data")
    return {
      posts: getMockFacebookPosts(limit),
      isMockData: true,
      message: "Facebook credentials not configured",
    }
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,full_picture,created_time,permalink_url&limit=${limit}&access_token=${accessToken}`,
    )

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      posts: data.data || [],
      isMockData: false,
    }
  } catch (error) {
    console.error("Error fetching Facebook posts:", error)
    return {
      posts: getMockFacebookPosts(limit),
      isMockData: true,
      message: `Facebook API error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

function getMockFacebookPosts(limit: number): FacebookPost[] {
  const mockPosts: FacebookPost[] = [
    {
      id: "mock_1",
      message: "Nový článek na našem blogu! Zjistěte, jak optimalizovat vaše webové stránky pro vyhledávače.",
      full_picture: "/placeholder.svg?height=400&width=600&text=SEO+Tips",
      created_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      permalink_url: "https://facebook.com/mock_post_1",
    },
    {
      id: "mock_2",
      message: "Děkujeme všem klientům za důvěru! Právě jsme dokončili další úspěšný projekt e-commerce platformy.",
      full_picture: "/placeholder.svg?height=400&width=600&text=E-commerce+Success",
      created_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      permalink_url: "https://facebook.com/mock_post_2",
    },
    {
      id: "mock_3",
      message:
        "Tip týdne: Používejte kvalitní obrázky na vašich webových stránkách. Vizuální obsah zvyšuje engagement o 80%!",
      full_picture: "/placeholder.svg?height=400&width=600&text=Visual+Content",
      created_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      permalink_url: "https://facebook.com/mock_post_3",
    },
  ]

  return mockPosts.slice(0, limit)
}

export async function getFacebookPostsAsArticles(limit = 3): Promise<
  {
    id: string
    title: string
    content: string
    excerpt: string
    imageUrl?: string
    publishedAt: string
  }[]
> {
  const { posts } = await getFacebookPosts(limit)

  return posts.map((post) => ({
    id: `fb_${post.id}`,
    title: post.message?.substring(0, 100) + "..." || "Facebook příspěvek",
    content: post.message || "",
    excerpt: post.message?.substring(0, 200) + "..." || "",
    imageUrl: post.full_picture,
    publishedAt: post.created_time,
  }))
}
