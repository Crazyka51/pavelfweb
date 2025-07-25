import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-100 px-4 py-12 text-center dark:bg-gray-950">
      <div className="max-w-md space-y-4">
        <h1 className="text-6xl font-bold tracking-tighter text-gray-900 dark:text-gray-50">404</h1>
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Stránka nenalezena</p>
        <p className="text-gray-500 dark:text-gray-400">
          Je nám líto, ale stránka, kterou hledáte, neexistuje. Možná byla přesunuta nebo odstraněna.
        </p>
        <Link href="/">
          <Button className="mt-6">Zpět na hlavní stránku</Button>
        </Link>
      </div>
    </div>
  )
}
