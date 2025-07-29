/** @type {import('next').NextConfig} */
const v0UserConfig = {
  // Nastavení environmentTarget pro NPM_RC a NPM_TOKEN na 'server'
  // Toto zabrání jejich přístupu na klientovi
  env: {
    NPM_RC: process.env.NPM_RC || '',
    NPM_TOKEN: process.env.NPM_TOKEN || ''
  },
  experimental: {
    // Explicitně určit, které env proměnné jsou pouze serverové
    serverComponentsExternalPackages: [],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Vymezení proměnných pouze pro server
    serverRuntimeConfig: {
      NPM_RC: process.env.NPM_RC || '',
      NPM_TOKEN: process.env.NPM_TOKEN || ''
    },
    // Veřejné proměnné (dostupné na klientovi)
    publicRuntimeConfig: {
      // prázdné, neobsahuje NPM_RC ani NPM_TOKEN
    }
  }
}

export default v0UserConfig
