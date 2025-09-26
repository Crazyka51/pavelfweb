import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin')
  const pathname = request.nextUrl.pathname
  
  // Seznam povolených origins pro produkci
  const allowedOrigins = [
    'https://fiserpavel.cz',
    'https://www.fiserpavel.cz',
    'http://localhost:3000'
  ]

  // Pro preflight OPTIONS požadavky
  if (request.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const response = new NextResponse(null, { status: 200 })
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      response.headers.set('Vary', 'Origin')
    }
    
    return response
  }

  // Pro všechny API požadavky
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Nastavit CORS hlavičky pouze pro povolené origins
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
      response.headers.set('Vary', 'Origin')
    }
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}