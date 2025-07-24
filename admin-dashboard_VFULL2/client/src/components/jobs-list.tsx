"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table.tsx";
import {
  Eye,
  Search,
  Filter,
  Briefcase,
  TrendingUp,
  Archive,
  ArchiveRestore,
  X,
  File,
} from "lucide-react";
import { AddJobModal } from "./add-job-modal.tsx";
import { EditJobModal } from "./edit-job-modal.tsx";
import { DeleteJobModal } from "./delete-job-modal.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip.tsx";
import { useJobs, useArchiveJob, useUnarchiveJob, useImportJobFile } from "../hooks/useJobs";
import { Job } from "../types/job.ts";
import clsx from "clsx";

interface Filter {
  type: string;
  values: string[];
}

interface FilterOption {
  value: string;
  label: string;
  options: string[];
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function JobsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [newFilterType, setNewFilterType] = useState("");
  const [newFilterValues, setNewFilterValues] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [openPopover, setOpenPopover] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const jobsPerPage = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: jobs = [], isLoading, isError, error } = useJobs({
    search: debouncedSearchTerm,
    archived: filters.some((f) => f.type === "Archivage" && f.values.includes("Archivés")),
  });

  const { mutate: archiveJob } = useArchiveJob();
  const { mutate: unarchiveJob } = useUnarchiveJob();
  const { mutate: importJobFile } = useImportJobFile();

  const uniqueEntites = useMemo(() => {
    if (!jobs) return [];
    const entites = jobs.map((job) => job.entite);
    return [...new Set(entites)].sort() as string[];
  }, [jobs]);

  const filterOptions: FilterOption[] = useMemo(
    () => [
      { label: "Entité", value: "Entité", options: uniqueEntites },
      { label: "Archivage", value: "Archivage", options: ["Archivés", "Actifs"] },
    ],
    [uniqueEntites]
  );

  const availableOptions = filterOptions.find((opt) => opt.value === newFilterType)?.options || [];

  const filteredJobs = jobs.filter((job: Job) => {
    const matchesFilters = filters.every((filter) => {
      if (filter.type === "Entité") return filter.values.some((val) => job.entite.toLowerCase() === val.toLowerCase());
      if (filter.type === "Archivage") {
        return filter.values.every((val) => {
          if (val === "Archivés") return job.archived === true;
          if (val === "Actifs") return job.archived === false;
          return true;
        });
      }
      return true;
    });

    return matchesFilters;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filters]);

  const handleArchive = (job: Job) => {
    setSelectedJob(job);
    setArchiveDialogOpen(true);
  };

  const handleUnarchive = (job: Job) => {
    setSelectedJob(job);
    setUnarchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    if (selectedJob && selectedJob.id_emploi) {
      archiveJob(selectedJob.id_emploi);
      setArchiveDialogOpen(false);
      setSelectedJob(null);
    }
  };

  const confirmUnarchive = () => {
    if (selectedJob && selectedJob.id_emploi) {
      unarchiveJob(selectedJob.id_emploi);
      setUnarchiveDialogOpen(false);
      setSelectedJob(null);
    }
  };

  const handleImportFile = () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      importJobFile(formData, {
        onSuccess: () => {
          setImportDialogOpen(false);
          setFile(null);
        },
        onError: (error) => {
          console.error("Erreur lors de l'importation du fichier:", error);
        },
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleViewFile = async () => {
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/common-files`);
      if (!response.ok) throw new Error("Erreur lors de la récupération du fichier commun");

      const data = await response.json();
      const filePath = data[0]?.file_path; // On récupère le premier fichier de la table common_files
      if (!filePath) throw new Error("Aucun fichier commun trouvé");

      const fullUrl = filePath.startsWith("http") ? filePath : `${baseUrl}${filePath}`;
      console.log("Fetching file from:", fullUrl);

      const fileResponse = await fetch(fullUrl);
      if (!fileResponse.ok) throw new Error("Erreur lors du téléchargement du fichier");

      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filePath.split("/").pop() || "document.pdf"; // Nom du fichier par défaut
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier:", error);
      alert("Impossible de télécharger le fichier. Vérifiez l'URL ou les permissions.");
    }
  };

  const clearFilter = (filterType: string, value?: string) => {
    if (value) {
      setFilters((prev) =>
        prev
          .map((f) => (f.type === filterType ? { ...f, values: f.values.filter((v) => v !== value) } : f))
          .filter((f) => f.values.length > 0)
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
      setOpenPopover(false);
    }
  };

  const getFilterColor = (type: string) => {
    switch (type) {
      case "Entité":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Archivage":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 4:
        return "bg-green-100 text-green-800 border-green-200";
      case 3:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 2:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 1:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const stats = {
    total: jobs.length,
    entites: uniqueEntites.length,
    competencesTotal: jobs.reduce((acc, job) => acc + (job.required_skills?.length || 0), 0),
  };

  if (isError) {
    return (
      <div>
        Erreur: {(error as Error)?.message || "Une erreur inconnue s'est produite"}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-yellow-400 shadow-lg shadow-yellow-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-yellow-500">Total Emplois</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-purple-900 shadow-lg shadow-purple-900">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-900" />
                </div>
                <div>
                  <p className="text-sm text-purple-700">Entités</p>
                  <p className="text-2xl font-bold">{stats.entites}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-100">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-900" />
                <Input
                  placeholder="Rechercher par entité, code ou formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-l border-green-600"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white rounded-lg border-green-600 hover:bg-gray-100 transition-all"
                    >
                      <Filter className="h-4 w-4" /> Ajouter Filtre
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-2/5 rounded-xl bg-white shadow-2xl border border-gray-200 animate-in fade-in duration-200">
                    <DialogHeader className="border-b border-gray-100 p-4">
                      <DialogTitle className="text-xl font-bold text-gray-900">Ajouter un filtre</DialogTitle>
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
                          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-gray-700 bg-white appearance-none"
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
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                      {newFilterType && (
                        <div className="space-y-4">
                          <Input
                            placeholder={`Saisir ou rechercher ${newFilterType.toLowerCase()}...`}
                            value={searchValue}
                            onChange={(e) => {
                              setSearchValue(e.target.value);
                              setOpenPopover(e.target.value.length > 0);
                            }}
                            onKeyDown={handleKeyDown}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 transition-all"
                            aria-label={`Rechercher ${newFilterType.toLowerCase()}`}
                          />
                          {openPopover && (
                            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {availableOptions
                                .filter((option) => option.toLowerCase().includes(searchValue.toLowerCase()))
                                .map((option) => (
                                  <div
                                    key={option}
                                    onClick={() => {
                                      if (!newFilterValues.includes(option)) {
                                        setNewFilterValues((prev) => [...prev, option]);
                                        setSearchValue("");
                                        setOpenPopover(false);
                                      }
                                    }}
                                    className={clsx(
                                      "p-2 cursor-pointer hover:bg-gray-100 transition-colors",
                                      newFilterValues.includes(option) && "opacity-50 cursor-not-allowed"
                                    )}
                                  >
                                    {option}
                                  </div>
                                ))}
                              {availableOptions.filter((option) => option.toLowerCase().includes(searchValue.toLowerCase())).length === 0 && (
                                <div className="p-2 text-gray-500">Aucun résultat. Appuyez sur Entrée pour ajouter.</div>
                              )}
                            </div>
                          )}
                          {newFilterValues.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {newFilterValues.map((value) => (
                                <Badge
                                  key={value}
                                  variant="secondary"
                                  className={clsx(
                                    "flex items-center gap-1 p-1 text-sm font-medium rounded-full transition-all",
                                    getFilterColor(newFilterType)
                                  )}
                                >
                                  {value}
                                  <X
                                    className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded-full p-0.5"
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
                    <DialogFooter className="border-t border-gray-100 p-4 flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setFilterDialogOpen(false)}
                        className="rounded-lg border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 transition-all"
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
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 shadow-md transition-all"
                      >
                        Ajouter
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white rounded-lg border-green-600 hover:bg-gray-100 transition-all"
                      onClick={handleViewFile}
                      disabled={false} // Toujours activé si un fichier existe dans common_files
                    >
                      <File className="h-4 w-4" /> Voir Rec
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Télécharger le fichier commun</p>
                  </TooltipContent>
                </Tooltip>
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-white rounded-lg border-green-600 hover:bg-gray-100 transition-all"
                    >
                      <File className="h-4 w-4" /> Importer Fichier
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-xl bg-white shadow-2xl border border-gray-200">
                    <DialogHeader>
                      <DialogTitle>Importer un fichier pour tous les emplois</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 space-y-4">
                      <Input
                        type="file"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        accept=".pdf"
                      />
                    </div>
                    <DialogFooter className="border-t border-gray-100 p-4 flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setImportDialogOpen(false)}
                        className="rounded-lg border-gray-300 hover:bg-gray-100 text-gray-700 px-4 py-2 transition-all"
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="default"
                        onClick={handleImportFile}
                        disabled={!file}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 shadow-md transition-all"
                      >
                        Importer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <AddJobModal />
              </div>
            </div>
            {filters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.map((filter) =>
                  filter.values.map((value) => (
                    <Badge
                      key={`${filter.type}-${value}`}
                      variant="secondary"
                      className={clsx("flex items-center gap-1", getFilterColor(filter.type))}
                    >
                      {filter.type}: {value}
                      <X
                        className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded"
                        onClick={() => clearFilter(filter.type, value)}
                        aria-label={`Supprimer filtre ${filter.type} ${value}`}
                      />
                    </Badge>
                  ))
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 rounded-lg border-gray-300 hover:bg-gray-100 transition-all"
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

        <Card className="bg-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between text-green-600">
              <CardTitle className="text-xl">
                {filters.some((f) => f.type === "Archivage" && f.values.includes("Archivés"))
                  ? "Emplois Archivés"
                  : "Liste des Emplois"}
              </CardTitle>
              <Badge variant="secondary">{filteredJobs.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : (
              <>
                <div className="rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/7 text-center text-green-800">Code</TableHead>
                        <TableHead className="w-1/4 text-center pr-12 text-green-800">Emploi</TableHead>
                        <TableHead className="w-1/6 text-center text-green-800">Entité</TableHead>
                        <TableHead className="w-1/6 text-center text-green-800">Formation</TableHead>
                        <TableHead className="w-1/6 text-center text-green-800">Expérience</TableHead>
                        <TableHead className="w-1/4 text-center text-green-800">Poids emploi</TableHead>
                        <TableHead className="text-center text-green-800">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentJobs.map((job: Job) => (
                        <TableRow key={job.id_emploi} className="hover:bg-gray-50">
                          <TableCell className="font-medium">{job.codeemploi}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                key={job.id_emploi}
                                className={clsx(
                                  "relative overflow-hidden whitespace-nowrap max-w-[160px] px-2",
                                  job.nom_emploi.length > 20 && "animate-scrollText"
                                )}
                              >
                                <span
                                  className={clsx(
                                    "block max-w-full whitespace-nowrap",
                                    job.nom_emploi.length > 20 && "will-change-transform animate-scrollContent"
                                  )}
                                >
                                  {job.nom_emploi}
                                </span>
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={job.archived ? "destructive" : "secondary"}>{job.entite}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-600">{job.formation}</TableCell>
                          <TableCell className="text-gray-600">{job.experience || "-"}</TableCell>
                          <TableCell className="text-gray-600">{job.poidsemploi || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Eye className="h-4 w-4 text-green-600" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>
                                          {job.entite} - {job.codeemploi}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-6 pr-2">
                                        <div>
                                          <h4 className="font-medium mb-3 text-gray-900">Informations générales</h4>
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <span className="font-medium text-gray-700">Code emploi:</span>
                                              <p className="text-gray-600">{job.codeemploi}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Nom emploi:</span>
                                              <p className="text-gray-600">{job.nom_emploi}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Entité:</span>
                                              <Badge variant={job.archived ? "destructive" : "secondary"}>
                                                {job.entite}
                                              </Badge>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Formation requise:</span>
                                              <p className="text-gray-600">{job.formation}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Expérience:</span>
                                              <p className="text-gray-600">{job.experience || "-"}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Poids emploi:</span>
                                              <p className="text-gray-600">{job.poidsemploi || "-"}</p>
                                            </div>
                                            <div>
                                              <span className="font-medium text-gray-700">Statut:</span>
                                              <Badge variant={job.archived ? "destructive" : "secondary"}>
                                                {job.archived ? "Archivé" : "Actif"}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-3 text-gray-900">
                                            Compétences requises ({job.required_skills?.length || 0})
                                          </h4>
                                          <div className="mt-12">
                                            {(job.required_skills && job.required_skills.length > 0) ? (
                                              <ul className="space-y-3">
                                                {job.required_skills.map((comp) => (
                                                  <li
                                                    key={comp.id_competencer}
                                                    className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 cursor-default"
                                                  >
                                                    <div className="flex items-center justify-between gap-2 w-full">
                                                      <span className="text-gray-800 font-medium">{comp.competencer}</span>
                                                      <Badge className={clsx("font-bold", getLevelColor(comp.niveaur))}>
                                                        Niveau {comp.niveaur}
                                                      </Badge>
                                                    </div>
                                                  </li>
                                                ))}
                                              </ul>
                                            ) : (
                                              <span className="text-gray-400 italic">Aucune compétence</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Voir les détails</p>
                                </TooltipContent>
                              </Tooltip>
                              {!job.archived && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <EditJobModal job={job} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Modifier l'emploi</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-yellow-600"
                                        onClick={() => handleArchive(job)}
                                      >
                                        <Archive className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Archiver l'emploi</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                              {filters.some((f) => f.type === "Archivage" && f.values.includes("Archivés")) && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-green-600"
                                        onClick={() => handleUnarchive(job)}
                                      >
                                        <ArchiveRestore className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Désarchiver l'emploi</p>
                                    </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <DeleteJobModal jobId={job.id_emploi} jobCode={job.codeemploi} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Supprimer l'emploi</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="text-sm text-gray-600 text-center md:text-left">
                      Affichage de {indexOfFirstJob + 1} à {Math.min(indexOfLastJob, filteredJobs.length)} sur{" "}
                      {filteredJobs.length} emplois
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-green-600 text-white"
                      >
                        Précédent
                      </Button>
                      {(() => {
                        const pages: React.ReactNode[] = [];
                        const showPages: (number | "start-ellipsis" | "end-ellipsis")[] = [1];
                        if (currentPage > 3) showPages.push("start-ellipsis");
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          if (i > 1 && i < totalPages) {
                            showPages.push(i);
                          }
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
                        return pages;
                      })()}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="bg-green-600 text-white"
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}

                {filteredJobs.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {filters.some((f) => f.type === "Archivage" && f.values.includes("Archivés"))
                        ? "Aucun emploi archivé trouvé"
                        : "Aucun emploi actif trouvé"}
                    </h3>
                    <p className="text-gray-600">
                      Essayez de modifier vos critères de recherche ou d'ajouter un nouvel emploi.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Archive Confirmation Dialog */}
        <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer l'archivage</DialogTitle>
            </DialogHeader>
            <p>Voulez-vous vraiment archiver l'emploi {selectedJob?.nom_emploi || "-"} ?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setArchiveDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={confirmArchive}>
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
            <p>Voulez-vous vraiment désarchiver l'emploi {selectedJob?.nom_emploi || "-"} ?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUnarchiveDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="default" onClick={confirmUnarchive}>
                Désarchiver
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}