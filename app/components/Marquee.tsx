"use client"

import { motion } from "framer-motion"

export default function Marquee() {
  const achievements = [
    "✅ Rekonstrukce dětského hřiště za 2,5 mil. Kč",
    "🚴‍♂️ Nové cyklostezky Pankrác - Michle",
    "🅿️ Zjednodušení rezidentního parkování",
    "🌳 Pilotní projekt třídění odpadu",
    "🚌 Posílení autobusových linek",
    "💡 Modernizace LED osvětlení",
    "👥 Komunitní centrum pro seniory",
    "🎭 Dotace pro kulturní organizace",
    "🛡️ Rozšíření kamerového systému",
    "🏫 Podpora školních projektů",
  ]

  return (
    <section className="py-12 bg-blue-600 overflow-hidden">
      <div className="relative">
        <motion.div
          className="flex space-x-8 whitespace-nowrap"
          animate={{
            x: [0, -2000],
          }}
          transition={{
            x: {
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
        >
          {/* Duplikujeme obsah pro plynulý loop */}
          {[...achievements, ...achievements].map((achievement, index) => (
            <div key={index} className="flex items-center space-x-2 text-white text-lg font-medium">
              <span>{achievement}</span>
              <span className="text-blue-200 mx-4">•</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
