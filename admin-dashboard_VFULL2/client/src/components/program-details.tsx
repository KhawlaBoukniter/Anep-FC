"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Header from "../components/header.tsx"
import Footer from "../components/footer.tsx"

interface Formation {
  id: number
  title: string
  description: string
  duration: string
  level: string
  price: string
  instructor: string
  image: string
  objectives: string[]
  prerequisites: string[]
}

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
  formations: Formation[]
}

interface ProgramDetailsProps {
  program: Program
  onBack: () => void
  enrolledPrograms: number[]
}

const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program, onBack, enrolledPrograms }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedCards, setAnimatedCards] = useState<boolean[]>(new Array(program.formations.length).fill(false))
  const [enrolledFormations, setEnrolledFormations] = useState<number[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Animer les cartes avec délai
      program.formations.forEach((_, index) => {
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
  }, [program.formations])

  const handleEnrollFormation = (formationId: number) => {
    setEnrolledFormations((prev) => [...prev, formationId])
    alert("Inscription réussie à la formation ! Vous recevrez un email de confirmation.")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className={`relative py-20 bg-gradient-to-br ${program.color} text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="flex items-center text-white hover:text-gray-200 transition-colors duration-200 mr-6"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <span className="px-4 py-2 bg-green-600 bg-opacity-80 rounded-full text-sm font-semibold">
              📚 Programme Spécialisé
            </span>
          </div>

          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{program.title}</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl opacity-90">{program.description}</p>

            <div className="flex flex-wrap gap-6 text-lg mb-8">
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
        </div>
      </section>

      {/* Formations Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">Formations de ce programme spécialisé</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez les formations qui vous intéressent dans ce programme. Vous pouvez vous inscrire à une ou
              plusieurs formations selon vos besoins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {program.formations.map((formation, index) => (
              <div
                key={formation.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                  animatedCards[index] ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                } hover:-translate-y-2`}
              >
                {/* Image */}
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={formation.image || "/placeholder.svg"}
                    alt={formation.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black bg-opacity-70 text-white text-xs font-semibold rounded-full">
                      {formation.level}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                      Formation {index + 1}
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

                  <p className="text-gray-600 mb-4 leading-relaxed">{formation.description}</p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-300">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Plus d'infos
                    </button>

                    <button
                      onClick={() => handleEnrollFormation(formation.id)}
                      disabled={enrolledFormations.includes(formation.id)}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                        enrolledFormations.includes(formation.id)
                          ? "bg-green-500 text-white cursor-not-allowed"
                          : `bg-gradient-to-r ${program.color} text-white hover:shadow-lg transform hover:-translate-y-1`
                      }`}
                    >
                      {enrolledFormations.includes(formation.id) ? "Inscrit ✓" : "S'inscrire"}
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

     

      <Footer />
    </div>
  )
}

export default ProgramDetails
