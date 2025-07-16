"use client";
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "../hooks/use-toast.ts";
import Header from "./header.tsx";
import Footer from "./footer.tsx";

interface Formation {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  price: string;
  instructor: string;
  // image: string;
  objectives: string[];
  prerequisites: string[];
  mode: string;
  start_date: string;
  end_date: string;
  registrationStatus?: "accepted" | "rejected" | "pending" | null;
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
  userId: string | null;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program, onBack, enrolledPrograms, userId }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [enrolledFormations, setEnrolledFormations] = useState<string[]>([]);
  const [moduleStatuses, setModuleStatuses] = useState<Record<string, string>>({});
  const [formationsWithStatus, setFormationsWithStatus] = useState<Formation[]>(program.formations);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isFullyEnrolled = useMemo(() => {
    return program.type === "program"
      ? formationsWithStatus.every((formation) => formation.registrationStatus === "accepted")
      : enrolledPrograms.includes(program.id);
  }, [formationsWithStatus, program.type, enrolledPrograms, program.id]);

  useEffect(() => {
    const fetchEnrolledModules = async (retries = 3, delay = 1000) => {
      if (!userId) {
        setError("Veuillez vous connecter pour voir vos modules inscrits.");
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Session invalide. Veuillez vous reconnecter.");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/cycles-programs/${program.id}/registrations?user_id=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.length > 0) {
          const moduleIds = response.data[0].CycleProgramUserModules.map((m: any) => m.module_id);
          const statuses = response.data[0].CycleProgramUserModules.reduce(
            (acc: Record<string, string>, m: any) => ({
              ...acc,
              [m.module_id]: m.status,
            }),
            {}
          );

          setEnrolledFormations(moduleIds);
          setModuleStatuses(statuses);
          setFormationsWithStatus(
            program.formations.map((formation) => ({
              ...formation,
              registrationStatus: statuses[formation.id] || null,
            }))
          );
        } else {
          setEnrolledFormations([]);
          setModuleStatuses({});
          setFormationsWithStatus(program.formations.map((formation) => ({ ...formation, registrationStatus: null })));
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des modules inscrits:", err);
        if (retries > 0 && (err.response?.status === 500 || err.response?.status === 429)) {
          // console.log(`Retrying fetchEnrolledModules, ${retries} attempts left...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchEnrolledModules(retries - 1, delay * 2);
        }
        setError(err.response?.data?.message || "Impossible de charger les modules inscrits.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrolledModules();

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [program.id, userId, program.formations]);

  const handleModuleToggle = (formationId: string) => {
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
      const availableModules = formationsWithStatus
        .filter((formation) => !enrolledFormations.includes(formation.id) || formation.registrationStatus === "rejected")
        .map((formation) => formation.id);
      setSelectedModules(availableModules);
    }
    setSelectAll(!selectAll);
  };

  const handleEnrollProgram = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez vous connecter pour vous inscrire.",
      });
      return;
    }

    if (selectedModules.length === 0) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner au moins un module pour vous inscrire.",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Session invalide. Veuillez vous reconnecter.",
        });
        return;
      }

      // console.log('Sending enrollment request:', {
      //   user_id: userId,
      //   module_ids: JSON.stringify(selectedModules),
      // });

      const response = await axios.post(
        `${API_BASE_URL}/api/cycles-programs/${program.id}/register`,
        {
          user_id: userId,
          module_ids: JSON.stringify(selectedModules),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEnrolledFormations((prev) => [...prev, ...selectedModules]);
      setModuleStatuses((prev) => {
        const newStatuses = { ...prev };
        selectedModules.forEach((id) => {
          newStatuses[id] = "pending";
        });
        return newStatuses;
      });
      setFormationsWithStatus((prev) =>
        prev.map((formation) =>
          selectedModules.includes(formation.id) ? { ...formation, registrationStatus: "pending" } : formation
        )
      );
      setSelectedModules([]);
      setSelectAll(false);
      toast({ title: "Succès", description: "Inscription soumise. En attente de validation par l'administrateur." });
    } catch (err: any) {
      console.error("Erreur lors de l'inscription:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de l'inscription. Veuillez réessayer.";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
    }
  };

  const openPopup = (formation: Formation) => {
    setSelectedFormation(formation);
  };

  const closePopup = () => {
    setSelectedFormation(null);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

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
              aria-label="Retour à la liste des formations"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour
            </button>
            <span
              className="px-4 py-2 bg-green-600 bg-opacity-80 rounded-full text-sm font-semibold"
              aria-label="Programme spécialisé"
            >
              📚 Programme Spécialisé
            </span>
          </div>

          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{program.title || "Programme sans titre"}</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl opacity-90">
              {program.description || "Aucune description disponible"}
            </p>

            {enrolledFormations.length > 0 && (
              <div className="mt-6 p-4 bg-green-100 border border-green-300 rounded-lg inline-block">
                <span className="text-green-800 font-semibold" aria-label="Statut de l'inscription">
                  ✅ Vous êtes inscrit à {enrolledFormations.length} module(s) sur {program.formations.length} dans {program.title}.
                </span>
              </div>
            )}
            {enrolledFormations.length === 0 && (
              <p className="text-lg text-gray-200" aria-label="Aucune inscription">
                Vous n'êtes inscrit à aucun module du programme {program.title}.
              </p>
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
            {program.type === "program" && !isFullyEnrolled && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <label className="flex items-center text-gray-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="mr-2 h-5 w-5"
                    disabled={!userId}
                    aria-label="Tout sélectionner"
                  />
                  Tout sélectionner
                </label>
                <button
                  onClick={handleEnrollProgram}
                  disabled={selectedModules.length === 0 || !userId}
                  className={`py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    selectedModules.length === 0 || !userId
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : `bg-gradient-to-r ${program.color} text-white hover:shadow-lg transform hover:-translate-y-1`
                  }`}
                  aria-label={`S'inscrire à ${selectedModules.length} module(s)`}
                  aria-disabled={selectedModules.length === 0 || !userId ? "true" : "false"}
                >
                  S'inscrire ({selectedModules.length} module{selectedModules.length > 1 ? "s" : ""} sélectionné
                  {selectedModules.length > 1 ? "s" : ""})
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {formationsWithStatus.map((formation) => (
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
                    aria-label={`Voir les détails de ${formation.title}`}
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
                  {formation.registrationStatus ? (
                    <span
                      className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                        formation.registrationStatus === "accepted"
                          ? "bg-green-500"
                          : formation.registrationStatus === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      aria-label={`Statut du module : ${formation.registrationStatus}`}
                    >
                      {formation.registrationStatus === "accepted"
                        ? "✓ Accepté"
                        : formation.registrationStatus === "pending"
                        ? "⏳ En attente"
                        : "❌ Rejeté"}
                    </span>
                  ) : (
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(formation.id)}
                      onChange={() => handleModuleToggle(formation.id)}
                      className="h-5 w-5"
                      disabled={!userId || (program.type === "cycle" && enrolledPrograms.includes(program.id))}
                      aria-label={`Sélectionner le module ${formation.title}`}
                    />
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
                  aria-label="Fermer la fenêtre des détails"
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