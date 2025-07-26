"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from "lucide-react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "general",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")

  const categories = [
    { value: "general", label: "Obecný dotaz" },
    { value: "transport", label: "Doprava" },
    { value: "environment", label: "Životní prostředí" },
    { value: "culture", label: "Kultura a sport" },
    { value: "housing", label: "Bydlení" },
    { value: "complaint", label: "Stížnost" },
    { value: "suggestion", label: "Návrh na zlepšení" },
  ]

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      content: "pavel.fiser@praha4.cz",
      action: () => window.open("mailto:pavel.fiser@praha4.cz"),
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Telefon",
      content: "+420 123 456 789",
      action: () => window.open("tel:+420123456789"),
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Adresa",
      content: "Úřad MČ Praha 4\nAntala Staška 2059/80b\n140 00 Praha 4",
      action: () => window.open("https://maps.google.com/?q=Antala+Staška+2059/80b,+Praha+4"),
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Konzultační hodiny",
      content: "Každý 1. čtvrtek v měsíci\n17:00 - 19:00\nKomunitní centrum Pankrác",
      action: null,
    },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: "contact",
        }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setSubmitMessage("Děkuji za vaši zprávu! Odpovím vám co nejdříve.")
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          category: "general",
        })
      } else {
        throw new Error("Chyba při odesílání")
      }
    } catch (error) {
      setSubmitStatus("error")
      setSubmitMessage(
        "Omlouváme se, zprávu se nepodařilo odeslat. Zkuste to prosím později nebo mě kontaktujte přímo.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kontakt</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Máte dotaz, návrh nebo potřebujete pomoc? Neváhejte se na mě obrátit. Jsem tu pro vás a rád vám pomohu.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Kontaktní informace */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <span>Kontaktní informace</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg border ${
                        info.action ? "cursor-pointer hover:bg-gray-50" : ""
                      }`}
                      onClick={info.action || undefined}
                    >
                      <div className="text-blue-600 mt-1">{info.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{info.title}</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{info.content}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Rychlá odpověď zaručena</h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Snažím se odpovědět na všechny dotazy do 24 hodin. V naléhavých případech mě neváhejte kontaktovat
                    telefonicky.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      Odpověď do 24h
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Osobní přístup
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Bezplatné poradenství
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kontaktní formulář */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="w-5 h-5 text-blue-600" />
                  <span>Napište mi</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Jméno a příjmení *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Vaše jméno"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="vas@email.cz"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+420 123 456 789"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Kategorie</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Předmět *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="Stručně popište váš dotaz"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Zpráva *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Popište podrobně váš dotaz, návrh nebo problém..."
                    />
                  </div>

                  {submitStatus === "success" && (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">{submitMessage}</span>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">{submitMessage}</span>
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Odesílám...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Odeslat zprávu
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Odesláním souhlasíte se zpracováním osobních údajů pro účely odpovědi na váš dotaz.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
