#!/bin/bash

# Test script pro nahrávání obrázků
# Vytvoří test soubor a zkusí ho nahrát

echo "🧪 Test nahráváí obrázků"

# Vytvoř testovací obrázek (jednoduchý SVG)
cat > /tmp/test-image.svg << 'EOF'
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="blue"/>
  <text x="50" y="50" text-anchor="middle" dy=".3em" fill="white">TEST</text>
</svg>
EOF

echo "✅ Testovací obrázek vytvořen: /tmp/test-image.svg"

# Test whether development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Development server není spuštěn na localhost:3000"
    echo "   Spusť: npm run dev"
    exit 1
fi

echo "✅ Development server běží"

# Test media upload API (requires authentication)
echo "🔍 Testování media upload API..."

# Note: This will fail without proper authentication, but will show if endpoint exists
curl -X POST \
  -F "file=@/tmp/test-image.svg" \
  -H "Content-Type: multipart/form-data" \
  http://localhost:3000/api/admin/media/upload \
  -w "\n📊 Status: %{http_code}\n" \
  -s

echo "🏁 Test dokončen"
echo ""
echo "Pro ruční test:"
echo "1. Otevři http://localhost:3000/admin/login"
echo "2. Přihlaš se jako admin"
echo "3. Jdi do sekce 'Nový článek'"
echo "4. Klikni na ikonu obrázku v editoru"
echo "5. Zkus nahrát obrázek"