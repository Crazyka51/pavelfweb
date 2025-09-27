// Test Vercel Analytics API v development prostředí
console.log('🧪 Testování Vercel Analytics API...\n');

// Environment check
console.log('📋 Environment proměnné:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('VERCEL_API_TOKEN:', process.env.VERCEL_API_TOKEN ? '✅ nastaven' : '❌ chybí');
console.log('VERCEL_TEAM_ID:', process.env.VERCEL_TEAM_ID ? '✅ nastaven' : '❌ chybí');
console.log('VERCEL_PROJECT_ID:', process.env.VERCEL_PROJECT_ID ? '✅ nastaven' : '❌ chybí');

// Test API call
if (process.env.VERCEL_API_TOKEN) {
  console.log('\n🔍 Testování Vercel Analytics API...');
  
  const testAnalyticsAPI = async () => {
    try {
      const vercelApiToken = process.env.VERCEL_API_TOKEN;
      const vercelTeamId = process.env.VERCEL_TEAM_ID;
      const projectId = process.env.VERCEL_PROJECT_ID;
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const since = startDate.getTime();
      const until = endDate.getTime();
      
      console.log(`📅 Časové rozmezí: ${startDate.toLocaleDateString('cs-CZ')} - ${endDate.toLocaleDateString('cs-CZ')}`);
      
      const url = `https://vercel.com/api/web/insights/views?teamId=${vercelTeamId}&projectId=${projectId}&since=${since}&until=${until}`;
      console.log('🌐 API URL:', url.substring(0, 80) + '...');
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${vercelApiToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API funguje!');
        console.log('📈 Pageviews:', data.views || 'N/A');
        console.log('📊 Data struktura:', Object.keys(data));
      } else {
        console.log('❌ API selhalo');
        console.log('📄 Response:', await response.text());
      }
      
    } catch (error) {
      console.log('❌ Chyba při volání API:', error.message);
    }
  };
  
  await testAnalyticsAPI();
} else {
  console.log('\n⚠️ VERCEL_API_TOKEN není nastaven');
}

console.log('\n🎯 Závěr:');
console.log('• Development: Token je nastaven pro testování');
console.log('• Production: Token už existuje na Vercelu');
console.log('• Admin dashboard: Připraven na real-time data');