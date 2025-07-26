"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Award } from "lucide-react"

export default function AboutUs() {
  const achievements = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Zastupitel MČ Praha 4",
      description: "Aktivně se podílím na rozvoji naší městské části",
      year: "2022-současnost",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Člen dopravní komise",
      description: "Zaměřujem se na zlepšení dopravní situace",
      year: "2022-současnost",
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Místní aktivista",
      description: "Dlouhodobě se věnuji komunitním projektům",
      year: "2018-současnost",
    },
  ]

  const priorities = [
    "Zlepšení dopravní situace",
    "Podpora místních podnikatelů",
    "Rozvoj zeleně a parků",
    "Transparentnost radnice",
    "Kvalitní veřejné služby",
    "Bezpečnost občanů",
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O mně</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Jsem Pavel Fišer, zastupitel MČ Praha 4. Věnuji se zlepšování života v naší městské části a prosazuji
              zájmy občanů v zastupitelstvu.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-semibold mb-6">Moje činnost</h3>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600 mt-1">{achievement.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {achievement.year}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm">{achievement.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6">Moje priority</h3>
              <div className="grid gap-3">
                {priorities.map((priority, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Calendar className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pravidelné konzultační hodiny</h3>
                  <p className="text-gray-700 mb-3">
                    Každý první čtvrtek v měsíci od 17:00 do 19:00 v komunitním centru na Pankráci. Můžete se na mě
                    obrátit s jakýmkoliv podnětem nebo problémem.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Komunitní centrum Pankrác
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      1. čtvrtek v měsíci, 17-19h
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
