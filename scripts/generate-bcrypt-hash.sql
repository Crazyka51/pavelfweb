-- Pro generování bcrypt hashe v PostgreSQL potřebujete rozšíření pgcrypto
-- Pokud není nainstalované, spusťte nejprve:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Generování bcrypt hashe pro heslo "admin123"
SELECT crypt('admin123', gen_salt('bf', 10)) as bcrypt_hash;

-- Generování bcrypt hashe pro heslo "pavel123" 
SELECT crypt('pavel123', gen_salt('bf', 10)) as bcrypt_hash;

-- Generování bcrypt hashe pro vlastní heslo (nahraďte 'vase_heslo')
SELECT crypt('vase_heslo', gen_salt('bf', 10)) as bcrypt_hash;
