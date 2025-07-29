"use client"

import { motion } from "framer-motion"

export default function Marquee() {
  return (
    <div className="relative w-full overflow-hidden bg-blue-700 py-16">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-transparent to-blue-700 z-10" />
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, ease: "linear", duration: 20 }}
      >
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center mx-4">
            <span
              className="text-7xl sm:text-8xl md:text-9xl font-bold text-transparent px-4"
              style={{
                WebkitTextStroke: "1px rgb(255, 255, 255)", // white stroke
              }}
            >
              MČ Praha 4
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
