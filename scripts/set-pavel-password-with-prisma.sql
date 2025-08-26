-- Nastavení hesla "admin123" pro uživatele pavel pomocí bcrypt
-- Tento hash odpovídá heslu "admin123" s bcrypt rounds=12
UPDATE admin_users 
SET password_hash = '$2a$12$LQv3c1yqBwEHXyvO/S0K4.6M3OgD0bVXV3iHt9TK0IuTRD9B1rQ0K'
WHERE username = 'pavel';

-- Ověření, že heslo bylo nastaveno
SELECT id, username, email, role, is_active, 
       CASE WHEN password_hash IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status
FROM admin_users 
WHERE username = 'pavel';
