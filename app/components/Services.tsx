"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, TreePine, Building, Shield, GraduationCap, Heart, Users, Lightbulb, CheckCircle } from "lucide-react"

export default function Services() {
  const priorities = [
    {
      icon: <Car className="w-8 h-8" />,
      title: "Doprava a mobilita",
      description: "Zlepšení dopravní situace, rozšíření cyklostezek a podpora veřejné dopravy",
      achievements: [
        "Nová pravidla pro rezidentní parkování",
        "Posílení autobusových linek",
        "Plán nových cyklostezek",
      ],
      status: "active",
      color: "blue",
    },
    {
      icon: <TreePine className="w-8 h-8" />,
      title: "Životní prostředí",
      description: "Ochrana zeleně, zlepšení kvality ovzduší a podpora udržitelného rozvoje",
      achievements: ["Pilotní projekt třídění odpadu", "Výsadba nových stromů", "LED osvětlení"],
      status: "active",
      color: "green",
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Rozvoj městské části",
      description: "Moderní infrastruktura, kvalitní veřejné prostory a podpora bydlení",
      achievements: ["Rekonstrukce dětských hřišť", "Modernizace veřejných prostorů", "Podpora dostupného bydlení"],
      status: "planning",
      color: "orange",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bezpečnost",
      description: "Zvýšení bezpečnosti občanů, prevence kriminality a podpora městské policie",
      achievements: ["Rozšíření kamerového systému", "Více strážníků v ulicích", "Bezpečné školní cesty"],
      status: "active",
      color: "red",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Vzdělávání a kultura",
      description: "Podpora škol, kulturních akcí a celoživotního vzdělávání",
      achievements: ["Dotace pro kulturní organizace", "Podpora školních projektů", "Komunitní centrum"],
      status: "active",
      color: "purple",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Sociální služby",
      description: "Péče o seniory, podporu rodin s dětmi a pomoc potřebným",
      achievements: ["Bezbariérové úpravy", "Programy pro seniory", "Podpora rodin"],
      status: "active",
      color: "pink",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      green: "bg-green-100 text-green-600 border-green-200",
      orange: "bg-orange-100 text-orange-600 border-orange-200",
      red: "bg-red-100 text-red-600 border-red-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      pink: "bg-pink-100 text-pink-600 border-pink-200",
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Aktivně řeším</Badge>
      case "planning":
        return <Badge className="bg-blue-100 text-blue-800">Plánovám</Badge>
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Dokončeno</Badge>
      default:
        return null
    }
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              Moje priority
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Na čem <span className="text-blue-600">pracuji</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Jako zastupitel se zaměřuji na klíčové oblasti, které ovlivňují kvalitu života v naší městské části. Zde
              jsou moje hlavní priority a dosažené výsledky.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {priorities.map((priority, index) => (
              <motion.div
                key={priority.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center ${getColorClasses(priority.color)}`}
                      >
                        {priority.icon}
                      </div>
                      {getStatusBadge(priority.status)}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">{priority.title}</CardTitle>
                    <p className="text-gray-600 leading-relaxed">{priority.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                        Konkrétní výsledky:
                      </h4>
                      {priority.achievements.map((achievement, achievementIndex) => (
                        <div key={achievementIndex} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-8 md:p-12">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="flex items-center justify-center mb-6">
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Máte nápad nebo problém?</h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Vaše podněty jsou pro mou práci klíčové. Pokud máte návrh na zlepšení nebo potřebujete pomoc s
                    řešením problému, neváhejte se na mě obrátit.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">📧</span>
                      <span>pavel.fiser@praha4.cz</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">📅</span>
                      <span>Konzultace každý 1. čtvrtek</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Target({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="6"></circle>
      <circle cx="12" cy="12" r="2"></circle>
    </svg>
  )
}
