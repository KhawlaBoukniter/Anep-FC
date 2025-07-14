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

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program, onBack, enrolledPrograms }) => {
  // Replace with your actual method to get the current user's ID
  const currentUserId = /* Your method to get user ID, e.g., useAuth().user?.id or session.user.id */ null;
  const [isVisible, setIsVisible] = useState(false);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [enrolledFormations, setEnrolledFormations] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

  useEffect(() => {
    const fetchEnrolledModules = async () => {
      if (!currentUserId) {
        console.error("Utilisateur non connecté.");
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cycles-programs/${program.id}/registrations?user_id=${currentUserId}`);
        if (response.data.length > 0) {
          const moduleIds = response.data[0].CycleProgramUserModules.map((m: any) => m.module_id);
          setEnrolledFormations(moduleIds);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des modules inscrits:", err);
      }
    };

    fetchEnrolledModules();

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [program.id, currentUserId]);

  const handleModuleToggle = (formationId: number) => {
    setSelectedModules((prev) =>
      prev.includes(formationId)
        ? prev.filter((id) => id !== formationId)
        : [...prev, formationId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedModules([]);
    } else {
      const availableModules = program.formations
        .filter((formation) => !enrolledFormations.includes(formation.id))
        .map((formation) => formation.id);
      setSelectedModules(availableModules);
    }
    setSelectAll(!selectAll);
  };

  const handleEnrollProgram = async () => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour vous inscrire.");
      return;
    }
    if (selectedModules.length === 0) {
      alert("Veuillez sélectionner au moins un module pour vous inscrire.");
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/cycles-programs/${program.id}/register`, {
        user_id: currentUserId,
        module_ids: JSON.stringify(selectedModules),
      });
      setEnrolledFormations((prev) => [...prev, ...selectedModules]);
      setSelectedModules([]);
      setSelectAll(false);
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
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">Modules de ce programme spécialisé</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez les modules qui vous intéressent dans ce programme. Vous pouvez vous inscrire à un ou plusieurs modules selon vos besoins.
            </p>
            {!isEnrolled && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <label className="flex items-center text-gray-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="mr-2 h-5 w-5"
                    disabled={!currentUserId}
                  />
                  Tout sélectionner
                </label>
                <button
                  onClick={handleEnrollProgram}
                  disabled={selectedModules.length === 0 || !currentUserId}
                  className={`py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    selectedModules.length === 0 || !currentUserId
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : `bg-gradient-to-r ${program.color} text-white hover:shadow-lg transform hover:-translate-y-1`
                  }`}
                >
                  S'inscrire ({selectedModules.length} module{selectedModules.length > 1 ? "s" : ""} sélectionné
                  {selectedModules.length > 1 ? "s" : ""})
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {program.formations.map((formation) => (
              <div
                key={formation.id}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{formation.title}</h3>
                  <p className="text-sm text-gray-600">{formation.description || "Aucune description disponible"}</p>
                  <p className="text-sm text-gray-500">Mode: {formation.mode || "Non spécifié"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openPopup(formation)}
                    className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-300"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Détails
                  </button>
                  {!enrolledFormations.includes(formation.id) ? (
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(formation.id)}
                      onChange={() => handleModuleToggle(formation.id)}
                      className="h-5 w-5"
                      disabled={!currentUserId}
                    />
                  ) : (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      ✓ Inscrit
                    </span>
                  )}
                </div>
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