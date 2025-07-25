import type { TimelineEvent } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

interface TimelineProps {
  events: TimelineEvent[]
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative py-8">
      {/* Vertical line */}
      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gray-200 dark:bg-gray-700" />

      {events.map((event, index) => (
        <div
          key={event.id}
          className={`relative mb-8 flex w-full items-center ${
            index % 2 === 0 ? "flex-row-reverse pr-8 md:pr-16" : "pl-8 md:pl-16"
          }`}
        >
          {/* Dot on the line */}
          <div className="absolute left-1/2 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-8 ring-white dark:ring-gray-950" />

          <Card
            className={`w-full md:w-1/2 ${index % 2 === 0 ? "md:ml-auto md:text-right" : "md:mr-auto md:text-left"}`}
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{event.year}</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="mb-2 text-xl font-semibold">{event.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{event.description}</p>
              {event.image_url && (
                <div className="mt-4">
                  <Image
                    src={event.image_url || "/placeholder.svg"}
                    alt={event.title}
                    width={400}
                    height={250}
                    className="h-auto w-full rounded-md object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
