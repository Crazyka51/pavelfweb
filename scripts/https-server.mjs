#!/usr/bin/env node

import { createServer } from 'https';
import { parse } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import next from 'next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certDir = path.join(__dirname, '..', 'certificates');

// Kontrola existence certifikátů
if (!fs.existsSync(path.join(certDir, 'localhost.pem')) || 
    !fs.existsSync(path.join(certDir, 'localhost-key.pem'))) {
  console.error('\x1b[31m%s\x1b[0m', 'Chybí SSL certifikáty!');
  console.log('\x1b[33m%s\x1b[0m', 'Prosím spusťte nejdřív: pnpm gen-certs');
  process.exit(1);
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.HTTPS_PORT || process.env.PORT || '3443', 10);

// Příprava Next.js aplikace
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(certDir, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(certDir, 'localhost.pem'))
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      // Běžné zpracování požadavků pomocí Next.js
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`\x1b[32m%s\x1b[0m`, `🔒 HTTPS server běží na https://${hostname}:${port}`);
    console.log('\x1b[36m%s\x1b[0m', 'Poznámka: Váš prohlížeč vás může varovat o nedůvěryhodném certifikátu. Pro vývojové účely je to v pořádku.');
  });
});
