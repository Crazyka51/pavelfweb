// test-auth-utils.js
// Tento skript testuje login API, které využívá auth-utils.ts

const fetch = require('node-fetch');
const bcrypt = require('bcryptjs');

async function testAuthUtils() {
  console.log('===== TEST AUTENTIZAČNÍHO API =====\n');
  
  // Test hashování hesla
  const heslo = 'TestHeslo123!';
  console.log(`Generuji hash pro heslo: ${heslo}`);
  const hash = await bcrypt.hash(heslo, 12);
  console.log(`Hash hesla: ${hash.substring(0, 20)}...`);
  
  console.log('\n===== TEST AUTENTIZACE UŽIVATELŮ =====');
  
  // Pokus o přihlášení uživatele pavel
  await testUser('pavel', 'PavelHeslo123!');
  
  // Pokus o přihlášení uživatele e-mailem
  await testUser('pavel.fiser@example.com', 'PavelHeslo123!');
  
  // Pokus o přihlášení uživatele crazyk
  await testUser('crazyk', 'CrazykHeslo123!');
  
  // Pokus o přihlášení neplatného uživatele
  await testUser('neexistujici', 'NeplatneHeslo');
}

async function testUser(usernameOrEmail, password) {
  console.log(`\nTestuji přihlášení pro: ${usernameOrEmail}`);
  try {
    // Volání login API
    const start = Date.now();
    
    const response = await fetch('http://localhost:3000/api/admin/auth/v2/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: usernameOrEmail,
        password: password
      })
    });
    
    const duration = Date.now() - start;
    const data = await response.json();
    
    if (!data.success) {
      console.log(`❌ Autentizace selhala (${duration} ms): ${data.error || 'Neznámá chyba'}`);
      return;
    }
    
    // Přihlášení úspěšné
    console.log(`✅ Autentizace úspěšná (${duration} ms)`);
    console.log('Údaje o uživateli:');
    console.table({
      id: data.user.id,
      username: data.user.username || '(není k dispozici)',
      email: data.user.email,
      role: data.user.role,
      zdroj: data.user.source || 'neznámý'
    });
    
    console.log(`Access token: ${data.accessToken.substring(0, 25)}...`);
    
  } catch (error) {
    console.error(`❌ Chyba při testování uživatele ${usernameOrEmail}:`, error);
  }
}

// Spustit testy
async function main() {
  // Kontrola, zda běží server
  try {
    console.log('Kontroluji, zda běží server na http://localhost:3000...');
    const serverCheck = await fetch('http://localhost:3000/api/health', { 
      method: 'GET', 
      timeout: 3000 
    }).catch(() => null);
    
    if (!serverCheck) {
      console.log('⚠️  Server pravděpodobně neběží! Ujistěte se, že aplikace běží na http://localhost:3000.');
      console.log('   Spusťte aplikaci pomocí: pnpm dev');
      process.exit(1);
    }
    
    console.log('✅ Server běží, pokračuji s testy...\n');
    await testAuthUtils();
  } catch (error) {
    console.error('❌ Došlo k chybě při testování:', error);
  }
}

main();
