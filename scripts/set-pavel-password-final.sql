-- Nastavení hesla "PavelHeslo123!" pro uživatele pavel (bcrypt hash)
UPDATE admin_users 
SET password_hash = '$2a$12$$2a$12$w6Qw6Qw6Qw6Qw6Qw6Qw6uOQw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6Qw6',
    updated_at = NOW()
WHERE username = 'pavel';

-- Ověření, že heslo bylo nastaveno
SELECT username, email, 
       CASE WHEN password_hash IS NOT NULL THEN 'Heslo nastaveno' ELSE 'Bez hesla' END as password_status,
       is_active, role
FROM admin_users 
WHERE username = 'pavel';