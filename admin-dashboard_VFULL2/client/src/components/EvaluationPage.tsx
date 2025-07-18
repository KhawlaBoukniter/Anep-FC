"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"; // Import ajouté
import axios from "axios"; // Import ajouté

interface EvaluationData {
  [key: string]: number
}

interface AxisConfig {
  id: string
  title: string
  angle: number
  color: string
}

const axisConfig: AxisConfig[] = [
  { id: "apports", title: "Apports d'informations", angle: 0, color: "#06668C" },
  { id: "reponse", title: "Réponse aux Objectifs", angle: 72, color: "#059669" },
  { id: "condition", title: "Conditions Logistiques", angle: 144, color: "#7C3AED" },
  { id: "conception", title: "Conception de la démarche", angle: 216, color: "#DC2626" },
  { id: "qualite", title: "Qualité de l'animation", angle: 288, color: "#EA580C" },
]

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Ajouté

const EvaluationPage: React.FC = () => {
  const location = useLocation(); // Hook ajouté
  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    apports: 0,
    reponse: 0,
    condition: 0,
    conception: 0,
    qualite: 0,
  })
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredAxis, setHoveredAxis] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null); // Ajouté
  const [moduleId, setModuleId] = useState<string | null>(null); // Ajouté

  useEffect(() => {
    // Récupération des paramètres URL
    const queryParams = new URLSearchParams(location.search);
    const userIdParam = queryParams.get('userId');
    const moduleIdParam = queryParams.get('moduleId');
    
    if (userIdParam) setUserId(userIdParam);
    if (moduleIdParam) setModuleId(moduleIdParam);
  }, [location]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Fonction pour convertir les coordonnées polaires en cartésiennes
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    }
  }

  // Fonction pour gérer le clic sur un axe
  const handleAxisClick = (axisId: string, level: number) => {
    setEvaluationData((prev) => ({
      ...prev,
      [axisId]: level,
    }))
  }

  // Fonction pour télécharger en PDF (simulation)
  const handleDownloadPDF = () => {
    const results = axisConfig.map((axis) => ({
      titre: axis.title,
      note: evaluationData[axis.id],
    }))

    // Simulation de génération PDF
    console.log("Génération PDF avec les données:", results)
    alert(
      `PDF généré avec succès!\n\nRésultats:\n${results
        .map((r) => `${r.titre}: ${r.note}/5`)
        .join("\n")}\n\nEn production, ceci téléchargerait un vrai PDF.`,
    )
  }

  // Fonction pour envoyer les réponses (modifiée)
  const handleSendResults = async () => {
    const completedAxes = Object.values(evaluationData).filter((value) => value > 0).length
    const totalAxes = axisConfig.length

    if (completedAxes < totalAxes) {
      alert(`Veuillez compléter toutes les évaluations (${completedAxes}/${totalAxes} complétées)`)
      return
    }

    // Vérification des IDs
    if (!userId || !moduleId) {
      alert("ID utilisateur ou module manquant. Veuillez passer par la page de formation.");
      return;
    }

    try {
      // Envoi des données au backend
      const response = await axios.post(`${API_BASE_URL}/api/evaluations`, {
        userId,
        moduleId,
        scores: evaluationData
      });

      console.log("Réponse du serveur:", response.data);
      alert("Évaluation envoyée avec succès! Merci pour votre participation.");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'évaluation:", error);
      alert("Une erreur est survenue lors de l'envoi de l'évaluation.");
    }
  }

  // Calcul du score moyen
  const averageScore = Object.values(evaluationData).reduce((sum, value) => sum + value, 0) / axisConfig.length

  const svgSize = 400
  const center = svgSize / 2
  const maxRadius = 150

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
            className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Évaluation des Formations</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Évaluez vos formations sur 5 axes principaux de 1 à 5
            </p>
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-[#06668C] mb-4">Comment ça marche ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-[#06668C] text-white rounded-full flex items-center justify-center mr-3 font-bold">
                  1
                </div>
                <span>Cliquez sur chaque axe pour noter de 1 à 5</span>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mr-3 font-bold">
                  2
                </div>
                <span>Téléchargez ou envoyez vos résultats</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Évaluation principale */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Graphique radar */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-[#06668C] mb-6 text-center">Evaluation à chaud de la formation</h3>

                <div className="flex justify-center">
                  <svg width={svgSize} height={svgSize} className="overflow-visible">
                    {/* Grilles concentriques */}
                    {[1, 2, 3, 4, 5].map((level) => (
                      <g key={level}>
                        <polygon
                          points={axisConfig
                            .map((axis) => {
                              const point = polarToCartesian(center, center, (maxRadius * level) / 5, axis.angle)
                              return `${point.x},${point.y}`
                            })
                            .join(" ")}
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                          opacity={0.5}
                        />
                        {/* Numéros de niveau */}
                        <text
                          x={center + ((maxRadius * level) / 5) * 0.1}
                          y={center - (maxRadius * level) / 5 + 5}
                          fontSize="10"
                          fill="#9ca3af"
                          textAnchor="middle"
                        >
                          {level}
                        </text>
                      </g>
                    ))}

                    {/* Axes */}
                    {axisConfig.map((axis) => {
                      const endPoint = polarToCartesian(center, center, maxRadius, axis.angle)
                      return (
                        <g key={axis.id}>
                          <line
                            x1={center}
                            y1={center}
                            x2={endPoint.x}
                            y2={endPoint.y}
                            stroke="#6b7280"
                            strokeWidth="2"
                          />

                          {/* Points cliquables sur chaque axe */}
                          {[1, 2, 3, 4, 5].map((level) => {
                            const point = polarToCartesian(center, center, (maxRadius * level) / 5, axis.angle)
                            const isSelected = evaluationData[axis.id] === level
                            const isHovered = hoveredAxis === `${axis.id}-${level}`

                            return (
                              <circle
                                key={level}
                                cx={point.x}
                                cy={point.y}
                                r={isSelected ? 8 : isHovered ? 6 : 4}
                                fill={isSelected ? axis.color : isHovered ? axis.color : "#d1d5db"}
                                stroke={isSelected ? "#ffffff" : axis.color}
                                strokeWidth={isSelected ? 3 : 1}
                                className="cursor-pointer transition-all duration-200"
                                onClick={() => handleAxisClick(axis.id, level)}
                                onMouseEnter={() => setHoveredAxis(`${axis.id}-${level}`)}
                                onMouseLeave={() => setHoveredAxis(null)}
                              />
                            )
                          })}

                          {/* Titres des axes */}
                          <text
                            x={polarToCartesian(center, center, maxRadius + 30, axis.angle).x}
                            y={polarToCartesian(center, center, maxRadius + 30, axis.angle).y}
                            fontSize="12"
                            fontWeight="bold"
                            fill={axis.color}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="pointer-events-none"
                          >
                            {axis.title}
                          </text>
                        </g>
                      )
                    })}

                    {/* Forme remplie basée sur les sélections */}
                    {Object.values(evaluationData).some((value) => value > 0) && (
                      <polygon
                        points={axisConfig
                          .map((axis) => {
                            const level = evaluationData[axis.id] || 0
                            const point = polarToCartesian(center, center, (maxRadius * level) / 5, axis.angle)
                            return `${point.x},${point.y}`
                          })
                          .join(" ")}
                        fill="rgba(6, 102, 140, 0.2)"
                        stroke="#06668C"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* Panel de contrôle */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-[#06668C] mb-6">Vos Évaluations</h3>

                  <div className="space-y-4">
                    {axisConfig.map((axis) => (
                      <div key={axis.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">{axis.title}</span>
                          <span
                            className="text-lg font-bold px-3 py-1 rounded-full text-white"
                            style={{ backgroundColor: axis.color }}
                          >
                            {evaluationData[axis.id] || 0}/5
                          </span>
                        </div>

                        {/* Boutons de sélection */}
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => handleAxisClick(axis.id, level)}
                              className={`w-10 h-10 rounded-full border-2 font-semibold transition-all duration-200 ${
                                evaluationData[axis.id] === level
                                  ? "text-white border-transparent"
                                  : "text-gray-600 border-gray-300 hover:border-gray-400"
                              }`}
                              style={{
                                backgroundColor: evaluationData[axis.id] === level ? axis.color : "transparent",
                              }}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="bg-gradient-to-r from-[#06668C] to-green-600 text-white rounded-2xl p-6">
                  <h4 className="text-lg font-bold mb-4">Résumé</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{averageScore.toFixed(1)}/5</div>
                      <div className="text-sm opacity-90">Score moyen</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Object.values(evaluationData).filter((v) => v > 0).length}/{axisConfig.length}
                      </div>
                      <div className="text-sm opacity-90">Axes complétés</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Télécharger PDF
                  </button>

                  <button
                    onClick={handleSendResults}
                    className="flex-1 bg-gradient-to-r from-[#06668C] to-green-600 hover:shadow-lg text-white py-4 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conseils d'amélioration */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-[#06668C] mb-8 text-center">Conseils d'Amélioration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {axisConfig.map((axis) => {
                const score = evaluationData[axis.id] || 0
                let advice = ""
                let bgColor = ""

                if (score === 0) {
                  advice = "Commencez par évaluer cette compétence"
                  bgColor = "bg-gray-100"
                } else if (score <= 2) {
                  advice = "Beaucoup de marge de progression - considérez une formation"
                  bgColor = "bg-red-50"
                } else if (score <= 3) {
                  advice = "Bon niveau - continuez à vous améliorer"
                  bgColor = "bg-yellow-50"
                } else if (score <= 4) {
                  advice = "Très bon niveau - quelques ajustements possibles"
                  bgColor = "bg-blue-50"
                } else {
                  advice = "Excellence - partagez votre expertise !"
                  bgColor = "bg-green-50"
                }

                return (
                  <div key={axis.id} className={`${bgColor} rounded-xl p-6 border`}>
                    <div className="flex items-center mb-3">
                      <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: axis.color }}></div>
                      <h3 className="font-bold text-gray-800">{axis.title}</h3>
                    </div>
                    <div className="text-2xl font-bold mb-2" style={{ color: axis.color }}>
                      {score}/5
                    </div>
                    <p className="text-sm text-gray-600">{advice}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default EvaluationPage