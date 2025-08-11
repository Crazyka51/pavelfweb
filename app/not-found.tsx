import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <h2 className="text-2xl font-semibold text-gray-600 mt-4">Stránka nenalezena</h2>
      <p className="text-gray-500 mt-2">Omlouváme se, ale stránka, kterou hledáte, neexistuje.</p>
      <Link href="/" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        Vrátit se na hlavní stránku
      </Link>
    </div>
  );
}
