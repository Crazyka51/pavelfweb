-- Nastavení hesla admin123 pro uživatele pavel
UPDATE admin_users 
SET password_hash = crypt('admin123', gen_salt('bf', 10)),
    updated_at = NOW()
WHERE username = 'pavel';

-- Ověření změny
SELECT username, email, 
       CASE WHEN password_hash IS NOT NULL THEN 'Heslo nastaveno' ELSE 'Bez hesla' END as password_status,
       is_active
FROM admin_users 
WHERE username = 'pavel';
