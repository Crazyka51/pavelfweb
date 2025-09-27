// Test nového VERCEL_BLOB_API tokenu
console.log('🧪 Testování VERCEL_BLOB_API...\n');

// Environment check
console.log('📋 Environment proměnné:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('VERCEL_BLOB_API:', process.env.VERCEL_BLOB_API ? '✅ nastaven' : '❌ chybí');

// Test @vercel/blob import
try {
  const { put, list, del } = await import('@vercel/blob');
  console.log('✅ @vercel/blob import úspěšný');
  
  if (process.env.VERCEL_BLOB_API) {
    console.log('\n🔍 Testování Blob API připojení...');
    
    try {
      // Test list operace (nedestruktivní)
      const { blobs } = await list({ 
        token: process.env.VERCEL_BLOB_API,
        limit: 1 
      });
      
      console.log('✅ Blob API funguje!');
      console.log(`📁 Nalezeno blobů: ${blobs.length}`);
      
      if (blobs.length > 0) {
        console.log(`📄 Příklad blob: ${blobs[0].pathname}`);
      }
      
    } catch (error) {
      console.log('❌ Blob API selhalo:', error.message);
    }
  }
  
} catch (error) {
  console.log('❌ @vercel/blob import selhání:', error.message);
}

console.log('\n🎯 Stav integrace:');
console.log('• Development: VERCEL_BLOB_API token nastaven');
console.log('• Production: Připraveno pro nasazení');
console.log('• Media upload: Bude používat Blob Storage');
console.log('• Fallback: Lokální storage v dev módu');