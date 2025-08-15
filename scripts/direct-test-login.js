// direct-test-login.js
const fetch = require('node-fetch');

async function testLogin(username, password) {
  console.log(`Testování přihlášení s: username=${username}, password=${password}`);
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/auth/v2/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: username,
        password: password
      })
    });

    const statusCode = response.status;
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { error: 'Nelze parsovat odpověď jako JSON' };
    }

    console.log('Status kód:', statusCode);
    console.log('Odpověď:', JSON.stringify(responseData, null, 2));
    
    return { statusCode, responseData };
  } catch (error) {
    console.error('Chyba při volání API:', error);
    return { error: error.message };
  }
}

async function main() {
  console.log('=== Test přihlášení ===');
  
  // Test s uživatelským jménem "pavel"
  await testLogin('pavel', 'PavelHeslo123!');
  
  console.log('\n=== Test přihlášení 2 ===');
  
  // Test s emailem
  await testLogin('pavel.fiser@praha4.cz', 'PavelHeslo123!');

  console.log('\n=== Test přihlášení 3 ===');
  
  // Test s dalším uživatelem
  await testLogin('crazyk', 'CrazykHeslo123!');
}

main().catch(console.error);
