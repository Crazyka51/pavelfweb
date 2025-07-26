"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, AlertCircle, Bell, Users, Calendar, Shield } from "lucide-react"

export default function NewsletterSubscribe() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [gdprConsent, setGdprConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [submitMessage, setSubmitMessage] = useState("")

  const interestOptions = [
    { id: "projects", label: "Nové projekty a investice", icon: "🏗️" },
    { id: "transport", label: "Doprava a mobilita", icon: "🚌" },
    { id: "environment", label: "Životní prostředí", icon: "🌱" },
    { id: "culture", label: "Kultura a sport", icon: "🎭" },
    { id: "meetings", label: "Konzultační hodiny", icon: "📅" },
    { id: "safety", label: "Bezpečnost", icon: "🛡️" },
  ]

  const benefits = [
    {
      icon: <Bell className="w-5 h-5" />,
      title: "Včasné informace",
      description: "Buďte první, kdo se dozví o nových projektech",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Pozvánky na akce",
      description: "Získejte pozvánky na veřejná setkání a diskuze",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Měsíční přehled",
      description: "Pravidelný souhrn mé práce a dosažených výsledků",
    },
  ]

  const handleInterestChange = (interestId: string, checked: boolean) => {
    if (checked) {
      setInterests((prev) => [...prev, interestId])
    } else {
      setInterests((prev) => prev.filter((id) => id !== interestId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gdprConsent) {
      setSubmitStatus("error")
      setSubmitMessage("Prosím, potvrďte souhlas se zpracováním osobních údajů.")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      const response = await fetch("/api/admin/newsletter/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: name || null,
          interests,
          source: "website",
          gdpr_consent: gdprConsent,
        }),
      })

      if (response.ok) {
        setSubmitStatus("success")
        setSubmitMessage("Děkuji za přihlášení! Brzy vám pošlu první newsletter.")
        setEmail("")
        setName("")
        setInterests([])
        setGdprConsent(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || "Chyba při přihlašování")
      }
    } catch (error: any) {
      setSubmitStatus("error")
      setSubmitMessage(error.message || "Omlouváme se, přihlášení se nezdařilo. Zkuste to prosím později.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Mail className="w-4 h-4 mr-2" />
              Newsletter
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Zůstaňte <span className="text-blue-600">v obraze</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Přihlaste se k odběru mého newsletteru a získejte pravidelné informace o mé práci, nových projektech a
              důležitých událostech v Praze 4.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center space-x-2">
                <Mail className="w-6 h-6 text-blue-600" />
                <span>Přihlášení k odběru</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="vas@email.cz"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Jméno (volitelné)</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Vaše jméno"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Co vás zajímá? (volitelné)</Label>
                  <p className="text-sm text-gray-600 mb-4">Vyberte témata, o kterých chcete dostávat informace</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {interestOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={option.id}
                          checked={interests.includes(option.id)}
                          onCheckedChange={(checked) => handleInterestChange(option.id, checked as boolean)}
                        />
                        <Label htmlFor={option.id} className="flex items-center space-x-2 cursor-pointer flex-1">
                          <span>{option.icon}</span>
                          <span className="text-sm">{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Checkbox id="gdpr" checked={gdprConsent} onCheckedChange={setGdprConsent} required />
                  <div className="flex-1">
                    <Label htmlFor="gdpr" className="text-sm cursor-pointer">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Souhlasím se zpracováním osobních údajů pro účely zasílání newsletteru. Souhlas mohu kdykoli
                      odvolat. *
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      Vaše údaje nebudou předány třetím stranám a budou použity pouze pro zasílání newsletteru.
                    </p>
                  </div>
                </div>

                {submitStatus === "success" && (
                  <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">{submitMessage}</span>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{submitMessage}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || !email || !gdprConsent}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Přihlašuji...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Přihlásit se k odběru
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      Bez spamu
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Kdykoli se odhlaste
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      GDPR compliant
                    </Badge>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Již více než 500 občanů odebírá můj newsletter a zůstává tak v obraze o dění v Praze 4.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
