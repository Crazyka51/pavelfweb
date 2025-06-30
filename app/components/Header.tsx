"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function Header() {

  return (
    <motion.header
      className="sticky top-0 z-50 backdrop-blur-md border-b border-slate-800"
      style={{ backgroundColor: 'rgba(2, 9, 23, 0.95)' }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Pavel Fišer</span>
            <span className="text-xl font-bold text-white">Pavel Fišer</span>
          </Link>
        </div>
        <div className="flex gap-x-12">
          <Link
            href="#priority"
            className="text-sm font-semibold leading-6 text-gray-300 hover:text-blue-400 transition-colors"
          >
            Priority
          </Link>
          <Link
            href="#about"
            className="text-sm font-semibold leading-6 text-gray-300 hover:text-blue-400 transition-colors"
          >
            O mně
          </Link>
          <Link
            href="#contact"
            className="text-sm font-semibold leading-6 text-gray-300 hover:text-blue-400 transition-colors"
          >
            Kontakt
          </Link>
        </div>
      </nav>
    </motion.header>
  )
}
