-- SQL skript pro aktualizaci kategorií v databázi
-- Přidá nové sloupce a inicializuje výchozí hodnoty

-- Zajistit unikátní hodnoty slug
UPDATE "Category"
SET slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '.', ''), ',', ''), 'á', 'a')) || '-' || id
WHERE slug IS NULL;

-- Nastavení výchozích hodnot pro ostatní sloupce
UPDATE "Category" 
SET 
  description = CASE 
    WHEN description IS NULL THEN 'Kategorie ' || name
    ELSE description
  END,
  color = CASE 
    WHEN color IS NULL THEN '#3B82F6'
    ELSE color
  END,
  display_order = CASE 
    WHEN display_order IS NULL THEN 0
    ELSE display_order
  END,
  is_active = CASE 
    WHEN is_active IS NULL THEN true
    ELSE is_active
  END;
