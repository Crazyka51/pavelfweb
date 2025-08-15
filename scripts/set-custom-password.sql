-- Nastavení vlastního hesla pro uživatele "pavel"
-- POZOR: Nejprve spusťte generate-bcrypt-hash.sql pro získání hashe vašeho hesla

-- Krok 1: Vygenerujte hash pro vaše heslo
SELECT crypt('vase_nove_heslo', gen_salt('bf', 10)) as new_password_hash;

-- Krok 2: Zkopírujte vygenerovaný hash a použijte ho níže
UPDATE admin_users
SET password_hash = '$2a$10$1lAHwD2uAcQxtcbuJq51ku9aSz00YXjkuEM90U4DbmLG/r4UwEW.6'
WHERE username = 'pavel' AND email = 'pavel.fiser@praha4.cz';

-- 3. Kontrola, zda bylo heslo správně nastaveno
SELECT username, email,
  CASE
    WHEN password_hash IS NOT NULL THEN 'Heslo OK'
    ELSE 'Chybí heslo'
  END AS stav_hesla
FROM admin_users
WHERE username = 'pavel';
