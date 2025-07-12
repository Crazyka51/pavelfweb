#!/bin/bash

# Test script pro ověření admin DELETE endpoint pro newsletter
echo "=== TESTOVÁNÍ ADMIN UNSUBSCRIBE FUNKCE ==="

# 1. Nejdříve se přihlásíme jako admin
echo "1. Přihlašování jako admin..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"pavel","password":"test123"}')

echo "Token Response: $TOKEN_RESPONSE"

# Extraktujeme token z odpovědi (předpokládáme JSON s "token" polem)
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ CHYBA: Nepodařilo se získat token"
  exit 1
fi

echo "✅ Token získán: ${TOKEN:0:20}..."

# 2. Načteme current subscribers
echo ""
echo "2. Načítání současných odběratelů..."
SUBSCRIBERS_RESPONSE=$(curl -s -X GET http://localhost:3001/api/admin/newsletter \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Subscribers Response: $SUBSCRIBERS_RESPONSE"

# 3. Zkusíme odhlásit test@example.com
echo ""
echo "3. Odhlašování test@example.com..."
UNSUBSCRIBE_RESPONSE=$(curl -s -X DELETE http://localhost:3001/api/admin/newsletter \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}')

echo "Unsubscribe Response: $UNSUBSCRIBE_RESPONSE"

# 4. Ověříme, že odběratel byl odhlášen
echo ""
echo "4. Ověření stavu po odhlášení..."
SUBSCRIBERS_AFTER=$(curl -s -X GET http://localhost:3001/api/admin/newsletter \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Subscribers After: $SUBSCRIBERS_AFTER"

echo ""
echo "=== TEST DOKONČEN ==="
