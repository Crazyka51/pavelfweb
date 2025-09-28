-- Debug script pro kontrolu článků v databázi
-- Tento script můžeme spustit pro kontrolu stavu článků

-- Zobrazit všechny články
SELECT id, title, status, "createdAt", "updatedAt" 
FROM "Article" 
ORDER BY "createdAt" DESC;

-- Počet článků podle statusu
SELECT status, COUNT(*) as count 
FROM "Article" 
GROUP BY status;

-- Nedávno upravené/vytvořené články
SELECT id, title, status, "createdAt", "updatedAt"
FROM "Article" 
WHERE "updatedAt" > NOW() - INTERVAL '1 hour'
ORDER BY "updatedAt" DESC;