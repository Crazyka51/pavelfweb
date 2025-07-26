"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, CheckCircle, Clock, ArrowRight, Euro, Wrench } from "lucide-react"

export default function Projects() {
  const projects = [
    {
      id: 1,
      title: "Rekonstrukce dětského hřiště na Pankráci",
      description: "Kompletní obnova dětského hřiště s moderními herními prvky, bezpečným povrchem a novým mobiliářem.",
      location: "Pankrác, Praha 4",
      budget: "2,5 mil. Kč",
      startDate: "2024-03-01",
      endDate: "2024-10-15",
      status: "completed",
      category: "Infrastruktura",
      impact: "Více než 200 rodin s dětmi",
      images: ["/placeholder.svg"],
      highlights: [
        "Nové bezpečné herní prvky",
        "Bezbariérový přístup",
        "Odpočinková zóna pro rodiče",
        "Nové osvětlení",
      ],
    },
    {
      id: 2,
      title: "Rozšíření cyklostezek Pankrác - Michle",
      description: "Propojení stávajících cyklostezek pro bezpečnější a pohodlnější cyklistickou dopravu.",
      location: "Pankrác - Michle",
      budget: "4,2 mil. Kč",
      startDate: "2024-11-01",
      endDate: "2025-06-30",
      status: "in-progress",
      category: "Doprava",
      impact: "Tisíce cyklistů denně",
      images: ["/placeholder.svg"],
      highlights: ["3,2 km nových cyklostezek", "Bezpečné křižovatky", "Odpočívadla a stojany", "Propojení s MHD"],
    },
    {
      id: 3,
      title: "Modernizace veřejného osvětlení",
      description: "Výměna starého osvětlení za úsporné LED technologie s chytrým řízením.",
      location: "Celá Praha 4",
      budget: "8,5 mil. Kč",
      startDate: "2024-12-01",
      endDate: "2025-12-31",
      status: "planned",
      category: "Životní prostředí",
      impact: "Všichni obyvatelé Prahy 4",
      images: ["/placeholder.svg"],
      highlights: ["60% úspora energie", "Lepší kvalita osvětlení", "Chytré řízení", "Snížení světelného smogu"],
    },
    {
      id: 4,
      title: "Komunitní centrum pro seniory",
      description: "Nové centrum s programy pro aktivní stárnutí, zdravotní péči a společenské aktivity.",
      location: "Budějovická, Praha 4",
      budget: "12 mil. Kč",
      startDate: "2024-08-01",
      endDate: "2024-12-20",
      status: "in-progress",
      category: "Sociální služby",
      impact: "Více než 500 seniorů",
      images: ["/placeholder.svg"],
      highlights: ["Bezbariérové prostory", "Zdravotní poradna", "Společenské aktivity", "Vzdělávací programy"],
    },
  ]

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return {
          label: "Dokončeno",
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
        }
      case "in-progress":
        return {
          label: "Probíhá",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Wrench className="w-4 h-4" />,
        }
      case "planned":
        return {
          label: "Plánováno",
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: <Clock className="w-4 h-4" />,
        }
      default:
        return {
          label: "Neznámý",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: <Clock className="w-4 h-4" />,
        }
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Infrastruktura: "bg-blue-500",
      Doprava: "bg-green-500",
      "Životní prostředí": "bg-emerald-500",
      "Sociální služby": "bg-purple-500",
    }
    return colors[category as keyof typeof colors] || "bg-gray-500"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("cs-CZ", {
      year: "numeric",
      month: "long",
    })
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <Wrench className="w-4 h-4 mr-2" />
              Konkrétní projekty
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Projekty, které <span className="text-blue-600">měním realitu</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Zde jsou konkrétní projekty, které jsem inicioval nebo na kterých aktivně pracuji. Každý projekt má jasný
              cíl, rozpočet a termín dokončení.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {projects.map((project, index) => {
              const statusInfo = getStatusInfo(project.status)

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                    <div className="relative">
                      <img
                        src={project.images[0] || "/placeholder.svg"}
                        alt={project.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 left-4 flex space-x-2">
                        <Badge className={statusInfo.color}>
                          {statusInfo.icon}
                          <span className="ml-1">{statusInfo.label}</span>
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(project.category)}`}></div>
                          <Badge variant="outline" className="bg-white/90">
                            {project.category}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-gray-900 mb-2">{project.title}</CardTitle>
                      <p className="text-gray-600 leading-relaxed">{project.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Základní informace */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Euro className="w-4 h-4 mr-2 text-green-500" />
                          <span>{project.budget}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                          <span>{formatDate(project.startDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-orange-500" />
                          <span>{project.impact}</span>
                        </div>
                      </div>

                      {/* Klíčové body */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Klíčové výhody:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {project.highlights.map((highlight, highlightIndex) => (
                            <div key={highlightIndex} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{highlight}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress bar pro probíhající projekty */}
                      {project.status === "in-progress" && (
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Průběh projektu</span>
                            <span>65%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                        </div>
                      )}

                      <Button variant="outline" className="w-full group bg-transparent">
                        Více informací
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
              <CardContent className="p-8 md:p-12">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Máte nápad na nový projekt?</h3>
                <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                  Pokud máte návrh na projekt, který by zlepšil život v naší městské části, rád si s vámi o něm
                  promluvím. Společně můžeme najít způsob, jak ho realizovat.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Napište mi nápad
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Konzultační hodiny
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
