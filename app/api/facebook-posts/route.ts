import { NextResponse } from "next/server"
import crypto from 'crypto';

// Funkce pro generování appsecret_proof pro zabezpečení FB API požadavků
function generateAppSecretProof(accessToken: string, appSecret: string): string {
  return crypto
    .createHmac('sha256', appSecret)
    .update(accessToken)
    .digest('hex');
}

// Mock data pro Facebook příspěvky (jako fallback)
const mockFacebookPosts = [
  {
    id: "1",
    message: "Nová cyklostezka na Praze 4 je hotová! 🚴‍♂️ Děkuji všem občanům za trpělivost během výstavby. Více info na https://www.praha4.cz",
    created_time: "2025-07-01T10:30:00Z",
    likes: { summary: { total_count: 45 } },
    comments: { summary: { total_count: 12 } },
    shares: { count: 8 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/1",
    full_picture: "https://www.praha4.cz/image/x700_y400/cyklostezka-podolske-nabrezi.jpg",
  },
  {
    id: "2",
    message: "Setkání s občany ohledně rekonstrukce náměstí Míru proběhlo úspěšně. Vaše připomínky budou zapracovány do projektu. #Praha4 #NamestíMíru",
    created_time: "2025-06-28T14:20:00Z",
    likes: { summary: { total_count: 32 } },
    comments: { summary: { total_count: 8 } },
    shares: { count: 5 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/2",
    full_picture: "https://www.praha4.cz/image/x700_y400/namesti-miru-rekonstrukce.jpg",
  },
  {
    id: "3",
    message: "Nové kontejnery na tříděný odpad byly instalovány v lokalitě Pankrác. Děkuji za vaše podněty! ♻️ #udržitelnost #Praha4",
    created_time: "2025-06-25T09:15:00Z",
    likes: { summary: { total_count: 28 } },
    comments: { summary: { total_count: 6 } },
    shares: { count: 3 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/3",
    full_picture: "https://www.praha4.cz/image/x700_y400/trideny-odpad-kontejnery.jpg",
  },
  {
    id: "4", 
    message: "Dokončujeme rekonstrukci dětského hřiště U Kublova. Nové herní prvky a bezpečný povrch budou hotové do konce týdne! 👶🏻🎪",
    created_time: "2025-06-22T16:45:00Z",
    likes: { summary: { total_count: 56 } },
    comments: { summary: { total_count: 14 } },
    shares: { count: 12 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/4",
    full_picture: "https://www.praha4.cz/image/x700_y400/hriste-kublova-rekonstrukce.jpg",
  },
  {
    id: "5",
    message: "Pozvánka na veřejné setkání k tématu budoucnosti dopravy v naší městské části. Úterý 9.7. v 18:00 v kulturním centru. 🚊🚗",
    created_time: "2025-06-20T11:30:00Z", 
    likes: { summary: { total_count: 41 } },
    comments: { summary: { total_count: 9 } },
    shares: { count: 7 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/5",
    full_picture: "https://www.praha4.cz/image/x700_y400/doprava-budoucnost-setkani.jpg",
  },
  {
    id: "6",
    message: "Týden životního prostředí v Praze 4 začíná! Přijďte se podívat na ukázky moderních technologií pro čistší město. 🌱🌍",
    created_time: "2025-06-18T08:00:00Z",
    likes: { summary: { total_count: 38 } },
    comments: { summary: { total_count: 11 } },
    shares: { count: 6 },
    permalink_url: "https://facebook.com/pavel.fiser/posts/6", 
    full_picture: "https://www.praha4.cz/image/x700_y400/zivotni-prostredi-tyden.jpg",
  }
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
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    
    // Vytvoření appsecret_proof pro zabezpečení požadavku
    const appSecretProof = appSecret ? generateAppSecretProof(accessToken, appSecret) : '';
    
    // Přidání appsecret_proof do URL požadavku pro větší zabezpečení
    const response = await fetch(
      `https://graph.facebook.com/v23.0/${pageId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares,permalink_url,full_picture&access_token=${accessToken}&appsecret_proof=${appSecretProof}&limit=10`,
      { next: { revalidate: 300 } }, // Cache na 5 minut
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Failed to parse error response' } }));
      console.error("Facebook API chyba:", JSON.stringify(errorData, null, 2));
      console.log("Používám mock data jako fallback");
      
      return NextResponse.json({
        data: mockFacebookPosts,
        isMockData: true,
        message: `Zobrazují se ukázková data - problém s Facebook API: ${errorData?.error?.message || response.status}`,
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
