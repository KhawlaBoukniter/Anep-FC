"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";

interface Formation {
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
  modules: string[]
  prerequisites: string[]
  objectives: string[]
  color: string
  rating: number
  students: number
}

interface FormationModalProps {
  formation: Formation | null
  isOpen: boolean
  onClose: () => void
  onEnroll: (formationId: number) => void
}

const formationsData: Formation[] = [
  {
    id: 1,
    title: "Développement React Avancé",
    description:
      "Maîtrisez React.js de A à Z avec les hooks, le state management et les bonnes pratiques modernes. Cette formation complète vous permettra de créer des applications web performantes et maintenables.",
    shortDescription: "Maîtrisez React.js avec les hooks et le state management moderne",
    duration: "40 heures",
    level: "Intermédiaire",
    price: "899€",
    instructor: "Thomas Martin",
    image: "/placeholder.svg?height=200&width=300",
    category: "Développement Web",
    modules: [
      "Introduction à React et JSX",
      "Hooks et State Management",
      "Context API et Redux",
      "Optimisation des performances",
      "Tests unitaires avec Jest",
      "Déploiement et CI/CD",
    ],
    prerequisites: ["JavaScript ES6+", "HTML/CSS", "Bases de Git"],
    objectives: [
      "Créer des applications React complexes",
      "Maîtriser les hooks avancés",
      "Optimiser les performances",
      "Implémenter des tests robustes",
    ],
    color: "from-[#06668C] to-blue-700",
    rating: 4.8,
    students: 245,
  },
  {
    id: 2,
    title: "Design UI/UX Professionnel",
    description:
      "Apprenez à créer des interfaces utilisateur exceptionnelles et des expériences utilisateur mémorables. De la recherche utilisateur au prototypage, maîtrisez tous les aspects du design digital.",
    shortDescription: "Créez des interfaces utilisateur exceptionnelles et des expériences mémorables",
    duration: "35 heures",
    level: "Débutant",
    price: "749€",
    instructor: "Sophie Laurent",
    image: "/placeholder.svg?height=200&width=300",
    category: "Design",
    modules: [
      "Principes fondamentaux du design",
      "Recherche utilisateur et personas",
      "Wireframing et prototypage",
      "Design systems et composants",
      "Outils Figma et Adobe XD",
      "Tests utilisateur et itération",
    ],
    prerequisites: ["Aucun prérequis", "Créativité et curiosité"],
    objectives: [
      "Maîtriser les principes du design",
      "Créer des prototypes interactifs",
      "Conduire des recherches utilisateur",
      "Développer un design system",
    ],
    color: "from-green-600 to-green-700",
    rating: 4.9,
    students: 189,
  },
  {
    id: 3,
    title: "DevOps et Cloud Computing",
    description:
      "Découvrez les pratiques DevOps modernes et le déploiement cloud. Automatisez vos workflows, gérez l'infrastructure as code et maîtrisez les plateformes cloud comme AWS et Azure.",
    shortDescription: "Maîtrisez DevOps, l'automatisation et le déploiement cloud",
    duration: "50 heures",
    level: "Avancé",
    price: "1299€",
    instructor: "Alexandre Petit",
    image: "/placeholder.svg?height=200&width=300",
    category: "Infrastructure",
    modules: [
      "Introduction au DevOps",
      "Containerisation avec Docker",
      "Orchestration avec Kubernetes",
      "CI/CD avec GitHub Actions",
      "Infrastructure as Code",
      "Monitoring et observabilité",
    ],
    prerequisites: ["Linux de base", "Réseaux", "Développement"],
    objectives: [
      "Automatiser les déploiements",
      "Gérer l'infrastructure cloud",
      "Implémenter CI/CD",
      "Monitorer les applications",
    ],
    color: "from-gray-800 to-black",
    rating: 4.7,
    students: 156,
  },
  {
    id: 4,
    title: "Marketing Digital & SEO",
    description:
      "Boostez votre présence en ligne avec les stratégies de marketing digital les plus efficaces. SEO, SEM, réseaux sociaux et analytics n'auront plus de secrets pour vous.",
    shortDescription: "Boostez votre présence en ligne avec le marketing digital",
    duration: "30 heures",
    level: "Débutant",
    price: "599€",
    instructor: "Marie Dubois",
    image: "/placeholder.svg?height=200&width=300",
    category: "Marketing",
    modules: [
      "Stratégie marketing digital",
      "SEO et référencement naturel",
      "Google Ads et SEM",
      "Réseaux sociaux et community management",
      "Email marketing et automation",
      "Analytics et mesure de performance",
    ],
    prerequisites: ["Bases du web", "Curiosité marketing"],
    objectives: [
      "Développer une stratégie digitale",
      "Optimiser le référencement",
      "Gérer les campagnes publicitaires",
      "Analyser les performances",
    ],
    color: "from-purple-600 to-purple-700",
    rating: 4.6,
    students: 312,
  },
  {
    id: 5,
    title: "Intelligence Artificielle & Machine Learning",
    description:
      "Plongez dans le monde de l'IA et du Machine Learning. Apprenez à créer des modèles prédictifs, à traiter des données et à implémenter des solutions d'IA dans vos projets.",
    shortDescription: "Créez des modèles d'IA et implémentez le Machine Learning",
    duration: "60 heures",
    level: "Avancé",
    price: "1599€",
    instructor: "Dr. Jean Dupont",
    image: "/placeholder.svg?height=200&width=300",
    category: "Intelligence Artificielle",
    modules: [
      "Fondamentaux de l'IA",
      "Python pour le Machine Learning",
      "Algorithmes d'apprentissage supervisé",
      "Deep Learning et réseaux de neurones",
      "Traitement du langage naturel",
      "Déploiement de modèles en production",
    ],
    prerequisites: ["Python", "Mathématiques", "Statistiques"],
    objectives: [
      "Comprendre les concepts de l'IA",
      "Créer des modèles ML",
      "Implémenter du Deep Learning",
      "Déployer des solutions IA",
    ],
    color: "from-orange-600 to-red-600",
    rating: 4.9,
    students: 98,
  },
  {
    id: 6,
    title: "Cybersécurité & Ethical Hacking",
    description:
      "Protégez les systèmes informatiques en apprenant les techniques de cybersécurité et d'ethical hacking. Identifiez les vulnérabilités et mettez en place des défenses efficaces.",
    shortDescription: "Maîtrisez la cybersécurité et les techniques d'ethical hacking",
    duration: "45 heures",
    level: "Intermédiaire",
    price: "1099€",
    instructor: "Captain Security",
    image: "/placeholder.svg?height=200&width=300",
    category: "Sécurité",
    modules: [
      "Fondamentaux de la cybersécurité",
      "Techniques de reconnaissance",
      "Tests de pénétration",
      "Sécurité des applications web",
      "Forensique numérique",
      "Gestion des incidents de sécurité",
    ],
    prerequisites: ["Réseaux", "Systèmes", "Linux"],
    objectives: [
      "Identifier les vulnérabilités",
      "Réaliser des tests de pénétration",
      "Sécuriser les applications",
      "Gérer les incidents de sécurité",
    ],
    color: "from-red-600 to-red-700",
    rating: 4.8,
    students: 134,
  },
]

const FormationModal: React.FC<FormationModalProps> = ({ formation, isOpen, onClose, onEnroll }) => {
  if (!isOpen || !formation) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${formation.color} text-white p-6 rounded-t-2xl relative`}>
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
              <h2 className="text-3xl font-bold mb-4">{formation.title}</h2>
              <p className="text-lg opacity-90 mb-4">{formation.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <span className="mr-2">⏱️</span>
                  <span>{formation.duration}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📊</span>
                  <span>{formation.level}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">⭐</span>
                  <span>
                    {formation.rating}/5 ({formation.students} étudiants)
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="text-4xl font-bold mb-2">{formation.price}</div>
              <div className="text-sm opacity-80">Instructeur: {formation.instructor}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Modules */}
            <div>
              <h3 className="text-xl font-bold text-[#06668C] mb-4">📚 Modules de formation</h3>
              <ul className="space-y-2">
                {formation.modules.map((module, index) => (
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
                {formation.objectives.map((objective, index) => (
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
              {formation.prerequisites.map((prereq, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {prereq}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onEnroll(formation.id)}
              className={`flex-1 bg-gradient-to-r ${formation.color} text-white py-4 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
            >
              S'inscrire maintenant - {formation.price}
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
  const [animatedCards, setAnimatedCards] = useState<boolean[]>(new Array(formationsData.length).fill(false))
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [enrolledFormations, setEnrolledFormations] = useState<number[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)

      // Animer les cartes avec délai
      formationsData.forEach((_, index) => {
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
  }, [])

  const handleViewDetails = (formation: Formation) => {
    setSelectedFormation(formation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFormation(null)
  }

  const handleEnroll = (formationId: number) => {
    setEnrolledFormations((prev) => [...prev, formationId])
    setIsModalOpen(false)
    // Ici vous pouvez ajouter la logique d'inscription (API call, etc.)
    alert("Inscription réussie ! Vous recevrez un email de confirmation.")
  }

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
              Développez vos compétences avec nos formations expertes et certifiantes
            </p>
            <div className="w-32 h-1 bg-white mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Formations Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">Nos Formations</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez parmi notre catalogue de formations conçues par des experts du secteur
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {formationsData.map((formation, index) => (
              <div
                key={formation.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                  animatedCards[index] ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                } hover:-translate-y-2`}
              >
                {/* Image et badge */}
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={formation.image || "/placeholder.svg"}
                    alt={formation.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white bg-opacity-90 text-gray-800 text-xs font-semibold rounded-full">
                      {formation.category}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-semibold rounded-full">
                      {formation.level}
                    </span>
                  </div>
                  {enrolledFormations.includes(formation.id) && (
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
                      {formation.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#06668C]">{formation.price}</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{formation.shortDescription}</p>

                  {/* Infos */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="mr-1">⏱️</span>
                      <span>{formation.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">⭐</span>
                      <span>{formation.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">👥</span>
                      <span>{formation.students}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(formation)}
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
                      onClick={() => handleEnroll(formation.id)}
                      disabled={enrolledFormations.includes(formation.id)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        enrolledFormations.includes(formation.id)
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : `bg-gradient-to-r ${formation.color} text-white hover:shadow-lg transform hover:-translate-y-1`
                      }`}
                    >
                      {enrolledFormations.includes(formation.id) ? "Inscrit ✓" : "S'inscrire"}
                    </button>
                  </div>
                </div>

                {/* Ligne décorative */}
                <div
                  className={`h-1 bg-gradient-to-r ${formation.color} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`}
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
              <div className="text-4xl font-bold text-[#06668C] mb-2">50+</div>
              <div className="text-gray-600">Formations disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">5000+</div>
              <div className="text-gray-600">Étudiants formés</div>
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
      <FormationModal
        formation={selectedFormation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEnroll={handleEnroll}
      />
      <Footer />
    </div>
  )
}

export default FormationPage
