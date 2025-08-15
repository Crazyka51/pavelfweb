import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"

export interface AuthUser {
  id: string
  username?: string  // Nepovinné pro User model
  email: string
  role: string
  source?: string    // Indikace zdroje (admin_users/User)
}

export interface JWTPayload {
  userId: string
  username?: string
  email: string
  role: string
  source?: string
  type: "access" | "refresh"
}

// Vytvoření access tokenu (15 minut)
export function createAccessToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      source: user.source,
      type: "access",
    } as JWTPayload,
    JWT_SECRET,
    { expiresIn: "15m" },
  )
}

// Vytvoření refresh tokenu (30 dní)
export function createRefreshToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      source: user.source,
      type: "refresh",
    } as JWTPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: "30d" },
  )
}

// Ověření access tokenu
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    if (decoded.type !== "access") {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

// Ověření refresh tokenu
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
    if (decoded.type !== "refresh") {
      return null
    }
    return decoded
  } catch (error) {
    return null
  }
}

// Hashování hesla
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Ověření hesla
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Autentizace uživatele podle emailu/username a hesla
export async function authenticateUser(emailOrUsername: string, password: string): Promise<AuthUser | null> {
  try {
    // Nejprve zkusíme najít uživatele v tabulce admin_users
    try {
      const result = await prisma.$queryRaw`
        SELECT id, username, email, password_hash, role, is_active 
        FROM admin_users 
        WHERE username = ${emailOrUsername} OR email = ${emailOrUsername} 
        LIMIT 1
      `;
      
      const users = result as any[];
      if (users && users.length > 0) {
        const user = users[0];
        
        // Kontrola, zda je uživatel aktivní
        if (!user.is_active) {
          console.warn("Attempt to login with inactive admin account:", emailOrUsername);
          return null;
        }
        
        // V tabulce admin_users je heslo uloženo jako password_hash
        const isValidPassword = await verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
          return null;
        }

        // Aktualizace updated_at pomocí raw SQL
        await prisma.$executeRaw`
          UPDATE admin_users 
          SET updated_at = NOW(), last_login = NOW() 
          WHERE id = ${user.id}
        `;

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || "admin",
          source: "admin_users"
        }
      }
    } catch (error) {
      console.warn("Error querying admin_users table:", error);
      // Pokračujeme k dalšímu pokusu s User modelem
    }
    
    // Zkusíme najít uživatele v tabulce User (podle Prisma modelu)
    const user = await prisma.user.findFirst({
      where: {
        email: emailOrUsername,
      },
    });

    if (!user) {
      return null;
    }

    // Ověříme heslo
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Aktualizace času poslední aktivity
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      role: "user", // Výchozí role pro uživatele z User modelu
      source: "User"
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// Získání uživatele podle ID
export async function getUserById(userId: string): Promise<AuthUser | null> {
  try {
    // Nejprve zkusíme najít uživatele v tabulce admin_users
    try {
      const result = await prisma.$queryRaw`
        SELECT id, username, email, role, is_active 
        FROM admin_users 
        WHERE id = ${userId}
        LIMIT 1
      `;
      
      const users = result as any[];
      if (users && users.length > 0) {
        const user = users[0];
        
        // Kontrola, zda je uživatel aktivní
        if (!user.is_active) {
          return null;
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || "admin",
          source: "admin_users"
        }
      }
    } catch (error) {
      console.warn("Error querying admin_users table by ID:", error);
      // Pokračujeme k dalšímu pokusu s User modelem
    }
    
    // Zkusíme najít uživatele v tabulce User (podle Prisma modelu)
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: "user", // Výchozí role pro uživatele z User modelu
      source: "User"
    }
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

// Middleware pro ochranu API routes
export function requireAuth(handler: (request: NextRequest, auth: AuthUser) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = request.headers.get("authorization")
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
      }

      const token = authHeader.substring(7)
      const payload = verifyAccessToken(token)

      if (!payload) {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
      }

      const user = await getUserById(payload.userId)
      if (!user) {
        return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
      }

      return handler(request, user)
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }
  }
}

// Vytvoření kompletní session (oba tokeny)
export async function createSession(user: AuthUser) {
  const accessToken = createAccessToken(user)
  const refreshToken = createRefreshToken(user)

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      source: user.source,
    },
  }
}

// Obnovení session pomocí refresh tokenu
export async function refreshSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    return null
  }

  const user = await getUserById(payload.userId)
  if (!user) {
    return null
  }

  const newAccessToken = createAccessToken(user)

  return {
    accessToken: newAccessToken,
    user,
  }
}
