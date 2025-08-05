import crypto from 'crypto';

// Funkce pro generování appsecret_proof pro zabezpečení FB API požadavků
function generateAppSecretProof(accessToken, appSecret) {
  return crypto
    .createHmac('sha256', appSecret)
    .update(accessToken)
    .digest('hex');
}

// Informace z .env souboru
const pageId = '640847772437096';
// Použijeme token z .env souboru
const accessToken = 'EAAWPfMaYnp4BOxPVdE2gNZAWl9GWlCBRyPDiiZBD1piwTzHjBhcZCvz6Lxrewqi8K13fPZAA3NG8UIhg5IxMCOpxXZAKN9JcWoxqZBsg6tmuFtovVf9f8S5VRoi2bqGyFY0fehb5GaeLkwk1k0t9eZCUkCCrUA99nS7kz2UY94ARPQ0esHAeKPamxZBYIyyQg4TOHP2y9FRHVJZCQpQZDZD';
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
