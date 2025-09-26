# Oprava funkcí pro správu článků a kategorií

## Identifikovaný problém

Po analýze kódu jsme zjistili, že funkce pro správu článků a kategorií nefungovaly správně. Problém byl způsoben nekonzistentním použitím autentizace:

1. V některých částech kódu jsme používali middleware `requireAuth`
2. V jiných částech jsme používali přímou implementaci s funkcí `authenticateAdmin`
3. V klientské části jsme někdy posílali token jen v cookies, jindy v hlavičce Authorization

## Provedené změny

### 1. Vrácení k middleware `requireAuth`

Vrátili jsme všechny API endpointy k používání middleware `requireAuth`, který poskytuje konzistentní způsob autentizace:

#### a) GET `/api/admin/articles`
\`\`\`typescript
// Před: export const GET = async (request: NextRequest) => { ... }
// Po:
export const GET = requireAuth(async (request: NextRequest, authResult: any) => { ... });
\`\`\`

#### b) POST `/api/admin/articles`
\`\`\`typescript
// Před: export const POST = async (request: NextRequest) => { ... }
// Po:
export const POST = requireAuth(async (request: NextRequest, authResult: any) => { ... });
\`\`\`

#### c) DELETE `/api/admin/articles/[id]`
\`\`\`typescript
// Před: export const DELETE = async (request: NextRequest, { params }) => { ... }
// Po:
export const DELETE = requireAuth(async (request: NextRequest, authResult: any, { params }) => { ... });
\`\`\`

#### d) GET a POST `/api/admin/categories`
Podobné změny byly provedeny i pro endpointy kategorií.

### 2. Konzistentní autentizace v klientské části

V komponentě `ArticleManager.tsx` jsme zajistili, aby při mazání článků byly vždy posílány jak cookies, tak i Authorization hlavička:

\`\`\`typescript
const headers: HeadersInit = {
  'Content-Type': 'application/json'
};

if (accessToken) {
  headers['Authorization'] = `Bearer ${accessToken}`;
}

const response = await fetch(`/api/admin/articles/${articleId}`, {
  method: "DELETE",
  headers,
  credentials: 'include',
});
\`\`\`

### 3. Lepší logování

Přidali jsme podrobnější logování, které pomůže identifikovat případné problémy:

\`\`\`typescript
console.log("Delete article endpoint - Auth header:", authHeader ? "Exists" : "Missing");
console.log("Delete article endpoint - Auth result:", authResult ? "Valid" : "Invalid");
\`\`\`

## Jak nyní funguje autentizace

1. Middleware `requireAuth` automaticky zpracovává:
   - Token z hlavičky Authorization
   - Refresh token z cookies
   - Kontrolu role

2. Klientská část posílá:
   - Authorization hlavičku s tokenu z localStorage (pokud existuje)
   - Cookies díky `credentials: 'include'`

## Důvod změn

Původně jsme se snažili implementovat vlastní autentizaci přímo v API endpointech, ale toto řešení nebylo plně kompatibilní s existujícím autentizačním systémem. Middleware `requireAuth` je komplexní řešení, které správně zpracovává všechny scénáře autentizace v této aplikaci.

Vrácením se k tomuto middleware by mělo fungování vytváření, mazání a aktualizace článků a kategorií opět pracovat správně.
