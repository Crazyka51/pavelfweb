'use client'

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Bc. Pavel Fišer</h3>
            <p className="text-blue-200 mb-4">
              Zastupitel MČ Praha 4<br />
              Manažer s vášní pro komunitní rozvoj
            </p>
            <p className="text-blue-200">© {new Date().getFullYear()} Bc. Pavel Fišer. Všechna práva vyhrazena.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Rychlé odkazy</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-blue-200 hover:text-white transition-colors">
                  O mně
                </Link>
              </li>
              <li>
                <Link href="#priority" className="text-blue-200 hover:text-white transition-colors">
                  Priority
                </Link>
              </li>
              <li>
                <Link href="#projects" className="text-blue-200 hover:text-white transition-colors">
                  Projekty
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-blue-200 hover:text-white transition-colors">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Užitečné odkazy</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.praha4.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  MČ Praha 4
                </a>
              </li>
              <li>
                <a
                  href="https://www.praha.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  Hlavní město Praha
                </a>
              </li>
              <li>
                <a
                  href="https://www.anobudelip.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-200 hover:text-white transition-colors"
                >
                  ANO 2011
                </a>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-blue-200 hover:text-white transition-colors">
                  Ochrana osobních údajů
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-blue-200 hover:text-white transition-colors">
                  Podmínky použití
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="text-blue-200 hover:text-white transition-colors">
                  Smazání údajů
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    // Dispatch custom event to open cookie preferences
                    window.dispatchEvent(new CustomEvent('openCookiePreferences'))
                  }}
                  className="text-blue-200 hover:text-white transition-colors text-left"
                >
                  Nastavení cookies
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-blue-300 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Bc. Pavel Fišer. Všechna práva vyhrazena.
          </p>
          <div className="flex space-x-6">
            <a 
              href="https://www.facebook.com/profile.php?id=61574874071299" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-white"
            >
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a href="#" className="text-blue-300 hover:text-white">
              <span className="sr-only">X</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
