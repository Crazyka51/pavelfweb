import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Zjistí JWT_SECRET z .env souboru
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Připraví klíč pro JWT operace
const KEY = new TextEncoder().encode(SECRET_KEY);

// Typ pro data uživatele z JWT tokenu
export type UserPayload = {
  userId: string;
  username: string;
  role: string;
};

/**
 * Zašifruje data pomocí JWT
 * @param payload Data k zašifrování
 * @returns JWT token
 */
export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // Token vyprší za 2 hodiny
    .sign(KEY);
}

/**
 * Dešifruje JWT token
 * @param session JWT token
 * @returns Dešifrovaná data nebo null při chybě
 */
export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, KEY, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Failed to decrypt session:", error);
    return null;
  }
}

/**
 * Vytvoří novou session (přihlášení)
 * @param userId ID uživatele
 * @param username Uživatelské jméno
 * @param role Role uživatele (např. admin, editor)
 */
export async function createSession(userId: string, username: string, role: string) {
  // Vytvoří data pro token včetně expirace
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hodiny
  const session = await encrypt({ userId, username, role, expiresAt: expiresAt.toISOString() });

  // Nastaví cookie s tokenem - použití Next.js 15 async cookies API
  const cookieJar = await cookies();
  cookieJar.set({
    name: "session",
    value: session,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  return session; // Vrací token pro případné další použití
}

/**
 * Odstraní session (odhlášení)
 */
export async function deleteSession() {
  const cookieJar = await cookies();
  cookieJar.delete("session");
}

/**
 * Získá informace o přihlášeném uživateli z cookies
 * Pro použití ve server komponentách a server akcích
 * @returns Informace o uživateli nebo null pokud není přihlášen
 */
export async function getAuthUser(): Promise<UserPayload | null> {
  const cookieJar = await cookies();
  const sessionCookie = cookieJar.get("session");
  const session = sessionCookie?.value;
  
  if (!session) return null;
  
  const decrypted = await decrypt(session);
  if (!decrypted) return null;
  
  // Kontrola expirace
  if (decrypted.expiresAt && new Date(decrypted.expiresAt as string) < new Date()) {
    return null;
  }
  
  return {
    userId: decrypted.userId as string,
    username: decrypted.username as string,
    role: decrypted.role as string,
  };
}

/**
 * Ověří autentizaci z requestu
 * @param request NextRequest objekt
 * @returns Objekt s daty uživatele nebo NextResponse s chybou
 */
export async function verifyAuth(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decrypted = await decrypt(session);
  if (!decrypted) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Kontrola expirace
  if (decrypted.expiresAt && new Date(decrypted.expiresAt as string) < new Date()) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 });
  }

  return decrypted;
}

/**
 * Higher-order function pro ochranu API routy pomocí autentizace.
 * 
 * @param handler Funkce handleru, která bude volána, když je uživatel autorizován
 * @param roles Nepovinné pole rolí, které jsou oprávněné přistupovat k resourci
 * @returns Funkci, která nejprve ověří autentizaci a pak volá handler
 */
export function requireAuth(handler: Function, roles?: string[]) {
  return async (request: NextRequest, ...args: any[]) => {
    const authResult = await verifyAuth(request);

    if (authResult instanceof NextResponse) {
      return authResult; // Unauthorized response z verifyAuth
    }

    if (roles && !roles.includes(authResult.role as string)) {
      return NextResponse.json({ message: "Forbidden: Insufficient role" }, { status: 403 });
    }

    // Předáváme informace o uživateli do handleru jako druhý parametr
    return handler(request, authResult, ...args);
  };
}

/**
 * Pro server komponenty/akce - získání informací o uživateli
 * @returns Informace o uživateli nebo null pokud není přihlášen
 */
export async function verifySession(): Promise<UserPayload | null> {
  const cookieJar = await cookies();
  const sessionCookie = cookieJar.get("session");
  const token = sessionCookie?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = await decrypt(token);
    
    if (!payload || typeof payload.username !== "string") {
      return null;
    }
    
    // Kontrola expirace
    if (payload.expiresAt && new Date(payload.expiresAt as string) < new Date()) {
      return null;
    }
    
    return {
      userId: payload.userId as string,
      username: payload.username as string, 
      role: payload.role as string
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}
