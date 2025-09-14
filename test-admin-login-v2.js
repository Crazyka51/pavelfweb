// test-admin-login-v2.js

// Otestování přihlášení do administrace - postup 1: fetch API
async function testLoginWithFetch() {
  console.log('Testuji přihlášení do administrace pomocí Fetch API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/auth/v2/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'PavelFiseradmin',
        password: '1T:V%uuYemJ'
      })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Odpověď:', data);
    
    if (data.success) {
      console.log('✅ Přihlášení úspěšné!');
    } else {
      console.log('❌ Přihlášení selhalo:', data.message);
    }
  } catch (error) {
    console.error('Chyba při přihlášení:', error);
  }
}

// Spuštění testu
testLoginWithFetch();
