# Integrace Facebook příspěvků

Tento dokument popisuje, jak propojit vaše Facebook příspěvky s webovou aplikací.

## Současný stav

✅ **Implementováno:**
- Facebook komponenta pro zobrazení příspěvků
- API endpoint pro bezpečné načítání dat
- Mock data pro development
- Moderní UI s animacemi a statistikami
- Responsivní design

## Nastavení pro produkci

### 1. Vytvoření Facebook App

1. Jděte na [Facebook Developers](https://developers.facebook.com/)
2. Vytvořte novou aplikaci
3. Přidejte následující produkty:
   - **Facebook Login**
   - **Graph API**

### 2. Získání Page Access Token

1. V Facebook App nastavení jděte na **Tools & Support > Graph API Explorer**
2. Vyberte vaši aplikaci
3. Vyberte **Page** místo **User** 
4. Přidejte následující oprávnění:
   - `pages_show_list`
   - `pages_read_engagement` 
   - `pages_read_user_content`
5. Vygenerujte Access Token
6. **Důležité:** Převeďte token na dlouhodobý (60 dní) nebo získejte permanentní token

### 3. Environment Variables

Vytvořte soubor `.env.local` s následujícím obsahem:

\`\`\`env
# Facebook konfigurace
NEXT_PUBLIC_FACEBOOK_PAGE_ID=61574874071299
FACEBOOK_ACCESS_TOKEN=your_long_lived_page_access_token_here

# Pro development (nastavte na false pro produkci)
NEXT_PUBLIC_USE_MOCK_DATA=false

# Nastavení
NEXT_PUBLIC_MAX_POSTS=6
\`\`\`

### 4. Testování

1. Nastavte `NEXT_PUBLIC_USE_MOCK_DATA=true` pro development
2. Aplikace bude zobrazovat mock data
3. Pro produkci nastavte `NEXT_PUBLIC_USE_MOCK_DATA=false` a přidejte správný access token

## Jak to funguje

### Automatické propojení
Když publikujete nový příspěvek na Facebook:
1. ✅ Příspěvek se automaticky objeví na vaší webové stránce
2. ✅ Zobrazí se včetně statistik (lajky, komentáře, sdílení)
3. ✅ Zachová se formátování a obrázky
4. ✅ Poskytne odkaz zpět na Facebook

### API Endpoint
- **URL:** `/api/facebook-posts`
- **Parametry:** `?limit=6` (počet příspěvků)
- **Cache:** 5 minut (300 sekund)
- **Fallback:** Mock data pokud API selže

### Komponenta
\`\`\`tsx
import FacebookPosts from "./components/FacebookPosts"

// Použití v aplikaci
<FacebookPosts maxPosts={6} />
\`\`\`

## Bezpečnost

- ✅ Access token je uložen pouze na serveru (ne v browseru)
- ✅ API používá rate limiting a cache
- ✅ Graceful fallback na mock data
- ✅ Error handling pro všechny scénáře

## Další možnosti rozšíření

### 1. Webhook integrace
Pro okamžité aktualizace můžete nastavit Facebook Webhook:
\`\`\`javascript
// Webhook endpoint pro okamžité aktualizace
app.post('/api/webhook/facebook', (req, res) => {
  // Revalidate cache při novém příspěvku
})
\`\`\`

### 2. Filtrování obsahu
\`\`\`typescript
// Přidat do API route
const filteredPosts = posts.filter(post => 
  post.message && !post.message.includes('private')
)
\`\`\`

### 3. Cache optimalizace
\`\`\`typescript
// Redis cache pro lepší výkon
import { redis } from '@/lib/redis'

const cachedPosts = await redis.get('facebook-posts')
\`\`\`

## Troubleshooting

### Nejčastější problémy:

1. **Token expiroval**
   - Řešení: Obnovte access token v Facebook Developer Console

2. **CORS chyby**
   - Řešení: Používáme server-side API, takže CORS není problém

3. **Rate limiting**
   - Řešení: Cache je nastavena na 5 minut, API má rate limiting

4. **Prázdné příspěvky**
   - Řešení: Zkontrolujte oprávnění access tokenu

### Debug kroky:
1. Zkontrolujte `.env.local` soubor
2. Otestujte API endpoint přímo: `GET /api/facebook-posts`
3. Zkontrolujte browser console pro chyby
4. Ověřte access token v Graph API Explorer

## Monitoring

Pro produkční použití doporučuji přidat:
- Error logging (Sentry)
- Analytics pro sledování engagement
- Monitoring API uptime
- Backup strategie pro případ výpadku Facebook API

---

*Pokud máte otázky ohledně implementace, kontaktujte vývojáře.*
