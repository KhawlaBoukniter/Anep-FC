"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Header from "../components/header.tsx"
import Footer from "../components/footer.tsx"

interface Program {
  id: number
  title: string
  description: string
  shortDescription: string
  duration: string
  level: string
  price: string
  instructor: string
  image: string
  category: string
  type: "cycle" | "programme"
  modules: string[]
  prerequisites: string[]
  objectives: string[]
  color: string
  rating: number
  students: number
}

interface ProgramModalProps {
  program: Program | null
  isOpen: boolean
  onClose: () => void
  onEnroll: (programId: number) => void
}

const programsData: Program[] = [
  // CYCLES
  {
    id: 1,
    title: "Cycle Développement Full-Stack",
    description:
      "Un cycle complet de 6 mois pour maîtriser le développement web moderne. De React à Node.js, en passant par les bases de données et le déploiement, devenez un développeur full-stack accompli.",
    shortDescription: "Cycle complet de 6 mois pour devenir développeur full-stack",
    duration: "6 mois",
    level: "Débutant à Intermédiaire",
    price: "2499€",
    instructor: "Équipe pédagogique",
    image: "/placeholder.svg?height=200&width=300",
    category: "Développement Web",
    type: "cycle",
    modules: [
      "HTML/CSS et JavaScript moderne",
      "React.js et écosystème",
      "Node.js et Express",
      "Bases de données SQL/NoSQL",
      "APIs REST et GraphQL",
      "Déploiement et DevOps",
    ],
    prerequisites: ["Motivation", "Logique de base"],
    objectives: [
      "Créer des applications web complètes",
      "Maîtriser le stack MERN",
      "Comprendre l'architecture web",
      "Déployer en production",
    ],
    color: "from-[#06668C] to-blue-700",
    rating: 4.9,
    students: 156,
  },
  {
    id: 2,
    title: "Cycle Data Science & IA",
    description:
      "Cycle intensif de 8 mois pour devenir expert en Data Science et Intelligence Artificielle. Python, Machine Learning, Deep Learning et mise en production de modèles IA.",
    shortDescription: "Cycle de 8 mois pour devenir expert en Data Science et IA",
    duration: "8 mois",
    level: "Intermédiaire à Avancé",
    price: "3299€",
    instructor: "Dr. Marie Dubois",
    image: "/placeholder.svg?height=200&width=300",
    category: "Intelligence Artificielle",
    type: "cycle",
    modules: [
      "Python pour la Data Science",
      "Statistiques et probabilités",
      "Machine Learning supervisé/non-supervisé",
      "Deep Learning et réseaux de neurones",
      "Traitement du langage naturel",
      "MLOps et déploiement de modèles",
    ],
    prerequisites: ["Mathématiques niveau bac", "Bases de programmation"],
    objectives: [
      "Analyser et visualiser des données",
      "Créer des modèles prédictifs",
      "Implémenter du Deep Learning",
      "Déployer des solutions IA",
    ],
    color: "from-purple-600 to-purple-800",
    rating: 4.8,
    students: 89,
  },
  {
    id: 3,
    title: "Cycle UX/UI Design",
    description:
      "Formation complète de 4 mois pour maîtriser le design d'expérience utilisateur et d'interface. De la recherche utilisateur au prototypage, créez des expériences digitales exceptionnelles.",
    shortDescription: "Cycle de 4 mois pour maîtriser l'UX/UI Design",
    duration: "4 mois",
    level: "Débutant",
    price: "1899€",
    instructor: "Sophie Laurent",
    image: "/placeholder.svg?height=200&width=300",
    category: "Design",
    type: "cycle",
    modules: [
      "Fondamentaux du design",
      "Recherche utilisateur",
      "Wireframing et prototypage",
      "Design systems",
      "Outils Figma/Adobe XD",
      "Tests utilisateur",
    ],
    prerequisites: ["Créativité", "Sens esthétique"],
    objectives: [
      "Conduire une recherche UX",
      "Créer des interfaces intuitives",
      "Prototyper des solutions",
      "Tester et itérer",
    ],
    color: "from-pink-500 to-rose-600",
    rating: 4.7,
    students: 134,
  },

  // PROGRAMMES
  {
    id: 4,
    title: "Programme React Avancé",
    description:
      "Programme intensif pour maîtriser React.js avec les hooks, le state management et les bonnes pratiques modernes. Créez des applications performantes et maintenables.",
    shortDescription: "Maîtrisez React.js avec les hooks et le state management",
    duration: "40 heures",
    level: "Intermédiaire",
    price: "899€",
    instructor: "Thomas Martin",
    image: "/placeholder.svg?height=200&width=300",
    category: "Développement Web",
    type: "programme",
    modules: [
      "Hooks avancés",
      "Context API et Redux",
      "Optimisation des performances",
      "Tests unitaires",
      "Patterns avancés",
    ],
    prerequisites: ["JavaScript ES6+", "React de base"],
    objectives: [
      "Maîtriser les hooks avancés",
      "Optimiser les performances",
      "Implémenter des tests",
      "Suivre les bonnes pratiques",
    ],
    color: "from-blue-500 to-blue-700",
    rating: 4.8,
    students: 245,
  },
  {
    id: 5,
    title: "Programme DevOps & Cloud",
    description:
      "Programme spécialisé en DevOps et Cloud Computing. Automatisez vos workflows, gérez l'infrastructure as code et maîtrisez AWS/Azure.",
    shortDescription: "Spécialisez-vous en DevOps et Cloud Computing",
    duration: "50 heures",
    level: "Avancé",
    price: "1299€",
    instructor: "Alexandre Petit",
    image: "/placeholder.svg?height=200&width=300",
    category: "Infrastructure",
    type: "programme",
    modules: ["Docker et Kubernetes", "CI/CD avec GitHub Actions", "Infrastructure as Code", "AWS/Azure", "Monitoring"],
    prerequisites: ["Linux", "Développement", "Réseaux"],
    objectives: [
      "Automatiser les déploiements",
      "Gérer l'infrastructure cloud",
      "Implémenter CI/CD",
      "Monitorer les applications",
    ],
    color: "from-gray-700 to-gray-900",
    rating: 4.7,
    students: 156,
  },
  {
    id: 6,
    title: "Programme Cybersécurité",
    description:
      "Programme spécialisé en cybersécurité et ethical hacking. Identifiez les vulnérabilités et mettez en place des défenses efficaces.",
    shortDescription: "Spécialisez-vous en cybersécurité et ethical hacking",
    duration: "45 heures",
    level: "Intermédiaire",
    price: "1099€",
    instructor: "Captain Security",
    image: "/placeholder.svg?height=200&width=300",
    category: "Sécurité",
    type: "programme",
    modules: ["Tests de pénétration", "Sécurité web", "Forensique numérique", "Gestion d'incidents", "Ethical hacking"],
    prerequisites: ["Réseaux", "Systèmes", "Linux"],
    objectives: [
      "Identifier les vulnérabilités",
      "Réaliser des pentests",
      "Sécuriser les applications",
      "Gérer les incidents",
    ],
    color: "from-red-600 to-red-800",
    rating: 4.8,
    students: 134,
  },
  {
    id: 7,
    title: "Programme Marketing Digital",
    description:
      "Programme complet en marketing digital et SEO. Boostez votre présence en ligne avec les stratégies les plus efficaces.",
    shortDescription: "Maîtrisez le marketing digital et le SEO",
    duration: "30 heures",
    level: "Débutant",
    price: "599€",
    instructor: "Marie Dubois",
    image: "/placeholder.svg?height=200&width=300",
    category: "Marketing",
    type: "programme",
    modules: ["SEO et référencement", "Google Ads", "Réseaux sociaux", "Email marketing", "Analytics"],
    prerequisites: ["Bases du web"],
    objectives: [
      "Optimiser le référencement",
      "Gérer les campagnes pub",
      "Analyser les performances",
      "Développer sa stratégie",
    ],
    color: "from-green-500 to-green-700",
    rating: 4.6,
    students: 312,
  },
  {
    id: 8,
    title: "Programme Machine Learning",
    description:
      "Programme spécialisé en Machine Learning. Créez des modèles prédictifs et implémentez des solutions d'IA dans vos projets.",
    shortDescription: "Créez des modèles ML et implémentez l'IA",
    duration: "60 heures",
    level: "Avancé",
    price: "1599€",
    instructor: "Dr. Jean Dupont",
    image: "/placeholder.svg?height=200&width=300",
    category: "Intelligence Artificielle",
    type: "programme",
    modules: [
      "Algorithmes ML supervisés",
      "Deep Learning",
      "Traitement du langage",
      "Computer Vision",
      "Déploiement de modèles",
    ],
    prerequisites: ["Python", "Mathématiques", "Statistiques"],
    objectives: [
      "Créer des modèles ML",
      "Implémenter du Deep Learning",
      "Traiter des données",
      "Déployer en production",
    ],
    color: "from-orange-500 to-orange-700",
    rating: 4.9,
    students: 98,
  },
]

const ProgramModal: React.FC<ProgramModalProps> = ({ program, isOpen, onClose, onEnroll }) => {
  if (!isOpen || !program) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${program.color} text-white p-6 rounded-t-2xl relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold">
                  {program.type === "cycle" ? "🔄 Cycle" : "📚 Programme"}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{program.title}</h2>
              <p className="text-lg opacity-90 mb-4">{program.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <span className="mr-2">⏱️</span>
                  <span>{program.duration}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span>
                  <span>{program.level}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⭐</span>
                  <span>
                    {program.rating}/5 ({program.students} étudiants)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-4xl font-bold mb-2">{program.price}</div>
              <div className="text-sm opacity-80">Instructeur: {program.instructor}</div>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Modules */}
            <div>
              <h3 className="text-xl font-bold text-[#06668C] mb-4">
                {program.type === "cycle" ? "📚 Modules du cycle" : "📖 Contenu du programme"}
              </h3>
              <ul className="space-y-2">
                {program.modules.map((module, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <span className="text-gray-700">{module}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Objectifs */}
            <div>
              <h3 className="text-xl font-bold text-[#06668C] mb-4">🎯 Objectifs pédagogiques</h3>
              <ul className="space-y-2">
                {program.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2 mt-1">→</span>
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Prérequis */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-[#06668C] mb-4">📋 Prérequis</h3>
            <div className="flex flex-wrap gap-2">
              {program.prerequisites.map((prereq, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {prereq}
                </span>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onEnroll(program.id)}
              className={`flex-1 bg-gradient-to-r ${program.color} text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
            >
              S'inscrire maintenant - {program.price}
            </button>
            <button className="flex-1 border-2 border-[#06668C] text-[#06668C] py-4 px-6 rounded-lg font-semibold hover:bg-[#06668C] hover:text-white transition-all duration-300">
              Demander plus d'infos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const FormationPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedCards, setAnimatedCards] = useState<boolean[]>(new Array(programsData.length).fill(false))
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [enrolledPrograms, setEnrolledPrograms] = useState<number[]>([])
  const [activeFilter, setActiveFilter] = useState<"all" | "cycle" | "programme">("all")

  const filteredPrograms = programsData.filter((program) => {
    if (activeFilter === "all") return true
    return program.type === activeFilter
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Animer les cartes avec délai
      filteredPrograms.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedCards((prev) => {
            const newState = [...prev]
            newState[index] = true
            return newState
          })
        }, index * 150)
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [filteredPrograms])

  // Reset animation when filter changes
  useEffect(() => {
    setAnimatedCards(new Array(filteredPrograms.length).fill(false))
    setTimeout(() => {
      filteredPrograms.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedCards((prev) => {
            const newState = [...prev]
            newState[index] = true
            return newState
          })
        }, index * 100)
      })
    }, 100)
  }, [activeFilter])

  const handleViewDetails = (program: Program) => {
    setSelectedProgram(program)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProgram(null)
  }

  const handleEnroll = (programId: number) => {
    setEnrolledPrograms((prev) => [...prev, programId])
    setIsModalOpen(false)
    alert("Inscription réussie ! Vous recevrez un email de confirmation.")
  }

  const cyclesCount = programsData.filter((p) => p.type === "cycle").length
  const programmesCount = programsData.filter((p) => p.type === "programme").length

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#06668C] via-blue-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Formations</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Choisissez entre nos cycles complets et nos programmes spécialisés
            </p>
            <div className="w-32 h-1 bg-white mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-700">Filtrer par :</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === "all"
                      ? "bg-[#06668C] text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Tout ({programsData.length})
                </button>
                <button
                  onClick={() => setActiveFilter("cycle")}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === "cycle"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  🔄 Cycles ({cyclesCount})
                </button>
                <button
                  onClick={() => setActiveFilter("programme")}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === "programme"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  📚 Programmes ({programmesCount})
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {filteredPrograms.length} formation{filteredPrograms.length > 1 ? "s" : ""} trouvée
              {filteredPrograms.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">
              {activeFilter === "cycle"
                ? "Nos Cycles de Formation"
                : activeFilter === "programme"
                  ? "Nos Programmes Spécialisés"
                  : "Cycles et Programmes"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {activeFilter === "cycle"
                ? "Des parcours complets pour une montée en compétences progressive"
                : activeFilter === "programme"
                  ? "Des formations spécialisées pour approfondir vos expertises"
                  : "Choisissez le format qui correspond le mieux à vos objectifs"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program, index) => (
              <div
                key={program.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                  animatedCards[index] ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                } hover:-translate-y-2`}
              >
                {/* Image et badges */}
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={program.image || "/placeholder.svg"}
                    alt={program.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                        program.type === "cycle" ? "bg-purple-600" : "bg-green-600"
                      }`}
                    >
                      {program.type === "cycle" ? "🔄 Cycle" : "📚 Programme"}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-semibold rounded-full">
                      {program.level}
                    </span>
                  </div>
                  {enrolledPrograms.includes(program.id) && (
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                        ✓ Inscrit
                      </span>
                    </div>
                  )}
                </div>
                {/* Contenu */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#06668C] transition-colors duration-300">
                      {program.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#06668C]">{program.price}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{program.shortDescription}</p>
                  {/* Infos */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="mr-1">⏱️</span>
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">⭐</span>
                      <span>{program.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">👥</span>
                      <span>{program.students}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(program)}
                      className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Détails
                    </button>
                    <button
                      onClick={() => handleEnroll(program.id)}
                      disabled={enrolledPrograms.includes(program.id)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        enrolledPrograms.includes(program.id)
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : `bg-gradient-to-r ${program.color} text-white hover:shadow-lg transform hover:-translate-y-1`
                      }`}
                    >
                      {enrolledPrograms.includes(program.id) ? "Inscrit ✓" : "S'inscrire"}
                    </button>
                  </div>
                </div>
                {/* Ligne décorative */}
                <div
                  className={`h-1 bg-gradient-to-r ${program.color} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{cyclesCount}</div>
              <div className="text-gray-600">Cycles disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{programmesCount}</div>
              <div className="text-gray-600">Programmes spécialisés</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#06668C] mb-2">95%</div>
              <div className="text-gray-600">Taux de satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
              <div className="text-gray-600">Support disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <ProgramModal program={selectedProgram} isOpen={isModalOpen} onClose={handleCloseModal} onEnroll={handleEnroll} />
      <Footer />
    </div>
  )
}

export default FormationPage
