"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface EnrolledFormation {
  id: number
  title: string
  description: string
  duration: string
  instructor: string
  image: string
  category: string
  color: string
  enrollmentDate: string
  progress: number
  status: "en_cours" | "termine" | "non_commence"
  completedModules: number
  totalModules: number
  certificateAvailable: boolean
  lastAccessed: string
}

// Simulation des formations inscrites (normalement récupérées depuis une API/base de données)
const enrolledFormationsData: EnrolledFormation[] = [
  {
    id: 1,
    title: "Développement React Avancé",
    description: "Maîtrisez React.js avec les hooks et le state management moderne",
    duration: "40 heures",
    instructor: "Thomas Martin",
    image: "/placeholder.svg?height=200&width=300",
    category: "Développement Web",
    color: "from-[#06668C] to-blue-700",
    enrollmentDate: "2024-01-15",
    progress: 65,
    status: "en_cours",
    nextModule: "Context API et Redux",
    completedModules: 4,
    totalModules: 6,
    certificateAvailable: false,
    lastAccessed: "2024-01-20",
  },
]

const FormationPersonnel: React.FC = () => {
  const [formations, setFormations] = useState<EnrolledFormation[]>(enrolledFormationsData)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"toutes" | "en_cours" | "terminees">("toutes")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_cours":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">En cours</span>
      case "termine":
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Terminé</span>
      case "non_commence":
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">Non commencé</span>
        )
      default:
        return null
    }
  }

  const getFilteredFormations = () => {
    switch (selectedTab) {
      case "en_cours":
        return formations.filter((f) => f.status === "en_cours")
      case "terminees":
        return formations.filter((f) => f.status === "termine")
      default:
        return formations
    }
  }

  const formatDate = (dateString: string) => {
    if (dateString === "Jamais") return dateString
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const totalFormations = formations.length
  const completedFormations = formations.filter((f) => f.status === "termine").length
  const inProgressFormations = formations.filter((f) => f.status === "en_cours").length
  const averageProgress = formations.reduce((acc, f) => acc + f.progress, 0) / formations.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-[#06668C] via-blue-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Mes Formations</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Suivez votre progression et accédez à vos formations</p>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-12 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-[#06668C] to-blue-700 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{totalFormations}</div>
              <div className="text-sm opacity-90">Formations inscrites</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{completedFormations}</div>
              <div className="text-sm opacity-90">Formations terminées</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{inProgressFormations}</div>
              <div className="text-sm opacity-90">En cours</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{Math.round(averageProgress)}%</div>
              <div className="text-sm opacity-90">Progression moyenne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedTab("toutes")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedTab === "toutes"
                  ? "bg-[#06668C] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toutes ({totalFormations})
            </button>
          </div>
        </div>
      </section>

      {/* Formations List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {getFilteredFormations().length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucune formation trouvée</h3>
              <p className="text-gray-600 mb-8">
                {selectedTab === "toutes"
                  ? "Vous n'êtes inscrit à aucune formation pour le moment."
                  : `Aucune formation ${selectedTab === "en_cours" ? "en cours" : "terminée"} trouvée.`}
              </p>
              <button className="bg-[#06668C] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Découvrir nos formations
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {getFilteredFormations().map((formation, index) => (
                <div
                  key={formation.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Header avec image */}
                  <div className="relative">
                    <img
                      src={formation.image || "/placeholder.svg"}
                      alt={formation.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4">{getStatusBadge(formation.status)}</div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-semibold rounded-full">
                        {formation.category}
                      </span>
                    </div>
                    {formation.certificateAvailable && (
                      <div className="absolute bottom-4 right-4">
                        <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full flex items-center">
                          🏆 Certificat disponible
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{formation.title}</h3>
                    <p className="text-gray-600 mb-4">{formation.description}</p>

                    {/* Progression */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progression</span>
                        <span className="text-sm font-bold text-[#06668C]">{formation.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${formation.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${formation.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formation.completedModules}/{formation.totalModules} modules terminés
                      </div>
                    </div>

                    {/* Informations */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Instructeur:</span>
                        <div className="font-medium">{formation.instructor}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Durée:</span>
                        <div className="font-medium">{formation.duration}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Inscrit le:</span>
                        <div className="font-medium">{formatDate(formation.enrollmentDate)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Dernier accès:</span>
                        <div className="font-medium">{formatDate(formation.lastAccessed)}</div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-3">
                      {formation.status === "termine" ? (
                        <>
                          <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300">
                            Revoir le contenu
                          </button>
                          {formation.certificateAvailable && (
                            <button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
                              Télécharger certificat
                            </button>
                          )}
                        </>
                      ) : formation.status === "en_cours" ? (
                        <>
                          <button
                            className={`flex-1 bg-gradient-to-r ${formation.color} text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
                          >
                            Continuer
                          </button>
                          <button className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#06668C] hover:text-[#06668C] transition-colors duration-300">
                            📋
                          </button>
                        </>
                      ) : (
                        <button
                          className={`w-full bg-gradient-to-r ${formation.color} text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
                        >
                          Commencer la formation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default FormationPersonnel
