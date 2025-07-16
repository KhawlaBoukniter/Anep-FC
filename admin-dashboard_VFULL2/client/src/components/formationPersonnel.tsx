"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Header from "./header.tsx";
import Footer from "./footer.tsx";

interface EnrolledFormation {
  id: number
  title: string
  description: string
  duration: string
  instructor: string
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

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

const FormationPersonnel: React.FC = () => {
  const [formations, setFormations] = useState<EnrolledFormation[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedFormation, setSelectedFormation] = useState<EnrolledFormation | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Veuillez vous connecter pour accéder à vos formations.")
          setLoading(false)
          return
        }

        const response = await axios.get(`${API_BASE_URL}/api/employees/verify-session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUserId(response.data.id.toString())
      } catch (err: any) {
        console.error("Erreur lors de la vérification de la session:", err)
        setError("Session invalide. Veuillez vous reconnecter.")
      } finally {
        setLoading(false)
      }
    }

    verifySession()
  }, [])

  useEffect(() => {
    if (!userId) return

    const fetchEnrolledModules = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_BASE_URL}/api/cycles-programs/user/${userId}/modules`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        const enrolledData = response.data

        const formattedFormations: EnrolledFormation[] = enrolledData.flatMap((program: any) =>
          program.modules.map((module: any, index: number) => ({
            id: index + 1,
            title: module.title || "Module sans titre",
            description: module.description || "Aucune description disponible",
            duration: module.duration || "Durée inconnue",
            instructor: program.cycleProgram.facilitator || "Instructeur inconnu",
            category: program.cycleProgram.type || "Non catégorisé",
            color: "from-blue-600 to-indigo-700",
            enrollmentDate: program.cycleProgram.created_at || new Date().toISOString(),
            progress: module.progress || 0,
            status: module.status || "non_commence",
            completedModules: module.completedModules || 0,
            totalModules: module.totalModules || 1,
            certificateAvailable: module.certificateAvailable || false,
            lastAccessed: module.lastAccessed || "Jamais",
          }))
        )

        setFormations(formattedFormations)
      } catch (err: any) {
        setError("Erreur lors de la récupération des modules")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledModules()
  }, [userId])

  useEffect(() => {
    if (!loading && !userId && error) {
      window.location.href = "/"
    }
  }, [loading, userId, error])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

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
  const averageProgress = formations.length > 0 ? formations.reduce((acc, f) => acc + f.progress, 0) / formations.length : 0

  // Fonction pour ouvrir le popup avec les détails de la formation
  const openFormationDetail = (formation: EnrolledFormation) => {
    setSelectedFormation(formation)
    setIsDetailModalOpen(true)
  }

  // Fonction pour convertir le markdown en HTML simple
  const renderDescriptionAsHtml = (description: string) => {
    // Pour cet exemple, on suppose que la description est déjà en texte brut ou qu'on veut l'afficher telle quelle
    // Si vous avez du Markdown, vous devriez utiliser une bibliothèque comme marked ou showdown pour le convertir en HTML
    return { __html: description }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
              <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Mes Formations</h1>
              <p className="text-xl opacity-90 max-w-2xl">Gérez et suivez votre progression dans vos programmes de formation avec facilité.</p>
            </div>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="py-10 bg-white">
          <div className="container mx-auto px-6">
            {loading ? (
              <div className="text-center text-gray-600">Chargement...</div>
            ) : error ? (
              <div className="text-center text-red-600 font-medium">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { value: totalFormations, label: "Formations Inscrites", color: "bg-blue-600" },
                  { value: completedFormations, label: "Terminées", color: "bg-green-600" },
                  { value: inProgressFormations, label: "En cours", color: "bg-orange-600" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`p-6 ${stat.color} text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300`}
                  >
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm font-medium opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Formations List */}
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-6">
            {loading ? (
              <div className="text-center text-gray-600">Chargement des modules...</div>
            ) : error ? (
              <div className="text-center text-red-600 font-medium">{error}</div>
            ) : formations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucune formation trouvée</h3>
                <p className="text-gray-600 mb-8">
                  Vous n'êtes inscrit à aucune formation pour le moment.
                </p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300">
                  Découvrir nos formations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {formations.map((formation) => (
                  <div
                    key={formation.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{formation.title}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {formation.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4 text-gray-600">
                        <div>
                          <span className="block text-xs text-gray-500">Instructeur</span>
                          <span className="font-medium">{formation.instructor}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Durée</span>
                          <span className="font-medium">{formation.duration}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500">Inscrit le</span>
                          <span className="font-medium">{formatDate(formation.enrollmentDate)}</span>
                        </div>
                      </div>
                      {formation.certificateAvailable && (
                        <div className="mb-4">
                          <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            🏆 Certificat disponible
                          </span>
                        </div>
                      )}
                      <div className="flex gap-3">
                        {formation.status === "termine" ? (
                          <>
                            <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-all duration-300">
                              Revoir le contenu
                            </button>
                            {formation.certificateAvailable && (
                              <button className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-600 transition-all duration-300">
                                Télécharger certificat
                              </button>
                            )}
                          </>
                        ) : formation.status === "en_cours" ? (
                          <>
                            <button
                              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                            >
                              Continuer
                            </button>
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                              📋
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openFormationDetail(formation)}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                          >
                            Commencer la formation
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-700" style={{ width: `${formation.progress}%` }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />

      {/* Popup de détails de formation */}
      {isDetailModalOpen && selectedFormation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedFormation.title}</h2>
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Description</h3>
                  <div 
                    className="text-gray-600" 
                    dangerouslySetInnerHTML={renderDescriptionAsHtml(selectedFormation.description)}
                  />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Détails de la formation</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Catégorie</span>
                        <span className="font-medium">{selectedFormation.category}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Instructeur</span>
                        <span className="font-medium">{selectedFormation.instructor}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Durée</span>
                        <span className="font-medium">{selectedFormation.duration}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Date d'inscription</span>
                        <span className="font-medium">{formatDate(selectedFormation.enrollmentDate)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Dernier accès</span>
                        <span className="font-medium">{formatDate(selectedFormation.lastAccessed)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Progression</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 h-2.5 rounded-full" 
                        style={{ width: `${selectedFormation.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{selectedFormation.progress}% complété</span>
                      <span>{selectedFormation.completedModules}/{selectedFormation.totalModules} modules</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300"
                >
                  Fermer
                </button>
                <button 
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                >
                  Commencer maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FormationPersonnel