import fetch from 'node-fetch';

async function testAuth() {
  try {
    console.log('Testing authentication flow...');
    
    // 1. Login
    console.log('\n1. Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/admin/auth/v2/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.token) {
      throw new Error('Login failed - no token received');
    }

    // 2. Verify token
    console.log('\n2. Testing token verification...');
    const verifyResponse = await fetch('http://localhost:3000/api/admin/auth/v2/verify', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const verifyData = await verifyResponse.json();
    console.log('Verify response:', verifyData);

    // 3. Create article with token
    console.log('\n3. Testing article creation with token...');
    const articleResponse = await fetch('http://localhost:3000/api/admin/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify({
        title: 'Test Article',
        content: 'Test content',
        category: 'aktuality',
        author: loginData.user.username
      })
    });

    const articleData = await articleResponse.json();
    console.log('Article creation response:', articleData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();
