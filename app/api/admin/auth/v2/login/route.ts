import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyAccessToken } from "@/lib/auth-utils-v2";
import { compare } from "bcryptjs";
// Použijeme relativní cestu místo alias
import prisma from '../../../../../../lib/prisma-client';

/**
 * API endpoint pro přihlášení uživatele
 * 
 * POST /api/admin/auth/v2/login
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Uživatelské jméno a heslo jsou povinné" }, 
        { status: 400 }
      );
    }
    
    // Vyhledání uživatele v databázi podle emailu (jako username)
    const user = await prisma.user.findUnique({
      where: { email: username }
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Nesprávné uživatelské jméno nebo heslo" }, 
        { status: 401 }
      );
    }
    
    // Porovnání hesla
    const isValid = await compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Nesprávné uživatelské jméno nebo heslo" }, 
        { status: 401 }
      );
    }
    
    // Vytvoření tokenů - používáme email jako username a výchozí roli "admin"
    const { accessToken } = await createSession(
      user.id,
      user.email, // Používáme email jako username
      "admin" // Výchozí role, protože v modelu User není role
    );
    
    // Navrácení access tokenu a základních informací o uživateli
    return NextResponse.json({
      success: true,
      message: "Přihlášení proběhlo úspěšně",
      token: accessToken,
      user: {
        id: user.id,
        username: user.email, // Používáme email jako username
        displayName: user.name || user.email, // Používáme name jako displayName, fallback na email
        email: user.email, // Přidáme i email pro úplnost
        role: "admin" // Výchozí role
      }
    });
    
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Chyba serveru: " + error.message }, 
      { status: 500 }
    );
  }
}
