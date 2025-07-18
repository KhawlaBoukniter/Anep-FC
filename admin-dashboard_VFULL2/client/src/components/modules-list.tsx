"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip.tsx";
import { Plus, Edit, Trash, Bell, Users, Download, FileText, Search, Filter, XCircle, X, Archive, ArchiveRestore, Eye } from "lucide-react";
import useApiAxios from "../config/axios";
import PropTypes from "prop-types";
import { AddModuleModal } from "./AddModuleModal.tsx";
import clsx from "clsx";
import { EditModuleModal } from "./EditModuleModal.tsx";

const socket = io("https://anep-proejct.onrender.com");

enum CourseMode {
  Online = "online",
  Hybrid = "hybrid",
  Offline = "offline",
}

interface Course {
  _id: string;
  title: string;
  offline: CourseMode;
  description: string;
  hidden: "visible" | "hidden";
  budget: number;
  location: string;
  imageUrl: string;
  notification: any[];
  times: {
    startTime: string;
    endTime: string;
    instructorType: "intern" | "extern";
    instructor: string;
    instructorName: string;
    externalInstructorDetails: {
      phone: string;
      position: string;
      cv: File | null;
    };
  }[];
  image: File | null;
  assignedUsers: Profile[] | string[];
  archived: boolean;
  cycleProgramTitle?: string;
}

interface Profile {
  id_profile: number;
  name: string;
  "NOM PRENOM": string;
  ADRESSE: string | null;
  DATE_NAISS: string | null;
  DAT_REC: string | null;
  CIN: string | null;
  DETACHE: string | null;
  SEXE: string | null;
  SIT_F_AG: string | null;
  STATUT: string | null;
  DAT_POS: string | null;
  LIBELLE_GRADE: string | null;
  GRADE_ASSIMILE: string | null;
  LIBELLE_FONCTION: string | null;
  DAT_FCT: string | null;
  LIBELLE_LOC: string | null;
  LIBELLE_REGION: string | null;
  created_at: string;
  updated_at: string;
}

interface Filter {
  type: string;
  values: string[];
}

interface FilterOption {
  value: string;
  label: string;
  options: string[] | [];
}

interface ChangeDetail {
  identifier: string;
  changedFields: { field: string; before: string; after: string }[];
}

const EvaluationsDialog = ({
  open,
  onOpenChange,
  evaluationsData,
  courseTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationsData: { message?: string; evaluations: { user: { id: number; name: string; email: string }; evaluation: string; program: string }[] };
  courseTitle: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100 animate-in fade-in duration-300">
        <DialogHeader className="border-b border-gray-100 p-6">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Évaluations pour {courseTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {evaluationsData?.message ? (
            <p className="text-gray-600">{evaluationsData.message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-900">Employé</TableHead>
                  <TableHead className="text-blue-900">Email</TableHead>
                  <TableHead className="text-blue-900">Programme</TableHead>
                  <TableHead className="text-blue-900">Évaluation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluationsData?.evaluations?.map((evaluation) => (
                  <TableRow key={evaluation.user.id}>
                    <TableCell>{evaluation.user.name}</TableCell>
                    <TableCell>{evaluation.user.email}</TableCell>
                    <TableCell>{evaluation.program}</TableCell>
                    <TableCell>{evaluation.evaluation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter className="border-t border-gray-100 p-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 transition-all duration-200"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

EvaluationsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  evaluationsData: PropTypes.object.isRequired,
  courseTitle: PropTypes.string.isRequired,
};

const PresenceDialog = ({
  open,
  onOpenChange,
  presenceData,
  handlePresenceChange,
  courseTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presenceData: { message?: string; presence: { user: { id: number; name: string; email: string }; presence: { date: string; status: string }[]; program: string }[]; durationDays: number };
  handlePresenceChange: (userId: number, date: string, status: string, currentPresence: any[]) => void;
  courseTitle: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-100 animate-in fade-in duration-300">
        <DialogHeader className="border-b border-gray-100 p-6">
          <DialogTitle className="text-2xl font-semibold text-gray-900">
            Gestion de la présence pour {courseTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="p-6">
          {presenceData?.message ? (
            <p className="text-gray-600">{presenceData.message}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-blue-900">Employé</TableHead>
                  {Array.from({ length: presenceData?.durationDays || 1 }, (_, i) => (
                    <TableHead key={i} className="text-blue-900">Jour {i + 1}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {presenceData?.presence?.map((record) => (
                  <TableRow key={record.user.id}>
                    <TableCell>{record.user.name}</TableCell>
                    {record.presence.map((day, index) => (
                      <TableCell key={index}>
                        <select
                          value={day.status}
                          onChange={(e) => handlePresenceChange(record.user.id, day.date, e.target.value, record.presence)}
                          className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                          <option value="present">Présent</option>
                          <option value="absent">Absent</option>
                        </select>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter className="border-t border-gray-100 p-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 transition-all duration-200"
          >
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

PresenceDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  presenceData: PropTypes.object.isRequired,
  handlePresenceChange: PropTypes.func.isRequired,
  courseTitle: PropTypes.string.isRequired,
};

export function ModulesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [evaluationsDialogOpen, setEvaluationsDialogOpen] = useState(false);
  const [presenceDialogOpen, setPresenceDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [newFilterType, setNewFilterType] = useState("");
  const [newFilterValues, setNewFilterValues] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [changeDetails, setChangeDetails] = useState<ChangeDetail[] | null>(null);
  const [showChanges, setShowChanges] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [addModuleDialogOpen, setAddModuleDialogOpen] = useState(false);
  const coursesPerPage = 10;
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // React Query: Fetch courses
  const { data: courses = [], isLoading, error } = useQuery(
    ["courses", { search: searchTerm, archived: filters.some((f) => f.type === "Archivage" && f.values.length === 1 && f.values.includes("Archivés")) }],
    () => useApiAxios.get("/courses", { params: { archived: filters.some((f) => f.type === "Archivage" && f.values.length === 1 && f.values.includes("Archivés")) ? true : false } }).then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      onSuccess: (data) => console.log("Successfully fetched courses:", data),
      onError: (error) => console.error("Error fetching courses:", error),
    }
  );

  // React Query: Fetch evaluations
  const { data: evaluationsData, refetch: refetchEvaluations } = useQuery(
    ["evaluations", selectedCourse?._id],
    () => useApiAxios.get(`/cycles-programs/module/${selectedCourse?._id}/evaluations`).then((res) => res.data),
    {
      enabled: !!selectedCourse && evaluationsDialogOpen,
      staleTime: 5 * 60 * 1000,
    }
  );

  // React Query: Fetch presence
  const { data: presenceData, refetch: refetchPresence } = useQuery(
    ["presence", selectedCourse?._id],
    () => useApiAxios.get(`/api/cycles-programs/module/${selectedCourse?._id}/presence`).then((res) => res.data),
    {
      enabled: !!selectedCourse && presenceDialogOpen,
      staleTime: 5 * 60 * 1000,
    }
  );

  // React Query: Update presence
  const presenceMutation = useMutation(
    ({ module_id, presence }: { module_id: string; presence: any[] }) =>
      useApiAxios.post(`/api/cycles-programs/module/${module_id}/presence`, { presence }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["presence", selectedCourse?._id]);
        console.log("Présence mise à jour avec succès");
      },
      onError: (error: any) => {
        console.error("Échec de la mise à jour de la présence:", error);
      },
    }
  );

  // React Query: Archive course
  const archiveCourse = useMutation(
    (id: string) => useApiAxios.put(`/courses/${id}/archive`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["courses"]);
        setArchiveDialogOpen(false);
        setSelectedCourse(null);
      },
      onError: (error) => {
        console.error("Error archiving course:", error);
      },
    }
  );

  // React Query: Unarchive course
  const unarchiveCourse = useMutation(
    (id: string) => useApiAxios.put(`/courses/${id}/unarchive`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["courses"]);
        setUnarchiveDialogOpen(false);
        setSelectedCourse(null);
      },
      onError: (error) => {
        console.error("Error unarchiving course:", error);
      },
    }
  );

  useEffect(() => {
    socket.on("notification", (message) => {
      alert(`Notification: ${message}`);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const handleArchive = (course: Course) => {
    setSelectedCourse(course);
    setArchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    if (selectedCourse) {
      archiveCourse.mutate(selectedCourse._id);
    }
  };

  const handleUnarchive = (course: Course) => {
    setSelectedCourse(course);
    setUnarchiveDialogOpen(true);
  };

  const confirmUnarchive = () => {
    if (selectedCourse) {
      unarchiveCourse.mutate(selectedCourse._id);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleImportCourses = async () => {
    if (!fileToUpload) {
      console.log("Aucun fichier sélectionné");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const res = await useApiAxios.post("/courses/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      setChangeDetails(data.updates || []);
      const summary = `Import terminé. ${data.inserted} ajouté(s), ${data.updated} modifié(s), ${data.unchanged} inchangé(s).`;
      setSyncStatus(summary);
      if (data.updates && data.updates.length > 0) {
        setShowChanges(true);
      }
      queryClient.invalidateQueries(["courses"]);
    } catch (err) {
      console.error("Erreur d'importation :", err);
      setSyncStatus("Erreur lors de l'importation du fichier");
    }
  };

  const handleSyncCourses = async () => {
    try {
      const response = await useApiAxios.post("/courses/sync", {});
      const data = response.data;
      if (response.status === 200) {
        setSyncStatus(
          `Synchronisation terminée à ${new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}. Mis à jour: ${data.updated}, Inséré: ${data.inserted}`
        );
        queryClient.invalidateQueries(["courses"]);
      } else {
        setSyncStatus(`Erreur lors de la synchronisation: ${data.message || "Vérifiez le serveur."}`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus(`Erreur lors de la synchronisation: ${error.message || "Problème de connexion."}`);
    }
  };

  const handleOpenEvaluations = (course: Course) => {
    setSelectedCourse(course);
    setEvaluationsDialogOpen(true);
    refetchEvaluations();
  };

  const handleOpenPresence = (course: Course) => {
    setSelectedCourse(course);
    setPresenceDialogOpen(true);
    refetchPresence();
  };

  const handlePresenceChange = (userId: number, date: string, status: string, currentPresence: any[]) => {
    // Ensure userId is included in every presence object
    const updatedPresence = currentPresence.map((p: any) => ({
      user_id: userId, // Always include userId
      date: p.date,
      status: p.status,
    })).filter((p: any) => !(p.date === date && p.user_id === userId)); // Remove old entry for this user and date

    // Add new presence entry
    updatedPresence.push({ user_id: userId, date, status });

    presenceMutation.mutate({ module_id: selectedCourse!._id, presence: updatedPresence });
  };

  const handleDelete = async (id: string) => {
    try {
      await useApiAxios.delete(`/courses/${id}`);
      queryClient.invalidateQueries(["courses"]);
    } catch (error) {
      console.error("Échec de la suppression du cours:", error);
    }
  };

  const handleDownloadAssignedUsers = async (courseId: string) => {
    try {
      const response = await useApiAxios.get(`/courses/${courseId}/assignedUsers/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assigned_users_${courseId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Échec du téléchargement des utilisateurs assignés:', error);
      alert('Erreur lors du téléchargement des utilisateurs assignés. Veuillez réessayer.');
    }
  };

  const handleNotify = async (course: Course) => {
    try {
      const response = await useApiAxios.get(`/courses/${course._id}/assignedUsers`);
      const userIds = response.data.map((user: any) => user._id);

      socket.emit("notify", {
        userIds,
        message: `Notification pour le cours: ${course.title}`,
        courseId: course._id,
      });

      console.log("Notification des utilisateurs pour le cours:", course.title);
    } catch (error) {
      console.error("Échec de la récupération des utilisateurs assignés pour la notification:", error);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      !searchTerm ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = filters.length === 0 || filters.some((filter) => {
      if (filter.type === "Mode")
        return filter.values.some((val) =>
          (val === "En ligne" && course.offline === CourseMode.Online) ||
          (val === "Hybride" && course.offline === CourseMode.Hybrid) ||
          (val === "Présentiel" && course.offline === CourseMode.Offline)
        );
      if (filter.type === "Statut")
        return filter.values.length === 0 || filter.values.some((val) => (val === "Caché" && course.hidden === "hidden") || (val === "Visible" && course.hidden === "visible"));
      if (filter.type === "Archivage")
        return filter.values.length === 0 || filter.values.some((val) => (val === "Archivés" && course.archived) || (val === "Actifs" && !course.archived));
      if (filter.type === "Cycle")
        return filter.values.length === 0 || filter.values.includes(course.cycleProgramTitle || "");
      return true;
    });

    const isArchivedFilterActive = filters.some((f) => f.type === "Archivage" && f.values.includes("Archivés"));
    return matchesSearch && matchesFilters && (!course.archived || isArchivedFilterActive);
  });

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const clearFilter = (filterType: string, value?: string) => {
    if (value) {
      setFilters((prev) =>
        prev.map((f) =>
          f.type === filterType ? { ...f, values: f.values.filter((v) => v !== value) } : f
        ).filter((f) => f.values.length > 0)
      );
    } else {
      setFilters((prev) => prev.filter((f) => f.type !== filterType));
    }
    setCurrentPage(1);
  };

  const addFilter = () => {
    if (newFilterType && newFilterValues.length > 0) {
      setFilters((prev) => {
        const existingFilter = prev.find((f) => f.type === newFilterType);
        if (existingFilter) {
          return prev.map((f) =>
            f.type === newFilterType ? { ...f, values: [...f.values, ...newFilterValues.filter((v) => !f.values.includes(v))] } : f
          );
        }
        return [...prev, { type: newFilterType, values: newFilterValues }];
      });
      setNewFilterType("");
      setNewFilterValues([]);
      setSearchValue("");
      setFilterDialogOpen(false);
      setCurrentPage(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchValue.trim() && !newFilterValues.includes(searchValue)) {
      setNewFilterValues((prev) => [...prev, searchValue]);
      setSearchValue("");
    }
  };

  const getFilterColor = (type: string) => {
    switch (type) {
      case "Mode":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Statut":
        return "bg-green-50 text-green-700 border-green-200";
      case "Archivage":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "Cycle":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filterOptions: FilterOption[] = [
    {
      label: "Mode",
      value: "Mode",
      options: ["En ligne", "Hybride", "Présentiel"],
    },
    { label: "Statut", value: "Statut", options: ["Visible", "Caché"] },
    { label: "Archivage", value: "Archivage", options: ["Archivés", "Actifs"] },
    {
      label: "Cycle",
      value: "Cycle",
      options: [...new Set(courses.map((course: Course) => course.cycleProgramTitle).filter(Boolean))],
    },
  ];

  const availableOptions = filterOptions.find((opt) => opt.value === newFilterType)?.options || [];

  const stats = {
    total: courses.length,
    online: courses.filter((c) => c.offline === CourseMode.Online).length,
    offline: courses.filter((c) => c.offline === CourseMode.Offline).length,
    hybriq: courses.filter((c) => c.offline === CourseMode.Hybrid).length,
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-800 shadow-lg shadow-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Users className="h-5 w-5 text-blue-800" />
                </div>
                <div>
                  <p className="text-sm text-blue-800">Total Modules</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-700 shadow-lg shadow-green-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Modules en ligne</p>
                  <p className="text-2xl font-bold">{stats.online}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-pink-700 shadow-lg shadow-pink-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <FileText className="h-5 w-5 text-pink-700" />
                </div>
                <div>
                  <p className="text-sm text-pink-700">Modules en présentiel</p>
                  <p className="text-2xl font-bold">{stats.offline}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-purple-700 shadow-lg shadow-purple-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-purple-700">Modules hybrides</p>
                  <p className="text-2xl font-bold">{stats.hybriq}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                  <Input
                    placeholder="Rechercher par titre ou description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-12 pr-12 rounded-xl border-blue-700 bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    aria-label="Rechercher"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-10 w-10"
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                    >
                      <XCircle className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    </Button>
                  )}
                </div>
                <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-gray-50 rounded-xl border-blue-700 hover:bg-gray-100 transition-all duration-200"
                    >
                      <Filter className="h-5 w-5" /> Ajouter Filtre
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 animate-in fade-in duration-300">
                    <DialogHeader className="border-b border-gray-100 p-6">
                      <DialogTitle className="text-2xl font-semibold text-gray-900">Ajouter un filtre</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 space-y-6">
                      <div className="relative">
                        <select
                          value={newFilterType}
                          onChange={(e) => {
                            setNewFilterType(e.target.value);
                            setNewFilterValues([]);
                            setSearchValue("");
                          }}
                          className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 bg-white appearance-none"
                          aria-label="Sélectionner le type de filtre"
                        >
                          <option value="">Choisir un type de filtre</option>
                          {filterOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                              disabled={filters.some((f) => f.type === option.value)}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                          <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                      {newFilterType && (
                        <div className="space-y-5">
                          <Input
                            ref={inputRef}
                            placeholder={`Saisir ou rechercher ${newFilterType.toLowerCase()}...`}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            aria-label={`Rechercher ${newFilterType.toLowerCase()}`}
                          />
                          {searchValue && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                              {availableOptions
                                .filter((option) => option.toLowerCase().includes(searchValue.toLowerCase()))
                                .map((option) => (
                                  <div
                                    key={option}
                                    onClick={() => {
                                      if (!newFilterValues.includes(option)) {
                                        setNewFilterValues((prev) => [...prev, option]);
                                        setSearchValue("");
                                      }
                                    }}
                                    className={clsx(
                                      "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                                      newFilterValues.includes(option) && "opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                    {option}
                                  </div>
                                ))}
                              {availableOptions.filter((option) => option.toLowerCase().includes(searchValue.toLowerCase())).length === 0 && (
                                <div className="p-3 text-gray-500">Aucun résultat. Appuyez sur Entrée pour ajouter.</div>
                              )}
                            </div>
                          )}
                          {newFilterValues.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {newFilterValues.map((value) => (
                                <Badge
                                  key={value}
                                  variant="secondary"
                                  className={clsx(
                                    "flex items-center gap-2 p-2 text-sm font-medium rounded-full transition-all",
                                    getFilterColor(newFilterType)
                                  )}
                                >
                                  {value}
                                  <X
                                    className="h-4 w-4 cursor-pointer hover:bg-gray-300 rounded-full p-0.5"
                                    onClick={() => setNewFilterValues((prev) => prev.filter((v) => v !== value))}
                                    aria-label={`Supprimer ${value}`}
                                  />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <DialogFooter className="border-t border-gray-100 p-6 flex justify-end gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setFilterDialogOpen(false)}
                        className="rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 transition-all duration-200"
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => {
                          addFilter();
                          setFilterDialogOpen(false);
                        }}
                        disabled={!newFilterType || newFilterValues.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 shadow-md transition-all duration-200"
                      >
                        Ajouter
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <AddModuleModal onCourseCreated={() => queryClient.invalidateQueries(["courses"])} />
              </div>
            </div>
            {filters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {filters.map((filter) =>
                  filter.values.map((value) => (
                    <Badge
                      key={`${filter.type}-${value}`}
                      variant="secondary"
                      className={clsx("flex items-center gap-2", getFilterColor(filter.type))}
                    >
                      {filter.type}: {value}
                      <X
                        className="h-4 w-4 cursor-pointer hover:bg-gray-300 rounded"
                        onClick={() => clearFilter(filter.type, value)}
                        aria-label={`Supprimer filtre ${filter.type} ${value}`}
                      />
                    </Badge>
                  ))
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  onClick={() => {
                    setFilters([]);
                    setCurrentPage(1);
                  }}
                >
                  Effacer tous les filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Courses table */}
        <Card className="bg-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between text-blue-900">
              <CardTitle className="text-xl">
                {filters.some((f) => f.type === "Archivage" && f.values.includes("Archivés")) ? "Modules Archivés" :
                  filters.some((f) => f.type === "Archivage" && f.values.includes("Actifs")) ? "Liste de Modules" :
                    "Liste des Modules"}
              </CardTitle>
              <Badge variant="secondary">{filteredCourses.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : error ? (
              <p className="text-red-600">Erreur: {(error as Error).message}</p>
            ) : (
              <div className="rounded-md border">
                <Table className="bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-blue-900 text-center">Titre du module</TableHead>
                      <TableHead className="text-blue-900 text-center">Cycle</TableHead>
                      <TableHead className="text-blue-900 text-center">Mode</TableHead>
                      <TableHead className="text-blue-900 text-center">Description</TableHead>
                      <TableHead className="text-blue-900 text-center">Statut</TableHead>
                      <TableHead className="text-blue-900 text-center">Budget</TableHead>
                      <TableHead className="text-blue-900 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCourses.map((course) => (
                      <TableRow key={course._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-sm text-center">{course.title}</TableCell>
                        <TableCell className="font-medium text-sm text-center">{course.cycleProgramTitle}</TableCell>
                        <TableCell className="text-center">
                          {course.offline === CourseMode.Online
                            ? "En ligne"
                            : course.offline === CourseMode.Hybrid
                              ? "Hybride"
                              : "Présentiel"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div dangerouslySetInnerHTML={{ __html: course.description }} />
                        </TableCell>
                        <TableCell className="text-center">{course.hidden === "hidden" ? "Caché" : "Visible"}</TableCell>
                        <TableCell className="text-center">{course.budget}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-center">
                            {!course.archived && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <EditModuleModal module={course} onCourseUpdated={() => queryClient.invalidateQueries(["courses"])} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Modifier le module</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {course.archived && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDelete(course._id)}
                                  >
                                    <Trash className="h-4 w-4 text-red-600" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Supprimer le module</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenEvaluations(course)}
                                >
                                  <FileText className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Voir les évaluations</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleOpenPresence(course)}
                                >
                                  <Users className="h-4 w-4 text-gray-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Gérer la présence</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleNotify(course)}
                                >
                                  <Bell className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Quick Notify</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDownloadAssignedUsers(course._id)}
                                >
                                  <Download className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Télécharger les utilisateurs assignés</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => course.archived ? handleUnarchive(course) : handleArchive(course)}
                                >
                                  {course.archived ? (
                                    <ArchiveRestore className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <Archive className="h-4 w-4 text-yellow-600" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{course.archived ? "Désarchiver le cours" : "Archiver le cours"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="text-sm text-gray-600 text-center md:text-left">
                  Affichage de {indexOfFirstCourse + 1} à{" "}
                  {Math.min(indexOfLastCourse, filteredCourses.length)} sur {filteredCourses.length} modules
                </div>
                <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-900 text-white"
                  >
                    Précédent
                  </Button>
                  {(() => {
                    const pages: React.ReactNode[] = [];
                    const showPages: (number | "start-ellipsis" | "end-ellipsis")[] = [1];
                    if (currentPage > 3) showPages.push("start-ellipsis");
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      if (i > 1 && i < totalPages) showPages.push(i);
                    }
                    if (currentPage < totalPages - 2) showPages.push("end-ellipsis");
                    if (totalPages > 1) showPages.push(totalPages);
                    showPages.forEach((item, index) => {
                      if (typeof item === "string") {
                        pages.push(
                          <span key={item + index} className="px-2 text-gray-500">
                            …
                          </span>
                        );
                      } else {
                        pages.push(
                          <Button
                            key={item}
                            variant={currentPage === item ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(item)}
                          >
                            {item}
                          </Button>
                        );
                      }
                    });
                    return <>{pages}</>;
                  })()}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-blue-900 text-white"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
            {filteredCourses.length === 0 && !isLoading && !error && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun module trouvé</h3>
                <p className="text-gray-600">Créez un nouveau module pour commencer.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedCourse && (
          <>
            <EvaluationsDialog
              open={evaluationsDialogOpen}
              onOpenChange={setEvaluationsDialogOpen}
              evaluationsData={evaluationsData || { evaluations: [] }}
              courseTitle={selectedCourse.title}
            />
            <PresenceDialog
              open={presenceDialogOpen}
              onOpenChange={setPresenceDialogOpen}
              presenceData={presenceData || { presence: [], durationDays: 1 }}
              handlePresenceChange={handlePresenceChange}
              courseTitle={selectedCourse.title}
            />
          </>
        )}

        {/* Archive Confirmation Dialog */}
        <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer l'archivage</DialogTitle>
            </DialogHeader>
            <p>Voulez-vous vraiment archiver le module {selectedCourse?.title || "-"} ?</p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setArchiveDialogOpen(false)}
                className="rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 transition-all duration-200"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmArchive}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white px-6 py-2 transition-all duration-200"
              >
                Archiver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Unarchive Confirmation Dialog */}
        <Dialog open={unarchiveDialogOpen} onOpenChange={setUnarchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer le désarchivage</DialogTitle>
            </DialogHeader>
            <p>Voulez-vous vraiment désarchiver le module {selectedCourse?.title || "-"} ?</p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUnarchiveDialogOpen(false)}
                className="rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2 transition-all duration-200"
              >
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={confirmUnarchive}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 transition-all duration-200"
              >
                Désarchiver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}