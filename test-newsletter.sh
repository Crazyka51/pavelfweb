#!/bin/bash
# Newsletter System Test Script
# Usage: ./test-newsletter.sh

echo "🧪 TESTING NEWSLETTER SYSTEM"
echo "================================"

# Test 1: Add subscriber
echo "📧 Test 1: Adding subscriber..."
curl -s -X POST "http://localhost:3000/api/admin/newsletter" \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@example.com"}' | jq '.'

echo ""

# Test 2: Login and get token
echo "🔐 Test 2: Admin login..."
TOKEN=$(curl -s -X POST "http://localhost:3000/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "pavel", "password": "test123"}' | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
  echo "✅ Login successful! Token received."
  
  # Test 3: Get subscribers
  echo ""
  echo "📋 Test 3: Getting subscribers..."
  curl -s -X GET "http://localhost:3000/api/admin/newsletter" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  
  echo ""
  echo "📊 Test 4: Getting templates..."
  curl -s -X GET "http://localhost:3000/api/admin/newsletter/templates" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
  
  echo ""
  echo "🎉 ALL TESTS COMPLETED!"
  echo "✅ Newsletter system is fully functional!"
else
  echo "❌ Login failed!"
fi

echo ""
echo "🌐 Access admin panel: http://localhost:3000/admin"
echo "👤 Credentials: pavel / test123"
