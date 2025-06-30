import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Podmínky použití | Pavel Fišer - Zastupitel Praha 4',
  description: 'Podmínky použití webových stránek a služeb Pavla Fišera, zastupitele Prahy 4.',
  robots: 'index, follow',
  openGraph: {
    title: 'Podmínky použití | Pavel Fišer',
    description: 'Podmínky použití webových stránek a služeb Pavla Fišera, zastupitele Prahy 4.',
    url: 'https://fiserpavel.cz/terms-of-service',
    siteName: 'Pavel Fišer - Zastupitel MČ Praha 4',
    images: [
      {
        url: '/og-terms.svg',
        width: 1200,
        height: 630,
        alt: 'Podmínky použití - Pavel Fišer',
      },
    ],
    locale: 'cs_CZ',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Podmínky použití | Pavel Fišer',
    description: 'Podmínky použití webových stránek a služeb Pavla Fišera, zastupitele Prahy 4.',
    images: ['/og-terms.svg'],
  },
}

export default function TermsOfServicePage() {
  return (
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
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Podmínky použití
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
              <Scale className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Úvodní ustanovení</h2>
            </div>
            <div className="prose prose-lg text-gray-700">
              <p>
                Vítejte na webových stránkách Pavla Fišera, zastupitele městské části Praha 4. 
                Tyto podmínky použití upravují pravidla pro používání těchto webových stránek 
                a souvisejících služeb.
              </p>
              <p>
                Používáním těchto stránek souhlasíte s těmito podmínkami. Pokud s nimi nesouhlasíte, 
                prosím stránky nepoužívajte.
              </p>
            </div>
          </section>

          {/* Definice */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Definice pojmů</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <dl className="space-y-4">
                <div>
                  <dt className="font-semibold text-gray-900">Webové stránky</dt>
                  <dd className="text-gray-700">Tyto internetové stránky a všechny jejich podstránky</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Uživatel</dt>
                  <dd className="text-gray-700">Osoba, která navštěvuje nebo používá tyto webové stránky</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Obsah</dt>
                  <dd className="text-gray-700">Veškeré informace, texty, obrázky, videa a další materiály na stránkách</dd>
                </div>
                <div>
                  <dt className="font-semibold text-gray-900">Služby</dt>
                  <dd className="text-gray-700">Všechny funkce a služby dostupné prostřednictvím těchto stránek</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Pravidla použití */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Pravidla používání</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-3">Povolené použití</h3>
                <ul className="text-green-700 space-y-2">
                  <li>• Osobní a nekomerční použití</li>
                  <li>• Získávání informací o činnosti zastupitele</li>
                  <li>• Kontaktování prostřednictvím formulářů</li>
                  <li>• Sdílení obsahu se souhlasem</li>
                  <li>• Přihlášení k newsletteru</li>
                </ul>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-3">Zakázané použití</h3>
                <ul className="text-red-700 space-y-2">
                  <li>• Komerční využití bez souhlasu</li>
                  <li>• Šíření nepravdivých informací</li>
                  <li>• Napadání nebo harašení</li>
                  <li>• Porušování autorských práv</li>
                  <li>• Hackování nebo poškozování</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Autorská práva */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Autorská práva a duševní vlastnictví</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Obsah stránek</h3>
                <p className="text-gray-700">
                  Veškerý obsah těchto stránek, včetně textů, fotografií, grafiky a designu, 
                  je chráněn autorským právem a patří Pavlu Fišerovi nebo třetím stranám, 
                  které poskytly souhlas k použití.
                </p>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Veřejné informace</h3>
                <p className="text-gray-700">
                  Informace o činnosti zastupitele, usneseních a veřejných dokumentech 
                  mohou být volně sdíleny v souladu se zákonem o svobodném přístupu k informacím.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Použití obsahu třetích stran</h3>
                <p className="text-gray-700">
                  Některé prvky mohou pocházet od třetích stran (fotografie, ikony, fonty). 
                  Jejich použití se řídí příslušnými licencemi.
                </p>
              </div>
            </div>
          </section>

          {/* Odpovědnost */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Omezení odpovědnosti</h2>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Přesnost informací:</strong> Snažím se udržovat informace aktuální a přesné, 
                  ale nemohu garantovat úplnou přesnost všech údajů.
                </p>
                <p>
                  <strong>Dostupnost služeb:</strong> Stránky mohou být dočasně nedostupné z důvodu 
                  údržby, technických problémů nebo jiných okolností.
                </p>
                <p>
                  <strong>Externí odkazy:</strong> Nejsem odpovědný za obsah externích stránek, 
                  na které odkazuji.
                </p>
                <p>
                  <strong>Uživatelský obsah:</strong> Za obsah zpráv a komentářů uživatelů 
                  odpovídají samotní uživatelé.
                </p>
              </div>
            </div>
          </section>

          {/* Ochrana soukromí */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ochrana soukromí</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Zpracování osobních údajů se řídí našimi 
                <Link href="/privacy-policy" className="text-blue-600 hover:underline font-semibold"> 
                  Zásadami ochrany osobních údajů
                </Link>.
              </p>
              <div className="space-y-2 text-gray-700">
                <p>• Respektujeme vaše soukromí</p>
                <p>• Dodržujeme GDPR a české zákony</p>
                <p>• Neznožujeme vaše údaje třetím stranám bez souhlasu</p>
                <p>• Používáme bezpečnostní opatření</p>
              </div>
            </div>
          </section>

          {/* Komunikace */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Elektronická komunikace</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Kontaktní formuláře</h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Určeny pro oficiální komunikaci</li>
                  <li>• Odpověď do 7 pracovních dnů</li>
                  <li>• Archivace podle zákona</li>
                  <li>• Možnost anonymní komunikace</li>
                </ul>
              </div>
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Newsletter</h3>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• Dobrovolné přihlášení</li>
                  <li>• Možnost odhlášení kdykoli</li>
                  <li>• Informace o činnosti zastupitele</li>
                  <li>• Maximálně 1x týdně</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Technické požadavky */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Technické požadavky</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="space-y-3 text-gray-700">
                <p><strong>Podporované prohlížeče:</strong> Chrome, Firefox, Safari, Edge (aktuální verze)</p>
                <p><strong>JavaScript:</strong> Pro plnou funkčnost je vyžadován JavaScript</p>
                <p><strong>Cookies:</strong> Některé funkce vyžadují cookies</p>
                <p><strong>Mobilní zařízení:</strong> Stránky jsou optimalizovány pro mobilní telefony a tablety</p>
              </div>
            </div>
          </section>

          {/* Změny podmínek */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Změny podmínek použití</h2>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-3">
                Vyhrazuji si právo tyto podmínky kdykoli změnit. O významných změnách 
                budete informováni prostřednictvím:
              </p>
              <ul className="text-gray-700 space-y-1">
                <li>• Oznámení na hlavní stránce</li>
                <li>• E-mailového upozornění (pro odběratele newsletteru)</li>
                <li>• Aktualizace data "Poslední aktualizace"</li>
              </ul>
              <p className="text-gray-700 mt-3">
                Pokračováním v používání stránek po změnách vyjadřujete souhlas s novými podmínkami.
              </p>
            </div>
          </section>

          {/* Řešení sporů */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Řešení sporů</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Mimosoudní řešení</h3>
                <p className="text-gray-700">
                  Snažíme se všechny spory řešit smírně. Kontaktujte mě na 
                  pavel.fiser@praha4.cz pro vyřešení problémů.
                </p>
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Soudní řešení</h3>
                <p className="text-gray-700">
                  V případě sporů je příslušný soud v České republice podle obecných pravidel 
                  o místní příslušnosti. Řídí se českým právem.
                </p>
              </div>
            </div>
          </section>

          {/* Kontakt */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Kontaktní informace</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                Pro otázky ohledně těchto podmínek použití mě kontaktujte:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Jméno:</strong> Pavel Fišer</p>
                <p><strong>Funkce:</strong> Zastupitel městské části Praha 4</p>
                <p><strong>Email:</strong> pavel.fiser@praha4.cz</p>
                <p><strong>Adresa:</strong> Antala Staška 2059/80b, 140 00 Praha 4</p>
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
              Ochrana soukromí
            </Link>
            <a href="mailto:pavel.fiser@praha4.cz" className="text-gray-400 hover:text-white transition-colors">
              Kontakt
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
