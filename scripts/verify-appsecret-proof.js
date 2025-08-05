import crypto from 'crypto';

// Funkce pro generování appsecret_proof pro zabezpečení FB API požadavků
function generateAppSecretProof(accessToken, appSecret) {
  return crypto
    .createHmac('sha256', appSecret)
    .update(accessToken)
    .digest('hex');
}

// Hodnoty přímo z .env
const accessToken = "EAAWPfMaYnp4BOxPVdE2gNZAWl9GWlCBRyPDiiZBD1piwTzHjBhcZCvz6Lxrewqi8K13fPZAA3NG8UIhg5IxMCOpxXZAKN9JcWoxqZBsg6tmuFtovVf9f8S5VRoi2bqGyFY0fehb5GaeLkwk1k0t9eZCUkCCrUA99nS7kz2UY94ARPQ0esHAeKPamxZBYIyyQg4TOHP2y9FRHVJZCQpQZDZD";
const appSecret = "a8732acf3c1b1f3f348093b67c38086a";

// Generování appsecret_proof
const appSecretProof = generateAppSecretProof(accessToken, appSecret);

console.log('========== APPSECRET_PROOF VERIFICATION ==========');
console.log('Access Token:');
console.log(accessToken);
console.log('\nApp Secret:');
console.log(appSecret);
console.log('\nGenerated appsecret_proof:');
console.log(appSecretProof);
console.log('================================================');

// Sestavení ukázkových příkazů
const pageId = '640847772437096';

// Standardní cURL příkaz (pro bash/cmd)
const curlCommand = `curl -i -X GET "https://graph.facebook.com/v23.0/${pageId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares,permalink_url,full_picture&access_token=${accessToken}&appsecret_proof=${appSecretProof}&limit=10"`;

// PowerShell kompatibilní příkaz
const psCommand = `Invoke-WebRequest -Uri "https://graph.facebook.com/v23.0/${pageId}/posts?fields=id,message,created_time,likes.summary(true),comments.summary(true),shares,permalink_url,full_picture&access_token=${accessToken}&appsecret_proof=${appSecretProof}&limit=10" -Method GET | Select-Object -ExpandProperty Content`;

// Příkaz pro získání stránek uživatele (me/accounts)
const accountsCommand = `Invoke-WebRequest -Uri "https://graph.facebook.com/v23.0/me/accounts?access_token=${accessToken}&appsecret_proof=${appSecretProof}" -Method GET | Select-Object -ExpandProperty Content`;

console.log('\nTest Command (Bash/CMD):');
console.log(curlCommand);

console.log('\nPowerShell Command (for posts):');
console.log(psCommand);

console.log('\nPowerShell Command (for me/accounts):');
console.log(accountsCommand);

// Pro ES moduly přidáme explicitní export
export { generateAppSecretProof };
