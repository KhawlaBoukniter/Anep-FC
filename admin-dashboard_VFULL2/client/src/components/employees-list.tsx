"use client";

import { useState, useRef } from "react";
import { useEmployees, useArchiveEmployee, useUnarchiveEmployee } from "../hooks/useEmployees.js";
import { useJobs } from "../hooks/useJobs.js";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "./ui/command.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx";
import { Eye, Search, Filter, Users, MapPin, User, Shield, X, Archive, ArchiveRestore, XCircle, Plus } from "lucide-react";
import { AddEmployeeModal } from "./add-employee-modal.tsx";
import { EditEmployeeModal } from "./edit-employee-modal.tsx";
import { DeleteEmployeeModal } from "./delete-employee-modal.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip.tsx";
import { Employee, Emploi, Profile, Competence } from "../types/employee.ts";
import clsx from "clsx";
import CompetencesByLevel from "./CompetencesByLevel.tsx";

// Extended interface to include profile
interface ExtendedEmployee extends Employee {
  profile: Profile | null;
}

interface Filter {
  type: string;
  values: string[];
}

interface FilterOption {
  value: string;
  label: string;
  options: string[];
}

export function EmployeesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [newFilterType, setNewFilterType] = useState("");
  const [newFilterValues, setNewFilterValues] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [openPopover, setOpenPopover] = useState(false);
  const employeesPerPage = 10;
  const inputRef = useRef<HTMLInputElement>(null);

  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSyncProfiles = async () => {
    try {
      const response = await fetch("/api/sync-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Sync response:", data);
      if (response.ok) {
        setSyncStatus(
          `Synchronisation terminée à ${new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}. Mis à jour: ${data.updated}, Inséré: ${data.inserted}`
        );
      } else {
        setSyncStatus(`Erreur lors de la synchronisation: ${data.message || "Vérifiez le serveur."}`);
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus(`Erreur lors de la synchronisation: ${error.message || "Problème de connexion."}`);
    }
  };

  const { data: employeesData = [], isLoading, error } = useEmployees({
    search: searchTerm,
    archived: showArchived,
  });
  const { mutate: archiveEmployee } = useArchiveEmployee();
  const { mutate: unarchiveEmployee } = useUnarchiveEmployee();
  const { data: availableJobs = [] } = useJobs();

  const enrichedEmployees: ExtendedEmployee[] = employeesData
    .map((data: Partial<Employee> = {}) => ({
      ...data,
      profile: data.profile || null,
      emplois: data.emplois || [],
      competences: data.competences || [],
    }))
    .filter((e): e is ExtendedEmployee => e !== null && e.id_employe !== undefined);

  const filteredEmployees: ExtendedEmployee[] = enrichedEmployees.filter((employee: ExtendedEmployee) => {
    const nomComplet = employee.nom_complet || "";
    const email = employee.email || "";
    const emplois = employee.emplois || [];
    const cin = employee.cin || "";

    const matchesSearch =
      !searchTerm ||
      nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emplois.some((e) => e?.nom_emploi?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      cin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = filters.every((filter) => {
      if (filter.type === "Emploi") return filter.values.some((val) => emplois.some((e) => e?.nom_emploi?.toLowerCase().includes(val.toLowerCase())));
      if (filter.type === "Ville") return filter.values.some((val) => employee.profile?.LIBELLE_LOC?.toLowerCase().includes(val.toLowerCase()));
      if (filter.type === "Département") return filter.values.some((val) => emplois.some((e) => e?.entite?.toLowerCase().includes(val.toLowerCase())));
      if (filter.type === "Région") return filter.values.some((val) => employee.profile?.LIBELLE_REGION?.toLowerCase().includes(val.toLowerCase()));
      if (filter.type === "Statut") return filter.values.some((val) => employee.profile?.STATUT?.toLowerCase() === val.toLowerCase());
      return true;
    });

    return matchesSearch && matchesFilters;
  });

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const indexOfLastEmployee = currentPage * employeesPerPage;
  const indexOfFirstEmployee = indexOfLastEmployee - employeesPerPage;
  const currentEmployees = filteredEmployees.slice(indexOfFirstEmployee, indexOfLastEmployee);

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
      setOpenPopover(false);
    }
  };

  const getRoleColor = (role: "user" | "admin") => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800";
  };

  const stats = {
    total: enrichedEmployees.length,
    admins: enrichedEmployees.filter((e: Employee) => e.role === "admin").length,
    emplois: new Set(enrichedEmployees.flatMap((e: Employee) => (e.emplois || []).map((j) => j.nom_emploi))).size,
    competencesTotal: enrichedEmployees.reduce((acc: number, emp: Employee) => acc + (emp.competences || []).length, 0),
  };

  const handleArchive = (employee: Employee) => {
    setSelectedEmployee(employee);
    setArchiveDialogOpen(true);
  };

  const handleUnarchive = (employee: Employee) => {
    setSelectedEmployee(employee);
    setUnarchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    if (selectedEmployee) {
      archiveEmployee({ id_employe: selectedEmployee.id_employe });
      setArchiveDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const confirmUnarchive = () => {
    if (selectedEmployee) {
      unarchiveEmployee({ id_employe: selectedEmployee.id_employe });
      setUnarchiveDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const uniqueVilles = Array.from(new Set(enrichedEmployees.map((e) => e.profile?.LIBELLE_LOC).filter(Boolean) as string[])).sort();
  const uniqueDepartements = Array.from(new Set(availableJobs.map((j: Emploi) => j.entite).filter(Boolean))).sort();
  const uniqueRegions = Array.from(new Set(enrichedEmployees.map((e) => e.profile?.LIBELLE_REGION).filter(Boolean) as string[])).sort();
  const uniqueStatuses = Array.from(new Set(enrichedEmployees.map((e) => e.profile?.STATUT).filter(Boolean) as string[])).sort();
  const uniqueJobs = Array.from(new Set(availableJobs.map((j: Emploi) => j.nom_emploi).filter(Boolean))).sort();

  const filterOptions: FilterOption[] = [
    { label: "Emploi", value: "Emploi", options: uniqueJobs },
    { label: "Ville", value: "Ville", options: uniqueVilles },
    { label: "Département", value: "Département", options: uniqueDepartements },
    { label: "Région", value: "Région", options: uniqueRegions },
    { label: "Statut", value: "Statut", options: uniqueStatuses },
  ];

  const availableOptions = filterOptions.find((opt) => opt.value === newFilterType)?.options || [];

  const getFilterColor = (type: string) => {
    switch (type) {
      case "Emploi":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Ville":
        return "bg-green-50 text-green-700 border-green-200";
      case "Département":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Région":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Statut":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-blue-800 shadow-lg shadow-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-200 rounded-lg">
                  <Users className="h-5 w-5 text-blue-800" />
                </div>
                <div>
                  <p className="text-sm text-blue-800">Total Employés</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-green-700 shadow-lg shadow-green-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Emplois</p>
                  <p className="text-2xl font-bold">{stats.emplois}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card className="bg-gray-100">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, email, CIN ou emploi..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant={showArchived ? "default" : "outline"}
                  onClick={() => {
                    setShowArchived(!showArchived);
                    setCurrentPage(1);
                  }}
                >
                  {showArchived ? "Voir Actifs" : "Voir Archivés"}
                </Button>
                <AddEmployeeModal />
              </div>
            </div>
            {syncStatus && (
              <div className="mt-2 p-2 text-sm text-center bg-green-100 text-green-800 rounded-md" role="alert">
                {syncStatus}
              </div>
            )}
            {filters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filters.map((filter) =>
                  filter.values.map((value) => (
                    <Badge
                      key={`${filter.type}-${value}`}
                      variant="secondary"
                      className={clsx("flex items-center gap-1", {
                        "bg-blue-50 text-blue-700 border-blue-200": filter.type === "Emploi",
                        "bg-green-50 text-green-700 border-green-200": filter.type === "Ville",
                        "bg-yellow-50 text-yellow-700 border-yellow-200": filter.type === "Département",
                        "bg-purple-50 text-purple-700 border-purple-200": filter.type === "Région",
                        "bg-red-50 text-red-700 border-red-200": filter.type === "Statut",
                      })}
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

        {/* Employees table */}
        <Card className="bg-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between text-blue-900">
              <CardTitle className="text-xl ">{showArchived ? "Employés Archivés" : "Liste des Employés"}</CardTitle>
              <Badge variant="secondary">{filteredEmployees.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Chargement...</p>
            ) : error ? (
              <p className="text-red-600">Erreur: {error.message}</p>
            ) : (
              <div className="rounded-md border">
                <Table className="bg-white">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4 text-blue-900 text-center">Nom Complet</TableHead>
                      <TableHead className="w-1/4 text-blue-900 text-center pr-12">Emploi</TableHead>
                      <TableHead className="w-1/4 text-blue-900 text-center pr-12">Email</TableHead>
                      <TableHead className="w-1/6 text-blue-900 text-center">Rôle</TableHead>
                      <TableHead className="w-1/6 text-blue-900 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentEmployees.map((employee: ExtendedEmployee) => (
                      <TableRow key={employee.id_employe} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-sm text-start">{employee.nom_complet || "-"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {(employee.emplois || []).map((emploi) => {
                              const isTooLong = emploi.nom_emploi?.length > 20 || false;
                              return (
                                <Badge
                                  key={emploi.id_emploi}
                                  variant="secondary"
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
                                    {emploi.nom_emploi || "-"}
                                  </span>
                                </Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{employee.email || "-"}</TableCell>
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
                                      <Eye className="h-4 w-4 text-green-600" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>{employee.nom_complet || "-"}</DialogTitle>
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
                                          <span className="font-medium text-gray-700">CIN:</span>
                                          <p className="text-gray-600">{employee.cin || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Ville:</span>
                                          <p className="text-gray-600">{employee.profile?.LIBELLE_LOC || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Région:</span>
                                          <p className="text-gray-600">{employee.profile?.LIBELLE_REGION || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Statut:</span>
                                          <p className="text-gray-600">{employee.profile?.STATUT || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Département:</span>
                                          <p className="text-gray-600">
                                            {(employee.emplois || []).map((e) => e.entite).join(", ") || "-"}
                                          </p>
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
                                          <p className="text-gray-600">{employee.profile?.ADRESSE || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Date de Recrutement:</span>
                                          <p className="text-gray-600">
                                            {employee.profile?.DAT_REC
                                              ? new Date(employee.profile.DAT_REC).toLocaleDateString("fr-FR")
                                              : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Date de Naissance:</span>
                                          <p className="text-gray-600">
                                            {employee.profile?.DATE_NAISS
                                              ? new Date(employee.profile.DATE_NAISS).toLocaleDateString("fr-FR")
                                              : "-"}
                                          </p>
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
                                        <div>
                                          <span className="font-medium text-gray-700">Détaché:</span>
                                          <p className="text-gray-600">{employee.profile?.DETACHE || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Sexe:</span>
                                          <p className="text-gray-600">{employee.profile?.SEXE || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Situation Familiale:</span>
                                          <p className="text-gray-600">{employee.profile?.SIT_F_AG || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Grade:</span>
                                          <p className="text-gray-600">{employee.profile?.LIBELLE_GRADE || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Grade Assimilé:</span>
                                          <p className="text-gray-600">{employee.profile?.GRADE_ASSIMILE || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Fonction:</span>
                                          <p className="text-gray-600">{employee.profile?.LIBELLE_FONCTION || "-"}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Date de Fonction:</span>
                                          <p className="text-gray-600">
                                            {employee.profile?.DAT_FCT
                                              ? new Date(employee.profile.DAT_FCT).toLocaleDateString("fr-FR")
                                              : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Créé le:</span>
                                          <p className="text-gray-600">
                                            {employee.created_at ? new Date(employee.created_at).toLocaleDateString("fr-FR") : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Mis à jour le:</span>
                                          <p className="text-gray-600">
                                            {employee.updated_at ? new Date(employee.updated_at).toLocaleDateString("fr-FR") : "-"}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Statut Employé:</span>
                                          <Badge variant={employee.archived ? "destructive" : "secondary"}>
                                            {employee.archived ? "Archivé" : "Actif"}
                                          </Badge>
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
                            {!employee.archived && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <EditEmployeeModal employee={employee} />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Modifier l'employé</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            {showArchived ? (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-green-600"
                                      onClick={() => handleUnarchive(employee)}
                                    >
                                      <ArchiveRestore className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Désarchiver l'employé</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DeleteEmployeeModal
                                      employeeId={employee.id_employe}
                                      employeeName={employee.nom_complet}
                                    />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Supprimer définitivement</p>
                                  </TooltipContent>
                                </Tooltip>
                              </>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-yellow-600"
                                    onClick={() => handleArchive(employee)}
                                  >
                                    <Archive className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Archiver l'employé</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
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

            {filteredEmployees.length === 0 && !isLoading && !error && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {showArchived ? "Aucun employé archivé trouvé" : "Aucun employé actif trouvé"}
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche ou d'ajouter un nouvel employé.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Archive Confirmation Dialog */}
        <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer l'archivage</DialogTitle>
            </DialogHeader>
            <p>Voulez-vous vraiment archiver l'employé {selectedEmployee?.nom_complet || "-"} ?</p>
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
            <p>Voulez-vous vraiment désarchiver l'employé {selectedEmployee?.nom_complet || "-"} ?</p>
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