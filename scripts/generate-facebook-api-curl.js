import crypto from 'crypto';

// Funkce pro generování appsecret_proof pro zabezpečení FB API požadavků
function generateAppSecretProof(accessToken, appSecret) {
  return crypto
    .createHmac('sha256', appSecret)
    .update(accessToken)
    .digest('hex');
}

// Informace z .env.production
const pageId = '61574874071299';
// Zde použijeme nový token z vašeho požadavku
const accessToken = 'EAAWPfMaYnp4BPFZAZAGQ8gsml7BZCJkh5FZCJjPknDpdHH6GllRtPyTOnA2zOZB65u2qhMzlJSABbkjF79vRDuRQlqDqxBoFSwD16qIiWrVzlUSPZCmv92g1xfSRPW96dih8k69OUDTTMSpKlsbL4YKa6hvkNa6jjE8gAfj2AaT63NRNiBYwZCviGzLXC2aAZBpFIviOooPeGobsqQDx4ZBAFNpRQ03nSlI6L5o8NWg94mQXoCKY6MAZDZD';
const appSecret = 'a8732acf3c1b1f3f348093b67c38086a';

// Generování appsecret_proof
const appSecretProof = generateAppSecretProof(accessToken, appSecret);

// Sestavení URL pro API požadavek
const apiUrl = `https://graph.facebook.com/v23.0/${pageId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares,permalink_url,full_picture&access_token=${accessToken}&appsecret_proof=${appSecretProof}&limit=10`;

// Sestavení kompletního cURL příkazu
const curlCommand = `curl -i -X GET "${apiUrl}"`;

console.log('========== COPY THIS CURL COMMAND ==========');
console.log(curlCommand);
console.log('============================================');
console.log('');
console.log('App Secret Proof:', appSecretProof);
console.log('Facebook Page ID:', pageId);

// Pro ES moduly přidáme explicitní export, i když ho v tomto skriptu nepotřebujeme
export { generateAppSecretProof };
