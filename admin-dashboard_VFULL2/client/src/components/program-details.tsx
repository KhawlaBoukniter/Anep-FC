"use client";
import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./header.tsx";
import Footer from "./footer.tsx";

interface Formation {
  id: number;
  title: string;
  description: string;
  duration: string;
  level: string;
  price: string;
  instructor: string;
  image: string;
  objectives: string[];
  prerequisites: string[];
  mode: string;
  start_date: string;
  end_date: string;
}

interface Program {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  duration: string;
  level: string;
  price: string;
  instructor: string;
  image: string;
  category: string;
  type: "cycle" | "program";
  modules: string[];
  prerequisites: string[];
  objectives: string[];
  color: string;
  rating: number;
  students: number;
  formations: Formation[];
}

interface ProgramDetailsProps {
  program: Program;
  onBack: () => void;
  enrolledPrograms: number[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program, onBack, enrolledPrograms }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCards, setAnimatedCards] = useState<boolean[]>(new Array(program.formations.length).fill(false));
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [enrolledFormations, setEnrolledFormations] = useState<number[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  useEffect(() => {
    const fetchEnrolledModules = async () => {
      try {
        const userId = 1; // Replace with actual user ID from authentication
        const response = await axios.get(`${API_BASE_URL}/api/cycles-programs/${program.id}/registrations?user_id=${userId}`);
        if (response.data.length > 0) {
          const moduleIds = response.data[0].CycleProgramUserModules.map((m: any) => m.module_id);
          setEnrolledFormations(moduleIds);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des modules inscrits:", err);
      }
    };

    fetchEnrolledModules();
  }, [program.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      program.formations.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedCards((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 150);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [program.formations]);

  const handleModuleToggle = (formationId: number) => {
    setSelectedModules((prev) =>
      prev.includes(formationId)
        ? prev.filter((id) => id !== formationId)
        : [...prev, formationId]
    );
  };

  const handleEnrollProgram = async () => {
    if (selectedModules.length === 0) {
      alert("Veuillez sélectionner au moins un module pour vous inscrire.");
      return;
    }

    try {
      const userId = 1; // Replace with actual user ID from authentication
      const response = await axios.post(`${API_BASE_URL}/api/cycles-programs/${program.id}/register`, {
        user_id: userId,
        module_ids: JSON.stringify(selectedModules),
      });
      setEnrolledFormations((prev) => [...prev, ...selectedModules]);
      setSelectedModules([]);
      alert("Inscription réussie ! Vous recevrez un email de confirmation.");
    } catch (err: any) {
      console.error("Erreur lors de l'inscription:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.";
      alert(errorMessage);
    }
  };

  const isEnrolled = enrolledPrograms.includes(program.id);

  const openPopup = (formation: Formation) => {
    setSelectedFormation(formation);
  };

  const closePopup = () => {
    setSelectedFormation(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
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

            {isEnrolled && (
              <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg inline-block">
                <span className="text-green-800 font-semibold">
                  ✅ Vous êtes inscrit à ce programme !
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">Formations de ce programme spécialisé</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez les formations qui vous intéressent dans ce programme. Vous pouvez vous inscrire à une ou
              plusieurs formations selon vos besoins.
            </p>
            {!isEnrolled && (
              <button
                onClick={handleEnrollProgram}
                disabled={selectedModules.length === 0}
                className={`py-3 px-6 m-6 rounded-lg font-semibold transition-all duration-300 ${
                  selectedModules.length === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : `bg-gradient-to-r ${program.color} text-white hover:shadow-lg transform hover:-translate-y-1`
                }`}
              >
                S'inscrire au programme ({selectedModules.length} module{selectedModules.length > 1 ? "s" : ""} sélectionné
                {selectedModules.length > 1 ? "s" : ""})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {program.formations.map((formation, index) => (
              <div
                key={formation.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                  animatedCards[index] ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                } hover:-translate-y-2`}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={formation.image || "/placeholder.svg"}
                    alt={formation.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
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
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#06668C] transition-colors duration-300">
                    {formation.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4">
                    <p><strong>Mode:</strong> {formation.mode || "Non spécifié"}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openPopup(formation)}
                      className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-300"
                    >
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
                    {!enrolledFormations.includes(formation.id) && (
                      <button
                        onClick={() => handleModuleToggle(formation.id)}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                          selectedModules.includes(formation.id)
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {selectedModules.includes(formation.id) ? "Sélectionné" : "Sélectionner"}
                      </button>
                    )}
                    {enrolledFormations.includes(formation.id) && (
                      <button
                        className="flex-1 py-2 px-4 rounded-lg font-semibold bg-green-500 text-white cursor-not-allowed"
                        disabled
                      >
                        Inscrit ✓
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className={`h-1 bg-gradient-to-r ${program.color} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`}
                />
              </div>
            ))}
          </div>

          {/* Popup Modal */}
          {selectedFormation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl text-blue-900 font-bold mb-4 text-left">Détails de la Formation</h3>
                <div className="space-y-2 text-left">
                  <p><strong>Titre du module:</strong> {selectedFormation.title}</p>
                  <p><strong>Mode:</strong> {selectedFormation.mode || "Non spécifié"}</p>
                  <p><strong>Description:</strong> {selectedFormation.description || "Aucune description disponible"}</p>
                </div>
                <button
                  onClick={closePopup}
                  className="mt-4 bg-green-600 text-white font-medium py-2 px-12 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProgramDetails;