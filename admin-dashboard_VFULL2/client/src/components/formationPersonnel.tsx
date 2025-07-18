"use client";

import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "../hooks/use-toast.ts";
import Header from "./header.tsx";
import Footer from "./footer.tsx";

interface EnrolledFormation {
  id: string;
  title: string;
  description: string;
  duration: string;
  instructor: string;
  category: string;
  color: string;
  enrollmentDate: string;
  progress: number;
  registrationStatus: "accepted" | "pending" | "rejected" | null;
  completedModules: number;
  totalModules: number;
  certificateAvailable: boolean;
  lastAccessed: string;
  startDate?: string;
  endDate?: string;
  supportLink?: string;
  evaluationLink?: string;
  photosLinks?: string[];
  programId: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const FormationPersonnel: React.FC = () => {
  const [formations, setFormations] = useState<EnrolledFormation[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<EnrolledFormation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Veuillez vous connecter pour accéder à vos formations.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/employees/verify-session`, {
          headers: { Authorization: `Bearer ${token}` },
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
    if (!userId) return;

    const fetchEnrolledModules = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Session invalide. Veuillez vous reconnecter.");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/cycles-programs/user/${userId}/modules`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const enrolledData = response.data;

        const formattedFormations: EnrolledFormation[] = enrolledData.map((entry: any) => {
          const module = entry.module;
          const cycleProgram = entry.cycleProgram;

          let duration = "Durée inconnue";
          let startDate = "";
          let endDate = "";
          if (module.times && module.times.length > 0) {
            const dateRanges = module.times.flatMap((session: any) => session.dateRanges);
            if (dateRanges.length > 0) {
              const validDateRanges = dateRanges.filter(
                (range: any) =>
                  range.startTime &&
                  range.endTime &&
                  !isNaN(new Date(range.startTime).getTime()) &&
                  !isNaN(new Date(range.endTime).getTime())
              );
              if (validDateRanges.length > 0) {
                const startTimes = validDateRanges.map((range: any) => new Date(range.startTime));
                const endTimes = validDateRanges.map((range: any) => new Date(range.endTime));
                const minDate = new Date(Math.min(...startTimes.map((date: Date) => date.getTime())));
                const maxDate = new Date(Math.max(...endTimes.map((date: Date) => date.getTime())));
                const diffDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
                duration = `${diffDays} jour${diffDays !== 1 ? "s" : ""}`;
                startDate = minDate.toLocaleDateString("fr-FR");
                endDate = maxDate.toLocaleDateString("fr-FR");
              }
            }
          }

          const instructor =
            module.times?.[0]?.instructorName ||
            module.times?.[0]?.externalInstructorDetails?.position ||
            "Instructeur inconnu";

          return {
            id: module.id,
            title: module.title,
            description: module.description,
            duration,
            instructor,
            category: cycleProgram.type || "Non catégorisé",
            color: "from-blue-600 to-indigo-700",
            enrollmentDate: cycleProgram.created_at || new Date().toISOString(),
            progress: module.progress || 0,
            registrationStatus: entry.status || null,
            completedModules: module.completedModules || 0,
            totalModules: module.totalModules || 1,
            certificateAvailable: module.certificateAvailable || false,
            lastAccessed: module.lastAccessed || "Jamais",
            startDate,
            endDate,
            supportLink: module.support?.type === "link" ? module.support.value : null,
            evaluationLink: cycleProgram.evaluation_url || null,
            photosLinks: module.photos || [],
            programId: cycleProgram.id.toString(),
          };
        });

        setFormations(formattedFormations);
      } catch (err: any) {
        console.error("Erreur lors de la récupération des modules:", err);
        setError("Erreur lors de la récupération des modules");
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Erreur lors de la récupération des modules",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledModules();
  }, [userId]);

  useEffect(() => {
    if (!loading && !userId && error) {
      window.location.href = "/";
    }
  }, [loading, userId, error]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    if (dateString === "Jamais") return dateString;
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const totalFormations = formations.length;
  const acceptedFormations = formations.filter((f) => f.registrationStatus === "accepted").length;
  const pendingFormations = formations.filter((f) => f.registrationStatus === "pending").length;

  const getStatusBadge = (registrationStatus: string | null) => {
    if (!registrationStatus) {
      return (
        <span
          className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full"
          aria-label="Statut : Non défini"
        >
          Non défini
        </span>
      );
    }
    return (
      <span
        className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${registrationStatus === "accepted"
            ? "bg-green-500"
            : registrationStatus === "pending"
              ? "bg-yellow-500"
              : "bg-red-500"
          }`}
        aria-label={`Statut de l'inscription : ${registrationStatus}`}
      >
        {registrationStatus === "accepted"
          ? "✓ Accepté"
          : registrationStatus === "pending"
            ? "⏳ En attente"
            : "❌ Rejeté"}
      </span>
    );
  };

  const handleReenroll = async (moduleId: string, programId: string) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez vous connecter pour vous réinscrire.",
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

      await axios.post(
        `${API_BASE_URL}/api/cycles-programs/${programId}/register`,
        {
          user_id: userId,
          module_ids: [moduleId],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setFormations((prev) =>
        prev.map((f) =>
          f.id === moduleId && f.programId === programId ? { ...f, registrationStatus: "pending" } : f
        )
      );
      toast({
        title: "Succès",
        description: "Réinscription soumise. En attente de validation par l'administrateur.",
      });
    } catch (err: any) {
      console.error("Erreur lors de la réinscription:", err);
      const errorMessage = err.response?.data?.message || "Erreur lors de la réinscription. Veuillez réessayer.";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage, // Fixed: Use errorMessage variable
      });
    }
  };

  const openFormationDetail = (formation: EnrolledFormation) => {
    setSelectedFormation(formation);
    setIsDetailModalOpen(true);
  };

  const renderDescriptionAsHtml = (description: string) => {
    return { __html: description };
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <Header />
      <div className="min-h-screen bg-gray-100">
        <section className="relative py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div
              className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <h1 className="text-5xl font-extrabold mb-4 tracking-tight">Mes Formations</h1>
              <p className="text-xl opacity-90 max-w-2xl">
                Gérez et suivez votre progression dans vos programmes de formation avec facilité.
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 bg-white">
          <div className="container mx-auto px-6">
            {loading ? (
              <div className="text-center text-gray-600">Chargement...</div>
            ) : error ? (
              <div className="text-center text-red-600 font-medium">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { value: totalFormations, label: "Formations Inscrites", color: "bg-blue-600" },
                  { value: acceptedFormations, label: "Acceptées", color: "bg-green-600" },
                  { value: pendingFormations, label: "En attente", color: "bg-yellow-600" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`p-6 ${stat.color} text-white rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300`}
                    aria-label={`Statistique : ${stat.label} - ${stat.value}`}
                  >
                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                    <div className="text-sm font-medium opacity-90">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section section--formation-list py-12 bg-gray-100">
          <div className="container mx-auto px-6">
            {loading ? (
              <div className="text-center text-gray-600">Chargement des modules...</div>
            ) : error ? (
              <div className="text-center text-red-600 font-medium">{error}</div>
            ) : formations.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucune formation trouvée</h3>
                <p className="text-gray-600 mb-8">
                  Vous n'êtes inscrit à aucune formation pour le moment.
                </p>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                  aria-label="Découvrir nos formations"
                >
                  Découvrir nos formations
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {formations.map((formation) => (
                  <div
                    key={`${formation.id}-${formation.programId}`}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">{formation.title}</h3>
                        <div className="flex flex-col gap-2">
                          <span
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            aria-label={`Catégorie : ${formation.category}`}
                          >
                            {formation.category}
                          </span>
                          {getStatusBadge(formation.registrationStatus)}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 text-sm mb-4 text-gray-600">
                        <div>
                          <span className="block text-xs text-gray-500">Instructeur</span>
                          <span className="font-medium">{formation.instructor}</span>
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <span className="block text-xs text-gray-500">
                              <i className="fa-regular fa-calendar mr-1"></i> Date de début
                            </span>
                            <span className="font-medium">{formation.startDate || "Non défini"}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-gray-500">
                              <i className="fa-regular fa-calendar mr-1"></i> Date de fin
                            </span>
                            <span className="font-medium">{formation.endDate || "Non défini"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {formation.registrationStatus === "rejected" ? (
                          <button
                            onClick={() => handleReenroll(formation.id, formation.programId)}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                            aria-label="Réessayer l'inscription"
                          >
                            Réessayer l'inscription
                          </button>
                        ) : formation.registrationStatus === "accepted" ? (
                          <button
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                            aria-label="Continuer la formation"
                            onClick={() => openFormationDetail(formation)}
                          >
                            Continuer
                          </button>
                        ) : (
                          <button
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                            disabled
                            aria-label="Inscription en attente de validation"
                            aria-disabled="true"
                          >
                            En attente ⏳
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />

      {isDetailModalOpen && selectedFormation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedFormation.title}</h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Fermer la fenêtre des détails"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Description</h3>
                  <div
                    className="text-gray-600"
                    dangerouslySetInnerHTML={renderDescriptionAsHtml(selectedFormation.description)}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Détails de la formation</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Catégorie</span>
                        <span className="font-medium">{selectedFormation.category}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Instructeur</span>
                        <span className="font-medium">{selectedFormation.instructor}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">Statut de l'inscription</span>
                        <span
                          className={`font-medium ${selectedFormation.registrationStatus === "accepted"
                              ? "text-green-600"
                              : selectedFormation.registrationStatus === "pending"
                                ? "text-yellow-600"
                                : selectedFormation.registrationStatus === "rejected"
                                  ? "text-red-600"
                                  : "text-gray-600"
                            }`}
                        >
                          {selectedFormation.registrationStatus
                            ? selectedFormation.registrationStatus === "accepted"
                              ? "Accepté"
                              : selectedFormation.registrationStatus === "pending"
                                ? "En attente"
                                : "Rejeté"
                            : "Non défini"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">
                          <i className="fa-regular fa-calendar mr-1"></i> Date de début
                        </span>
                        <span className="font-medium">{selectedFormation.startDate || "Non défini"}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-600">
                          <i className="fa-regular fa-calendar mr-1"></i> Date de fin
                        </span>
                        <span className="font-medium">{selectedFormation.endDate || "Non défini"}</span>
                      </div>
                      {selectedFormation.supportLink && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Lien de support</span>
                          <a
                            href={selectedFormation.supportLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                            aria-label="Accéder au lien de support"
                          >
                            Accéder
                          </a>
                        </div>
                      )}
                      {selectedFormation.evaluationLink && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-gray-600">Lien d'évaluation</span>
                          <a
                            href={selectedFormation.evaluationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                            aria-label="Accéder au lien d'évaluation"
                          >
                            Accéder
                          </a>
                        </div>
                      )}
                      {selectedFormation.photosLinks &&
                        selectedFormation.photosLinks.length > 0 &&
                        selectedFormation.photosLinks.map((photoLink, index) => (
                          <div
                            key={`photo-${selectedFormation.id}-${selectedFormation.programId}-${index}`}
                            className="flex justify-between border-b pb-2"
                          >
                            <span className="text-gray-600">Photo {index + 1}</span>
                            <a
                              href={photoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-600 hover:underline"
                              aria-label={`Accéder à la photo ${index + 1}`}
                            >
                              Accéder
                            </a>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                {selectedFormation.registrationStatus === "rejected" && (
                  <button
                    onClick={() => handleReenroll(selectedFormation.id, selectedFormation.programId)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
                    aria-label="Réessayer l'inscription"
                  >
                    Réessayer l'inscription
                  </button>
                )}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-300"
                  aria-label="Fermer la fenêtre des détails"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormationPersonnel;