"use client"

import { motion } from "framer-motion"
import { Calendar, ExternalLink } from "lucide-react"
import type { TimelineEvent } from "@/lib/types"

interface TimelineProps {
  events?: TimelineEvent[]
}

const defaultEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "Založení společnosti",
    description: "Začátek podnikání v oblasti webového vývoje a digitálního marketingu.",
    date: "2020-01-15",
    type: "milestone",
    icon: "🚀",
  },
  {
    id: "2",
    title: "První velký projekt",
    description: "Úspěšné dokončení e-commerce platformy pro významného klienta.",
    date: "2020-06-20",
    type: "achievement",
    icon: "🏆",
  },
  {
    id: "3",
    title: "Rozšíření týmu",
    description: "Přijetí prvních zaměstnanců a rozšíření kapacit.",
    date: "2021-03-10",
    type: "milestone",
    icon: "👥",
  },
  {
    id: "4",
    title: "Certifikace Google Ads",
    description: "Získání oficiální certifikace pro správu reklamních kampaní.",
    date: "2021-09-05",
    type: "education",
    icon: "📜",
  },
  {
    id: "5",
    title: "100+ spokojených klientů",
    description: "Dosažení významného milníku v počtu realizovaných projektů.",
    date: "2022-12-01",
    type: "achievement",
    icon: "🎯",
  },
  {
    id: "6",
    title: "Nové technologie",
    description: "Implementace moderních technologií jako Next.js, TypeScript a AI.",
    date: "2023-08-15",
    type: "project",
    icon: "⚡",
  },
]

const typeColors = {
  milestone: "bg-blue-500",
  achievement: "bg-green-500",
  project: "bg-purple-500",
  education: "bg-orange-500",
}

const typeLabels = {
  milestone: "Milník",
  achievement: "Úspěch",
  project: "Projekt",
  education: "Vzdělání",
}

export function Timeline({ events = defaultEvents }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Naše cesta</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Klíčové momenty a milníky, které nás dovedly tam, kde jsme dnes
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500"></div>

            {sortedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative flex items-start mb-12 last:mb-0"
              >
                {/* Timeline dot */}
                <div
                  className={`
                  relative z-10 flex items-center justify-center w-16 h-16 rounded-full
                  ${typeColors[event.type]} text-white text-2xl font-bold shadow-lg
                  border-4 border-white
                `}
                >
                  {event.icon || "📅"}
                </div>

                {/* Content */}
                <div className="ml-8 flex-1">
                  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`
                        inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                        ${typeColors[event.type]} text-white
                      `}
                      >
                        {typeLabels[event.type]}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(event.date)}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>

                    <p className="text-gray-600 mb-4">{event.description}</p>

                    {event.link && (
                      <a
                        href={event.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Více informací
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">{new Date().getFullYear() - 2020}+</div>
            <div className="text-gray-600">Let zkušeností</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
            <div className="text-gray-600">Spokojených klientů</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">200+</div>
            <div className="text-gray-600">Dokončených projektů</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Podpora</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Timeline
