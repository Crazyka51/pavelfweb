// testLogin.mjs - Skript pro testování přihlašování
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000';

// Funkce pro testování přihlašování
async function testLogin() {
  try {
    console.log('Testování přihlašování...');
    
    // 1. Přihlášení s platnými údaji
    console.log('1. Pokus o přihlášení s údaji: Pavel / 1T:V%uuYemJ');
    
    const loginResponse = await fetch(`${baseUrl}/api/admin/auth/v2/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'Pavel',
        password: '1T:V%uuYemJ'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log(`Status: ${loginResponse.status}`);
    console.log('Response:', JSON.stringify(loginData, null, 2));
    
    // 2. Pokud přihlášení proběhlo úspěšně, testujeme API volání
    if (loginResponse.ok && loginData.token) {
      console.log('\n2. Testování API volání s autorizačním tokenem');
      
      const articlesResponse = await fetch(`${baseUrl}/api/admin/articles`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      const articlesData = await articlesResponse.json();
      console.log(`Status: ${articlesResponse.status}`);
      console.log('Přístup k API:', articlesResponse.ok ? 'ÚSPĚŠNÝ' : 'SELHÁN');
      
      if (articlesResponse.ok) {
        console.log(`Počet článků: ${articlesData.data?.articles?.length || 0}`);
      } else {
        console.log('Chyba:', articlesData);
      }
    }
    
    console.log('\nTest dokončen');
    
  } catch (error) {
    console.error('Chyba při testování:', error);
  }
}

// Spustit test
testLogin();
