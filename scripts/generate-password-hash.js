import bcrypt from 'bcryptjs';

const password = 'admin123';

// Generování hashe
const saltRounds = 10;
bcrypt.hash(password, saltRounds).then(hash => {
    console.log('Hash hesla pro SQL:', hash);
});