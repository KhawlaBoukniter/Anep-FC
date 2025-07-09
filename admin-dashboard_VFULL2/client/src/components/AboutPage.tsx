"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";

interface TeamMember {
  id: number
  name: string
  role: string
  description: string
  image: string
  skills: string[]
}

interface Value {
  id: number
  title: string
  description: string
  icon: string
  color: string
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Marie Dubois",
    role: "CEO & Fondatrice",
    description: "Passionnée par l'innovation digitale avec plus de 15 ans d'expérience",
    image: "/placeholder.svg?height=300&width=300",
    skills: ["Leadership", "Stratégie", "Innovation"],
  },
  {
    id: 2,
    name: "Thomas Martin",
    role: "CTO",
    description: "Expert en développement avec une expertise en architecture logicielle",
    image: "/placeholder.svg?height=300&width=300",
    skills: ["React", "Node.js", "Architecture"],
  },
  {
    id: 3,
    name: "Sophie Laurent",
    role: "Designer UI/UX",
    description: "Créatrice d'expériences utilisateur exceptionnelles et interfaces intuitives",
    image: "/placeholder.svg?height=300&width=300",
    skills: ["Figma", "Design System", "UX Research"],
  },
  {
    id: 4,
    name: "Alexandre Petit",
    role: "Développeur Senior",
    description: "Spécialiste en développement full-stack et optimisation des performances",
    image: "/placeholder.svg?height=300&width=300",
    skills: ["JavaScript", "Python", "DevOps"],
  },
]

const companyValues: Value[] = [
  {
    id: 1,
    title: "Innovation",
    description: "Nous restons à la pointe des technologies pour offrir des solutions avant-gardistes",
    icon: "💡",
    color: "from-[#06668C] to-blue-700",
  },
  {
    id: 2,
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque projet avec un souci du détail constant",
    icon: "⭐",
    color: "from-green-600 to-green-700",
  },
  {
    id: 3,
    title: "Collaboration",
    description: "Nous travaillons en étroite collaboration avec nos clients pour leur succès",
    icon: "🤝",
    color: "from-purple-600 to-purple-700",
  },
  {
    id: 4,
    title: "Intégrité",
    description: "Nous agissons avec transparence et honnêteté dans toutes nos relations",
    icon: "🛡️",
    color: "from-gray-800 to-black",
  },
]

const AboutPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedElements, setAnimatedElements] = useState({
    hero: false,
    story: false,
    values: false,
    team: false,
    stats: false,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)

      // Animer les éléments avec délai
      setTimeout(() => setAnimatedElements((prev) => ({ ...prev, hero: true })), 200)
      setTimeout(() => setAnimatedElements((prev) => ({ ...prev, story: true })), 400)
      setTimeout(() => setAnimatedElements((prev) => ({ ...prev, values: true })), 600)
      setTimeout(() => setAnimatedElements((prev) => ({ ...prev, team: true })), 800)
      setTimeout(() => setAnimatedElements((prev) => ({ ...prev, stats: true })), 1000)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header/>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#06668C] via-blue-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`text-center transition-all duration-1000 ${animatedElements.hero ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">À Propos</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Découvrez notre histoire, nos valeurs et l'équipe passionnée qui donne vie à vos projets digitaux
            </p>
            <div className="w-32 h-1 bg-white mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 ${animatedElements.story ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              <h2 className="text-4xl font-bold text-[#06668C] mb-6">Notre Histoire</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                L’ANEP est un établissement public marocain, créé en 2013 par le décret n°2-13-39 du 24 avril 2013, placé sous la tutelle du Ministère de l'Équipement et de l’Eau. Elle a été mise en place pour professionnaliser la maîtrise d’ouvrage déléguée dans les projets publics d’infrastructure.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                L’ANEP agit souvent comme maître d’ouvrage délégué, ce qui permet aux ministères et institutions de se concentrer sur leur cœur de métier tout en confiant à l’ANEP la conduite technique et administrative des projets.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                L’agence contribue aussi à l’optimisation des coûts, des délais et de la qualité des ouvrages publics, avec un objectif de transparence, d’efficacité et de durabilité.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-[#06668C] mb-2">2013</div>
                  <div className="text-gray-600">Année de création</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                  <div className="text-gray-600">Clients satisfaits</div>
                </div>
              </div>
            </div>

            <div
              className={`transition-all duration-1000 delay-300 ${animatedElements.story ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-[#06668C] to-green-600 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Notre Mission</h3>
                  <p className="text-lg opacity-90 mb-6">
                    Sa mission principale est de concevoir, gérer et suivre la réalisation des équipements publics (bâtiments administratifs, établissements de santé, écoles, centres culturels, etc.) pour le compte de l’État, des collectivités territoriales, ou d’autres établissements publics. 
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${animatedElements.values ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">Nos Valeurs</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Les principes fondamentaux qui guident nos actions et définissent notre culture d'entreprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <div
                key={value.id}
                className={`group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                  animatedElements.values ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                } hover:-translate-y-2`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center text-2xl text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-[#06668C] transition-colors duration-300">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                <div
                  className={`w-0 h-1 bg-gradient-to-r ${value.color} mt-6 group-hover:w-full transition-all duration-500 rounded-full`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div
            className={`text-center mb-16 transition-all duration-1000 ${animatedElements.team ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">Notre Équipe</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Rencontrez les experts passionnés qui donnent vie à vos projets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                  animatedElements.team ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                } hover:-translate-y-2`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#06668C] transition-colors duration-300">
                    {member.name}
                  </h3>
                  <div className="text-green-600 font-semibold mb-3">{member.role}</div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{member.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {member.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full group-hover:bg-[#06668C] group-hover:text-white transition-colors duration-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
     
      <Footer/>
    </div>
  )
}

export default AboutPage
