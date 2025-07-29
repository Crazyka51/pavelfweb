"use client"

import { motion } from "framer-motion"

export default function Introduction() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600 mb-6">Vítejte</h2>
          <p className="text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto mb-6">
            Vítejte na stránkách Bc. Pavla Fišera, zastupitele MČ Praha 4 a manažera, který je odhodlán zlepšovat
            kvalitu života ve své komunitě.
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Moje dlouholeté zkušenosti jako rodiče čtyř dětí mě vedly k zaměření na řešení problémů, jež ovlivňují
            každodenní život obyvatel městské části Praha 4. Dobře rozumím výzvám, kterým čelí rodiny, senioři i další
            skupiny obyvatel, a přináším praktická řešení založená na skutečných potřebách komunity.
          </p>
          <div className="quote max-w-2xl mx-auto text-gray-700 italic text-lg border-l-4 border-blue-600 pl-4 my-4">
            &ldquo;Mým cílem je vytvořit z Prahy 4 místo, kde se všichni obyvatelé cítí bezpečně, kde mají děti prostor pro
            zdravý rozvoj a kde senioři mohou důstojně a aktivně trávit svůj čas.&rdquo;
          </div>
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <a href="#about" className="inline-flex items-center px-6 py-3 rounded-full bg-blue-600 text-white font-semibold transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50">
              Více o mně
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
