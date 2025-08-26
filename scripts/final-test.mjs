// Finální testovací skript pro autentizaci a přístup k admin rozhraní
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000';

// Funkce pro uložení tokenu do formátu, který lze použít v Cookies hlavičce
function saveCookieFromToken(token) {
  return `adminToken=${token}; path=/; samesite=strict; httponly=true`;
}

async function main() {
  try {
    console.log('🔍 KOMPLEXNÍ TEST AUTENTIZACE');
    console.log('==============================');
    
    // 1. Přihlášení
    console.log('\n1. Přihlášení uživatele');
    const loginResponse = await fetch(`${baseUrl}/api/admin/auth/v2/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'Pavel', 
        password: '1T:V%uuYemJ'
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Status:', loginResponse.status);
    console.log('Odpověď:', loginData.success ? 'Úspěšné přihlášení' : 'Neúspěšné přihlášení');
    
    if (!loginData.success || !loginData.token) {
      console.log('❌ Přihlášení selhalo, končím test');
      return;
    }
    
    const token = loginData.token;
    console.log('✅ Token získán');
    
    // 2. Přístup k API - články
    console.log('\n2. Získání seznamu článků (API)');
    const articlesResponse = await fetch(`${baseUrl}/api/admin/articles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    const articlesData = await articlesResponse.json();
    console.log('Status:', articlesResponse.status);
    console.log('Odpověď:', articlesData.success ? `Úspěšné získání ${articlesData.data?.articles?.length || 0} článků` : 'Neúspěšné získání článků');
    
    // 3. Přístup k admin rozhraní
    console.log('\n3. Přístup k admin rozhraní');
    const adminResponse = await fetch(`${baseUrl}/admin`, {
      method: 'GET',
      headers: {
        'Cookie': saveCookieFromToken(token)
      },
    });
    
    console.log('Status:', adminResponse.status);
    console.log('Přístup:', adminResponse.status === 200 ? '✅ Úspěšný' : '❌ Neúspěšný');
    
    // 4. Ověření přihlášení na klientské straně
    console.log('\n4. Ověření přihlášení na klientské straně');
    const checkAuthResponse = await fetch(`${baseUrl}/api/admin/auth/v2/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    const checkAuthData = await checkAuthResponse.json();
    console.log('Status:', checkAuthResponse.status);
    console.log('Odpověď:', checkAuthData.success ? '✅ Uživatel je přihlášen' : '❌ Uživatel není přihlášen');
    
    console.log('\n✅ TEST DOKONČEN ÚSPĚŠNĚ');
  } catch (error) {
    console.error('\n❌ TEST SELHAL:', error);
  }
}

main();
