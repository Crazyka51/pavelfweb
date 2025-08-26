"use server"

import { sql } from "@/lib/neon-config"
import bcrypt from "bcryptjs"

export async function testDatabaseConnection() {
  try {
    const result = await sql`SELECT version()`
    return { success: true, message: "Databáze připojena", data: result }
  } catch (error) {
    return { success: false, message: "Chyba připojení", error: error.message }
  }
}

export async function getAdminUsers() {
  try {
    const users = await sql`
      SELECT id, username, email, role, is_active, created_at, last_login 
      FROM admin_users 
      ORDER BY created_at DESC
    `
    return { success: true, users }
  } catch (error) {
    return { success: false, message: "Chyba při načítání uživatelů", error: error.message }
  }
}

export async function setPavelPassword() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 12)

    const result = await sql`
      UPDATE admin_users 
      SET password_hash = ${hashedPassword}, updated_at = NOW()
      WHERE username = 'pavel'
      RETURNING id, username, email
    `

    return { success: true, message: "Heslo nastaveno", user: result[0] }
  } catch (error) {
    return { success: false, message: "Chyba při nastavování hesla", error: error.message }
  }
}

export async function testLogin(username: string, password: string) {
  try {
    const users = await sql`
      SELECT id, username, email, password_hash, role, is_active
      FROM admin_users 
      WHERE username = ${username} AND is_active = true
    `

    if (users.length === 0) {
      return { success: false, message: "Uživatel nenalezen" }
    }

    const user = users[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return { success: false, message: "Nesprávné heslo" }
    }

    return {
      success: true,
      message: "Přihlášení úspěšné",
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    }
  } catch (error) {
    return { success: false, message: "Chyba při přihlašování", error: error.message }
  }
}
