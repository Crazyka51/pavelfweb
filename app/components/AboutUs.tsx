import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Timeline } from "./Timeline"
import { Testimonials } from "./Testimonials"

export function AboutUs() {
  return (
    <section id="about-us" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">O nás</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Poznejte náš příběh, hodnoty a tým, který stojí za naším úspěchem.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 lg:grid-cols-2 lg:gap-12">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Naše poslání</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-gray-700 dark:text-gray-300">
                Naším posláním je poskytovat inovativní a kvalitní řešení, která pomáhají našim klientům dosahovat
                jejich cílů. Věříme v transparentnost, integritu a neustálé zlepšování. Snažíme se budovat dlouhodobé
                vztahy založené na důvěře a vzájemném respektu.
              </p>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Náš tým</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-user.jpg" alt="Pavel Fišer" />
                  <AvatarFallback>PF</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">Pavel Fišer</h3>
                  <p className="text-gray-500 dark:text-gray-400">Zakladatel & CEO</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    S více než 10 lety zkušeností v oboru, Pavel vede náš tým s vizí a odhodláním.
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-gray-700 dark:text-gray-300">
                Náš tým se skládá z talentovaných profesionálů s vášní pro to, co dělají. Jsme hrdí na naši spolupráci a
                schopnost dodávat výjimečné výsledky.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="py-12">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 sm:text-4xl">Naše historie</h2>
          <Timeline />
        </div>

        <div className="py-12">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-8 sm:text-4xl">Co o nás říkají klienti</h2>
          <Testimonials />
        </div>
      </div>
    </section>
  )
}
