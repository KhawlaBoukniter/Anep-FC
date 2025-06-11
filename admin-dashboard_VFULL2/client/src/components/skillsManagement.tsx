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
  useLatestSkillCode
} from "../hooks/useSkills";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.tsx";
import { Button } from "../components/ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog.tsx";
import { Input } from "../components/ui/input.tsx";
import { Eye, Search, Filter, BookOpen, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip.tsx";
import { DialogTrigger } from "@radix-ui/react-dialog";

export function SkillsManagement() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [newSkill, setNewSkill] = useState({ code_competencea: "", competencea: "" });
  const [editSkill, setEditSkill] = useState({ id: "", code_competencea: "", competencea: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const skillsPerPage = 10;

  const { data: allSkills = [], isLoading: isSkillsLoading } = useSkills();

  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const { data: latestCode, isLoading: isLatestCodeLoading, error } = useLatestSkillCode();

  const filteredSkills = allSkills.filter((skill) => {
    return (
      skill.code_competencea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.competencea.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const generateNextCode = (code) => {
    if (!code || isNaN(parseInt(code.replace("C", "")))) return "C001"; 
    const number = parseInt(code.replace("C", "")) + 1;
    return `C${number.toString().padStart(3, "0")}`;
  };

  useEffect(() => {
    if (isAddModalOpen && latestCode && !isLatestCodeLoading && !error) {
      setNewSkill((prev) => ({
        ...prev,
        code_competencea: generateNextCode(latestCode),
      }));
    } else if (isAddModalOpen && !latestCode && !isLatestCodeLoading && error) {
      setNewSkill((prev) => ({ ...prev, code_competencea: "C001" }));
    } else if (!isAddModalOpen) {
      setNewSkill((prev) => ({ ...prev, code_competencea: "" }));
    }
  }, [isAddModalOpen, latestCode, isLatestCodeLoading, error]);

  const handleAddSkill = () => {
    createSkill.mutate(newSkill, {
      onSuccess: () => {
        toast({ title: "Succès", description: "Compétence ajoutée avec succès." });
        setIsAddModalOpen(false);
        setNewSkill({ code_competencea: "", competencea: "" });
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
      { id: editSkill.id, data: { code_competencea: editSkill.code_competencea, competencea: editSkill.competencea } },
      {
        onSuccess: () => {
          toast({ title: "Succès", description: "Compétence mise à jour avec succès." });
          setIsEditModalOpen(false);
          setEditSkill({ id: "", code_competencea: "", competencea: "" });
          queryClient.invalidateQueries("skills");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: error.response?.data?.error || "Échec de la mise à jour de la compétence.",
          });
        },
      },
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

  if (isSkillsLoading) return <div>Chargement des compétences...</div>;

  const stats = {
    total: allSkills.length,
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Compétences</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par code ou compétence..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-500 text-white"
              >
                Ajouter une compétence
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Liste des Compétences</CardTitle>
              <Badge variant="secondary">{filteredSkills.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isSkillsLoading ? (
              <p>Chargement...</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/6 text-center">Code</TableHead>
                      <TableHead className="w-1/2 text-center">Compétence</TableHead>
                      <TableHead className="w-1/6 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSkills.map((skill) => (
                      <TableRow key={skill.id} className="hover:bg-gray-50">
                        <TableCell className="text-center">{skill.code_competencea}</TableCell>
                        <TableCell className="text-center">{skill.competencea}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Compétence: {skill.competencea}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4 text-sm my-6">
                                      <div>
                                        <span className="font-medium text-gray-700">ID:</span>
                                        <p className="text-gray-600">{skill.id}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Code:</span>
                                        <p className="text-gray-600">{skill.code_competencea}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Compétence:</span>
                                        <p className="text-gray-600">{skill.competencea}</p>
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
                                    className="h-4 w-4"
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
                                  <X className="h-4 w-4 text-red-500" />
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
                <Input
                  type="text"
                  placeholder="Code"
                  value={newSkill.code_competencea}
                  onChange={(e) => setNewSkill({ ...newSkill, code_competencea: e.target.value })}
                  className="border p-2 w-full"
                  disabled={isLatestCodeLoading || (latestCode && !error)} // Disable if loading or code is successfully retrieved
                />
                {error && <p className="text-red-500 text-sm">Erreur lors du chargement du dernier code. Veuillez entrer un code manuellement (ex: C001).</p>}
                <Input
                  type="text"
                  placeholder="Compétence"
                  value={newSkill.competencea}
                  onChange={(e) => setNewSkill({ ...newSkill, competencea: e.target.value })}
                  className="border p-2 w-full"
                />
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
                <Input
                  type="text"
                  placeholder="Code"
                  value={editSkill.code_competencea}
                  onChange={(e) => setEditSkill({ ...editSkill, code_competencea: e.target.value })}
                  className="border p-2 w-full"
                />
                <Input
                  type="text"
                  placeholder="Compétence"
                  value={editSkill.competencea}
                  onChange={(e) => setEditSkill({ ...editSkill, competencea: e.target.value })}
                  className="border p-2 w-full"
                />
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