// Kompletní testovací skript pro autentizační systém
// Kontroluje celý autentizační flow včetně ukládání tokenů a následných API požadavků

import fetch from 'node-fetch';
import * as readline from 'readline';

// Pomocná funkce pro interaktivní vstup
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

// Globální proměnné
let accessToken = null;
const baseUrl = 'http://localhost:3000';

// 1. Funkce pro přihlášení
async function login(username, password) {
  console.log(`\n🔑 Přihlašování uživatele: ${username}`);
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/auth/v2/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response data:', data);
    
    if (data.success && data.token) {
      accessToken = data.token;
      console.log('✅ Přihlášení úspěšné!');
      console.log(`📝 Token: ${accessToken.substring(0, 15)}...`);
      return true;
    } else {
      console.log('❌ Přihlášení selhalo:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Chyba při přihlášení:', error.message);
    return false;
  }
}

// 2. Funkce pro ověření tokenu
async function verifyToken() {
  console.log('\n🔍 Ověřování platnosti tokenu');
  
  if (!accessToken) {
    console.log('❌ Žádný token není k dispozici');
    return false;
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/auth/v2/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response data:', data);
    
    if (data.success) {
      console.log('✅ Token je platný!');
      return true;
    } else {
      console.log('❌ Token je neplatný:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Chyba při ověřování tokenu:', error.message);
    return false;
  }
}

// 3. Funkce pro získání článků (jako příklad chráněné koncové body)
async function getArticles() {
  console.log('\n📚 Získávání seznamu článků');
  
  if (!accessToken) {
    console.log('❌ Žádný token není k dispozici');
    return false;
  }
  
  try {
    console.log('Používám token:', accessToken.substring(0, 15) + '...');
    
    const response = await fetch(`${baseUrl}/api/admin/articles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.status === 401) {
      console.log('❌ Neautorizovaný přístup (401). Token není platný nebo neexistuje.');
      const data = await response.json();
      console.log('Response data:', data);
      return false;
    }
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success) {
      console.log(`✅ Úspěšně získáno ${data.data.articles.length} článků!`);
      return true;
    } else {
      console.log('❌ Získání článků selhalo:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Chyba při získávání článků:', error.message);
    return false;
  }
}

// 4. Funkce pro obnovení tokenu
async function refreshToken() {
  console.log('\n🔄 Obnovování tokenu');
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/auth/v2/refresh`, {
      method: 'GET',
      credentials: 'include',
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response data:', data);
    
    if (data.success && data.token) {
      accessToken = data.token;
      console.log('✅ Token úspěšně obnoven!');
      console.log(`📝 Nový token: ${accessToken.substring(0, 15)}...`);
      return true;
    } else {
      console.log('❌ Obnovení tokenu selhalo:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Chyba při obnovování tokenu:', error.message);
    return false;
  }
}

// 5. Vytvoření hlavičky s tokeny v různých formátech pro analýzu
async function testDifferentAuthHeaders() {
  console.log('\n🧪 Testování různých formátů Authorization hlavičky');
  
  if (!accessToken) {
    console.log('❌ Žádný token není k dispozici');
    return;
  }
  
  const headers = [
    { name: 'Standard Bearer', value: `Bearer ${accessToken}` },
    { name: 'bez Bearer', value: accessToken },
    { name: 'Lowercase bearer', value: `bearer ${accessToken}` },
    { name: 'S mezerou navíc', value: `Bearer  ${accessToken}` },
  ];
  
  for (const header of headers) {
    console.log(`\nTestuji: ${header.name} (${header.value.substring(0, 15)}...)`);
    
    try {
      const response = await fetch(`${baseUrl}/api/admin/articles`, {
        method: 'GET',
        headers: {
          'Authorization': header.value
        },
      });
      
      console.log('Status:', response.status);
      const data = await response.json();
      console.log('Response data:', data.success ? 'Úspěšné' : 'Neúspěšné');
    } catch (error) {
      console.error(`❌ Chyba pro '${header.name}':`, error.message);
    }
  }
}

// 6. Funkce pro odhlášení
async function logout() {
  console.log('\n👋 Odhlašování');
  
  try {
    const response = await fetch(`${baseUrl}/api/admin/auth/v2/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    console.log('Response data:', data);
    
    accessToken = null;
    console.log('✅ Odhlášení proběhlo úspěšně!');
    return true;
  } catch (error) {
    console.error('❌ Chyba při odhlášení:', error.message);
    return false;
  }
}

// 7. Spuštění celého testu
async function runFullTest() {
  console.log('📝 KOMPLETNÍ TEST AUTENTIZAČNÍHO SYSTÉMU');
  console.log('======================================');
  
  const rl = createInterface();
  
  // 1. Přihlášení
  const username = await new Promise(resolve => {
    rl.question('Zadejte uživatelské jméno (výchozí: Pavel): ', answer => {
      resolve(answer || 'Pavel');
    });
  });
  
  const password = await new Promise(resolve => {
    rl.question('Zadejte heslo (výchozí: 1T:V%uuYemJ): ', answer => {
      resolve(answer || '1T:V%uuYemJ');
    });
  });
  
  // Provedení testů
  if (await login(username, password)) {
    // 2. Ověření tokenu
    await verifyToken();
    
    // 3. Získání článků
    await getArticles();
    
    // 4. Testování různých formátů hlaviček
    await testDifferentAuthHeaders();
    
    // 5. Odhlášení
    await logout();
  }
  
  rl.close();
  console.log('\n✨ Test dokončen!');
}

runFullTest().catch(error => {
  console.error('Neočekávaná chyba:', error);
  process.exit(1);
});
