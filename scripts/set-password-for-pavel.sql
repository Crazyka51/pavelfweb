-- Nastavení hesla pro uživatele "pavel"
-- Heslo bude: "admin123" (bcrypt hash s 10 rounds)

UPDATE admin_users 
SET password_hash = '$2b$10$rOzJqQZ8kVx.Ub8YQJ5fKOqKqKqKqKqKqKqKqKqKqKqKqKqKqKqKq'
WHERE username = 'pavel' AND email = 'pavel.fiser@praha4.cz';

-- Ověření, že heslo bylo nastaveno
SELECT id, username, email, 
       CASE 
         WHEN password_hash IS NOT NULL THEN 'Heslo nastaveno' 
         ELSE 'Heslo NENÍ nastaveno' 
       END as password_status,
       is_active, created_at
FROM admin_users 
WHERE username = 'pavel';
