"use client"

import { motion } from "framer-motion"
const testimonials = [
  {
    quote:
      "Pavel Fišer je zastupitel, který skutečně naslouchá potřebám občanů. Díky jeho iniciativě se podařilo zrekonstruovat dětské hřiště v naší čtvrti, které nyní slouží jako bezpečné místo pro naše děti.",
    author: "Jana Nováková",
    position: "Matka dvou dětí, Praha 4",
  },
  {
    quote:
      "Oceňuji Pavlův přístup k řešení problémů seniorů. Díky jeho podpoře máme nyní v našem seniorském klubu pravidelné aktivity a kurzy, které nám pomáhají zůstat aktivní a zapojení do společnosti.",
    author: "Jiří Svoboda",
    position: "Důchodce, Praha 4",
  },
  {
    quote:
      "Pavel Fišer přinesl do zastupitelstva MČ Praha 4 svěží vítr. Jeho praktický přístup k řešení problémů a schopnost naslouchat různým názorům z něj dělá skutečného zástupce občanů.",
    author: "Martina Dvořáková",
    position: "Podnikatelka, Praha 4",
  },
]

export default function Testimonials() {
	return (
		<section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-100">
			<div className="container mx-auto">
				<motion.h2
					className="text-4xl font-bold mb-16 text-center text-blue-700"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
				>
					Co říkají občané
				</motion.h2>
				<div className="grid md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={testimonial.author}
							className="bg-white p-6 rounded-lg shadow-lg"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: index * 0.1 }}
						>
							<p className="text-gray-700 mb-4 italic">
								"{testimonial.quote}"
							</p>
							<div className="text-center">
								<p className="font-bold text-blue-700">
									{testimonial.author}
								</p>
								<p className="text-gray-500 text-sm">
									{testimonial.position}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
