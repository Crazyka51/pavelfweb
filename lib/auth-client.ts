// Client-side auth utilities that don't use server-only functions like cookies()

export async function signIn(username: string, password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (response.ok) {
      return { success: true }
    } else {
      const data = await response.json()
      return { success: false, message: data.message || "Přihlášení selhalo" }
    }
  } catch (error) {
    console.error("Client signIn error:", error)
    return { success: false, message: "Chyba při přihlášení" }
  }
}

export async function signOut(): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch("/api/admin/auth/logout", {
      method: "POST",
    })

    if (response.ok) {
      return { success: true }
    } else {
      const data = await response.json()
      return { success: false, message: data.message || "Odhlášení selhalo" }
    }
  } catch (error) {
    console.error("Client signOut error:", error)
    return { success: false, message: "Chyba při odhlášení" }
  }
}