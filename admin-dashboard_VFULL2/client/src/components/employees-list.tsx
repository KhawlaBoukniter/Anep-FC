"use client";

import { useState, useRef } from "react";
import { useEmployees } from "../hooks/useEmployees.js";
import { useJobs } from "../hooks/useJobs.js";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx";
import { Eye, Search, Filter, Users, Award, MapPin, User, Shield, X } from "lucide-react";
import { AddEmployeeModal } from "./add-employee-modal.tsx";
import { EditEmployeeModal } from "./edit-employee-modal.tsx";
import { DeleteEmployeeModal } from "./delete-employee-modal.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip.tsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx";
import { Employee, Emploi } from "../types/employee.ts";
import { DialogTrigger } from "@radix-ui/react-dialog";
import clsx from "clsx";
import CompetencesByLevel from "./CompetencesByLevel.tsx";

export function EmployeesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmploi, setFilterEmploi] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [openEmploiPopover, setOpenEmploiPopover] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 10;
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: employees = [], isLoading } = useEmployees({ search: searchTerm });
  const { data: availableJobs = [] } = useJobs();

  const filteredEmployees = employees.filter((employee: Employee) => {
    const matchesSearch =
      employee.nom_complet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.emplois || []).some((e) => e.nom_emploi.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEmploi =
      !filterEmploi ||
      (employee.emplois || []).some((e) => e.nom_emploi.toLowerCase().includes(filterEmploi.toLowerCase()));
    const matchesRole = filterRole === "all" || employee.role === filterRole;

    return matchesSearch && matchesEmploi && matchesRole;
  });

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const selectEmploi = (emploi: string) => {
    setFilterEmploi(emploi);
    setOpenEmploiPopover(false);
    setCurrentPage(1);
  };

  const clearEmploiFilter = () => {
    setFilterEmploi("");
    setCurrentPage(1);
  };

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800";
  };

  const stats = {
    total: employees.length,
    admins: employees.filter((e: Employee) => e.role === "admin").length,
    emplois: new Set(employees.flatMap((e: Employee) => (e.emplois || []).map((j) => j.nom_emploi))).size,
    competencesTotal: employees.reduce((acc: number, emp: Employee) => acc + (emp.competences || []).length, 0),
  };
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Employés</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emplois</p>
                  <p className="text-2xl font-bold">{stats.emplois}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email ou emploi..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Popover open={openEmploiPopover} onOpenChange={setOpenEmploiPopover}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-48 justify-start text-left overflow-hidden text-ellipsis whitespace-nowrap"
                        role="combobox"
                      >
                        <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{filterEmploi || "Filtrer par emploi..."}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-64" align="start" side="bottom" sideOffset={5}>
                      <Command>
                        <CommandInput placeholder="Rechercher un emploi..." />
                        <CommandList>
                          <CommandEmpty>Aucun emploi trouvé.</CommandEmpty>
                          <CommandGroup>
                            {availableJobs.map((job: Emploi) => (
                              <CommandItem
                                key={job.id_emploi}
                                value={job.nom_emploi}
                                onSelect={() => {
                                  selectEmploi(job.nom_emploi);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{job.nom_emploi}</span>
                                  <span className="text-sm text-muted-foreground">{job.codeemploi}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                </div>
                <Select 
                  value={filterRole}
                  onValueChange={(value) => {
                    setFilterRole(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
                <AddEmployeeModal />
              </div>
            </div>
            {filterEmploi && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">Filtre actif:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filterEmploi}
                  <X className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded" onClick={clearEmploiFilter} />
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employees table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Liste des Employés</CardTitle>
              <Badge variant="secondary">{filteredEmployees.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4 text-center">Nom Complet</TableHead>
                      <TableHead className="w-1/4 text-center pr-12">Emploi</TableHead>
                      <TableHead className="w-1/4 text-center pr-12">Email</TableHead>
                      <TableHead className="w-1/6 text-center">Rôle</TableHead>
                      <TableHead className="w-1/6 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEmployees.map((employee: Employee) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-sm text-start">{employee.nom_complet}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {(employee.emplois || []).map((emploi) => {
                              const isTooLong = emploi.nom_emploi.length > 20;

                              return (
                                <Badge
                                  key={emploi.id_emploi}
                                  className={clsx(
                                    "relative overflow-hidden whitespace-nowrap max-w-[160px] px-2",
                                    isTooLong && "animate-scrollText"
                                  )}
                                >
                                  <span
                                    className={clsx(
                                      "block max-w-full whitespace-nowrap",
                                      isTooLong && "will-change-transform animate-scrollContent"
                                    )}
                                  >
                                    {emploi.nom_emploi}
                                  </span>
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{employee.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(employee.role)} variant="secondary">
                            {employee.role === "admin" ? (
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                Admin
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                User
                              </div>
                            )}
                          </Badge>
                        </TableCell>
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
                                  <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>{employee.nom_complet}</DialogTitle>
                                    </DialogHeader>
                                    <div className="pr-2">
                                        <div className="grid grid-cols-2 gap-4 text-sm my-6">
                                          <div>
                                            <span className="font-medium text-gray-700">Emplois:</span>
                                            <p className="text-gray-600">
                                              {(employee.emplois || []).map((e) => e.nom_emploi).join(", ") || "-"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Email:</span>
                                            <p className="text-gray-600">{employee.email || "-"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Téléphone 1:</span>
                                            <p className="text-gray-600">{employee.telephone1 || "-"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Téléphone 2:</span>
                                            <p className="text-gray-600">{employee.telephone2 || "-"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Adresse:</span>
                                            <p className="text-gray-600">{employee.adresse || "-"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Date de Recrutement:</span>
                                            <p className="text-gray-600">
                                              {employee.date_recrutement
                                                ? new Date(employee.date_recrutement).toLocaleDateString("fr-FR")
                                                : "-"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Date de Naissance:</span>
                                            <p className="text-gray-600">
                                              {employee.date_naissance
                                                ? new Date(employee.date_naissance).toLocaleDateString("fr-FR")
                                                : "-"}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">CIN:</span>
                                            <p className="text-gray-600">{employee.cin || "-"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Rôle:</span>
                                            <Badge className={getRoleColor(employee.role)} variant="secondary">
                                              {employee.role}
                                            </Badge>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Catégorie:</span>
                                            <p className="text-gray-600">{employee.categorie || "-"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Spécialité:</span>
                                            <p className="text-gray-600">{employee.specialite || "-"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Expérience:</span>
                                            <p className="text-gray-600">{employee.experience_employe || "-"} ans</p>
                                          </div>
                                        </div>
                                      <div className="mt-12">
                                        {(employee.competences && employee.competences.length > 0) ? (
                                          <CompetencesByLevel competences={employee.competences} />
                                        ) : (
                                          <span className="text-gray-400 italic">Aucune compétence</span>
                                        )}
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
                                <EditEmployeeModal employee={employee} />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Modifier l'employé</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DeleteEmployeeModal
                                  employeeId={employee.id}
                                  employeeName={employee.nom_complet}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Supprimer l'employé</p>
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
                  Affichage de {indexOfFirstEmployee + 1} à{" "}
                  {Math.min(indexOfLastEmployee, filteredEmployees.length)} sur {filteredEmployees.length} employés
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

            {filteredEmployees.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun employé trouvé</h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche ou d'ajouter un nouvel employé.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}