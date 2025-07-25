import type { FacebookPost } from "@/lib/types"

const FACEBOOK_PAGE_ID = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN

export class FacebookService {
  private apiUrl = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/posts`

  async getFacebookPosts(limit = 5): Promise<FacebookPost[]> {
    if (!FACEBOOK_PAGE_ID || !FACEBOOK_ACCESS_TOKEN) {
      console.warn("Facebook API credentials not set. Returning mock data.")
      return this.getMockFacebookPosts(limit)
    }

    try {
      const response = await fetch(
        `${this.apiUrl}?fields=id,message,created_time,full_picture,permalink_url&access_token=${FACEBOOK_ACCESS_TOKEN}&limit=${limit}`,
        {
          next: { revalidate: 3600 }, // Revalidate every hour
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Facebook API error:", errorData)
        throw new Error(`Failed to fetch Facebook posts: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return data.data.map((post: any) => ({
        id: post.id,
        message: post.message || "",
        created_time: post.created_time,
        full_picture: post.full_picture,
        permalink_url: post.permalink_url,
      }))
    } catch (error) {
      console.error("Error fetching Facebook posts:", error)
      return this.getMockFacebookPosts(limit) // Fallback to mock data on error
    }
  }

  private getMockFacebookPosts(limit: number): FacebookPost[] {
    const mockPosts: FacebookPost[] = [
      {
        id: "mock1",
        message: "Mock Facebook post 1: Exciting news coming soon!",
        created_time: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        full_picture: "/placeholder.svg?height=400&width=600",
        permalink_url: "#",
      },
      {
        id: "mock2",
        message: "Mock Facebook post 2: Check out our latest blog article!",
        created_time: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        full_picture: "/placeholder.svg?height=400&width=600",
        permalink_url: "#",
      },
      {
        id: "mock3",
        message: "Mock Facebook post 3: We're hiring! Join our team.",
        created_time: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        full_picture: "/placeholder.svg?height=400&width=600",
        permalink_url: "#",
      },
    ]
    return mockPosts.slice(0, limit)
  }
}

export const facebookService = new FacebookService()
