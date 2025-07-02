"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface Card {
  id: number
  title: string
  description: string
  icon: string
  color: string
  delay: number
}

const cardsData: Card[] = [
  {
    id: 1,
    title: "Expertise Technique",
    description:
      "Notre équipe d'experts maîtrise les dernières technologies pour vous offrir des solutions innovantes.",
    icon: "⚡",
    color: "from-[#06668C] to-blue-700",
    delay: 0,
  },
  {
    id: 2,
    title: "Support Client",
    description: "Un accompagnement personnalisé 24h/24 et 7j/7 pour répondre à tous vos besoins.",
    icon: "🎯",
    color: "from-green-600 to-green-700",
    delay: 200,
  },
  {
    id: 3,
    title: "Sécurité Garantie",
    description: "Vos données sont protégées par les plus hauts standards de sécurité du marché.",
    icon: "🛡️",
    color: "from-gray-800 to-black",
    delay: 400,
  },
  {
    id: 4,
    title: "Performance Optimale",
    description: "Des solutions rapides et efficaces pour maximiser votre productivité au quotidien.",
    icon: "🚀",
    color: "from-[#06668C] to-green-600",
    delay: 600,
  },
]

const AnimatedCards: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedCards, setAnimatedCards] = useState<boolean[]>([false, false, false, false])

  useEffect(() => {
    // Déclencher l'animation au chargement de la page
    const timer = setTimeout(() => {
      setIsVisible(true)

      // Animer chaque carte avec un délai
      cardsData.forEach((card, index) => {
        setTimeout(() => {
          setAnimatedCards((prev) => {
            const newState = [...prev]
            newState[index] = true
            return newState
          })
        }, card.delay)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#06668C] rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-green-600 rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-[#06668C] rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-green-600 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Titre de la section */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#06668C] mb-4">Nos Avantages</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez pourquoi des milliers de clients nous font confiance pour leurs projets
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#06668C] to-green-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grille des cartes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardsData.map((card, index) => (
            <div
              key={card.id}
              className={`group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                animatedCards[index] ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
              } hover:-translate-y-2 hover:scale-105`}
              style={{
                transitionDelay: animatedCards[index] ? "0ms" : `${card.delay}ms`,
              }}
            >
              {/* Gradient de fond au hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}
              ></div>

              {/* Contenu de la carte */}
              <div className="relative p-6 h-full flex flex-col">
                {/* Icône */}
                <div className="mb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-full flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {card.icon}
                  </div>
                </div>

                {/* Titre */}
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#06668C] transition-colors duration-300">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed flex-grow group-hover:text-gray-700 transition-colors duration-300">
                  {card.description}
                </p>

                {/* Ligne décorative */}
                <div
                  className={`w-0 h-1 bg-gradient-to-r ${card.color} mt-4 group-hover:w-full transition-all duration-500 rounded-full`}
                ></div>
              </div>

              {/* Effet de brillance au hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 rounded-xl"></div>
            </div>
          ))}
        </div>

        {/* Statistiques en bas */}
        <div
          className={`mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-800 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-[#06668C] mb-2">1000+</div>
            <div className="text-gray-600">Clients Satisfaits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
            <div className="text-gray-600">Projets Réalisés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#06668C] mb-2">24/7</div>
            <div className="text-gray-600">Support Client</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">10+</div>
            <div className="text-gray-600">Années d'Expérience</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnimatedCards
