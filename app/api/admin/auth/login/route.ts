import { type NextRequest, NextResponse } from "next/server";
import { createSession, comparePasswords } from "@/lib/auth-utils-new";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    // Vyhledání uživatele podle emailu v modelu User
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Ověření, že uživatel existuje
    if (!user) {
      return NextResponse.json({ message: "Nesprávný email nebo heslo." }, { status: 401 });
    }

    // Porovnání hesla s hashem uloženým v databázi
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Nesprávný email nebo heslo." }, { status: 401 });
    }

    // Vytvoření session, které interně nastaví cookie
    const userId = user.id;
    const role = "admin"; // V Prisma schématu role není, proto používáme výchozí "admin"
    
    const token = await createSession(userId, email, role);

    return NextResponse.json({ 
      success: true,
      message: "Login successful",
      token: token, // Přidán token do odpovědi
      user: {
        userId: userId,
        email: email,
        role: role,
        displayName: email === "pavel@example.com" ? "Pavel Fišer" : "Administrátor"
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Při přihlašování došlo k chybě." }, { status: 500 });
  }
}
