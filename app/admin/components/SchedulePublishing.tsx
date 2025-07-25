"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SchedulePublishingProps {
  published: boolean
  publishedAt?: string
  onScheduleChange: (scheduled: boolean, scheduledDate?: string, publishNow?: boolean) => void
}

export function SchedulePublishing({ published, publishedAt, onScheduleChange }: SchedulePublishingProps) {
  const [isScheduled, setIsScheduled] = useState(!!publishedAt)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(publishedAt ? new Date(publishedAt) : undefined)

  useEffect(() => {
    setIsScheduled(!!publishedAt)
    setSelectedDate(publishedAt ? new Date(publishedAt) : undefined)
  }, [publishedAt])

  const handleCheckboxChange = (checked: boolean) => {
    setIsScheduled(checked)
    if (!checked) {
      setSelectedDate(undefined)
      onScheduleChange(false, undefined, false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      onScheduleChange(true, date.toISOString(), false)
    } else {
      onScheduleChange(false, undefined, false)
    }
  }

  const handlePublishNow = () => {
    onScheduleChange(false, undefined, true)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Publikování</h3>

      <div className="flex items-center space-x-2">
        <Checkbox id="schedule-publish" checked={isScheduled} onCheckedChange={handleCheckboxChange} />
        <Label htmlFor="schedule-publish">Naplánovat publikování</Label>
      </div>

      {isScheduled && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Vyberte datum</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
          </PopoverContent>
        </Popover>
      )}

      {!isScheduled && !published && (
        <Button onClick={handlePublishNow} className="w-full">
          Publikovat ihned
        </Button>
      )}

      {published && !isScheduled && <p className="text-sm text-green-600">Článek je aktuálně publikován.</p>}

      {isScheduled && selectedDate && (
        <p className="text-sm text-blue-600">Článek bude publikován: {format(selectedDate, "PPP")}</p>
      )}
    </div>
  )
}
