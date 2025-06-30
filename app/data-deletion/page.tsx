import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail, Globe, Shield, Trash2, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Žádost o smazání údajů | Pavel Fišer - Zastupitel Praha 4',
  description: 'Jednoduchý způsob, jak požádat o smazání vašich osobních údajů v souladu s GDPR a zásadami Meta/Facebook.',
  robots: 'index, follow',
  openGraph: {
    title: 'Žádost o smazání údajů | Pavel Fišer',
    description: 'Jednoduchý způsob, jak požádat o smazání vašich osobních údajů v souladu s GDPR a zásadami Meta/Facebook.',
    url: 'https://fiserpavel.cz/data-deletion',
    siteName: 'Pavel Fišer - Zastupitel MČ Praha 4',
    images: [
      {
        url: '/og-data-deletion.svg',
        width: 1200,
        height: 630,
        alt: 'Žádost o smazání údajů - Pavel Fišer',
      },
    ],
    locale: 'cs_CZ',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Žádost o smazání údajů | Pavel Fišer',
    description: 'Jednoduchý způsob, jak požádat o smazání vašich osobních údajů v souladu s GDPR a zásadami Meta/Facebook.',
    images: ['/og-data-deletion.svg'],
  },
}

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
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
            <Trash2 className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Žádost o smazání osobních údajů
            </h1>
          </div>
          <p className="text-gray-600 mt-2">
            Právo na výmaz podle GDPR a Meta/Facebook zásad
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Úvod */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Vaše právo na smazání údajů</h2>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
              <p className="text-gray-700 mb-4">
                V souladu s <strong>GDPR (článek 17)</strong> a <strong>zásadami Meta/Facebook</strong> 
                máte právo požádat o úplné smazání všech vašich osobních údajů, které zpracováváme.
              </p>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Vaši žádost vyřídíme do <strong>30 dnů</strong> od obdržení</span>
              </div>
            </div>
          </section>

          {/* Co budeme mazat */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Jaké údaje smažeme</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Kontaktní údaje</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Jméno a příjmení</li>
                  <li>• E-mailová adresa</li>
                  <li>• Telefonní číslo</li>
                  <li>• Obsah zpráv</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Newsletter a komunikace</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• E-mail pro newsletter</li>
                  <li>• Komunikační preference</li>
                  <li>• Historie odběru</li>
                </ul>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-900 mb-2">Analytická data</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• IP adresa</li>
                  <li>• Údaje o návštěvách</li>
                  <li>• Cookies preferences</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">Facebook integrace</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Facebook Pixel data</li>
                  <li>• Social media interakce</li>
                  <li>• Sledovací cookies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Způsoby kontaktu */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Jak požádat o smazání</h2>
            <p className="text-gray-700 mb-6">
              Vyberte způsob, který vám vyhovuje. Všechny žádosti mají stejnou právní váhu.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* E-mail */}
              <div className="bg-white border-2 border-red-200 p-6 rounded-lg hover:border-red-300 transition-colors">
                <div className="flex items-center mb-4">
                  <Mail className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">E-mailem</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Nejrychlejší způsob. Odpovídáme obvykle do 24 hodin.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-2">Pošlete e-mail s předmětem:</p>
                  <p className="font-mono text-sm bg-white p-2 rounded border">
                    &quot;Žádost o smazání údajů - GDPR&quot;
                  </p>
                </div>
                <a 
                  href="mailto:pavel.fiser@praha4.cz?subject=Žádost%20o%20smazání%20údajů%20-%20GDPR"
                  className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Odeslat e-mail
                </a>
              </div>

              {/* Pošta */}
              <div className="bg-white border-2 border-red-200 p-6 rounded-lg hover:border-red-300 transition-colors">
                <div className="flex items-center mb-4">
                  <Globe className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Poštou</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Oficiální způsob s potvrzením doručení.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Adresa pro zasílání:</p>
                  <div className="text-sm">
                    <strong>Pavel Fišer</strong><br />
                    Antala Staška 2059/80b<br />
                    140 00 Praha 4<br />
                    <em className="text-gray-500">Poznámka: &quot;Žádost o smazání údajů&quot;</em>
                  </div>
                </div>
              </div>

              {/* Osobně */}
              <div className="bg-white border-2 border-red-200 p-6 rounded-lg hover:border-red-300 transition-colors">
                <div className="flex items-center mb-4">
                  <Shield className="w-8 h-8 text-red-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">Osobně</h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Přímé setkání s okamžitým vyřízením.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Úřední hodiny nebo na objednání:</p>
                  <div className="text-sm">
                    <strong>Úřad MČ Praha 4</strong><br />
                    Antala Staška 2059/80b<br />
                    <em className="text-gray-500">Doporučujeme předchozí domluvu</em>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Co uvést v žádosti */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Co uvést v žádosti</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">Povinné údaje</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Vaše jméno a příjmení</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>E-mailovou adresu pro ověření</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span>Jasné vyjádření &quot;žádám o smazání údajů&quot;</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">Volitelné údaje</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                      <span className="w-4 h-4 border border-blue-400 rounded mt-0.5 mr-2 flex-shrink-0"></span>
                      <span>Konkrétní typ údajů k smazání</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-4 h-4 border border-blue-400 rounded mt-0.5 mr-2 flex-shrink-0"></span>
                      <span>Důvod žádosti</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-4 h-4 border border-blue-400 rounded mt-0.5 mr-2 flex-shrink-0"></span>
                      <span>Preferovaný způsob potvrzení</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Vzor žádosti */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Vzor žádosti</h2>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">E-mailová žádost - vzor</h3>
              <div className="bg-white p-4 rounded border font-mono text-sm text-black shadow-sm">
                <p className="mb-2 text-black"><strong>Předmět:</strong> Žádost o smazání údajů - GDPR</p>
                <hr className="my-3 border-gray-300" />
                <p className="mb-3 text-black">Vážený pane Fišere,</p>
                <p className="mb-3 text-black">
                  na základě článku 17 GDPR (právo na výmaz) žádám o smazání všech 
                  mých osobních údajů, které zpracováváte v souvislosti s:
                </p>
                <p className="mb-3 ml-4 text-black">
                  □ Newsletter<br />
                  □ Kontaktní formuláře<br />
                  □ Facebook integrace<br />
                  □ Všechny moje údaje
                </p>
                <p className="mb-3 text-black">
                  <strong>Moje údaje:</strong><br />
                  Jméno: [Vaše jméno]<br />
                  E-mail: [Váš e-mail]
                </p>
                <p className="mb-3 text-black">
                  Žádám o potvrzení smazání na můj e-mail.
                </p>
                <p className="text-black">
                  Děkuji za vyřízení.<br />
                  [Vaše jméno]
                </p>
              </div>
            </div>
          </section>

          {/* Časový harmonogram */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Jak probíhá vyřízení</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-blue-900">Přijetí žádosti</h3>
                  <p className="text-blue-800 text-sm">Potvrdíme obdržení do 48 hodin</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-yellow-50 rounded-lg">
                <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-yellow-900">Ověření totožnosti</h3>
                  <p className="text-yellow-800 text-sm">Může trvat 1-3 dny podle způsobu kontaktu</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 bg-red-50 rounded-lg">
                <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-red-900">Smazání údajů</h3>
                  <p className="text-red-800 text-sm">Provedeme do 30 dnů a pošleme potvrzení</p>
                </div>
              </div>
            </div>
          </section>

          {/* Upozornění */}
          <section className="mb-8">
            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Důležité upozornění</h3>
                  <ul className="text-yellow-800 space-y-2 text-sm">
                    <li>• Po smazání údajů již nebudete dostávat newsletter ani komunikaci</li>
                    <li>• Některé údaje mohou být zákonně archivovány (oficiální korespondence)</li>
                    <li>• Smazání je <strong>nevratné</strong> - údaje nelze obnovit</li>
                    <li>• Facebook/Meta data budou smazána podle jejich zásad (může trvat až 90 dnů)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Právní odkazy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Právní základ</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">GDPR - Článek 17</h3>
                <p className="text-blue-800 text-sm">
                  Právo na výmaz (&quot;právo být zapomenut&quot;) umožňuje požádat o smazání 
                  osobních údajů za určitých podmínek.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Meta/Facebook politiky</h3>
                <p className="text-purple-800 text-sm">
                  Aplikace používající Facebook API musí poskytovat způsob pro 
                  smazání uživatelských dat.
                </p>
              </div>
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
            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Zásady ochrany údajů
            </Link>
            <Link href="/terms-of-service" className="text-gray-400 hover:text-white transition-colors">
              Podmínky použití
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
