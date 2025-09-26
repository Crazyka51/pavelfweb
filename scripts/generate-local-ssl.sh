# Skript pro generování lokálních SSL certifikátů pro vývojové prostředí

# Vytvoření adresáře pro certifikáty
mkdir -p ./certificates

# Generování soukromého klíče
openssl genrsa -out ./certificates/localhost-key.pem 2048

# Vytvoření CSR (Certificate Signing Request)
openssl req -new -key ./certificates/localhost-key.pem -out ./certificates/localhost.csr -subj "/C=CZ/ST=Prague/L=Prague/O=PavelFiser/OU=Development/CN=localhost"

# Podepsání certifikátu (self-signed)
openssl x509 -req -days 365 -in ./certificates/localhost.csr -signkey ./certificates/localhost-key.pem -out ./certificates/localhost.pem

# Výpis informací
echo "SSL certifikáty vygenerovány:"
echo "- ./certificates/localhost-key.pem (soukromý klíč)"
echo "- ./certificates/localhost.pem (certifikát)"

# Nastavení oprávnění
chmod 600 ./certificates/localhost-key.pem
