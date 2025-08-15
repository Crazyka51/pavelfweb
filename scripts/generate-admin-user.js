const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = process.argv[2] || 'admin123';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('BCrypt Hash:', hash);
  
  // Generování SQL pro vložení uživatele
  const sql = `
-- Vložení nového administrátorského uživatele
INSERT INTO admin_users (
    id,
    username,
    email,
    password_hash,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    '${process.argv[3] || 'admin'}',
    '${process.argv[4] || 'admin@example.com'}',
    '${hash}',
    'admin',
    true,
    NOW(),
    NOW()
);
  `;
  
  console.log('\nSQL pro vložení uživatele:');
  console.log(sql);
}

generateHash();
