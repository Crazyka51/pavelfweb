"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Příklad použití editovatelných textů v client-side komponentě
export default function HeroEditable() {
  const [texts, setTexts] = useState({
    badge: "Zastupitel MČ Praha 4",
    title: "Bc. Pavel Fišer",
    description: "Manažer s vášní pro komunitní rozvoj a zlepšování kvality života v Praze 4",
    buttonText: "Kontaktujte mě",
    linkText: "Moje priority",
    cardTitle: "Otec čtyř dětí",
    cardText: "Rozumím potřebám rodin"
  });

  useEffect(() => {
    // Načíst texty z API pro komponentu "hero"
    fetch('/api/texts?component=hero')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const textMap: Record<string, string> = {};
          data.data.forEach((t: any) => {
            textMap[t.textKey] = t.value;
          });
          // Sloučit načtené texty s výchozími hodnotami
          setTexts(prev => ({ ...prev, ...textMap }));
        }
      })
      .catch(err => {
        console.error('Error loading editable texts:', err);
        // Pokud se nepodaří načíst, použijí se výchozí hodnoty
      });
  }, []);

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
            {texts.badge}
          </motion.div>
          <motion.h1
            className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {texts.title}
          </motion.h1>
          <motion.p
            className="mt-6 text-xl leading-8 text-blue-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {texts.description}
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
              {texts.buttonText}
            </a>
            <a href="#priority" className="text-sm font-semibold leading-6 text-white group">
              {texts.linkText}{" "}
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
              <p className="font-bold">{texts.cardTitle}</p>
              <p className="text-sm">{texts.cardText}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
