import { ContactForm } from "./ContactForm"
import { MailIcon, PhoneIcon, MapPinIcon, ClockIcon } from "lucide-react"

export function Contact() {
  return (
    <section id="contact" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Kontaktujte nás</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Máte dotaz nebo nápad? Neváhejte nás kontaktovat. Rádi si vyslechneme Vaše podněty.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <MailIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Email</h3>
                <p className="text-gray-500 dark:text-gray-400">info@example.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <PhoneIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Telefon</h3>
                <p className="text-gray-500 dark:text-gray-400">+420 123 456 789</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <MapPinIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Adresa</h3>
                <p className="text-gray-500 dark:text-gray-400">Příkladová ulice 123, 123 45 Praha, Česká republika</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <ClockIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Pracovní doba</h3>
                <p className="text-gray-500 dark:text-gray-400">Po-Pá: 9:00 - 17:00</p>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
