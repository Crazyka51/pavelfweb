// Client-side auth utilities that don't use next/headers

export async function signIn(username: string, password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    })

    const data = await response.json()

    if (response.ok) {
      return { success: true }
    } else {
      return { 
        success: false, 
        message: data.message || 'Přihlášení selhalo' 
      }
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return { 
      success: false, 
      message: 'Chyba při připojování k serveru' 
    }
  }
}