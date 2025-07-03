"use client"

import { motion } from "framer-motion"
import { Users, Shield, Heart, School } from "lucide-react"

const priorities = [
  {
    icon: <Users className="w-12 h-12 mb-4 text-white" />,
    title: "Podpora pro rodiny a děti",
    description:
      "Zajištění kvalitního vzdělávání, bezpečné školní cesty a míst, kde mohou děti aktivně trávit volný čas. Rozšiřování kapacit mateřských škol a zlepšování kvality výuky na základních školách.",
  },
  {
    icon: <Shield className="w-12 h-12 mb-4 text-white" />,
    title: "Bezpečné a klidné prostředí",
    description:
      "Zajištění klidných rezidenčních zón, včetně lepší infrastruktury na sídlištích. Podpora projektů pro zvýšení bezpečnosti, lepší osvětlení a údržbu veřejných prostranství.",
  },
  {
    icon: <Heart className="w-12 h-12 mb-4 text-white" />,
    title: "Zlepšení života seniorů",
    description:
      "Podpora aktivního stárnutí prostřednictvím bohaté nabídky aktivit, které přispívají k jejich pohodě a spokojenosti. Zajištění dostupné zdravotní péče a sociálních služeb pro seniory.",
  },
  {
    icon: <School className="w-12 h-12 mb-4 text-white" />,
    title: "Komunální politika jako služba",
    description:
      "Věřím, že zapojení občanů je klíčem k nalezení efektivních řešení problémů, jež sužují komunitu. Prosazuji transparentní rozhodování a aktivní komunikaci s občany o všech důležitých otázkách.",
  },
]

export default function Priorities() {
  return (
    <section id="priority" className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-700 text-white">
      <div className="container mx-auto">
        <motion.h2
          className="text-5xl font-black mb-6 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Moje Priority
        </motion.h2>
        <motion.p
          className="text-xl text-blue-100 text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Jako zastupitel MČ Praha 4 se zaměřuji na několik klíčových oblastí, které považuji za zásadní pro zlepšení
          kvality života všech obyvatel naší městské části.
        </motion.p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {priorities.map((priority, index) => (
            <motion.div
              key={priority.title}
              className="bg-blue-800 p-6 rounded-lg shadow-lg hover:bg-blue-900 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              {priority.icon}
              <h3 className="text-xl font-bold mb-2 text-white">{priority.title}</h3>
              <p className="text-blue-100">{priority.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
