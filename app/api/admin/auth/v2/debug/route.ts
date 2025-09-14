import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Diagnostický endpoint pro ověření nastavení cookie a hlaviček
 */
export async function GET(request: Request) {
  // Získáme všechny cookies
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Zjistíme, jestli existuje refresh_token cookie
  const refreshToken = cookieStore.get('refresh_token');
  
  // Získáme hlavičky
  const headers = Object.fromEntries(
    [...request.headers.entries()]
      // Filtrujeme citlivé hlavičky
      .filter(([key]) => !['cookie', 'authorization'].includes(key.toLowerCase()))
  );
  
  return NextResponse.json({
    success: true,
    data: {
      cookies: {
        count: allCookies.length,
        names: allCookies.map(cookie => cookie.name),
        hasRefreshToken: !!refreshToken,
      },
      headers,
      // Informace o doméně
      domain: {
        host: request.headers.get('host'),
        origin: request.headers.get('origin'),
      }
    }
  });
}