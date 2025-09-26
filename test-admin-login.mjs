const testAdminLogin = async () => {
  console.log('Testuji přihlášení do administrace...');

  try {
    const response = await fetch('http://localhost:3000/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'PavelFiseradmin',
        password: '1T:V%uuYemJ'
      }),
      redirect: 'follow',
    });

    const data = await response.json();
    console.log('Status kód odpovědi:', response.status);
    console.log('Odpověď serveru:', data);
    
    if (response.ok) {
      console.log('Přihlášení bylo úspěšné!');
      // Vypiš cookies, které přišly v odpovědi
      console.log('Cookies:', response.headers.get('set-cookie'));
    } else {
      console.log('Přihlášení selhalo.');
    }
  } catch (error) {
    console.error('Došlo k chybě při přihlášení:', error);
  }
}

testAdminLogin();
