// Tento skript otestuje přihlašovací API pro admin uživatele
const fetch = require('node-fetch');

async function testLogin(username, password) {
  console.log(`Testuji přihlášení pro uživatele: ${username}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/auth/v2/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emailOrUsername: username,
        password: password
      })
    });
    
    const data = await response.json();
    
    console.log('Status kód:', response.status);
    console.log('Odpověď API:', data);
    
    if (data.success) {
      console.log('✅ Přihlášení úspěšné!');
      console.log('Access Token:', data.accessToken.substring(0, 20) + '...');
      console.log('Uživatel:', data.user);
    } else {
      console.log('❌ Přihlášení selhalo:', data.error);
    }
  } catch (error) {
    console.error('Chyba při volání API:', error);
  }
}

// Test pro oba uživatele
async function runTests() {
  console.log('===== TEST PŘIHLÁŠENÍ ADMIN UŽIVATELŮ =====');
  
  // Testujeme přihlášení uživatele Pavel
  await testLogin('pavel', 'PavelHeslo123!');
  console.log('\n');
  
  // Testujeme přihlášení uživatele Crazyk
  await testLogin('crazyk', 'CrazykHeslo123!');
  console.log('\n');
  
  // Testujeme neplatné přihlášení
  await testLogin('neexistujici', 'NeplatneHeslo123!');
}

// Spusť testy
runTests();
