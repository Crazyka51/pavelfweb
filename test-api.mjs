import fetch from 'node-fetch';

async function testAPI() {
    console.log('Testing API endpoints...');

    try {
        // 1. Login
        console.log('\nTesting login...');
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

        const token = loginData.token;

        // 2. Create Article
        console.log('\nTesting article creation...');
        const articleResponse = await fetch('http://localhost:3000/api/admin/articles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: 'Test Article',
                content: 'This is a test article content',
                excerpt: 'Test excerpt',
                category: 'Aktuality',
                tags: ['test', 'api'],
                published: true
            })
        });

        const articleData = await articleResponse.json();
        console.log('Article creation response:', articleData);

        // 3. Get Articles
        console.log('\nTesting article listing...');
        const getArticlesResponse = await fetch('http://localhost:3000/api/admin/articles', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const articles = await getArticlesResponse.json();
        console.log('Articles list:', articles);

    } catch (error) {
        console.error('Error during API test:', error);
    }
}

testAPI();
