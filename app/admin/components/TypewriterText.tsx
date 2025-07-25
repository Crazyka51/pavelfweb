"use client"

import { useState, useEffect } from "react"

interface TypewriterTextProps {
  text: string
  delay?: number
  speed?: number
  onComplete?: () => void
}

export function TypewriterText({ text, delay = 0, speed = 50, onComplete }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index))
        setIndex((prev) => prev + 1)
      } else {
        onComplete?.()
      }
    }, speed)

    return () => clearTimeout(timer)
  }, [index, text, speed, onComplete])

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("")
    setIndex(0)
  }, [text])

  return <>{displayedText}</>
}
