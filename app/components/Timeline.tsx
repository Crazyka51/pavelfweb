"use client"

import { motion } from "framer-motion"

interface TimelineEvent {
  year: string
  title: string
  description: string
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "2020",
    title: "Založení společnosti",
    description:
      "Pavel Fišer založil společnost s vizí poskytovat kvalitní digitální řešení pro malé a střední podniky.",
  },
  {
    year: "2021",
    title: "První velký projekt",
    description:
      "Úspěšně jsme dokončili náš první velký e-commerce projekt, který přinesl klientovi 300% nárůst online prodejů.",
  },
  {
    year: "2022",
    title: "Rozšíření týmu",
    description: "Rozšířili jsme náš tým o specialisty na UX/UI design a digitální marketing.",
  },
  {
    year: "2023",
    title: "Mezinárodní expanze",
    description:
      "Začali jsme spolupracovat s klienty ze zahraničí a rozšířili naše služby o pokročilé SEO optimalizace.",
  },
  {
    year: "2024",
    title: "Inovace a AI",
    description: "Integrovali jsme nejnovější AI technologie do našich řešení a spustili vlastní CMS platformu.",
  },
]

export function Timeline() {
  return (
    <div className="relative">
      <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-0.5 h-full bg-blue-200"></div>

      <div className="space-y-8">
        {timelineEvents.map((event, index) => (
          <motion.div
            key={event.year}
            className={`relative flex items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>

            <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-8" : "md:pl-8"}`}>
              <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="flex items-center mb-2">
                  <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {event.year}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Timeline
