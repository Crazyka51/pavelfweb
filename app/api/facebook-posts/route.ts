import { NextResponse } from "next/server"

// Mock data pro Facebook příspěvky
const mockFacebookPosts = [
  {
    id: "1",
    message: "Nová cyklostezka na Praze 4 je hotová! 🚴‍♂️ Děkuji všem občanům za trpělivost během výstavby.",
    created_time: "2024-01-15T10:30:00Z",
    likes: { summary: { total_count: 45 } },
    comments: { summary: { total_count: 12 } },
    shares: { count: 8 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/1",
    full_picture: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "2",
    message:
      "Setkání s občany ohledně rekonstrukce náměstí Míru proběhlo úspěšně. Vaše připomínky budou zapracovány do projektu.",
    created_time: "2024-01-12T14:20:00Z",
    likes: { summary: { total_count: 32 } },
    comments: { summary: { total_count: 8 } },
    shares: { count: 5 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/2",
    full_picture: "/placeholder.svg?height=300&width=500",
  },
  {
    id: "3",
    message: "Nové kontejnery na tříděný odpad byly instalovány v lokalitě Pankrác. Děkuji za vaše podněty! ♻️",
    created_time: "2024-01-10T09:15:00Z",
    likes: { summary: { total_count: 28 } },
    comments: { summary: { total_count: 6 } },
    shares: { count: 3 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/3",
    full_picture: "/placeholder.svg?height=350&width=550",
  },
]

export async function GET() {
  try {
    // Zkusíme načíst reálná data z Facebook API
    const pageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN

    if (!pageId || !accessToken) {
      console.log("Facebook API není nakonfigurováno, používám mock data")
      return NextResponse.json({
        data: mockFacebookPosts,
        isMockData: true,
        message: "Zobrazují se ukázková data - Facebook API není nakonfigurováno",
      })
    }

    // Pokus o načtení reálných dat
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares,permalink_url,full_picture&access_token=${accessToken}&limit=10`,
      { next: { revalidate: 300 } }, // Cache na 5 minut
    )

    if (!response.ok) {
      console.log("Facebook API chyba, používám mock data")
      return NextResponse.json({
        data: mockFacebookPosts,
        isMockData: true,
        message: "Zobrazují se ukázková data - problém s Facebook API",
      })
    }

    const data = await response.json()

    return NextResponse.json({
      data: data.data || mockFacebookPosts,
      isMockData: false,
      message: "Reálná data z Facebook",
    })
  } catch (error) {
    console.error("Facebook API error:", error)

    // Fallback na mock data
    return NextResponse.json({
      data: mockFacebookPosts,
      isMockData: true,
      message: "Zobrazují se ukázková data - chyba při načítání z Facebook",
    })
  }
}
