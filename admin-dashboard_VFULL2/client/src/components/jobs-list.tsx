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
import { Eye, Search, Filter, Briefcase, TrendingUp, Award } from "lucide-react";
import { AddJobModal } from "./add-job-modal.tsx";
import { EditJobModal } from "./edit-job-modal.tsx";
import { DeleteJobModal } from "./delete-job-modal.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip.tsx";
import { useJobs } from "../hooks/useJobs";
import { Job, Competence } from "../types/job.ts";
import clsx from "clsx";
import CompetencesByLevel from "./CompetencesByLevel.tsx";
import CompetencesRByLevel from "./CompetencesRByLevel.tsx";


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
  const [filterEntite, setFilterEntite] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: jobs = [], isLoading, isError, error } = useJobs({
    search: debouncedSearchTerm,
  });

  const uniqueEntites = useMemo(() => {
    if (!jobs) return [];
    const entites = jobs.map(job => job.entite);
    return [...new Set(entites)].sort();
  }, [jobs]);


  const filteredJobs = jobs.filter((job: Job) => {
    const matchesEntite = filterEntite === "all" || job.entite === filterEntite;
    return matchesEntite;
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
  }, [debouncedSearchTerm, filterEntite]);

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-blue-100 text-blue-800";
      case 4:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: jobs.length,
    entites: uniqueEntites.length,
    competencesTotal: jobs.reduce((acc, job) => acc + (job.required_skills?.length || 0), 0),
  };

  if (isError) {
    return <div>Error: {(error as Error)?.message || 'An unknown error occurred'}</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Emplois</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Entités</p>
                  <p className="text-2xl font-bold">{stats.entites}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compétences</p>
                  <p className="text-2xl font-bold">{stats.competencesTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par entité, code ou formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterEntite} onValueChange={(value) => setFilterEntite(value)}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Entité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les entités</SelectItem>
                    {uniqueEntites.map((entite) => (
                      <SelectItem key={entite} value={entite}>
                        {entite}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <AddJobModal />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Liste des Emplois</CardTitle>
              <Badge variant="secondary">{filteredJobs.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/7 text-center">Code</TableHead>
                        <TableHead className="w-1/4 text-center pr-12">Emploi</TableHead>
                        <TableHead className="w-1/6 text-center ">Entité</TableHead>
                        <TableHead className="w-1/6 text-center">Formation</TableHead>
                        <TableHead className="w-1/6 text-center">Expérience</TableHead>
                        <TableHead className="w-1/4 text-center">Poids emploi</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
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
                            <Badge variant="secondary">
                              {job.entite}
                            </Badge>
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
                                        <Eye className="h-4 w-4" />
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
                                              <Badge variant="secondary">
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
                                          </div>
                                        </div>

                                        <div>
                                          <h4 className="font-medium mb-3 text-gray-900">
                                            Compétences requises ({job.required_skills?.length || 0})
                                          </h4>
                                          <div className="mt-12">
                                            {(job.required_skills && job.required_skills.length > 0) ? (
                                              <CompetencesRByLevel competences={job.required_skills} />
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
                                  <DeleteJobModal jobId={job.id_emploi} jobCode={job.codeemploi} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Supprimer l'emploi</p>
                                </TooltipContent>
                              </Tooltip>
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
                      Affichage de {indexOfFirstJob + 1} à{" "}
                      {Math.min(indexOfLastJob, filteredJobs.length)} sur {filteredJobs.length} emplois
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
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
                              <span key={item + index} className="px-2 text-gray-500">…</span>
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
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}

                {filteredJobs.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun emploi trouvé</h3>
                    <p className="text-gray-600">
                      Essayez de modifier vos critères de recherche ou d'ajouter un nouvel emploi.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
