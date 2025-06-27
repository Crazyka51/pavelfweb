import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Force dynamic rendering pro API volání
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '6'
    const pageId = process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || '61574874071299'
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN
    const appSecret = process.env.FACEBOOK_APP_SECRET

    // Pokud je nastaveno používání mock dat nebo chybí access token
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !accessToken) {
      const mockPosts = [
        {
          id: "1",
          message: "Dnes jsem se zúčastnil jednání zastupitelstva MČ Praha 4. Projednávali jsme důležité otázky týkající se rozvoje naší čtvrti a zlepšení kvality života obyvatel.",
          created_time: new Date().toISOString(),
          permalink_url: "/61574874071299/posts/1",
          type: "status",
          reactions: { summary: { total_count: 15 } },
          comments: { summary: { total_count: 3 } }
        },
        {
          id: "2",
          message: "Nová hřiště pro děti v našem obvodu jsou téměř hotová! Už se těším, až si na nich děti budou moci hrát. Investice do dětských hřišť je investice do budoucnosti naší komunity.",
          created_time: new Date(Date.now() - 86400000).toISOString(),
          permalink_url: "/61574874071299/posts/2",
          type: "status",
          reactions: { summary: { total_count: 28 } },
          comments: { summary: { total_count: 7 } }
        },
        {
          id: "3",
          message: "Účastnil jsem se dnešního jednání o dopravě v Praze 4. Diskutovali jsme o nových cyklostezkách a zlepšení veřejné dopravy.",
          created_time: new Date(Date.now() - 172800000).toISOString(),
          permalink_url: "/61574874071299/posts/3",
          type: "status",
          reactions: { summary: { total_count: 12 } },
          comments: { summary: { total_count: 5 } }
        }
      ]

      return NextResponse.json({ 
        data: mockPosts.slice(0, parseInt(limit)),
        mock: true 
      })
    }

    // Generování app_secret_proof pro bezpečnost
    let appSecretProof = ''
    if (appSecret && accessToken) {
      appSecretProof = crypto
        .createHmac('sha256', appSecret)
        .update(accessToken)
        .digest('hex')
    }

    // Produkční API volání
    const fields = "id,message,story,created_time,permalink_url,full_picture,type,reactions.summary(total_count),comments.summary(total_count),shares"
    
    // Sestavení URL s app_secret_proof
    let url = `https://graph.facebook.com/v18.0/${pageId}/posts?fields=${fields}&access_token=${accessToken}&limit=${limit}`
    if (appSecretProof) {
      url += `&appsecret_proof=${appSecretProof}`
    }
    
    const response = await fetch(url, {
      next: { revalidate: 300 } // Cache na 5 minut
    })
    
    if (!response.ok) {
      throw new Error(`Facebook API chyba: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chyba při načítání Facebook příspěvků:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst příspěvky z Facebooku' },
      { status: 500 }
    )
  }
}
