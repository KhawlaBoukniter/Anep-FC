"use client";

import { useState } from "react";
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
import { useJobs } from "../hooks/useJobs"; // Import the useJobs hook
import { Job, Competence } from "../types/job.ts";

export function JobsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntite, setFilterEntite] = useState("all");

  // Fetch jobs using the useJobs hook
  const { data: jobs = [], isLoading, isError, error } = useJobs({ search: searchTerm });

  // Filter jobs client-side based on entite
  const filteredJobs = jobs.filter((job) => {
    const matchesEntite = filterEntite === "all" || job.entite === filterEntite;
    return matchesEntite;
  });

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

  const getEntiteColor = (entite: string) => {
    const colors = {
      "Département IT": "bg-blue-100 text-blue-800",
      "Département Design": "bg-purple-100 text-purple-800",
      "Département Management": "bg-indigo-100 text-indigo-800",
      "Département Marketing": "bg-pink-100 text-pink-800",
      "Département RH": "bg-teal-100 text-teal-800",
    };
    return colors[entite as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const stats = {
    total: jobs.length,
    entites: new Set(jobs.map((j) => j.entite)).size,
    competencesTotal: jobs.reduce((acc, job) => acc + (job.required_skills?.length || 0), 0),
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    // Type assertion for error
    return <div>Error: {(error as Error)?.message || 'An unknown error occurred'}</div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with statistics */}
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

        {/* Search and filter bar */}
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
                <Select value={filterEntite} onValueChange={setFilterEntite}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Entité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les entités</SelectItem>
                    <SelectItem value="Département IT">Département IT</SelectItem>
                    <SelectItem value="Département Design">Département Design</SelectItem>
                    <SelectItem value="Département Management">Département Management</SelectItem>
                    <SelectItem value="Département Marketing">Département Marketing</SelectItem>
                    <SelectItem value="Département RH">Département RH</SelectItem>
                  </SelectContent>
                </Select>

                <AddJobModal />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Liste des Emplois</CardTitle>
              <Badge variant="secondary">{filteredJobs.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead>Formation</TableHead>
                    <TableHead>Expérience</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id_emploi} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{job.codeemploi}</TableCell>
                      <TableCell>
                        <Badge className={getEntiteColor(job.entite)} variant="secondary">
                          {job.entite}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{job.formation}</TableCell>
                      <TableCell className="text-gray-600">{job.experience || "N/A"}</TableCell>
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
                                    {/* General information */}
                                    <div>
                                      <h4 className="font-medium mb-3 text-gray-900">Informations générales</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-700">Code emploi:</span>
                                          <p className="text-gray-600">{job.codeemploi}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Entité:</span>
                                          <Badge className={getEntiteColor(job.entite)} variant="secondary">
                                            {job.entite}
                                          </Badge>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Formation requise:</span>
                                          <p className="text-gray-600">{job.formation}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Expérience:</span>
                                          <p className="text-gray-600">{job.experience || "N/A"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Poids emploi:</span>
                                          <p className="text-gray-600">{job.poidsemploi || "N/A"}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Required skills */}
                                    <div>
                                      <h4 className="font-medium mb-3 text-gray-900">
                                        Compétences requises ({job.required_skills?.length || 0})
                                      </h4>
                                      <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {job.required_skills?.map((skill, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                          >
                                            <div className="flex items-center gap-3">
                                              <span className="font-medium">{skill.competencer}</span>
                                            </div>
                                            <Badge className={getLevelColor(skill.niveaur)}>
                                              Niveau {skill.niveaur}
                                            </Badge>
                                          </div>
                                        ))}
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

            {filteredJobs.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun emploi trouvé</h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche ou d'ajouter un nouvel emploi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}