import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Hlavní tajné klíče pro JWT tokeny
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "access_secret_key";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_key";

// Převedení na TextEncoder objekty pro JOSE knihovnu
const ACCESS_KEY = new TextEncoder().encode(ACCESS_TOKEN_SECRET);
const REFRESH_KEY = new TextEncoder().encode(REFRESH_TOKEN_SECRET);

// Expirace tokenů
const ACCESS_TOKEN_EXPIRATION = "15m"; // 15 minut
const REFRESH_TOKEN_EXPIRATION = "7d"; // 7 dní

export type UserPayload = {
  userId: string;
  username: string;
  role: string;
}

/**
 * Vytvoří access token pro uživatele
 * @param payload Data, která budou zakódována v tokenu
 * @returns Podepsaný JWT token
 */
export async function createAccessToken(payload: UserPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
    .sign(ACCESS_KEY);
}

/**
 * Vytvoří refresh token pro uživatele
 * @param payload Data, která budou zakódována v tokenu
 * @returns Podepsaný JWT token
 */
export async function createRefreshToken(payload: UserPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
    .sign(REFRESH_KEY);
}

/**
 * Dekóduje a ověří access token
 * @param token JWT token k ověření
 * @returns Dekódovaný payload nebo null
 */
export async function verifyAccessToken(token: string | undefined = "") {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, ACCESS_KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Failed to verify access token:", error);
    return null;
  }
}

/**
 * Dekóduje a ověří refresh token
 * @param token JWT refresh token k ověření
 * @returns Dekódovaný payload nebo null
 */
export async function verifyRefreshToken(token: string | undefined = "") {
  try {
    if (!token) return null;
    const { payload } = await jwtVerify(token, REFRESH_KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Failed to verify refresh token:", error);
    return null;
  }
}

/**
 * Vytvoří novou session pro uživatele
 * @param userId ID uživatele
 * @param username Uživatelské jméno
 * @param role Role uživatele
 * @returns Object obsahující access token
 */
export async function createSession(userId: string, username: string, role: string) {
  const userPayload = { userId, username, role };
  
  // Vytvoření access a refresh tokenů
  const accessToken = await createAccessToken(userPayload);
  const refreshToken = await createRefreshToken(userPayload);
  
  // Nastavení refresh tokenu jako HTTP-only cookie
  const refreshExpires = new Date();
  refreshExpires.setDate(refreshExpires.getDate() + 7); // 7 dní
  
  // Použití cookies() API asynchronně
  const cookieStore = await cookies();
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: refreshExpires,
    sameSite: "strict",
    path: "/",
  });
  
  // Access token je vracen klientovi
  return { accessToken };
}

/**
 * Obnoví session pomocí refresh tokenu
 * @returns Nový access token nebo null
 */
export async function refreshSession() {
  try {
    // Použití cookies() API asynchronně
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;
    
    if (!refreshToken) return null;
    
    // Ověření refresh tokenu
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) return null;
    
    // Vytvoření nového access tokenu
    const userPayload = {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as string,
    };
    
    const accessToken = await createAccessToken(userPayload);
    return { accessToken, user: userPayload };
  } catch (error) {
    console.error("Failed to refresh session:", error);
    return null;
  }
}

/**
 * Odstraní session (logout)
 */
export async function deleteSession() {
  // Použití cookies() API asynchronně
  const cookieStore = await cookies();
  cookieStore.delete("refresh_token");
}

/**
 * Ověří autentizaci uživatele z NextRequest objektu
 * @param request NextRequest objekt
 * @returns Dekódovaný payload nebo NextResponse s chybou
 */
export async function verifyAuth(request: NextRequest) {
  // Získání access tokenu z Authorization hlavičky
  const authHeader = request.headers.get("Authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
  
  if (accessToken) {
    const payload = await verifyAccessToken(accessToken);
    if (payload) return payload;
  }
  
  // Pokud access token není nebo je neplatný, zkusíme refresh token
  const refreshResult = await refreshSession();
  
  if (refreshResult) {
    // Toto je speciální případ - vracíme NextResponse s novým access tokenem
    return NextResponse.json({ 
      message: "Access token expired, but refreshed successfully",
      accessToken: refreshResult.accessToken 
    }, { 
      status: 401,
      headers: { "X-Refresh-Token": "true" }
    });
  }
  
  // Žádný validní token nebyl nalezen
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

/**
 * Autentizuje požadavek, kontroluje jestli je uživatel admin
 * @param request NextRequest objekt
 * @returns Null pokud autentizace selže, nebo UserPayload objekt pokud je úspěšná
 */
export async function authenticateAdmin(request: NextRequest): Promise<UserPayload | null> {
  // Nejdříve zkusíme získat access token z hlavičky
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7); // Odstranit 'Bearer ' prefix
    const payload = await verifyAccessToken(token);
    
    if (payload && payload.role === 'admin') {
      return {
        userId: payload.userId as string,
        username: payload.username as string,
        role: payload.role as string,
      };
    }
  }
  
  // Pokud access token není nebo je neplatný, zkusíme refresh token
  const refreshResult = await refreshSession();
  if (refreshResult && refreshResult.user.role === 'admin') {
    return refreshResult.user;
  }
  
  return null;
}

/**
 * Middleware pro ověření autentizace a rolí
 * @param handler Funkce handleru
 * @param roles Pole povolených rolí
 * @returns Wrapper funkce
 */
export function requireAuth(handler: Function, roles?: string[]) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse | any> => {
    const authResult = await verifyAuth(request);

    // Pokud je výsledek NextResponse, mohlo dojít k refresh tokenu
    if (authResult instanceof NextResponse) {
      // Kontrolujeme, zda došlo k úspěšnému refresh tokenu
      const refreshHeader = authResult.headers.get("X-Refresh-Token");
      if (refreshHeader === "true") {
        const data = await authResult.json();
        
        // Upravíme request a přidáme nový access token do hlavičky
        const newAuthHeader = `Bearer ${data.accessToken}`;
        const newHeaders = new Headers(request.headers);
        newHeaders.set("Authorization", newAuthHeader);
        
        // Vytvoříme nový request s aktualizovanou hlavičkou
        const newRequest = new NextRequest(request.url, {
          method: request.method,
          headers: newHeaders,
          body: request.body
        });
        
        // Rekurzivně voláme requireAuth s novým requestem
        return requireAuth(handler, roles)(newRequest, ...args);
      }
      
      return authResult; // Unauthorized response
    }

    // Kontrola rolí, pokud jsou definovány
    if (roles && !roles.includes(authResult.role as string)) {
      return NextResponse.json({ message: "Forbidden: Insufficient role" }, { status: 403 });
    }

    // Vše je v pořádku, voláme handler
    return handler(request, authResult, ...args);
  };
}
