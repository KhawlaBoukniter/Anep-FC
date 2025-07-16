"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip.tsx";
import { Plus, Edit, Trash, Users, Download, Archive, ArchiveRestore, Search, Eye, Filter, X } from "lucide-react";
import useApiAxios from "../config/axios.js";
import { AddCycleProgramModal } from "./AddCycleProgramModal.tsx";
import { EditCycleProgramModal } from "./EditCycleProgramModal.tsx";
import clsx from "clsx";

interface CycleProgram {
    id: number;
    title: string;
    type: "cycle" | "program";
    description: string;
    start_date: string;
    end_date: string;
    budget: number;
    archived: boolean;
    modules: { _id: string; title: string }[];
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

export const CycleProgramList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<Filter[]>([]);
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [modulesDialogOpen, setModulesDialogOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [newFilterType, setNewFilterType] = useState("");
    const [newFilterValues, setNewFilterValues] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [openPopover, setOpenPopover] = useState(false);
    const [selectedCycleProgram, setSelectedCycleProgram] = useState<CycleProgram | null>(null);
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const cycleProgramPerPage = 10;

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: cyclePrograms = [], isLoading, error } = useQuery(
        ["cycles-programs", { archived: filters.some(f => f.type === "Archivage" && f.values.includes("Archivés")), search: debouncedSearchTerm }],
        () => useApiAxios.get("/api/cycles-programs", { 
            params: { 
                archived: filters.some(f => f.type === "Archivage" && f.values.includes("Archivés")),
                search: debouncedSearchTerm 
            } 
        }).then((res) => res.data),
        {
            staleTime: 5 * 60 * 1000,
        }
    );

    const archiveCycleProgram = useMutation(
        (id: number) => useApiAxios.put(`/api/cycles-programs/${id}/archive`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["cycles-programs"]);
                setArchiveDialogOpen(false);
                setSelectedCycleProgram(null);
            },
        }
    );

    const unarchiveCycleProgram = useMutation(
        (id: number) => useApiAxios.put(`/api/cycles-programs/${id}/unarchive`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["cycles-programs"]);
                setUnarchiveDialogOpen(false);
                setSelectedCycleProgram(null);
            },
        }
    );

    const deleteCycleProgram = useMutation(
        (id: number) => useApiAxios.delete(`/api/cycles-programs/${id}`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["cycles-programs"]);
                setDeleteDialogOpen(false);
                setSelectedCycleProgram(null);
            },
        }
    );

    const handleArchive = (cycleProgram: CycleProgram) => {
        setSelectedCycleProgram(cycleProgram);
        setArchiveDialogOpen(true);
    };

    const confirmArchive = () => {
        if (selectedCycleProgram) {
            archiveCycleProgram.mutate(selectedCycleProgram.id);
        }
    };

    const handleUnarchive = (cycleProgram: CycleProgram) => {
        setSelectedCycleProgram(cycleProgram);
        setUnarchiveDialogOpen(true);
    };

    const confirmUnarchive = () => {
        if (selectedCycleProgram) {
            unarchiveCycleProgram.mutate(selectedCycleProgram.id);
        }
    };

    const handleDelete = (cycleProgram: CycleProgram) => {
        setSelectedCycleProgram(cycleProgram);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedCycleProgram) {
            deleteCycleProgram.mutate(selectedCycleProgram.id);
        }
    };

    const handleViewModules = (cycleProgram: CycleProgram) => {
        setSelectedCycleProgram(cycleProgram);
        setModulesDialogOpen(true);
    }

    const handleDownloadRegistrations = async (id: number) => {
        try {
            const response = await useApiAxios.get(`/api/cycles-programs/${id}/registrations/download`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "registrations.xlsx");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading registrations:", error);
        }
    };

    const filterOptions: FilterOption[] = useMemo(() => [
        { label: "Type", value: "Type", options: ["Cycle", "Programme"] },
        { label: "Archivage", value: "Archivage", options: ["Archivés", "Désarchivés"] },
    ], []);

    const availableOptions = filterOptions.find((opt) => opt.value === newFilterType)?.options || [];

    const filteredCyclePrograms = cyclePrograms.filter((cp: CycleProgram) => {
        const matchesFilters = filters.every((filter) => {
            if (filter.type === "Type") {
                return filter.values.some((val) => {
                    if (val === "Cycle") return cp.type === "cycle";
                    if (val === "Programme") return cp.type === "program";
                    return true;
                });
            }
            if (filter.type === "Archivage") {
                return filter.values.every((val) => {
                    if (val === "Archivés") return cp.archived === true;
                    if (val === "Désarchivés") return cp.archived === false;
                    return true;
                });
            }
            return true;
        });

        const matchesSearch = debouncedSearchTerm
            ? cp.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            cp.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            : true;

        return matchesFilters && matchesSearch;
    });

    const totalPages = Math.ceil(filteredCyclePrograms.length / cycleProgramPerPage);
    const indexOfLastCycleProgram = currentPage * cycleProgramPerPage;
    const indexOfFirstCycleProgram = indexOfLastCycleProgram - cycleProgramPerPage;
    const currentCyclePrograms = filteredCyclePrograms.slice(indexOfFirstCycleProgram, indexOfLastCycleProgram);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters]);

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

    const getFilterColor = (type: string) => {
        switch (type) {
            case "Type":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "Archivage":
                return "bg-gray-50 text-gray-700 border-gray-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                <Card className="bg-white shadow-lg rounded-xl border border-gray-200">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600" />
                                <Input
                                    placeholder="Rechercher par titre ou description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-12 rounded-xl border-blue-700 bg-gray-50"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="flex items-center gap-2 bg-white rounded-lg border-blue-700 hover:bg-gray-100 transition-all"
                                        >
                                            <Filter className="h-4 w-4" /> Ajouter Filtre
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md rounded-xl bg-white shadow-2xl border border-gray-200 animate-in fade-in duration-200">
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
                                                    className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 bg-white appearance-none"
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
                                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
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
                                                onClick={addFilter}
                                                disabled={!newFilterType || newFilterValues.length === 0}
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md transition-all"
                                            >
                                                Ajouter
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <AddCycleProgramModal onCycleProgramCreated={() => queryClient.invalidateQueries(["cyclePrograms"])} />
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
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl text-blue-900">
                                {filters.some(f => f.type === "Archivage" && f.values.includes("Archivés")) ? "Cycles et Programmes Archivés" : "Liste des Cycles et Programmes"}
                            </CardTitle>
                            <Badge variant="secondary">{filteredCyclePrograms.length} résultat(s)</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p>Chargement...</p>
                        ) : error ? (
                            <p className="text-red-600">Erreur: {(error as Error).message}</p>
                        ) : (
                            <>
                                <Table className="bg-white">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-blue-900 text-center">Titre</TableHead>
                                            <TableHead className="text-blue-900 text-center">Type</TableHead>
                                            <TableHead className="text-blue-900 text-center">Modules</TableHead>
                                            <TableHead className="text-blue-900 text-center">Période</TableHead>
                                            <TableHead className="text-blue-900 text-center">Budget</TableHead>
                                            <TableHead className="text-blue-900 text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {currentCyclePrograms.map((cp) => (
                                            <TableRow key={cp.id} className="hover:bg-gray-50">
                                                <TableCell className="text-center">{cp.title}</TableCell>
                                                <TableCell className="text-center">{cp.type === "cycle" ? "Cycle" : "Programme"}</TableCell>
                                                <TableCell className="text-center">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleViewModules(cp)}
                                                                    >
                                                                        <Eye className="h-4 w-4 text-green-600" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                                                                    <DialogHeader>
                                                                        <DialogTitle>Modules de {cp.title}</DialogTitle>
                                                                    </DialogHeader>
                                                                    <div className="my-6">
                                                                            {selectedCycleProgram ? (
                                                                                selectedCycleProgram.modules.length > 0 ? (
                                                                                    <ul className="list-disc pl-5 text-gray-600">
                                                                                        {selectedCycleProgram.modules.map((module) => (
                                                                                            <li key={module._id}>{module.title}</li>
                                                                                        ))}
                                                                                    </ul>
                                                                                ) : (
                                                                                    <p className="text-gray-600">Aucun module associé.</p>
                                                                                )
                                                                            ) : (
                                                                                <p className="text-gray-600">Aucun programme sélectionné.</p>
                                                                            )}
                                                                        </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Voir les modules</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell className="text-center">{`${new Date(cp.start_date).toLocaleDateString()} - ${new Date(cp.end_date).toLocaleDateString()}`}</TableCell>
                                                <TableCell className="text-center">{cp.budget}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-1 justify-center">
                                                        {cp.archived ? (
                                                            <>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-red-600"
                                                                            onClick={() => handleDelete(cp)}
                                                                        >
                                                                            <Trash className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Supprimer le cycle/programme</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            onClick={() => handleUnarchive(cp)}
                                                                        >
                                                                            <ArchiveRestore className="h-4 w-4 text-green-600" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Désarchiver</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <EditCycleProgramModal
                                                                            cycleProgram={cp}
                                                                            onCycleProgramUpdated={() => queryClient.invalidateQueries(["cyclePrograms"])}
                                                                        />
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
                                                                            onClick={() => handleDownloadRegistrations(cp.id)}
                                                                        >
                                                                            <Download className="h-4 w-4 text-blue-600" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Télécharger les inscriptions</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8"
                                                                            onClick={() => handleArchive(cp)}
                                                                        >
                                                                            <Archive className="h-4 w-4 text-yellow-600" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Archiver</p>
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
                                
                                {totalPages > 1 && (
                                    <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="text-sm text-gray-600 text-center md:text-left">
                                            Affichage de {indexOfFirstCycleProgram + 1} à{" "}
                                            {Math.min(indexOfLastCycleProgram, filteredCyclePrograms.length)} sur {filteredCyclePrograms.length} cycles/programmes
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="bg-blue-600 text-white"
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
                                                className="bg-blue-600 text-white"
                                            >
                                                Suivant
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {filteredCyclePrograms.length === 0 && !isLoading && (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            {filters.some(f => f.type === "Archivage" && f.values.includes("Archivés")) ? "Aucun cycle/programme archivé trouvé" : "Aucun cycle/programme actif trouvé"}
                                        </h3>
                                        <p className="text-gray-600">
                                            Essayez de modifier vos critères de recherche ou d'ajouter un nouveau cycle/programme.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmer l'archivage</DialogTitle>
                        </DialogHeader>
                        <p>Voulez-vous vraiment archiver {selectedCycleProgram?.title} ?</p>
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

                <Dialog open={unarchiveDialogOpen} onOpenChange={setUnarchiveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmer le désarchivage</DialogTitle>
                        </DialogHeader>
                        <p>Voulez-vous vraiment désarchiver {selectedCycleProgram?.title} ?</p>
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

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Confirmer la suppression</DialogTitle>
                        </DialogHeader>
                        <p>Voulez-vous vraiment supprimer {selectedCycleProgram?.title} ? Cette action est irréversible.</p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Annuler
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Supprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </TooltipProvider>
    );
};

