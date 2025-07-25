"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { MailIcon, PhoneIcon, MessageSquareIcon, XIcon } from "lucide-react"
import Link from "next/link"

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  return (
    <>
      {isVisible && (
        <Button
          className="fixed bottom-6 right-6 rounded-full p-4 shadow-lg z-40 animate-bounce"
          size="icon"
          onClick={() => setIsOpen(true)}
          aria-label="Kontaktujte nás"
        >
          <MailIcon className="h-6 w-6" />
        </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Kontaktujte nás</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-6">
            <Link href="/#contact" passHref>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsOpen(false)}>
                <MessageSquareIcon className="mr-2 h-5 w-5" />
                Odeslat zprávu
              </Button>
            </Link>
            <a href="tel:+420123456789">
              <Button variant="outline" className="w-full bg-transparent">
                <PhoneIcon className="mr-2 h-5 w-5" />
                Zavolat nám
              </Button>
            </a>
            <a href="mailto:info@pavelfiser.cz">
              <Button variant="outline" className="w-full bg-transparent">
                <MailIcon className="mr-2 h-5 w-5" />
                Poslat e-mail
              </Button>
            </a>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Zavřít">
              <XIcon className="h-6 w-6" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
