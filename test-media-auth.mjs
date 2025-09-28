#!/usr/bin/env node

import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testMediaAuth() {
  console.log('🔍 Testing media authentication...\n');
  
  try {
    // 1. Nejdříve se přihlásíme
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.success);
    
    // Získáme cookies z response
    const cookies = loginResponse.headers.raw()['set-cookie'];
    const cookieHeader = cookies?.join('; ') || '';
    console.log('🍪 Cookies received:', cookieHeader ? 'Yes' : 'No');
    
    // 2. Testujeme media list endpoint
    console.log('\n2. Testing media list endpoint...');
    const listResponse = await fetch('http://localhost:3000/api/admin/media/list', {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    console.log('📋 Media list response status:', listResponse.status);
    if (listResponse.ok) {
      console.log('✅ Media list access successful');
    } else {
      console.log('❌ Media list access failed');
      const errorData = await listResponse.text();
      console.log('Error response:', errorData);
    }
    
    // 3. Testujeme upload endpoint (pokud máme testovací soubor)
    console.log('\n3. Testing media upload endpoint...');
    
    // Vytvoříme jednoduchý testovací obrázek
    const testImagePath = '/tmp/test-image.png';
    
    // Vytvoříme jednoduchý PNG soubor (1x1 pixel)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // Width: 1
      0x00, 0x00, 0x00, 0x01, // Height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // Rest of IHDR
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x1D, 0x01, 0x01, 0x00, 0x00, 0xFE, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // IEND CRC
    ]);
    
    fs.writeFileSync(testImagePath, pngData);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testImagePath), {
      filename: 'test-image.png',
      contentType: 'image/png'
    });
    
    const uploadResponse = await fetch('http://localhost:3000/api/admin/media/upload', {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log('📤 Media upload response status:', uploadResponse.status);
    if (uploadResponse.ok) {
      console.log('✅ Media upload successful');
      const uploadData = await uploadResponse.json();
      console.log('Upload result:', uploadData);
    } else {
      console.log('❌ Media upload failed');
      const errorData = await uploadResponse.text();
      console.log('Error response:', errorData);
    }
    
    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMediaAuth();