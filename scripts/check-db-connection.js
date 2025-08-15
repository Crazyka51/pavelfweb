const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Testování připojení k databázi
    console.log('Zkouším připojení k databázi...');
    await prisma.$connect();
    console.log('Připojení k databázi úspěšné!');

    // Kontrola existence tabulky admin_users
    console.log('\nKontrola existence tabulky admin_users:');
    try {
      const result = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admin_users'
        );
      `;
      
      const exists = result[0].exists;
      
      if (exists) {
        console.log('✅ Tabulka admin_users existuje.');
        
        // Pokud tabulka existuje, zjistíme počet záznamů
        const countResult = await prisma.$queryRaw`SELECT COUNT(*) FROM admin_users;`;
        const count = Number(countResult[0].count);
        
        console.log(`   - Počet uživatelů v tabulce: ${count}`);
        
        if (count > 0) {
          // Vypiseme první uživatele (bez hesla)
          const users = await prisma.$queryRaw`
            SELECT id, username, email, role, is_active, created_at, updated_at, last_login
            FROM admin_users
            ORDER BY created_at DESC
            LIMIT 5;
          `;
          
          console.log('\nPosledních 5 uživatelů:');
          console.table(users);
        }
      } else {
        console.log('❌ Tabulka admin_users neexistuje!');
        console.log('Je potřeba vytvořit tabulku pomocí skriptu create-admin-users-table.sql');
      }
    } catch (err) {
      console.log('❌ Chyba při kontrole tabulky admin_users:', err.message);
    }

    // Kontrola Prisma modelů
    console.log('\nKontrola Prisma modelů:');
    try {
      const user = await prisma.user.findFirst();
      console.log('✅ Model User je správně nakonfigurován.');
      console.log(`   - ${user ? 'Nalezen alespoň jeden uživatel.' : 'Žádný uživatel nebyl nalezen.'}`);
    } catch (err) {
      console.log('❌ Chyba při přístupu k modelu User:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Chyba připojení k databázi:', err);
  } finally {
    await prisma.$disconnect();
    console.log('\nTest dokončen.');
  }
}

testConnection();
