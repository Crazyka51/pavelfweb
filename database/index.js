// Tento soubor slouží pouze jako odkaz na dokumentaci k databázi

console.log(`
==================================================
 DOKUMENTACE K DATABÁZI - NEON POSTGRESQL
==================================================

Pro kompletní dokumentaci k práci s databází viz:
- database/README.md - základní instrukce
- dokumentace/DATABASE_STANDARDIZATION.md - podrobná dokumentace

Dostupné npm skripty:
- pnpm run db:test - test připojení k databázi
- pnpm run db:schema - vytvoření databázového schématu
- pnpm run db:users-sync - vytvoření tabulky users_sync
- pnpm run db:unify - sjednocení názvů sloupců
- pnpm run db:backup - zálohování databáze
- pnpm run db:setup-all - kompletní nastavení databáze

==================================================
`);

// Exportujeme odkaz na README pro použití v jiných částech aplikace
module.exports = {
  documentation: './README.md'
};
