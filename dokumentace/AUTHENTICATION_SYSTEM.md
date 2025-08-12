# Autentizace s Refresh Tokeny - Dokumentace

## Přehled

Tento dokument popisuje implementaci bezpečného autentizačního systému s využitím JWT (JSON Web Tokens), včetně mechanismu refresh tokenů, který umožňuje dlouhodobé přihlášení uživatelů bez nutnosti častého zadávání přihlašovacích údajů.

## Architektura

Systém používá dva typy tokenů:

1. **Access Token** - krátkodobý token (15 minut) pro autorizaci API požadavků
   - Uložen v localStorage na klientské straně
   - Používán pro všechny API volání vyžadující autorizaci

2. **Refresh Token** - dlouhodobý token (30 dní) pro obnovení access tokenů
   - Uložen jako HTTP-only cookie, není přístupný z JavaScriptu
   - Používán pouze pro endpoint `/api/admin/auth/v2/refresh`

## Implementace na straně serveru

### Soubory

- `lib/auth-utils-v2.ts` - Hlavní autentizační logika
- `app/api/admin/auth/v2/login/route.ts` - Přihlašovací API endpoint
- `app/api/admin/auth/v2/logout/route.ts` - Odhlašovací API endpoint
- `app/api/admin/auth/v2/refresh/route.ts` - API endpoint pro obnovení tokenů
- `app/api/admin/auth/v2/verify/route.ts` - API endpoint pro ověření platnosti tokenu

### Hlavní funkce

- `createSession` - Vytváří novou uživatelskou relaci a generuje oba tokeny
- `refreshSession` - Obnovuje access token pomocí refresh tokenu
- `verifyAccessToken` - Ověřuje platnost access tokenu
- `deleteSession` - Odstraňuje relaci (odhlášení)
- `requireAuth` - Middleware pro zabezpečení API endpointů

## Implementace na straně klienta

### Soubory

- `lib/auth-service.ts` - Klientská služba pro práci s autentizací
- `lib/auth-context.tsx` - React Context pro centrální správu autentizace
- `app/admin/components/AdminAuthLayout.tsx` - Komponenta pro ochranu admin stránek
- `app/admin/login/page.tsx` - Přihlašovací stránka

### Hlavní funkce

- `AuthService.login` - Přihlášení uživatele
- `AuthService.logout` - Odhlášení uživatele
- `AuthService.checkAuth` - Ověření přihlášení uživatele
- `AuthService.refreshToken` - Obnovení tokenu
- `AuthProvider` - React Provider pro autentizační stav
- `useAuth` - React Hook pro přístup k autentizačnímu stavu

## Tok autentizace

1. **Přihlášení uživatele**
   - Uživatel zadá přihlašovací údaje
   - Frontend pošle požadavek na `/api/admin/auth/v2/login`
   - Server ověří údaje a vygeneruje tokeny
   - Access token je vrácen v odpovědi, refresh token je nastaven jako HTTP-only cookie
   - Frontend uloží access token do localStorage a aktualizuje stav autentizace

2. **Autorizované API volání**
   - Při každém API volání je access token přidán do hlavičky Authorization
   - Server ověří token a zpracuje požadavek

3. **Vypršení access tokenu**
   - Když vyprší access token, server vrátí chybu 401
   - Frontend detekuje chybu a pokusí se obnovit token voláním `/api/admin/auth/v2/refresh`
   - Server použije refresh token z cookies k vygenerování nového access tokenu
   - Frontend aktualizuje access token v localStorage a zopakuje původní požadavek

4. **Automatické obnovení tokenu**
   - Frontend nastaví interval (10 minut), který pravidelně obnovuje access token
   - Tím se předejde vypršení tokenu během aktivního používání

5. **Odhlášení uživatele**
   - Uživatel klikne na odhlášení
   - Frontend zavolá `/api/admin/auth/v2/logout`
   - Server smaže refresh token cookie
   - Frontend vyčistí localStorage a aktualizuje stav autentizace

## Zabezpečení

- Access token má krátkou životnost (15 minut) pro minimalizaci rizika při odcizení
- Refresh token je uložen jako HTTP-only cookie, není přístupný z JavaScriptu
- Veškerá komunikace by měla probíhat přes HTTPS
- Při odhlášení jsou odstraněny všechny tokeny
- Access token obsahuje pouze nezbytné informace (ID, username, role)

## Použití v kódu

### Ochrana API endpointů

```typescript
import { requireAuth } from "@/lib/auth-utils-v2";
import { NextRequest, NextResponse } from "next/server";

export const GET = requireAuth(async (request: NextRequest, auth) => {
  // auth obsahuje ověřené informace o uživateli
  const { userId, username, role } = auth;
  
  // Implementace API logiky...
  
  return NextResponse.json({ success: true, data: {...} });
});
```

### Použití autentizace na frontendu

```tsx
'use client';

import { useAuth } from "@/lib/auth-context";

export default function SecuredComponent() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();
  
  if (isLoading) {
    return <div>Načítání...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Nemáte oprávnění k zobrazení této stránky</div>;
  }
  
  return (
    <div>
      <p>Přihlášen jako: {user?.username}</p>
      <button onClick={logout}>Odhlásit se</button>
    </div>
  );
}
```

## Shrnutí

Implementovaný autentizační systém poskytuje:

- Bezpečné dlouhodobé přihlášení s automatickou obnovou tokenů
- Ochranu před XSS a CSRF útoky
- Možnost okamžitého odvolání přístupu
- Jednoduché rozhraní pro použití v React aplikacích
