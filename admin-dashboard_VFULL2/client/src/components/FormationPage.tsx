"use client";
import type React from "react";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "../hooks/use-toast.ts";
import Header from "./header.tsx";
import Footer from "./footer.tsx";
import ProgramDetails from "../components/program-details.tsx";
import CycleDetails from "../components/cycle-details.tsx";

interface Formation {
  id: string;
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
  start_date: string;
  end_date: string;
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
  registrationStatus?: "accepted" | "rejected" | "pending" | null;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]+>/g, "").trim();
};

const getImageUrl = (imagePath: string | null | undefined, type?: "cycle" | "program"): string => {
  if (!imagePath) {
    return type === "cycle" ? "/images/cycle.jpg" : type === "program" ? "/images/program.jpg" : "/placeholder.svg";
  }
  return imagePath.startsWith("http") ? imagePath : `${API_BASE_URL}${imagePath}`;
};

const FormationPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCards, setAnimatedCards] = useState<boolean[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrolledPrograms, setEnrolledPrograms] = useState<number[]>([]);
  const [activeFilter, setActiveFilter] = useState<"all" | "cycle" | "program">("all");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedProgramForDetails, setSelectedProgramForDetails] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Veuillez vous connecter pour accéder à vos formations.");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/employees/verify-session`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserId(response.data.id.toString());
      } catch (err: any) {
        console.error("Erreur lors de la vérification de la session:", err);
        setError("Session invalide. Veuillez vous reconnecter.");
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  useEffect(() => {
    if (!loading && !userId && !error) {
      window.location.href = "/";
    }
  }, [loading, userId, error]);

  useEffect(() => {
    const fetchProgramsAndEnrollments = async (retries = 3, delay = 1000) => {
      if (!userId) {
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Session invalide. Veuillez vous reconnecter.");
          return;
        }

        const [programsResponse, registrationsResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/cycles-programs`),
          axios.get(`${API_BASE_URL}/api/cycles-programs/registrations?user_id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const enrollmentMap = new Map<number, string>();
        registrationsResponse.data.forEach((reg: any) => {
          enrollmentMap.set(reg.cycle_program_id, reg.status);
        });

        const transformedPrograms = programsResponse.data.map((cp: any) => ({
          id: cp.id,
          title: cp.title || "Programme sans titre",
          description: stripHtmlTags(cp.description || "Description non disponible"),
          shortDescription: stripHtmlTags(cp.description?.slice(0, 100) + "..." || "Description non disponible"),
          start_date: cp.start_date || "Non spécifié",
          end_date: cp.end_date || "Non spécifié",
          instructor: cp.facilitator || "Équipe pédagogique",
          image: getImageUrl(cp.photos_url?.[0], cp.type),
          category: cp.type === "cycle" ? "Cycle de formation" : cp.program_type || "Programme spécialisé",
          type: cp.type,
          modules: cp.modules?.map((m: any) => m.title) || [],
          prerequisites: cp.prerequisites || ["Motivation", "Logique de base"],
          objectives: cp.objectives || ["Objectif 1", "Objectif 2"],
          color: cp.type === "cycle" ? "from-purple-600 to-purple-800" : "from-blue-500 to-blue-700",
          rating: cp.rating || 0,
          students: cp.CycleProgramRegistrations?.length || 0,
          formations: cp.modules?.map((m: any) => ({
            id: m._id,
            title: m.title || "Module sans titre",
            description: stripHtmlTags(m.description || "Description non disponible"),
            duration: m.duration || "Non spécifié",
            level: m.level || "Débutant",
            price: m.budget ? `${m.budget} MAD` : "Prix non spécifié",
            instructor: cp.facilitator || "Équipe pédagogique",
            // image: getImageUrl(m.imageUrl, cp.type),
            objectives: m.objectives || ["Objectif 1", "Objectif 2"],
            prerequisites: m.prerequisites || ["Aucun"],
            mode: m.offline || "Non spécifié",
            start_date: m.times?.[0]?.dateRanges?.[0]?.startTime || "Non spécifié",
            end_date: m.times?.[0]?.dateRanges?.[0]?.endTime || "Non spécifié",
          })) || [],
          registrationStatus: enrollmentMap.get(cp.id) || null,
        }));

        setPrograms(transformedPrograms);
        setEnrolledPrograms(registrationsResponse.data.map((reg: any) => reg.cycle_program_id));
        setAnimatedCards(new Array(transformedPrograms.length).fill(false));
      } catch (err: any) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les formations.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProgramsAndEnrollments();
    }
  }, [userId]);

  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      if (activeFilter === "all") return true;
      return program.type === activeFilter;
    });
  }, [programs, activeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      filteredPrograms.forEach((_, index) => {
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
  }, [filteredPrograms]);

  useEffect(() => {
    setAnimatedCards(new Array(filteredPrograms.length).fill(false));
    setTimeout(() => {
      filteredPrograms.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedCards((prev) => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
        }, index * 100);
      });
    }, 100);
  }, [activeFilter]);

  const handleViewDetails = (program: Program) => {
    setSelectedProgramForDetails(program);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedProgramForDetails(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
  };

  const handleEnroll = async (programId: number) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez vous connecter pour vous inscrire.",
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

      const response = await axios.post(
        `${API_BASE_URL}/api/cycles-programs/${programId}/register`,
        {
          user_id: userId,
          module_ids: [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEnrolledPrograms((prev) => [...prev, programId]);
      setPrograms((prev) =>
        prev.map((p) =>
          p.id === programId ? { ...p, registrationStatus: "pending" } : p
        )
      );
      setIsModalOpen(false);
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

  const cyclesCount = programs.filter((p) => p.type === "cycle").length;
  const programmesCount = programs.filter((p) => p.type === "program").length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  if (showDetails && selectedProgramForDetails) {
    if (selectedProgramForDetails.type === "cycle") {
      return (
        <CycleDetails
          cycle={selectedProgramForDetails}
          onBack={handleBackToList}
          onEnroll={handleEnroll}
          enrolledPrograms={enrolledPrograms}
          userId={userId}
        />
      );
    } else {
      return (
        <ProgramDetails
          program={selectedProgramForDetails}
          onBack={handleBackToList}
          enrolledPrograms={enrolledPrograms}
          userId={userId}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="relative py-20 bg-gradient-to-br from-[#06668C] via-blue-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
        <div className="mx-auto px-4 relative z-10">
          <div
            className={`text-center transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">Formations</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Choisissez entre nos cycles complets et nos programmes spécialisés
            </p>
            <div className="w-32 h-1 bg-white mx-auto rounded-full"></div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-gray-50 border-b">
        <div className="mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-700">Filtrer par :</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === "all"
                      ? "bg-[#06668C] text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-label="Afficher toutes les formations"
                >
                  Tout ({programs.length})
                </button>
                <button
                  onClick={() => setActiveFilter("cycle")}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === "cycle"
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-label="Afficher les cycles de formation"
                >
                  🔄 Cycles ({cyclesCount})
                </button>
                <button
                  onClick={() => setActiveFilter("program")}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeFilter === "program"
                      ? "bg-green-600 text-white shadow-lg"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-label="Afficher les programmes spécialisés"
                >
                  📚 Programmes ({programmesCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#06668C] mb-4">
              {activeFilter === "cycle"
                ? "Nos Cycles de Formation"
                : activeFilter === "program"
                ? "Nos Programmes Spécialisés"
                : "Cycles et Programmes"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {activeFilter === "cycle"
                ? "Des parcours complets pour une montée en compétences progressive"
                : activeFilter === "program"
                ? "Des formations spécialisées pour approfondir vos expertises"
                : "Choisissez le format qui correspond le mieux à vos objectifs"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program, index) => (
              <div
                key={program.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform ${
                  animatedCards[index] ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
                } hover:-translate-y-2`}
              >
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                        program.type === "cycle" ? "bg-purple-600" : "bg-green-600"
                      }`}
                      aria-label={program.type === "cycle" ? "Cycle de formation" : "Programme spécialisé"}
                    >
                      {program.type === "cycle" ? "🔄 Cycle" : "📚 Programme"}
                    </span>
                  </div>
                  {program.registrationStatus && (
                    <div className="absolute bottom-4 left-4">
                      <span
                        className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                          program.registrationStatus === "accepted"
                            ? "bg-green-500"
                            : program.registrationStatus === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        aria-label={`Statut de l'inscription : ${program.registrationStatus}`}
                      >
                        {program.registrationStatus === "accepted"
                          ? "✓ Accepté"
                          : program.registrationStatus === "pending"
                          ? "⏳ En attente"
                          : "❌ Rejeté"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#06668C] transition-colors duration-300">
                      {program.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[#06668C]">{program.price}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">{program.shortDescription}</p>
                  <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-4 gap-2">
                    <div className="flex items-center">
                      <span className="mr-1">📅 Début</span>
                      <span>
                        {program.start_date !== "Non spécifié"
                          ? new Date(program.start_date).toLocaleDateString("fr-FR")
                          : "Non spécifié"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">📅 Fin</span>
                      <span>
                        {program.end_date !== "Non spécifié"
                          ? new Date(program.end_date).toLocaleDateString("fr-FR")
                          : "Non spécifié"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleViewDetails(program)}
                      className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors duration-300"
                      aria-label={`Voir les détails de ${program.title}`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Voir formations
                    </button>
                    {program.type === "cycle" && (
                      <button
                        onClick={() => handleEnroll(program.id)}
                        disabled={!userId || program.registrationStatus === "accepted" || program.registrationStatus === "pending"}
                        aria-disabled={
                          !userId || program.registrationStatus === "accepted" || program.registrationStatus === "pending"
                            ? "true"
                            : "false"
                        }
                        aria-label={
                          program.registrationStatus === "accepted"
                            ? "Inscription acceptée"
                            : program.registrationStatus === "pending"
                            ? "Inscription en attente"
                            : program.registrationStatus === "rejected"
                            ? "Réessayer l'inscription"
                            : "S'inscrire"
                        }
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                          !userId ||
                          program.registrationStatus === "accepted" ||
                          program.registrationStatus === "pending"
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : `bg-gradient-to-r ${program.color} text-white hover:shadow-lg transform hover:-translate-y-1`
                        }`}
                      >
                        {program.registrationStatus === "accepted"
                          ? "Accepté ✓"
                          : program.registrationStatus === "pending"
                          ? "En attente ⏳"
                          : program.registrationStatus === "rejected"
                          ? "Réessayer l'inscription"
                          : "S'inscrire"}
                      </button>
                    )}
                  </div>
                </div>
                <div
                  className={`h-1 bg-gradient-to-r ${program.color} w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{cyclesCount}</div>
              <div className="text-gray-600">Cycles disponibles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{programmesCount}</div>
              <div className="text-gray-600">Programmes spécialisés</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FormationPage;