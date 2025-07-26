"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"

export default function Testimonials() {
  const testimonials = [
    {
      name: "Marie Nováková",
      role: "Obyvatelka Pankráce",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      text: "Pan Fišer se skutečně zajímá o problémy obyčejných lidí. Díky jeho zásahu se podařilo vyřešit dlouhodobý problém s parkováním v naší ulici.",
      date: "Říjen 2024",
    },
    {
      name: "Tomáš Svoboda",
      role: "Místní podnikatel",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      text: "Oceňuji přístup pana Fišera k podpoře místních podnikatelů. Pomohl nám s vyřízením povolení a vždy je ochoten naslouchat našim potřebám.",
      date: "Září 2024",
    },
    {
      name: "Jana Procházková",
      role: "Matka na mateřské",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      text: "Díky panu Fišerovi máme konečně nové dětské hřiště. Moje děti jsou nadšené a já jsem ráda, že máme zastupitele, který myslí na rodiny s dětmi.",
      date: "Listopad 2024",
    },
    {
      name: "Petr Dvořák",
      role: "Senior",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      text: "Pan Fišer je vždy dostupný a ochotný pomoci. Když jsem měl problém s bezbariérovým přístupem, hned se toho ujal a problém vyřešil.",
      date: "Srpen 2024",
    },
    {
      name: "Lucie Kratochvílová",
      role: "Učitelka",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      text: "Jako učitelka oceňuji, že pan Fišer podporuje vzdělávací projekty. Díky jeho podpoře jsme mohli zrealizovat několik zajímavých aktivit pro děti.",
      date: "Červen 2024",
    },
    {
      name: "Martin Krejčí",
      role: "Cyklista",
      avatar: "/placeholder-user.jpg",
      rating: 5,
      text: "Konečně máme zastupitele, který rozumí potřebám cyklistů. Pan Fišer aktivně podporuje rozvoj cyklostezek a bezpečné cyklistické dopravy.",
      date: "Červenec 2024",
    },
  ]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Co říkají občané</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Zpětná vazba od obyvatel Prahy 4, kterým jsem pomohl vyřešit jejich problémy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback>
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600 truncate">{testimonial.role}</p>
                      <div className="flex items-center space-x-1 mt-1">{renderStars(testimonial.rating)}</div>
                    </div>
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-100" />
                    <blockquote className="text-gray-700 italic relative z-10 mb-3">"{testimonial.text}"</blockquote>
                  </div>

                  <div className="text-xs text-gray-500 text-right">{testimonial.date}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="bg-blue-50 border-blue-200 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Chcete se podělit o svou zkušenost?</h3>
                <p className="text-gray-700 mb-4">
                  Pokud jsem vám pomohl vyřešit nějaký problém nebo máte zpětnou vazbu k mé práci, budu rád, když se o
                  ni podělíte.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-600">
                  <span>📧 pavel.fiser@praha4.cz</span>
                  <span>📱 Konzultační hodiny každý 1. čtvrtek</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
