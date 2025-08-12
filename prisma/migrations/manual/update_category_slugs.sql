-- Nejprve přiřadíme základní hodnoty slugu pro existující kategorie
UPDATE "Category"
SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), ',', '')) || '-' || id
WHERE slug IS NULL;

-- Nyní přidáme omezení NOT NULL a UNIQUE
ALTER TABLE "Category" 
ALTER COLUMN "slug" SET NOT NULL,
ADD CONSTRAINT "Category_slug_key" UNIQUE ("slug");
