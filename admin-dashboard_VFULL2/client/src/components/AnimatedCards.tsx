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
  title: "Formation à l’ANEP",
  description:
    "Un levier stratégique de développement des compétences. À l’ANEP, la formation continue n’est pas seulement une obligation institutionnelle, c’est un véritable outil de développement des compétences au service de la performance individuelle et collective. Dès votre intégration, vous serez invité(e) à vous inscrire dans une dynamique d’apprentissage continu, à travers des parcours structurés, des modules spécialisés et des dispositifs innovants adaptés à l’évolution des métiers de l’Agence. Une offre variée et en constante évolution. L’ANEP propose plusieurs cycles de formation actuellement en cours, couvrant des domaines techniques, managériaux et réglementaires. Ces formations s’adressent à l’ensemble des collaborateurs, en fonction de leurs missions et de leurs besoins professionnels.",
  icon: "⚡",
  color: "from-[#06668C] to-blue-700",
  delay: 0,
  },
  {
    id: 2,
    title: "Un accompagnement logistique complet pour favoriser l’accès à la formation",
    description: "Consciente que le développement des compétences passe aussi par la levée des freins logistiques, l’ANEP prend intégralement en charge les frais liés à la participation aux formations. Hébergement, restauration : chaque aspect est pris en compte afin de permettre aux collaborateurs de se concentrer pleinement sur leur apprentissage. Ce soutien logistique reflète la volonté de l’Agence de faire de la formation continue un levier stratégique, accessible à tous.",
    icon: "🎯",
    color: "from-green-600 to-green-700",
    delay: 200,
  },
  {
    id: 3,
    title: "Vous êtes acteur de votre développement professionnel :",
    description: "À l’ANEP, chaque collaborateur est invité à être un véritable acteur de sa montée en compétences. Cette dynamique repose sur une implication personnelle forte, notamment par l’autoformation, ainsi que sur un accompagnement personnalisé assuré par les managers. Les collaborateurs sont ainsi encouragés à consulter régulièrement l’offre de formation, à exprimer leurs besoins spécifiques et à s’engager activement dans l’évolution de leur parcours.",
    icon: "🛡️",
    color: "from-gray-800 to-black",
    delay: 400,
  }
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
          <div className="w-24 h-1 bg-gradient-to-r from-[#06668C] to-green-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grille des cartes */}
        <div className="grid grid-cols-1 w-[60%] m-auto md:grid-cols-1 lg:grid-cols-1 gap-6 text-left">
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
                <div className="mb-4 flex justify-left gap-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-full flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {card.icon}
                  </div>
                  {/* Titre */}
                <h3 className="text-xl font-bold text-gray-800 mt-3 group-hover:text-[#06668C] transition-colors duration-300">
                  {card.title}
                </h3>
                </div>

                

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

       
      </div>
    </section>
  )
}

export default AnimatedCards
