"use client";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Button } from "./ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog.tsx";
import { Download, Save, ArrowLeft } from "lucide-react";
import useApiAxios from "../config/axios";
import { toast } from "../hooks/use-toast.ts";

interface Course {
  _id: string;
  title: string;
  duration: number;
  assignedUsers: string[] | User[];
}

interface User {
  _id: string;
  name: string;
  dailyStatuses: { day: number; status: "present" | "absent" }[];
}

interface Evaluation {
  _id: string;
  userName: string;
  evaluationData: { name: string; value: number }[];
  comments: string;
  aspectsToImprove: string;
  createdAt: string;
}

interface PresenceData {
  userId: string;
  dailyStatuses: { day: number; status: "present" | "absent" }[];
}

const ModuleEvaluationsPresence: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [presenceData, setPresenceData] = useState<PresenceData[]>([]);
  const [isPresenceDialogOpen, setIsPresenceDialogOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Session expirée",
        description: "Veuillez vous connecter pour continuer.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [navigate]);

  // Fetch course details
  const { data: course, isLoading: courseLoading, error: courseError } = useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await useApiAxios.get(`/courses/${id}`);
      return response.data;
    },
    enabled: !!id,
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast({
          title: "Non autorisé",
          description: "Veuillez vous reconnecter.",
          variant: "destructive",
        });
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast({
          title: "Module non trouvé",
          description: "Le module avec cet ID n'existe pas.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la récupération du module.",
          variant: "destructive",
        });
      }
    },
  });

  // Fetch evaluations
  const { data: evaluations = [], isLoading: evaluationsLoading, error: evaluationsError } = useQuery({
    queryKey: ["evaluations", id],
    queryFn: async () => {
      const response = await useApiAxios.get(`/evaluations/${id}`);
      return response.data;
    },
    enabled: !!id,
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast({
          title: "Non autorisé",
          description: "Veuillez vous reconnecter.",
          variant: "destructive",
        });
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast({
          title: "Évaluations non trouvées",
          description: "Aucune évaluation disponible pour ce module.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la récupération des évaluations.",
          variant: "destructive",
        });
      }
    },
  });

  // Fetch assigned users
  const { data: assignedUsersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ["assignedUsers", id],
    queryFn: async () => {
      const response = await useApiAxios.get(`/courses/${id}/assignedUsers`);
      return response.data;
    },
    enabled: !!id,
    onSuccess: (data: { users: User[] }) => {
      // Initialize presenceData with dailyStatuses for each user
      const initializedPresence = data.users.map((user: User) => ({
        userId: user._id,
        dailyStatuses:
          user.dailyStatuses?.length === course?.duration
            ? user.dailyStatuses
            : Array.from({ length: course?.duration || 0 }, (_, i) => ({
                day: i + 1,
                status: user.dailyStatuses?.find((ds) => ds.day === i + 1)?.status || "absent",
              })),
      }));
      setPresenceData(initializedPresence);
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast({
          title: "Non autorisé",
          description: "Veuillez vous reconnecter.",
          variant: "destructive",
        });
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast({
          title: "Utilisateurs non trouvés",
          description: "Aucun utilisateur assigné à ce module.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la récupération des utilisateurs.",
          variant: "destructive",
        });
      }
    },
  });

  // Mutation to update presence
  const updatePresenceMutation = useMutation({
    mutationFn: async ({ courseId, presence }: { courseId: string; presence: PresenceData[] }) => {
      const response = await useApiAxios.post(`/courses/${courseId}/updatePresence`, { presence });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["assignedUsers", id]);
      toast({ title: "Présence mise à jour avec succès" });
      setIsPresenceDialogOpen(false);
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast({
          title: "Non autorisé",
          description: "Veuillez vous reconnecter.",
          variant: "destructive",
        });
        navigate("/login");
      } else if (error.response?.status === 404) {
        toast({
          title: "Utilisateurs non trouvés",
          description: "Aucun utilisateur assigné à ce module.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la récupération des utilisateurs.",
          variant: "destructive",
        });
      }
    },
  });

  // Handle presence change
  const handlePresenceChange = (userId: string, day: number, status: "present" | "absent") => {
    setPresenceData((prev) =>
      prev.map((user) =>
        user.userId === userId
          ? {
              ...user,
              dailyStatuses: user.dailyStatuses.map((ds) =>
                ds.day === day ? { ...ds, status } : ds
              ),
            }
          : user
      )
    );
  };

  // Save presence
  const handleSavePresence = () => {
    if (id) {
      updatePresenceMutation.mutate({ courseId: id, presence: presenceData });
    }
  };

  // Download evaluations
  const handleDownloadEvaluations = async () => {
    try {
      const response = await useApiAxios.get(`/evaluations/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "evaluations.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: "Erreur lors du téléchargement des évaluations",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  if (courseLoading || evaluationsLoading || usersLoading) {
    return <div className="p-6 text-center text-gray-600">Chargement...</div>;
  }

  if (!course || !id|| courseError || evaluationsError || usersError) {
    return <div className="p-6 text-center text-red-600">Erreur: Module non trouvé ou une erreur s'est produite</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-900">
          {course.title} - Évaluations & Présence
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard", { state: { activeSection: "modules" } })}
          className="rounded-xl border-blue-700 hover:bg-gray-50 text-gray-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux modules
        </Button>
      </div>
      <Tabs defaultValue="evaluations" className="bg-white rounded-xl shadow-lg p-6">
        <TabsList className="mb-4">
          <TabsTrigger value="evaluations" className="rounded-xl">
            Évaluations
          </TabsTrigger>
          <TabsTrigger value="presence" className="rounded-xl">
            Présence
          </TabsTrigger>
        </TabsList>
        <TabsContent value="evaluations">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-900">Évaluations</h2>
            <Button
              onClick={handleDownloadEvaluations}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Download className="mr-2 h-4 w-4" /> Télécharger les évaluations
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-blue-900">Utilisateur</TableHead>
                <TableHead className="text-blue-900">Données d'évaluation</TableHead>
                <TableHead className="text-blue-900">Commentaires</TableHead>
                <TableHead className="text-blue-900">Aspects à améliorer</TableHead>
                <TableHead className="text-blue-900">Date de création</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-600">
                    Aucune évaluation disponible
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation: Evaluation) => (
                  <TableRow key={evaluation._id}>
                    <TableCell>{evaluation.userName}</TableCell>
                    <TableCell>
                      {evaluation.evaluationData.map((data) => (
                        <div key={data.name}>
                          {data.name}: {data.value}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>{evaluation.comments || "Aucun"}</TableCell>
                    <TableCell>{evaluation.aspectsToImprove || "Aucun"}</TableCell>
                    <TableCell>{new Date(evaluation.createdAt).toLocaleString("fr-FR")}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="presence">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-blue-900">Présence</h2>
            <Button
              onClick={() => setIsPresenceDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              <Save className="mr-2 h-4 w-4" /> Gérer la présence
            </Button>
          </div>
          <Dialog open={isPresenceDialogOpen} onOpenChange={setIsPresenceDialogOpen}>
            <DialogContent className="max-w-4xl rounded-2xl bg-white shadow-xl border border-gray-100">
              <DialogHeader>
                <DialogTitle className="text-2xl font-semibold text-blue-900">
                  Gérer la présence quotidienne
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-blue-900">Utilisateur</TableHead>
                      {Array.from({ length: course.duration || 0 }, (_, i) => (
                        <TableHead key={i} className="text-blue-900">
                          Jour {i + 1}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedUsersData?.users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={(course.duration || 0) + 1} className="text-center text-gray-600">
                          Aucun utilisateur assigné
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignedUsersData?.users.map((user: User) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name}</TableCell>
                          {presenceData
                            .find((p) => p.userId === user._id)
                            ?.dailyStatuses.map((ds) => (
                              <TableCell key={ds.day}>
                                <select
                                  value={ds.status}
                                  onChange={(e) =>
                                    handlePresenceChange(user._id, ds.day, e.target.value as "present" | "absent")
                                  }
                                  className="border border-gray-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="present">Présent</option>
                                  <option value="absent">Absent</option>
                                </select>
                              </TableCell>
                            ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter className="border-t border-gray-100 p-6 flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPresenceDialogOpen(false)}
                  className="rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSavePresence}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  <Save className="mr-2 h-4 w-4" /> Sauvegarder
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModuleEvaluationsPresence;