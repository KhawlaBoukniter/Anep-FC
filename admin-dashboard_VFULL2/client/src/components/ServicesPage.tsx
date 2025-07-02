"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
interface Service {
  id: number
  title: string
  description: string
  icon: string
  features: string[]
  price: string
  color: string
}

const servicesData: Service[] = [
  {
    id: 1,
    title: "Développement Web",
    description: "Création de sites web modernes et responsives avec les dernières technologies",
    icon: "💻",
    features: ["React/Next.js", "Design Responsive", "SEO Optimisé", "Performance Élevée"],
    price: "À partir de 2500€",
    color: "from-[#06668C] to-blue-700",
  },
  {
    id: 2,
    title: "Applications Mobile",
    description: "Développement d'applications natives et cross-platform pour iOS et Android",
    icon: "📱",
    features: ["React Native", "Flutter", "iOS/Android", "UI/UX Design"],
    price: "À partir de 3500€",
    color: "from-green-600 to-green-700",
  },
  {
    id: 3,
    title: "E-commerce",
    description: "Solutions complètes de commerce électronique avec paiement sécurisé",
    icon: "🛒",
    features: ["Shopify/WooCommerce", "Paiement Sécurisé", "Gestion Stock", "Analytics"],
    price: "À partir de 4000€",
    color: "from-gray-800 to-black",
  },
  {
    id: 4,
    title: "Consulting IT",
    description: "Conseil et stratégie digitale pour optimiser votre présence en ligne",
    icon: "🎯",
    features: ["Audit Technique", "Stratégie Digital", "Formation", "Support 24/7"],
    price: "À partir de 150€/h",
    color: "from-[#06668C] to-green-600",
  },
  {
    id: 5,
    title: "Design UI/UX",
    description: "Création d'interfaces utilisateur intuitives et expériences utilisateur optimales",
    icon: "🎨",
    features: ["Wireframing", "Prototypage", "Design System", "Tests Utilisateur"],
    price: "À partir de 1800€",
    color: "from-purple-600 to-purple-700",
  },
  {
    id: 6,
    title: "Maintenance & Support",
    description: "Maintenance continue et support technique pour vos projets digitaux",
    icon: "🔧",
    features: ["Mises à jour", "Sécurité", "Backup", "Monitoring"],
    price: "À partir de 200€/mois",
    color: "from-orange-600 to-red-600",
  },
]

const processSteps = [
  {
    step: "01",
    title: "Analyse & Consultation",
    description: "Nous analysons vos besoins et définissons ensemble la stratégie optimale",
    icon: "🔍",
  },
  {
    step: "02",
    title: "Conception & Design",
    description: "Création des maquettes et prototypes selon vos spécifications",
    icon: "✏️",
  },
  {
    step: "03",
    title: "Développement",
    description: "Développement de votre solution avec les meilleures technologies",
    icon: "⚙️",
  },
  {
    step: "04",
    title: "Tests & Livraison",
    description: "Tests complets et mise en ligne de votre projet finalisé",
    icon: "🚀",
  },
]

const ServicesPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedServices, setAnimatedServices] = useState<boolean[]>(new Array(servicesData.length).fill(false))

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)

      // Animer les services avec délai
      servicesData.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedServices((prev) => {
            const newState = [...prev]
            newState[index] = true
            return newState
          })
        }, index * 150)
      })
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
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Nos Services</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Des solutions digitales sur mesure pour propulser votre entreprise vers le succès
            </p>
            <div className="w-32 h-1 bg-white mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">Notre Expertise</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez notre gamme complète de services digitaux conçus pour répondre à tous vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesData.map((service, index) => (
              <div
                key={service.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                  animatedServices[index] ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                } hover:-translate-y-2`}
              >
                <div className="p-8">
                  {/* Icône et prix */}
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-2xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {service.icon}
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Prix</span>
                      <div className="text-lg font-bold text-[#06668C]">{service.price}</div>
                    </div>
                  </div>

                  {/* Titre et description */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-[#06668C] transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bouton */}
                  <button className="w-full bg-gradient-to-r from-[#06668C] to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                    En savoir plus
                  </button>
                </div>

                {/* Ligne décorative */}
                <div
                  className={`h-1 bg-gradient-to-r ${service.color} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">Notre Processus</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une méthodologie éprouvée pour garantir le succès de vos projets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#06668C] to-green-600 rounded-full flex items-center justify-center text-2xl text-white mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-[#06668C] transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  )
}

export default ServicesPage
