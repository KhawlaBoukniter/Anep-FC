"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useToast } from "../hooks/use-toast.ts";
import { useIsMobile } from "../hooks/use-mobile.tsx";
import {
  useSkills,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
  useLatestSkillCode,
} from "../hooks/useReqSkills";
import { useEmployees } from "../hooks/useEmployees";
import { useJobs } from "../hooks/useJobs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card.tsx";
import { Button } from "./ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx";
import { Badge } from "./ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Eye, Search, Filter, BookOpen, X, AlertTriangle, Users, UserX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip.tsx";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Trash } from "lucide-react";

export function ReqSkillsManagement() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [newSkill, setNewSkill] = useState({ code_competencer: "", competencer: "" });
  const [editSkill, setEditSkill] = useState({ id: "", code_competencer: "", competencer: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const skillsPerPage = 10;

  const { data: allSkills = [], isLoading: isSkillsLoading } = useSkills();
  const { data: employees = [], isLoading: isEmployeesLoading } = useEmployees({ archived: false });
  const { data: jobs = [], isLoading: isJobsLoading } = useJobs();

  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const { data: latestCode, isLoading: isLatestCodeLoading, error } = useLatestSkillCode();

  const filteredSkills = allSkills.filter((skill) => {
    if (!skill || typeof skill !== "object") return false;
    const code = skill.code_competencer || "";
    const competence = skill.competencer || "";
    return (
      code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      competence.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const generateNextCode = (latestCode) => {
    if (!latestCode) return "C1";
    
    const match = latestCode.match(/\d+/);
    if (!match) return "C1";
    
    const currentNumber = parseInt(match[0]);
    return `C${currentNumber + 1}`;
  };

  useEffect(() => {
    if (isAddModalOpen) {
      if (!isLatestCodeLoading && latestCode) {
        setNewSkill(prev => ({
          ...prev,
          code_competencer: generateNextCode(latestCode)
        }));
      } else if (!isLatestCodeLoading && error) {
        setNewSkill(prev => ({
          ...prev,
          code_competencer: ""
        }));
      }
    } else {
      setNewSkill({ code_competencer: "", competencer: "" });
    }
  }, [isAddModalOpen, latestCode, isLatestCodeLoading, error]);

  const handleAddSkill = () => {
    if (!newSkill.code_competencer || !newSkill.competencer) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
      });
      return;
    }

    createSkill.mutate(newSkill, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Compétence ajoutée avec succès." });
        setIsAddModalOpen(false);
        setNewSkill({ code_competencer: "", competencer: "" });
        queryClient.invalidateQueries("skills");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.response?.data?.error || "Échec de l'ajout de la compétence.",
        });
      },
    });
  };

  const handleUpdateSkill = () => {
    updateSkill.mutate(
      { id: editSkill.id, data: { code_competencer: editSkill.code_competencer, competencer: editSkill.competencer } },
      {
        onSuccess: () => {
          toast({ title: "Succès", description: "Compétence mise à jour avec succès." });
          setIsEditModalOpen(false);
          setEditSkill({ id: "", code_competencer: "", competencer: "" });
          queryClient.invalidateQueries("skills");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: error.response?.data?.error || "Échec de la mise à jour de la compétence.",
          });
        },
      }
    );
  };

  const handleDeleteSkill = (id: string) => {
    deleteSkill.mutate(id, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Compétence supprimée avec succès." });
        queryClient.invalidateQueries("skills");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.response?.data?.error || "Échec de la suppression de la compétence.",
        });
      },
    });
  };

  const totalPages = Math.ceil(filteredSkills.length / skillsPerPage);
  const indexOfLastSkill = currentPage * skillsPerPage;
  const indexOfFirstSkill = indexOfLastSkill - skillsPerPage;
  const currentSkills = filteredSkills.slice(indexOfFirstSkill, indexOfLastSkill);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const calculateSkillsWithGap = () => {
    if (isEmployeesLoading || isJobsLoading || isSkillsLoading) return 0;

    const skillsWithGap = new Set();

    employees.forEach((employee) => {
      const employeeJobs = (employee.emplois || []).map((e) => e.id_emploi);
      const requiredSkills = jobs
        .filter((job) => employeeJobs.includes(job.id_emploi))
        .flatMap((job) => job.required_skills || [])
        .map((skill) => ({
          id_competencer: skill.id_competencer,
          niveaur: skill.niveaur,
        }));

      const acquiredSkills = (employee.competences || []).map((skill) => ({
        id_competencea: skill.id_competencea,
        niveaua: skill.niveaua,
      }));

      requiredSkills.forEach((reqSkill) => {
        const matchingAcquiredSkill = acquiredSkills.find(
          (acqSkill) => acqSkill.id_competencea === reqSkill.id_competencer
        );
        const acquiredLevel = matchingAcquiredSkill ? matchingAcquiredSkill.niveaua : 0;
        if (reqSkill.niveaur > acquiredLevel) {
          skillsWithGap.add(reqSkill.id_competencer);
        }
      });
    });

    return skillsWithGap.size;
  };

  const calculateEmployeesWithGap = () => {
    if (isEmployeesLoading || isJobsLoading || isSkillsLoading) return 0;

    const employeesWithGap = new Set();

    employees.forEach((employee) => {
      let hasGap = false;
      const employeeJobs = (employee.emplois || []).map((e) => e.id_emploi);
      const requiredSkills = jobs
        .filter((job) => employeeJobs.includes(job.id_emploi))
        .flatMap((job) => job.required_skills || [])
        .map((skill) => ({
          id_competencer: skill.id_competencer,
          niveaur: skill.niveaur,
        }));

      const acquiredSkills = (employee.competences || []).map((skill) => ({
        id_competencea: skill.id_competencea,
        niveaua: skill.niveaua,
      }));

      requiredSkills.forEach((reqSkill) => {
        const matchingAcquiredSkill = acquiredSkills.find(
          (acqSkill) => acqSkill.id_competencea === reqSkill.id_competencer
        );
        const acquiredLevel = matchingAcquiredSkill ? matchingAcquiredSkill.niveaua : 0;
        if (reqSkill.niveaur > acquiredLevel) {
          hasGap = true;
        }
      });

      if (hasGap) {
        employeesWithGap.add(employee.id_employe);
      }
    });

    return employeesWithGap.size;
  };

  const calculateSkillsEmployeesWithGap = () => {
    if (isEmployeesLoading || isJobsLoading || isSkillsLoading) return 0;

    const skillsWithGap = new Set();
    const employeesWithGap = new Set();

    employees.forEach((employee) => {
      let hasGap = false;
      const employeeJobs = (employee.emplois || []).map((e) => e.id_emploi);
      const requiredSkills = jobs
        .filter((job) => employeeJobs.includes(job.id_emploi))
        .flatMap((job) => job.required_skills || [])
        .map((skill) => ({
          id_competencer: skill.id_competencer,
          niveaur: skill.niveaur,
        }));

      const acquiredSkills = (employee.competences || []).map((skill) => ({
        id_competencea: skill.id_competencea,
        niveaua: skill.niveaua,
      }));

      requiredSkills.forEach((reqSkill) => {
        const matchingAcquiredSkill = acquiredSkills.find(
          (acqSkill) => acqSkill.id_competencea === reqSkill.id_competencer
        );
        const acquiredLevel = matchingAcquiredSkill ? matchingAcquiredSkill.niveaua : 0;
        if (reqSkill.niveaur > acquiredLevel) {
          skillsWithGap.add(reqSkill.id_competencer);
          hasGap = true;
        }
      });

      if (hasGap) {
        employeesWithGap.add(employee.id_employe);
      }
    });

    return skillsWithGap.size * employeesWithGap.size;
  };

  if (isSkillsLoading || isEmployeesLoading || isJobsLoading) {
    return <div>Chargement des données...</div>;
  }

  const stats = {
    total: allSkills.length,
    gaps: calculateSkillsWithGap(),
    employeesGaps: calculateEmployeesWithGap(),
    skillsEmployeesGaps: calculateSkillsEmployeesWithGap(),
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-yellow-600 shadow-lg shadow-yellow-600 ">
            <CardContent className="p-4 ">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600">Total Compétences</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-rose-600 shadow-lg shadow-rose-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-rose-600">Compétences avec Écart</p>
                  <p className="text-2xl font-bold">{stats.gaps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card  style={{ borderColor: '#5784BA' }} className="border-l-4 shadow-lg shadow-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users style={{ color: '#5784BA' }} className="h-5 w-5 " />
                </div>
                <div>
                  <p style={{ color: '#5784BA' }} className="text-sm">Écart Compétences x Employés</p>
                  <p className="text-2xl font-bold">{stats.skillsEmployeesGaps}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-purple-800 shadow-lg shadow-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserX className="h-5 w-5 text-purple-900" />
                </div>
                <div>
                  <p className="text-sm text-purple-800">Employés avec Écart</p>
                  <p className="text-2xl font-bold">{stats.employeesGaps}</p>
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
                  placeholder="Rechercher par code ou compétence..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ borderColor: '#007198' }}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                style={{ backgroundColor: '#007198' }}
                className=" text-white"
              >
                Ajouter une compétence
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between" style={{ color: '#007198' }}>
              <CardTitle className="text-xl">Liste des Compétences</CardTitle>
              <Badge variant="secondary">{filteredSkills.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent >
            {isSkillsLoading ? (
              <p>Chargement...</p>
            ) : (
              <div className="rounded-md border">
                <Table className="bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/6 text-center" style={{ color: '#003C57' }}>Code</TableHead>
                      <TableHead className="w-1/2 text-center" style={{ color: '#003C57' }}>Compétence</TableHead>
                      <TableHead className="w-1/6 text-center" style={{ color: '#003C57' }}>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSkills.map((skill) => (
                      <TableRow key={skill.id} className="hover:bg-gray-50">
                        <TableCell className="text-center">{skill.code_competencer}</TableCell>
                        <TableCell className="text-center">{skill.competencer}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Eye className="h-4 w-4 text-green-600" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Compétence: {skill.competencer}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4 text-sm my-6">
                                      <div>
                                        <span className="font-medium text-gray-700">ID:</span>
                                        <p className="text-gray-600">{skill.id}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Code:</span>
                                        <p className="text-gray-600">{skill.code_competencer}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Compétence:</span>
                                        <p className="text-gray-600">{skill.competencer}</p>
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => {
                                    setEditSkill(skill);
                                    setIsEditModalOpen(true);
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="h-4 w-4 "
                                    style={{ color: '#007198' }}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                    />
                                  </svg>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Modifier</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDeleteSkill(skill.id)}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Supprimer</p>
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
                  Affichage de {indexOfFirstSkill + 1} à{" "}
                  {Math.min(indexOfLastSkill, filteredSkills.length)} sur {filteredSkills.length} compétences
                </div>
                <div className="flex flex-wrap justify-center gap-1 md:gap-2 ">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{ backgroundColor: '#007198' }}
                    className="text-white"
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
                        pages.push(<span key={item + index} className="px-2 text-gray-500">…</span>);
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
                    style={{ backgroundColor: '#007198' }}
                    className="text-white"
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}

            {filteredSkills.length === 0 && !isSkillsLoading && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune compétence trouvée</h3>
                <p className="text-gray-600">
                  Essayez de modifier votre recherche ou d'ajouter une nouvelle compétence.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {isAddModalOpen && (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une compétence</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <Input
                    type="text"
                    placeholder="Code (ex: C001)"
                    value={newSkill.code_competencer}
                    onChange={(e) => setNewSkill({ ...newSkill, code_competencer: e.target.value })}
                    className="border p-2 w-full"
                    disabled={isLatestCodeLoading}
                  />
                  {isLatestCodeLoading && (
                    <p className="text-sm text-gray-500 mt-1">Chargement du dernier code...</p>
                  )}
                  {error && (
                    <p className="text-red-500 text-sm mt-1">
                      Erreur lors du chargement du dernier code. Veuillez entrer un code manuellement.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compétence</label>
                  <Input
                    type="text"
                    placeholder="Nom de la compétence"
                    value={newSkill.competencer}
                    onChange={(e) => setNewSkill({ ...newSkill, competencer: e.target.value })}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddSkill}
                    disabled={createSkill.isLoading}
                  >
                    {createSkill.isLoading ? "Ajout en cours..." : "Ajouter"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {isEditModalOpen && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier une compétence</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <Input
                    type="text"
                    placeholder="Code"
                    value={editSkill.code_competencer}
                    onChange={(e) => setEditSkill({ ...editSkill, code_competencer: e.target.value })}
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Compétence</label>
                  <Input
                    type="text"
                    placeholder="Compétence"
                    value={editSkill.competencer}
                    onChange={(e) => setEditSkill({ ...editSkill, competencer: e.target.value })}
                    className="border p-2 w-full"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleUpdateSkill}
                    disabled={updateSkill.isLoading}
                  >
                    {updateSkill.isLoading ? "Mise à jour en cours..." : "Modifier"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}