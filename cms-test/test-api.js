#!/usr/bin/env node

/**
 * Test script pro ověření funkcionality CMS API
 * Spusťte: node test-api.js
 */

const baseUrl = 'http://localhost:3001'

async function testAPI() {
  console.log('🧪 Testování Pavel Fišer CMS API...\n')

  // Test 1: Veřejné API - všechny články
  console.log('📋 Test 1: Načítání všech publikovaných článků')
  try {
    const response = await fetch(`${baseUrl}/api/public/articles`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Úspěch!')
      console.log(`   Nalezeno ${data.total} článků`)
      console.log(`   První článek: "${data.articles[0]?.title || 'Žádný'}"`)
    } else {
      console.log('❌ Chyba:', data.message)
    }
  } catch (error) {
    console.log('❌ Chyba připojení:', error.message)
  }

  console.log()

  // Test 2: Filtrování podle kategorie
  console.log('🏷️  Test 2: Filtrování podle kategorie "Doprava"')
  try {
    const response = await fetch(`${baseUrl}/api/public/articles?category=Doprava`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Úspěch!')
      console.log(`   Články v kategorii Doprava: ${data.total}`)
    } else {
      console.log('❌ Chyba:', data.message)
    }
  } catch (error) {
    console.log('❌ Chyba připojení:', error.message)
  }

  console.log()

  // Test 3: Limit článků
  console.log('🔢 Test 3: Omezení na 2 články')
  try {
    const response = await fetch(`${baseUrl}/api/public/articles?limit=2`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Úspěch!')
      console.log(`   Vráceno ${data.articles.length} článků (mělo by být max 2)`)
    } else {
      console.log('❌ Chyba:', data.message)
    }
  } catch (error) {
    console.log('❌ Chyba připojení:', error.message)
  }

  console.log()

  // Test 4: Přihlášení (test auth API)
  console.log('🔐 Test 4: Přihlášení do administrace')
  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'pavel',
        password: 'test123'
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Úspěch!')
      console.log(`   Uživatel: ${data.user.username}`)
      console.log(`   Role: ${data.user.role}`)
      console.log(`   Token získán: ${data.token ? 'Ano' : 'Ne'}`)
      
      // Test 5: Ověření tokenu
      console.log()
      console.log('🔍 Test 5: Ověření platnosti tokenu')
      
      const verifyResponse = await fetch(`${baseUrl}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      })
      
      const verifyData = await verifyResponse.json()
      
      if (verifyResponse.ok && verifyData.valid) {
        console.log('✅ Token je platný!')
        
        // Test 6: Admin API - načtení článků
        console.log()
        console.log('📝 Test 6: Admin API - načtení všech článků')
        
        const adminResponse = await fetch(`${baseUrl}/api/articles`, {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        })
        
        if (adminResponse.ok) {
          const adminData = await adminResponse.json()
          console.log('✅ Admin API funguje!')
          console.log(`   Celkem článků (včetně konceptů): ${adminData.length}`)
        } else {
          console.log('❌ Admin API nefunguje')
        }
        
      } else {
        console.log('❌ Token není platný')
      }
      
    } else {
      console.log('❌ Chyba přihlášení:', data.message)
    }
  } catch (error) {
    console.log('❌ Chyba připojení:', error.message)
  }

  console.log('\n🎯 Test dokončen!')
  console.log('\n📋 Shrnutí:')
  console.log('   - Veřejné API: /api/public/articles')
  console.log('   - Admin přihlášení: pavel / test123')
  console.log('   - CMS interface: http://localhost:3001')
  console.log('\n✨ CMS je připraven k použití!')
}

// Spustit testy pouze pokud je tento soubor spuštěn přímo
if (require.main === module) {
  testAPI().catch(console.error)
}

module.exports = { testAPI }
