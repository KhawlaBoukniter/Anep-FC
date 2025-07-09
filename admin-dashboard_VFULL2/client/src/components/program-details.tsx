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
              <div className="flex items-center">
                <span className="mr-2">💰</span>
                <span className="text-2xl font-bold">À partir de {program.formations[0]?.price || program.price}</span>
              </div>
            </div>

            <button className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-800 transition-all duration-300">
              Demander plus d'infos sur le programme
            </button>
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

                  {/* Infos */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="mr-1">⏱️</span>
                      <span>{formation.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">👨‍🏫</span>
                      <span>{formation.instructor}</span>
                    </div>
                  </div>

                  {/* Objectifs */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">🎯 Objectifs :</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {formation.objectives.slice(0, 2).map((objective, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-0.5">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prérequis */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">📋 Prérequis :</h4>
                    <div className="flex flex-wrap gap-1">
                      {formation.prerequisites.slice(0, 2).map((prereq, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>

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

      {/* Program Info Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Modules */}
            <div>
              <h3 className="text-2xl font-bold text-[#06668C] mb-6">📖 Contenu du programme</h3>
              <ul className="space-y-3">
                {program.modules.map((module, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-3 mt-1">✓</span>
                    <span className="text-gray-700 text-lg">{module}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Objectifs */}
            <div>
              <h3 className="text-2xl font-bold text-[#06668C] mb-6">🎯 Objectifs pédagogiques</h3>
              <ul className="space-y-3">
                {program.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">→</span>
                    <span className="text-gray-700 text-lg">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prérequis */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-[#06668C] mb-6">📋 Prérequis</h3>
            <div className="flex flex-wrap gap-3">
              {program.prerequisites.map((prereq, index) => (
                <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-lg">
                  {prereq}
                </span>
              ))}
            </div>
          </div>

          {/* Avantages du programme */}
          <div className="mt-12 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl">
            <h3 className="text-2xl font-bold text-[#06668C] mb-6">🌟 Avantages du programme spécialisé</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">🎯</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Formation ciblée</h4>
                  <p className="text-gray-600">Concentrez-vous sur les compétences spécifiques dont vous avez besoin</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">⚡</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Flexibilité maximale</h4>
                  <p className="text-gray-600">Choisissez uniquement les formations qui vous intéressent</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">💼</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Expertise approfondie</h4>
                  <p className="text-gray-600">Devenez expert dans un domaine spécifique</p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-green-600 mr-3 mt-1">🚀</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Mise en pratique immédiate</h4>
                  <p className="text-gray-600">Appliquez directement vos nouvelles compétences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default ProgramDetails
