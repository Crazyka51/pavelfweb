"use client"

import { motion } from "framer-motion"

export default function Hero() {
  return (
    <div className="relative isolate overflow-hidden bg-blue-700 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 z-0"></div>
      <div className="mx-auto max-w-7xl px-6 py-24 lg:flex lg:items-center lg:gap-x-10 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg lg:flex-shrink-0">
          <motion.div
            className="mb-6 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-sm font-medium text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Zastupitel MČ Praha 4
          </motion.div>
          <motion.h1
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Bc. Pavel Fišer
          </motion.h1>
          <motion.p
            className="mt-6 text-xl leading-8 text-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Manažer s vášní pro komunitní rozvoj a zlepšování kvality života v Praze 4
          </motion.p>
          <motion.div
            className="mt-10 flex items-center gap-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="#contact"
              className="px-6 py-3 rounded-full bg-white text-blue-700 font-semibold transition-all duration-300 ease-in-out hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Kontaktujte mě
            </a>
            <a href="#priority" className="text-sm font-semibold leading-6 text-white group">
              Moje priority{" "}
              <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </motion.div>
        </div>
        <motion.div
          className="mx-auto mt-16 lg:mt-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="relative">
            <img
              src="/pf.png?height=600&width=600"
              alt="Pavel Fišer"
              width={600}
              height={600}
              className="w-[500px] rounded-2xl shadow-xl ring-1 ring-white/10"
            />
            <div className="absolute -bottom-6 -right-6 bg-white text-blue-700 rounded-lg p-4 shadow-lg">
              <p className="font-bold">Otec čtyř dětí</p>
              <p className="text-sm">Rozumím potřebám rodin</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
