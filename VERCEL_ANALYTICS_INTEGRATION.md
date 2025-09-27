# 📊 VERCEL ANALYTICS INTEGRACE DO ADMIN DASHBOARDU

## ✅ Co bylo implementováno:

### 1. **Nové API endpoint** (`/app/api/admin/vercel-analytics/route.ts`)
- ✅ Připojení k Vercel Analytics Web API
- ✅ Získávání real-time dat z Vercel platformy
- ✅ Transformace dat do formátu kompatibilního s existujícím dashboardem
- ✅ Automatický fallback při selhání API

### 2. **Vylepšený AnalyticsWidget**
- ✅ Přepínač zdrojů dat: Auto / Vercel / Google Analytics
- ✅ Prioritizace Vercel Analytics v Auto módu
- ✅ Graceful fallback na Google Analytics nebo mock data
- ✅ Zachování všech existujících funkcí

### 3. **Environment Variables**
- ✅ `VERCEL_TEAM_ID` - ID vašeho Vercel teamu
- ✅ `VERCEL_PROJECT_ID` - ID projektu
- ✅ `VERCEL_API_TOKEN` - potřeba přidat do produkce

## 🔧 Nastavení pro produkci:

### **Krok 1: Získání Vercel API tokenu**
1. Jít na https://vercel.com/account/tokens
2. Vytvořit nový token s oprávněními "Read"
3. Přidat do environment variables na Vercelu:
   ```
   VERCEL_API_TOKEN=your_token_here
   ```

### **Krok 2: Ověření Team a Project ID**
Tyto hodnoty jsou už v .env:
```
VERCEL_TEAM_ID="team_zPeZCZYo4guVHIvfwhwRpfkH"
VERCEL_PROJECT_ID="prj_3hMIp9tfABgKs52WyJ8GR4zbvpmt"
```

## 📈 Funkce v Admin dashboardu:

### **Přepínač zdrojů dat:**
- **🔄 Auto**: Preferuje Vercel Analytics, fallback na Google Analytics
- **📊 Vercel**: Pouze Vercel Analytics data
- **🎯 Google**: Pouze Google Analytics data

### **Vercel Analytics poskytuje:**
- ✅ **Real-time pageviews** - aktuální návštěvnost
- ✅ **Unique visitors** - unikátní návštěvníci  
- ✅ **Top pages** - nejnavštěvovanější stránky
- ✅ **Countries** - geografické rozložení
- ✅ **Referrers** - zdroje návštěvnosti
- ✅ **Trends** - změny oproti předchozímu období

### **Výhody Vercel Analytics v dashboardu:**
| Feature | Google Analytics | Vercel Analytics |
|---------|------------------|------------------|
| **Rychlost** | 24h zpoždění | Real-time |
| **Přesnost** | Cookies, lze blokovat | Server-side |
| **Privacy** | GDPR compliance needed | GDPR ready |
| **Setup** | Komplexní konfigurace | Automaticky |

## 🎯 Jak to funguje:

### **Development:**
```typescript
// API automaticky detekuje prostředí
if (!vercelApiToken) {
  return fallback_data; // Mock nebo Google Analytics
}
```

### **Production:**
```typescript
// Real Vercel Analytics API calls
const pageviews = await fetch('vercel.com/api/web/insights/views');
const visitors = await fetch('vercel.com/api/web/insights/visitors');
// ...další metriky
```

## 🚀 Výsledek:

**Admin dashboard nyní podporuje 3 zdroje analytics dat:**

1. **🔄 Auto mód**: Nejlepší dostupná data
2. **📊 Vercel Analytics**: Real-time, přesná data
3. **🎯 Google Analytics**: Pokročilé metriky

**Po nastavení VERCEL_API_TOKEN budete mít real-time statistiky přímo v admin panelu!** 🎉

---

**Pro aktivaci stačí:**
1. Přidat `VERCEL_API_TOKEN` na Vercel
2. Restart aplikace
3. V admin dashboardu vybrat "Vercel" nebo nechat "Auto"