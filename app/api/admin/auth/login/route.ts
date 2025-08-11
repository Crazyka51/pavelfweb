import { type NextRequest, NextResponse } from "next/server";
import { createSession, comparePasswords } from "@/lib/auth-utils-new";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    // Vyhledání uživatele podle username v tabulce admin_users (která neodpovídá přímo Prisma modelu)
    const user = await prisma.$queryRaw`
      SELECT id, username, password_hash as password, role 
      FROM admin_users 
      WHERE username = ${username} AND is_active = true
    `;

    // Ověření, že uživatel existuje
    if (!user || !Array.isArray(user) || user.length === 0) {
      return NextResponse.json({ message: "Nesprávné uživatelské jméno nebo heslo." }, { status: 401 });
    }

    // Porovnání hesla s hashem uloženým v databázi
    const isPasswordValid = await comparePasswords(password, user[0].password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Nesprávné uživatelské jméno nebo heslo." }, { status: 401 });
    }

    // Vytvoření session, které interně nastaví cookie
    const userId = user[0].id;
    const role = user[0].role || "admin";
    
    await createSession(userId, username, role);

    return NextResponse.json({ 
      success: true,
      message: "Login successful",
      user: {
        userId: userId,
        username: username,
        role: role,
        displayName: username === "pavel" ? "Pavel Fišer" : "Administrátor"
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Při přihlašování došlo k chybě." }, { status: 500 });
  }
}
