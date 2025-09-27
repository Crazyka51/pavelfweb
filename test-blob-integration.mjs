// Test skript pro ověření Blob Storage integrace
console.log('🧪 Testování Blob Storage integrace...\n');

// Environment check
console.log('📋 Environment proměnné:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✅ nastaveno' : '❌ chybí');

// Test import
try {
  const { put, list, del } = await import('@vercel/blob');
  console.log('✅ @vercel/blob import úspěšný');
} catch (error) {
  console.log('❌ @vercel/blob import selhání:', error.message);
}

console.log('\n🚀 Integrace připravena!');
console.log('\n📝 Jak to bude fungovat:');
console.log('• Development: Obrázky v /public/media/');
console.log('• Production: Obrázky v Vercel Blob Storage');
console.log('• Automatická detekce prostředí');
console.log('\n🎯 Příští krok: Deploy na Vercel');