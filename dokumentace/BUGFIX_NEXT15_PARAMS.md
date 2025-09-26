# Oprava chyb v dynamických trasách Next.js 15.4.5

## Problém

V Next.js 15.4.5 je nutné počkat na parametry dynamických tras pomocí `await`. Bez tohoto řešení dochází k chybě "Unauthorized" při přístupu k parametrům v API koncových bodech.

## Provedené změny

### 1. API trasa pro články `/app/api/admin/articles/[id]/route.ts`

V této trase byly upraveny všechny metody (GET, PUT, DELETE) tak, aby správně čekaly na parametry:

#### DELETE metoda:
\`\`\`typescript
export const DELETE = requireAuth(async (request: NextRequest, authResult: any, { params }: { params: { id: string } }) => {
  try {
    // Nejprve počkáme na params
    const resolvedParams = await params;
    const success = await articleService.deleteArticle(resolvedParams.id);
    // ...
  }
});
\`\`\`

#### GET metoda:
\`\`\`typescript
export const GET = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // Nejprve počkáme na params
    const resolvedParams = await params;
    const article = await articleService.getArticleById(resolvedParams.id);
    // ...
  }
});
\`\`\`

#### PUT metoda:
\`\`\`typescript
export const PUT = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }, authResult: any) => {
  try {
    // ...
    // Nejprve počkáme na params
    const resolvedParams = await params;
    const articleId = resolvedParams.id;
    // ...
  }
});
\`\`\`

### 2. Další úpravy

Odstraněna reference na `resolvedParams` v bloky `catch`, protože tato proměnná není dostupná mimo blok `try`. Chybové zprávy byly upraveny:

\`\`\`typescript
// Změněno z
console.error(`Error deleting article ${resolvedParams.id}:`, error);

// Na
console.error(`Error deleting article:`, error);
\`\`\`

## Poznámka

V trase `/app/api/admin/categories/[id]/route.ts` není nutné dělat úpravy, protože již obsahuje správný přístup:

\`\`\`typescript
export const GET = requireAuth(
  async (request: NextRequest, authResult: any, context: any) => {
    try {
      const { id } = await context.params;
      // ...
    }
  }
);
\`\`\`

## Výsledek

Po těchto změnách by mělo být možné mazat články a provádět další operace s dynamickými trasami bez chyby "Unauthorized".
