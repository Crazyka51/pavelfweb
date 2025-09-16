import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Získat origin z požadavku
  const origin = request.headers.get('origin')
  
  // Seznam povolených origins pro produkci
  const allowedOrigins = [
    'https://fiserpavel.cz',
    'https://www.fiserpavel.cz',
    'http://localhost:3000'
  ]

  // Pokud je to API požadavek
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Nastavit CORS hlavičky
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}