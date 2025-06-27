import { NextRequest, NextResponse } from 'next/server'

// Proxy endpoint pro získání článků z CMS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '3'
    
    // Zavolej CMS API
    const cmsResponse = await fetch(`http://localhost:3002/api/public/articles?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!cmsResponse.ok) {
      throw new Error('CMS API nedostupné')
    }
    
    const data = await cmsResponse.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching articles from CMS:', error)
    
    // Fallback mock data
    const mockData = {
      articles: [
        {
          id: '1',
          title: 'Nová cyklostezka v Praze 4',
          excerpt: 'Dokončili jsme další úsek cyklostezky, který propojuje centrum s okrajovými částmi městské části.',
          content: '',
          category: 'Doprava',
          tags: ['doprava', 'cyklostezka', 'investice'],
          published: true,
          createdAt: '2025-06-20T10:00:00Z',
          updatedAt: '2025-06-20T10:00:00Z',
          imageUrl: '/placeholder.jpg'
        },
        {
          id: '2',
          title: 'Revitalizace parku Kamýk',
          excerpt: 'Zahájili jsme rozsáhlou revitalizaci parku Kamýk, která přinese nové prvky pro odpočinek i sport.',
          content: '',
          category: 'Životní prostředí',
          tags: ['park', 'revitalizace', 'životní prostředí'],
          published: true,
          createdAt: '2025-06-18T14:30:00Z',
          updatedAt: '2025-06-18T14:30:00Z',
          imageUrl: '/placeholder.jpg'
        }
      ],
      total: 2,
      hasMore: false
    }
    
    return NextResponse.json(mockData)
  }
}
