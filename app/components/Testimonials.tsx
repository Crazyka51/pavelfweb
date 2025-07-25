import type { Testimonial } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StarIcon } from "lucide-react"

interface TestimonialsProps {
  testimonials: Testimonial[]
  featuredTestimonialId?: string
}

export function Testimonials({ testimonials, featuredTestimonialId }: TestimonialsProps) {
  const featured = testimonials.find((t) => t.id === featuredTestimonialId)
  const otherTestimonials = testimonials.filter((t) => t.id !== featuredTestimonialId)

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Clients Say</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Hear from our satisfied customers about their experience with our services.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          {featured && (
            <Card className="flex flex-col justify-between p-6 shadow-lg lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  {Array.from({ length: featured.rating }).map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  {Array.from({ length: 5 - featured.rating }).map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                  ))}
                </div>
                <CardTitle className="mt-2 text-xl font-semibold">Featured Testimonial</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <blockquote className="text-lg italic leading-relaxed text-gray-700 dark:text-gray-300">
                  &ldquo;{featured.text}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {featured.image_url ? (
                      <AvatarImage src={featured.image_url || "/placeholder.svg"} alt={featured.author} />
                    ) : (
                      <AvatarFallback>{featured.author.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{featured.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Satisfied Client</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <div className="grid gap-6 lg:col-span-1">
            {otherTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="p-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-base italic leading-relaxed text-gray-700 dark:text-gray-300">
                    &ldquo;{testimonial.text}&rdquo;
                  </blockquote>
                  <div className="mt-4 flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {testimonial.image_url ? (
                        <AvatarImage src={testimonial.image_url || "/placeholder.svg"} alt={testimonial.author} />
                      ) : (
                        <AvatarFallback>{testimonial.author.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Client</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
