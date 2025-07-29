"use client"

import { motion } from "framer-motion"

export default function AboutMe() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
      <div className="container mx-auto">
        <motion.h2
          className="text-5xl font-black mb-8 text-center text-blue-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          O mně
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h3 className="text-3xl font-bold mb-4 text-blue-700">Osobní Přístup a Praktické Řešení</h3>
            <p className="text-gray-700 mb-6">
             Chápu potřeby rodin a dětí, seniorů i širší komunity, protože jsem sám jako otec čelil mnohým z těchto výzev. 
             Ať už jde o nedostatek míst ve školkách, zlepšení kvality výuky, bezpečnost dětských hřišť nebo dostupné volnočasové aktivity, přináším preventivní přístup zaměřený na skutečné výsledky.
            </p>
            <p className="text-gray-700 mb-6">
              Vystudoval jsem bakalářský obor v oblasti managementu, což mi dává potřebné znalosti pro efektivní řízení
              projektů a týmů. Tyto dovednosti nyní využívám ve prospěch obyvatel Prahy 4, kde se snažím o systematické
              a efektivní řešení problémů.
            </p>
            <div className="quote">
              Chci, aby Praha 4 byla místem, kde budou obyvatelé pyšní na svůj domov, kde se děti mohou bezpečně
              rozvíjet a senioři cítí, že jsou nedílnou součástí naší komunity.&quot;
            </div>
          </motion.div>
          <motion.div
            className="relative h-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h4 className="text-2xl font-bold text-blue-700 mb-4">Vzdělání a zkušenosti</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-gray-900">Manažerské zkušenosti</strong>
                    <p className="text-gray-600">
                      Dlouholeté zkušenosti s vedením týmů a řízením projektů v soukromém sektoru
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-gray-900">Otec čtyř dětí</strong>
                    <p className="text-gray-600">
                      Praktické zkušenosti s výzvami, kterým čelí rodiny s dětmi v Praze 4
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-1">
                    <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-gray-900">Zastupitel MČ Praha 4</strong>
                    <p className="text-gray-600">
                      Aktivní zapojení do komunální politiky s cílem zlepšit život v naší městské části
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          {/*
          <div className="absolute -bottom-6 -right-6 bg-blue-700 text-white p-4 rounded-lg shadow-lg">
            <p className="font-bold">Člen hnutí ANO</p>
            <p className="text-sm">Komunální politika jako služba občanům</p>
          </div>
          */}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
