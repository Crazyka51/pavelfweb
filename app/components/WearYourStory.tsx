"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Users, Target } from "lucide-react"

export default function WearYourStory() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Vítejte na mých <span className="text-blue-600">stránkách</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Jsem Pavel Fišer, zastupitel MČ Praha 4 a otec čtyř dětí. Moje dlouholeté zkušenosti jako rodiče mě vedly
              k zaměření na řešení problémů, které ovlivňují každodenní život obyvatel naší městské části.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <Card className="h-full border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Heart className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Pro rodiny</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Jako otec čtyř dětí rozumím potřebám rodin. Prosazuji kvalitní dětská hřiště, bezpečné školní cesty
                    a podporu rodinných aktivit v naší čtvrti.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="h-full border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Pro seniory</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Senioři si zaslouží důstojné a aktivní stáří. Podporuji bezbariérové úpravy, kvalitní zdravotní péči
                    a programy pro aktivní stárnutí v komunitě.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="h-full border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Pro komunitu</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Věřím v sílu komunity. Podporuji místní podnikatele, kulturní akce a iniciativy, které spojují
                    obyvatele a vytvářejí pocit sounáležitosti.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-blue-50 rounded-2xl p-8 md:p-12"
          >
            <div className="max-w-3xl mx-auto text-center">
              <blockquote className="text-2xl md:text-3xl font-medium text-gray-900 mb-6 italic">
                "Mým cílem je vytvořit z Prahy 4 místo, kde se všichni obyvatelé cítí bezpečně, kde mají děti prostor
                pro zdravý rozvoj a kde senioři mohou důstojně a aktivně trávit svůj čas."
              </blockquote>
              <cite className="text-lg text-blue-600 font-semibold">— Pavel Fišer</cite>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4">
              Více o mně
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
