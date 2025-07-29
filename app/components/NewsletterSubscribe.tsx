"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../components/ui/form"

const formSchema = z.object({
  email: z.string().email({ message: "Zadejte platnou e-mailovou adresu." }),
})

export default function NewsletterSubscribe() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: values.email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ text: data.message, type: 'success' })
        form.reset()
      } else {
        setMessage({ text: data.message, type: 'error' })
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setMessage({ 
        text: 'Chyba při přihlašování k odběru. Zkuste to prosím později.', 
        type: 'error' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-blue-700 py-20 text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Buďte informováni</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Přihlaste se k odběru novinek o dění v Praze 4 a mých aktivitách jako zastupitele. Budu Vás pravidelně
            informovat o projektech, iniciativách a událostech, které mohou ovlivnit život v naší městské části.
          </p>
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <h3 className="text-xl font-bold text-blue-700 mb-4">Odběr novinek</h3>
            
            {/* Success/Error message */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Zadejte váš e-mail" {...field} className="rounded-full" />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full rounded-full bg-blue-700 hover:bg-blue-800"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Přihlašování..." : "Přihlásit k odběru"}
                </Button>
              </form>
            </Form>
            <p className="text-gray-500 text-xs mt-4 text-center">
              Vaše osobní údaje budou zpracovány v souladu s GDPR. Odběr můžete kdykoliv zrušit.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
