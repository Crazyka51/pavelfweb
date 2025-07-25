"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [cursorVariant, setCursorVariant] = useState("default")

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", mouseMove)

    return () => {
      window.removeEventListener("mousemove", mouseMove)
    }
  }, [])

  const variants = {
    default: {
      x: mousePosition.x - 8,
      y: mousePosition.y - 8,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      mixBlendMode: "difference",
      height: 16,
      width: 16,
    },
    text: {
      x: mousePosition.x - 75,
      y: mousePosition.y - 75,
      height: 150,
      width: 150,
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      mixBlendMode: "difference",
    },
    link: {
      x: mousePosition.x - 24,
      y: mousePosition.y - 24,
      height: 48,
      width: 48,
      backgroundColor: "rgba(0, 123, 255, 0.8)",
      mixBlendMode: "difference",
    },
  }

  const handleMouseEnter = (variant: string) => () => setCursorVariant(variant)
  const handleMouseLeave = () => setCursorVariant("default")

  useEffect(() => {
    document.querySelectorAll("a, button, input, textarea, select").forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter("link"))
      el.addEventListener("mouseleave", handleMouseLeave)
    })

    document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, li").forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter("text"))
      el.addEventListener("mouseleave", handleMouseLeave)
    })

    return () => {
      document.querySelectorAll("a, button, input, textarea, select").forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter("link"))
        el.removeEventListener("mouseleave", handleMouseLeave)
      })
      document.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, li").forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter("text"))
        el.removeEventListener("mouseleave", handleMouseLeave)
      })
    }
  }, [])

  return (
    <motion.div
      className="fixed left-0 top-0 z-[9999] pointer-events-none rounded-full"
      variants={variants}
      animate={cursorVariant}
      transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
    />
  )
}
