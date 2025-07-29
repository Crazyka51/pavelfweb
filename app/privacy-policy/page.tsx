import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Lock, Share, Globe, Mail, Calendar, Database, Users, AlertTriangle, Trash2 } from 'lucide-react'
import StructuredData from '../components/StructuredData'

export const metadata: Metadata = {
  title: 'Zásady ochrany osobních údajů | Pavel Fišer - Zastupitel Praha 4',
  description: 'Zásady ochrany osobních údajů pro webové stránky a služby Pavla Fišera, zastupitele Prahy 4. Informace o zpracování osobních údajů.',
  robots: 'index, follow',
  openGraph: {
    title: 'Zásady ochrany osobních údajů | Pavel Fišer',
    description: 'Zásady ochrany osobních údajů pro webové stránky a služby Pavla Fišera, zastupitele Prahy 4.',
    url: 'https://fiserpavel.cz/privacy-policy',
    siteName: 'Pavel Fišer - Zastupitel MČ Praha 4',
    images: [
      {
        url: '/og-privacy.svg',
        width: 1200,
        height: 630,
        alt: 'Zásady ochrany osobních údajů - Pavel Fišer',
      },
    ],
    locale: 'cs_CZ',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zásady ochrany osobních údajů | Pavel Fišer',
    description: 'Zásady ochrany osobních údajů pro webové stránky a služby Pavla Fišera, zastupitele Prahy 4.',
    images: ['/og-privacy.svg'],
  },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <StructuredData 
        type="article"
        title="Zásady ochrany osobních údajů"
        description="Zásady ochrany osobních údajů pro webové stránky a služby Pavla Fišera, zastupitele Prahy 4."
        url="https://fiserpavel.cz/privacy-policy"
        image="https://fiserpavel.cz/og-privacy.svg"
        datePublished="2024-01-01T00:00:00Z"
        dateModified={new Date().toISOString()}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na hlavní stránku
          </Link>
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Zásady ochrany osobních údajů
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Poslední aktualizace: 26. června 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Úvod */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Globe className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Úvod</h2>
            </div>
            <div className="prose prose-lg text-gray-700">
              <p>
                Vážím si Vaší důvěry a zavazuji se chránit Vaše osobní údaje. Tyto zásady ochrany 
                osobních údajů vysvětlují, jak sbírám, používám a chráním informace, které získávám 
                prostřednictvím mých webových stránek a služeb.
              </p>
              <p>
                Jako zastupitel Prahy 4 se řídím platnými zákony České republiky, zejména 
                zákonem č. 110/2019 Sb., o zpracování osobních údajů, a nařízením GDPR.
              </p>
            </div>
          </section>

          {/* Správce údajů */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Správce osobních údajů</h2>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-gray-700">
                <p><strong>Jméno:</strong> Pavel Fišer</p>
                <p><strong>Funkce:</strong> Zastupitel městské části Praha 4</p>
                <p><strong>Email:</strong> pavel.fiser@praha4.cz</p>
                <p><strong>Adresa:</strong> Antala Staška 2059/80b, 140 00 Praha 4</p>
              </div>
            </div>
          </section>

          {/* Jaké údaje sbíráme */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Jaké osobní údaje zpracováváme</h2>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Kontaktní formuláře</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• Jméno a příjmení</li>
                  <li>• E-mailová adresa</li>
                  <li>• Telefon (pokud jej uvedete)</li>
                  <li>• Obsah zprávy</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Newsletter</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• E-mailová adresa</li>
                  <li>• Jméno (pokud jej uvedete)</li>
                  <li>• Preference komunikace</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Automaticky sbírané údaje</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• IP adresa</li>
                  <li>• Typ prohlížeče a operačního systému</li>
                  <li>• Údaje o návštěvnosti stránek (Google Analytics)</li>
                  <li>• Cookies a podobné technologie</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Účel zpracování */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Share className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Účel zpracování osobních údajů</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Komunikace s občany</h3>
                <p className="text-gray-700">
                  Odpovídání na dotazy, stížnosti a podněty občanů v rámci 
                  výkonu mandátu zastupitele.
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Informování občanů</h3>
                <p className="text-gray-700">
                  Zasílání newsletteru s informacemi o aktivitách a 
                  rozhodnutích zastupitelstva.
                </p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Zlepšování služeb</h3>
                <p className="text-gray-700">
                  Analýza návštěvnosti webu pro zlepšení uživatelského 
                  komfortu a kvality služeb.
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Plnění právních povinností</h3>
                <p className="text-gray-700">
                  Zpracování v souladu se zákony o výkonu mandátu 
                  a transparentnosti veřejné správy.
                </p>
              </div>
            </div>
          </section>

          {/* Právní základ */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Lock className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Právní základ zpracování</h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Souhlas:</strong> Pro newsletter a marketingovou komunikaci</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Veřejný zájem:</strong> Pro výkon mandátu zastupitele</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Oprávněný zájem:</strong> Pro zlepšování služeb a komunikace</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Právní povinnost:</strong> Pro archivaci podle zákona o archivnictví</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Doba uchovávání */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Doba uchovávání údajů</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-gray-300 p-3 text-left text-gray-900">Typ údajů</th>
                    <th className="border border-gray-300 p-3 text-left text-gray-900">Doba uchovávání</th>
                    <th className="border border-gray-300 p-3 text-left text-gray-900">Důvod</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3 text-gray-900">Kontaktní formuláře</td>
                    <td className="border border-gray-300 p-3 text-gray-900">5 let</td>
                    <td className="border border-gray-300 p-3 text-gray-900">Archivace korespondence</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 text-gray-900">Newsletter</td>
                    <td className="border border-gray-300 p-3 text-gray-900">Do odvolání souhlasu</td>
                    <td className="border border-gray-300 p-3 text-gray-900">Aktivní souhlas</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3 text-gray-900">Analytická data</td>
                    <td className="border border-gray-300 p-3 text-gray-900">26 měsíců</td>
                    <td className="border border-gray-300 p-3 text-gray-900">Google Analytics</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 text-gray-900">Cookies</td>
                    <td className="border border-gray-300 p-3 text-gray-900">12 měsíců</td>
                    <td className="border border-gray-300 p-3 text-gray-900">Technické fungování</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Vaše práva */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vaše práva</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Právo na informace</h3>
                <p className="text-sm text-gray-700">Můžete se zeptat, jaké údaje o Vás zpracováváme</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Právo na opravu</h3>
                <p className="text-sm text-gray-700">Můžete požádat o opravu nesprávných údajů</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Právo na výmaz</h3>
                <p className="text-sm text-gray-700">Můžete požádat o smazání Vašich údajů</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Právo na přenositelnost</h3>
                <p className="text-sm text-gray-700">Můžete získat Vaše údaje v strukturovaném formátu</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Právo na omezení</h3>
                <p className="text-sm text-gray-700">Můžete omezit zpracování v určitých případech</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Právo na námitku</h3>
                <p className="text-sm text-gray-700">Můžete vznést námitku proti zpracování</p>
              </div>
            </div>
          </section>

          {/* Žádost o smazání údajů */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Jak požádat o smazání Vašich údajů</h2>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Právo na výmaz osobních údajů (GDPR článek 17)
              </h3>
              <p className="text-gray-700 mb-4">
                V souladu s GDPR a zásadami Meta/Facebook máte právo požádat o úplné smazání 
                všech Vašich osobních údajů, které zpracováváme. Vaši žádost vyřídíme do 30 dnů.
              </p>
              
              <div className="bg-white p-6 rounded-lg border border-red-200">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Podrobný návod a vzory žádostí najdete na dedikované stránce
                  </h4>
                  <Link 
                    href="/data-deletion"
                    className="inline-flex items-center bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Požádat o smazání údajů
                  </Link>
                </div>
              </div>

              <div className="mt-4 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
                <p className="text-sm text-gray-800">
                  <strong>Upozornění:</strong> Po smazání údajů už nebudete dostávat newsletter 
                  ani další komunikaci. Některé údaje mohou být zachovány po zákonně stanovenou 
                  dobu pro archivní účely (např. oficiální korespondence).
                </p>
              </div>
            </div>
          </section>

          {/* Bezpečnost */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bezpečnost údajů</h2>
            <div className="bg-green-50 p-6 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li>• SSL šifrování pro všechny přenosy dat</li>
                <li>• Pravidelné zálohování dat</li>
                <li>• Omezený přístup pouze pro oprávněné osoby</li>
                <li>• Pravidelné bezpečnostní audity</li>
                <li>• Aktualizace bezpečnostních opatření</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies a podobné technologie</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Naše webové stránky používají cookies k zajištění správného fungování 
                a zlepšení uživatelského zážitku.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-600 mb-2">Nezbytné cookies</h3>
                  <p className="text-sm text-gray-700">
                    Zajišťují základní funkčnost webu. Nelze je vypnout.
                  </p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-600 mb-2">Analytické cookies</h3>
                  <p className="text-sm text-gray-700">
                    Pomáhají nám pochopit, jak návštěvníci používají web.
                  </p>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-600 mb-2">Marketingové cookies</h3>
                  <p className="text-sm text-gray-700">
                    Umožňují personalizaci obsahu a reklam.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Třetí strany */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Služby třetích stran</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Google Analytics</h3>
                <p className="text-gray-700">
                  Používáme Google Analytics pro analýzu návštěvnosti. Google může 
                  zpracovávat data podle svých zásad ochrany soukromí.
                </p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Facebook Pixel</h3>
                <p className="text-gray-700">
                  Pro integrace s Facebook stránkami používáme Facebook Pixel 
                  v souladu se zásadami Meta.
                </p>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Hosting</h3>
                <p className="text-gray-700">
                  Naše stránky jsou hostovány u spolehlivých poskytovatelů v EU 
                  s odpovídajícími bezpečnostními certifikacemi.
                </p>
              </div>
            </div>
          </section>

          {/* Kontakt */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kontakt pro otázky ohledně ochrany údajů</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Pokud máte jakékoli otázky ohledně zpracování Vašich osobních údajů 
                nebo chcete uplatnit svá práva, kontaktujte mě:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> pavel.fiser@praha4.cz</p>
                <p><strong>Telefon:</strong> +420 XXX XXX XXX</p>
                <p><strong>Pošta:</strong> Antala Staška 2059/80b, 140 00 Praha 4</p>
              </div>
              <p className="text-gray-700 mt-4">
                <strong>Úřad pro ochranu osobních údajů:</strong><br />
                Pokud si myslíte, že zpracovávám Vaše údaje nezákonně, 
                můžete podat stížnost na <a href="https://www.uoou.cz" className="text-blue-600 hover:underline">www.uoou.cz</a>
              </p>
            </div>
          </section>

          {/* Změny */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Změny těchto zásad</h2>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <p className="text-gray-700">
                Tyto zásady mohou být čas od času aktualizovány. O významných změnách 
                budete informováni prostřednictvím webu nebo e-mailu. Doporučujeme 
                pravidelně kontrolovat tuto stránku.
              </p>
              <p className="text-gray-700 mt-3">
                <strong>Datum poslední aktualizace:</strong> 26. června 2025
              </p>
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2025 Pavel Fišer - Zastupitel Praha 4. Všechna práva vyhrazena.
          </p>
          <div className="mt-4 space-x-6">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Hlavní stránka
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
              Podmínky použití
            </Link>
            <a href="mailto:pavel.fiser@praha4.cz" className="text-gray-400 hover:text-white transition-colors">
              Kontakt
            </a>
          </div>
        </div>
      </footer>
      </div>
    </>
  )
}
