// testAuth.mjs - jednoduchý testovací skript pro autentizaci
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000';

async function main() {
  try {
    // 1. Přihlášení
    console.log('Přihlašuji uživatele...');
    const loginResponse = await fetch(`${baseUrl}/api/admin/auth/v2/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'Pavel', 
        password: '1T:V%uuYemJ'
      }),
    });
    
    const loginData = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    console.log('Login response:', loginData);
    
    if (!loginData.success || !loginData.token) {
      console.log('Přihlášení selhalo, končím test');
      return;
    }
    
    const token = loginData.token;
    console.log('Token získán:', token.substring(0, 15) + '...');
    
    // 2. Získání seznamu článků
    console.log('\nZískávám seznam článků...');
    const articlesResponse = await fetch(`${baseUrl}/api/admin/articles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    console.log('Articles status:', articlesResponse.status);
    const articlesData = await articlesResponse.json();
    console.log('Articles response:', articlesData);
    
  } catch (error) {
    console.error('Chyba během testu:', error);
  }
}

main();
