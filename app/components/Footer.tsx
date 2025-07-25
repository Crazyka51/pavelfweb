import Link from "next/link"
import { FacebookIcon, InstagramIcon, LinkedinIcon, TwitterIcon } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Pavel Fišer</h3>
          <p className="text-sm">
            Inovativní řešení pro váš digitální svět. Specializujeme se na vývoj webových aplikací, SEO a digitální marketing.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <FacebookIcon className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <TwitterIcon className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <InstagramIcon className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <LinkedinIcon className="h-6 w-6" />
            </a>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Rychlé odkazy</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/#services" className="hover:text-white transition-colors">
                Služby
              </Link>
            </li>
            <li>
              <Link href="/#projects" className="hover:text-white transition-colors">
                Projekty
              </Link>
            </li>
            <li>
              <Link href="/aktuality" className="hover:text-white transition-colors">
                Aktuality
              </Link>
            </li>
            <li>
              <Link href="/#about-us" className="hover:text-white transition-colors">
                O nás
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="hover:text-white transition-colors">
                Kontakt
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Právní</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Zásady ochrany osobních údajů
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">
                Podmínky služby
              </Link>
            </li>
            <li>
              <Link href="/data-deletion" className="hover:text-white transition-colors">
                Mazání osobních údajů
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Kontakt</h3>
          <p className="text-sm">
            Email: info@pavelfiser.cz
            <br />
            Telefon: +420 123 456 789
          </p>
        </div>
      </div>
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Pavel Fišer. Všechna práva vyhrazena.</p>
      </div>
    </footer>
  )
}
