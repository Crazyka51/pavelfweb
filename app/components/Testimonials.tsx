"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import type { Testimonial } from "@/lib/types"
import Image from "next/image"

interface TestimonialsProps {
  testimonials?: Testimonial[]
}

const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Jan Novák",
    role: "CEO",
    company: "TechStart s.r.o.",
    content:
      "Pavel vytvořil pro naši společnost úžasnou webovou stránku. Profesionální přístup, rychlá komunikace a výsledek předčil naše očekávání. Určitě doporučuji!",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    featured: true,
    created_at: "2023-10-15",
  },
  {
    id: "2",
    name: "Marie Svobodová",
    role: "Marketing Manager",
    company: "Fashion Boutique",
    content:
      "Spolupráce s Pavlem byla skvělá. Vytvořil nám moderní e-shop, který výrazně zvýšil naše online prodeje. Vřele doporučuji jeho služby.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    featured: true,
    created_at: "2023-09-22",
  },
  {
    id: "3",
    name: "Tomáš Dvořák",
    role: "Majitel",
    company: "Restaurace U Dvořáka",
    content:
      "Pavel nám pomohl s kompletním redesignem webu a nastavením online rezervací. Výsledek je fantastický a zákazníci si pochvalují jednoduchost použití.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    featured: false,
    created_at: "2023-08-10",
  },
  {
    id: "4",
    name: "Anna Procházková",
    role: "Ředitelka",
    company: "Vzdělávací centrum",
    content:
      "Profesionální přístup, kreativní řešení a dodržení termínů. Pavel vytvořil pro naše vzdělávací centrum web, který perfektně reprezentuje naše hodnoty.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    featured: true,
    created_at: "2023-07-05",
  },
  {
    id: "5",
    name: "Petr Krejčí",
    role: "Zakladatel",
    company: "Fitness Studio",
    content:
      "Díky Pavlovi máme moderní web s online rezervačním systémem. Implementace byla rychlá a bezproblémová. Výborná práce!",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    featured: false,
    created_at: "2023-06-18",
  },
  {
    id: "6",
    name: "Lucie Horáková",
    role: "Majitelka",
    company: "Beauty Salon",
    content:
      "Pavel vytvořil krásný a funkční web pro náš salon. Zákazníci si mohou snadno rezervovat termíny online. Jsme velmi spokojeni s výsledkem.",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    featured: false,
    created_at: "2023-05-30",
  },
]

export function Testimonials({ testimonials = defaultTestimonials }: TestimonialsProps) {
  const featuredTestimonials = testimonials.filter((t) => t.featured)
  const regularTestimonials = testimonials.filter((t) => !t.featured)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-5 h-5 ${i < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const TestimonialCard = ({ testimonial, featured = false }: { testimonial: Testimonial; featured?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`
        bg-white rounded-xl shadow-lg p-6 border border-gray-100
        hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1
        ${featured ? "md:col-span-2 lg:col-span-1" : ""}
      `}
    >
      <div className="flex items-center mb-4">
        <Quote className="w-8 h-8 text-blue-500 mr-3" />
        <div className="flex">{renderStars(testimonial.rating)}</div>
      </div>

      <blockquote className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</blockquote>

      <div className="flex items-center">
        <div className="relative w-12 h-12 mr-4">
          <Image
            src={testimonial.avatar || "/placeholder-user.jpg"}
            alt={testimonial.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{testimonial.name}</div>
          <div className="text-sm text-gray-600">
            {testimonial.role} • {testimonial.company}
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Co říkají naši klienti</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Přečtěte si reference od spokojených klientů, kteří důvěřují našim službám
          </p>
        </motion.div>

        {/* Featured testimonials */}
        {featuredTestimonials.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} featured={true} />
            ))}
          </div>
        )}

        {/* Regular testimonials */}
        {regularTestimonials.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        )}

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">5.0</div>
              <div className="flex justify-center mb-2">{renderStars(5)}</div>
              <div className="text-sm text-gray-600">Průměrné hodnocení</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Spokojených klientů</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Referencí</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl font-bold text-orange-600 mb-2">3+</div>
              <div className="text-sm text-gray-600">Roky zkušeností</div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Staňte se dalším spokojeným klientem</h3>
            <p className="text-gray-600 mb-6">
              Kontaktujte nás ještě dnes a začněme společně pracovat na vašem projektu
            </p>
            <a
              href="#contact"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Kontaktovat nás
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
