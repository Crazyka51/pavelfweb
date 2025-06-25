"use client"
import { motion } from "framer-motion"
import { Tab } from "@headlessui/react"
import { CheckCircle, Calendar, Users, Building } from "lucide-react"

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

const projects = {
  "Rodiny a děti": [
    {
      id: 1,
      title: "Renovace dětských hřišť",
      description: "Iniciativa pro modernizaci a zvýšení bezpečnosti dětských hřišť v Praze 4.",
      status: "Probíhá",
      icon: <Users className="h-6 w-6" />,
      details:
        "Projekt zahrnuje kompletní renovaci 5 dětských hřišť, instalaci nových bezpečných herních prvků a vytvoření odpočinkových zón pro rodiče. První dvě hřiště již byla dokončena a otevřena veřejnosti.",
    },
    {
      id: 2,
      title: "Rozšíření kapacity MŠ",
      description: "Projekt zaměřený na zvýšení dostupnosti předškolního vzdělávání.",
      status: "Dokončeno",
      icon: <Building className="h-6 w-6" />,
      details:
        "Díky tomuto projektu se podařilo navýšit kapacitu mateřských škol v Praze 4 o 120 míst. Součástí projektu byla také modernizace vybavení a zlepšení venkovních prostor pro děti.",
    },
    {
      id: 3,
      title: "Bezpečná cesta do školy",
      description: "Program pro zvýšení bezpečnosti dětí na cestě do školy.",
      status: "Probíhá",
      icon: <CheckCircle className="h-6 w-6" />,
      details:
        "Program zahrnuje instalaci bezpečnostních prvků na přechodech pro chodce, vzdělávací akce pro děti o bezpečnosti v dopravě a spolupráci s městskou policií na zajištění dohledu v ranních hodinách.",
    },
  ],
  Senioři: [
    {
      id: 4,
      title: "Aktivní stárnutí",
      description: "Série programů pro aktivní zapojení seniorů do komunitního života.",
      status: "Probíhá",
      icon: <Users className="h-6 w-6" />,
      details:
        "Program nabízí širokou škálu aktivit pro seniory, včetně vzdělávacích kurzů, sportovních aktivit a kulturních akcí. Cílem je podpořit aktivní životní styl a sociální zapojení seniorů.",
    },
    {
      id: 5,
      title: "Seniorské centrum",
      description: "Vytvoření komunitního centra pro seniory s nabídkou služeb a aktivit.",
      status: "Plánováno",
      icon: <Building className="h-6 w-6" />,
      details:
        "Projekt počítá s vybudováním moderního komunitního centra, které bude nabízet širokou škálu služeb a aktivit pro seniory, včetně poradenství, zdravotních služeb a volnočasových aktivit.",
    },
    {
      id: 6,
      title: "Počítačové kurzy pro seniory",
      description: "Vzdělávací program zaměřený na digitální gramotnost seniorů.",
      status: "Dokončeno",
      icon: <Calendar className="h-6 w-6" />,
      details:
        "Kurzy pomohly více než 200 seniorům zlepšit jejich digitální dovednosti, naučit se používat internet, komunikovat s rodinou online a využívat digitální služby.",
    },
  ],
  Infrastruktura: [
    {
      id: 10,
      title: "Revitalizace parků",
      description: "Obnova a modernizace zelených ploch a parků v Praze 4.",
      status: "Probíhá",
      icon: <Building className="h-6 w-6" />,
      details:
        "Projekt zahrnuje obnovu zeleně, instalaci nového mobiliáře, vytvoření odpočinkových zón a dětských koutků. Cílem je vytvořit příjemné prostředí pro relaxaci a trávení volného času.",
    },
    {
      id: 11,
      title: "Oprava chodníků a komunikací",
      description: "Systematická oprava poškozených chodníků a komunikací.",
      status: "Probíhá",
      icon: <Calendar className="h-6 w-6" />,
      details:
        "Program je zaměřen na identifikaci a opravu poškozených chodníků a komunikací, s důrazem na bezbariérovost a bezpečnost chodců. Každý rok je opraveno přibližně 5 km chodníků.",
    },
    {
      id: 12,
      title: "Modernizace veřejných prostranství",
      description: "Komplexní přístup k obnově a modernizaci veřejných prostranství.",
      status: "Plánováno",
      icon: <CheckCircle className="h-6 w-6" />,
      details:
        "Projekt počítá s revitalizací náměstí, vytvoření nových odpočinkových zón a zlepšení celkového vzhledu veřejných prostranství v Praze 4. Součástí je i zapojení obyvatel do plánování těchto změn.",
    },
  ],
}

export default function Projects() {
  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold text-blue-700 mb-4">Projekty a iniciativy</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Jako zastupitel MČ Praha 4 se aktivně podílím na řadě projektů a iniciativ, které mají za cíl zlepšit
            kvalitu života v naší městské části. Zde jsou některé z nich.
          </p>
        </motion.div>

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-100 p-1 mb-8">
            {Object.keys(projects).map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    "w-full rounded-lg py-3 text-sm font-medium leading-5",
                    "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60",
                    selected ? "bg-blue-700 text-white shadow" : "text-blue-700 hover:bg-blue-200 hover:text-blue-800",
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2">
            {Object.values(projects).map((projectsInCategory, idx) => (
              <Tab.Panel key={idx} className="rounded-xl bg-white p-3">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projectsInCategory.map((project) => (
                    <motion.div
                      key={project.id}
                      className="bg-blue-50 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (project.id * 0.1) % 0.5 }}
                    >
                      <div className="p-5">
                        <div className="flex items-center mb-4">
                          <div className="bg-blue-100 p-2 rounded-full mr-3 text-blue-700">{project.icon}</div>
                          <div>
                            <h3 className="text-lg font-bold text-blue-700">{project.title}</h3>
                            <span
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                project.status === "Dokončeno"
                                  ? "bg-green-100 text-green-800"
                                  : project.status === "Probíhá"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{project.description}</p>
                        <div className="bg-white p-3 rounded-md text-sm text-gray-700">{project.details}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </section>
  )
}

