// testLoginFlow.mjs - podrobný testovací skript pro autentizaci
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
    console.log('Token získán:', token);
    console.log('Token délka:', token.length);
    
    // 2. Ověření tokenu
    console.log('\nOvěřuji token...');
    const verifyResponse = await fetch(`${baseUrl}/api/admin/auth/v2/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    
    console.log('Verify status:', verifyResponse.status);
    const verifyData = await verifyResponse.json();
    console.log('Verify response:', verifyData);
    
    // 3. Získání seznamu článků
    console.log('\nZískávám seznam článků...');
    
    // Vytisknout přesnou hlavičku, která se posílá
    const authHeader = `Bearer ${token}`;
    console.log('Auth header:', authHeader);
    console.log('Auth header délka:', authHeader.length);
    
    const articlesResponse = await fetch(`${baseUrl}/api/admin/articles`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader
      },
    });
    
    console.log('Articles status:', articlesResponse.status);
    const articlesData = await articlesResponse.json();
    console.log('Articles response:', articlesData);
    
    // 4. Zkusíme alternativní formáty hlavičky
    console.log('\nTesty různých formátů Authorization hlavičky:');
    
    const testHeaders = [
      { name: 'Bez mezer', value: `Bearer${token}` },
      { name: 'Lowercase bearer', value: `bearer ${token}` },
      { name: 'Přeformátovaný token', value: `Bearer ${token.trim()}` }
    ];
    
    for (const test of testHeaders) {
      console.log(`\nTest: ${test.name}`);
      const testResponse = await fetch(`${baseUrl}/api/admin/articles`, {
        method: 'GET',
        headers: {
          'Authorization': test.value
        },
      });
      
      console.log('Status:', testResponse.status);
      const testData = await testResponse.json();
      console.log('Response:', testData);
    }
    
  } catch (error) {
    console.error('Chyba během testu:', error);
  }
}

// Spustit test
main();

main();
