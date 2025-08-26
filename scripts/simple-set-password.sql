-- Nastavení hesla "admin123" pro uživatele pavel
-- Spusťte tento příkaz v Neon SQL editoru

UPDATE admin_users 
SET password_hash = crypt('admin123', gen_salt('bf'))
WHERE username = 'pavel';

-- Ověření, že heslo bylo nastaveno
SELECT 
    username, 
    email, 
    role, 
    is_active,
    CASE 
        WHEN password_hash IS NOT NULL THEN 'Heslo nastaveno' 
        ELSE 'Heslo chybí' 
    END as password_status
FROM admin_users 
WHERE username = 'pavel';
