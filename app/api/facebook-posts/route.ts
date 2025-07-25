import { type NextRequest, NextResponse } from "next/server"
import { getFacebookPosts } from "@/lib/services/facebook-service"

// Mock data pro Facebook příspěvky (jako fallback)
const mockFacebookPosts = [
  {
    id: "1",
    message:
      "Nová cyklostezka na Praze 4 je hotová! 🚴‍♂️ Děkuji všem občanům za trpělivost během výstavby. Více info na https://www.praha4.cz",
    created_time: "2025-07-01T10:30:00Z",
    likes: { summary: { total_count: 45 } },
    comments: { summary: { total_count: 12 } },
    shares: { count: 8 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/1",
    full_picture: "https://www.praha4.cz/image/x700_y400/cyklostezka-podolske-nabrezi.jpg",
  },
  {
    id: "2",
    message:
      "Setkání s občany ohledně rekonstrukce náměstí Míru proběhlo úspěšně. Vaše připomínky budou zapracovány do projektu. #Praha4 #NamestíMíru",
    created_time: "2025-06-28T14:20:00Z",
    likes: { summary: { total_count: 32 } },
    comments: { summary: { total_count: 8 } },
    shares: { count: 5 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/2",
    full_picture: "https://www.praha4.cz/image/x700_y400/namesti-miru-rekonstrukce.jpg",
  },
  {
    id: "3",
    message:
      "Nové kontejnery na tříděný odpad byly instalovány v lokalitě Pankrác. Děkuji za vaše podněty! ♻️ #udržitelnost #Praha4",
    created_time: "2025-06-25T09:15:00Z",
    likes: { summary: { total_count: 28 } },
    comments: { summary: { total_count: 6 } },
    shares: { count: 3 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/3",
    full_picture: "https://www.praha4.cz/image/x700_y400/trideny-odpad-kontejnery.jpg",
  },
  {
    id: "4",
    message:
      "Dokončujeme rekonstrukci dětského hřiště U Kublova. Nové herní prvky a bezpečný povrch budou hotové do konce týdne! 👶🏻🎪",
    created_time: "2025-06-22T16:45:00Z",
    likes: { summary: { total_count: 56 } },
    comments: { summary: { total_count: 14 } },
    shares: { count: 12 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/4",
    full_picture: "https://www.praha4.cz/image/x700_y400/hriste-kublova-rekonstrukce.jpg",
  },
  {
    id: "5",
    message:
      "Pozvánka na veřejné setkání k tématu budoucnosti dopravy v naší městské části. Úterý 9.7. v 18:00 v kulturním centru. 🚊🚗",
    created_time: "2025-06-20T11:30:00Z",
    likes: { summary: { total_count: 41 } },
    comments: { summary: { total_count: 9 } },
    shares: { count: 7 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/5",
    full_picture: "https://www.praha4.cz/image/x700_y400/doprava-budoucnost-setkani.jpg",
  },
  {
    id: "6",
    message:
      "Týden životního prostředí v Praze 4 začíná! Přijďte se podívat na ukázky moderních technologií pro čistší město. 🌱🌍",
    created_time: "2025-06-18T08:00:00Z",
    likes: { summary: { total_count: 38 } },
    comments: { summary: { total_count: 11 } },
    shares: { count: 6 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/6",
    full_picture: "https://www.praha4.cz/image/x700_y400/zivotni-prostredi-tyden.jpg",
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "3")

  try {
    const { posts, isMockData, message } = await getFacebookPosts(limit)
    return NextResponse.json({ data: posts, isMockData, message })
  } catch (error) {
    console.error("Error fetching Facebook posts:", error)
    return NextResponse.json({ message: "Failed to fetch Facebook posts" }, { status: 500 })
  }
}
