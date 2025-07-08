"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip.tsx";
import { Plus, Edit, Trash, Users, Download, Archive, ArchiveRestore, Search } from "lucide-react";
import useApiAxios from "../config/axios.js";
import { AddCycleProgramModal } from "./AddCycleProgramModal.tsx";
import { EditCycleProgramModal } from "./EditCycleProgramModal.tsx";

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

export const CycleProgramList = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [unarchiveDialogOpen, setUnarchiveDialogOpen] = useState(false);
    const [selectedCycleProgram, setSelectedCycleProgram] = useState<CycleProgram | null>(null);
    const queryClient = useQueryClient();

    const { data: cyclePrograms = [], isLoading, error } = useQuery(
        ["cycles-programs", { archived: false }],
        () => useApiAxios.get("/api/cycles-programs", { params: { archived: false } }).then((res) => res.data),
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
        (id: number) => useApiAxios.put(`/cycles-programs/${id}/unarchive`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(["cycles-programs"]);
                setUnarchiveDialogOpen(false);
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

    const handleDownloadRegistrations = async (id: number) => {
        try {
            const response = await useApiAxios.get(`/cycles-programs/${id}/registrations/download`, {
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

    const filteredCyclePrograms = cyclePrograms.filter(
        (cp) =>
            cp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cp.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                            <AddCycleProgramModal onCycleProgramCreated={() => queryClient.invalidateQueries(["cyclePrograms"])} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gray-100">
                    <CardHeader>
                        <CardTitle className="text-xl text-blue-900">
                            Liste des Cycles et Programmes
                        </CardTitle>
                        <Badge variant="secondary">{filteredCyclePrograms.length} résultat(s)</Badge>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p>Chargement...</p>
                        ) : error ? (
                            <p className="text-red-600">Erreur: {(error as Error).message}</p>
                        ) : (
                            <Table className="bg-white">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-blue-900 text-center">Titre</TableHead>
                                        <TableHead className="text-blue-900 text-center">Type</TableHead>
                                        <TableHead className="text-blue-900 text-center">Modules</TableHead>
                                        <TableHead className="text-blue-900 text-center">Période</TableHead>
                                        <TableHead className="text-blue-900 text-center">Budget</TableHead>
                                        <TableHead className="text-blue-900 text-center">Archivé</TableHead>
                                        <TableHead className="text-blue-900 text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCyclePrograms.map((cp) => (
                                        <TableRow key={cp.id} className="hover:bg-gray-50">
                                            <TableCell className="text-center">{cp.title}</TableCell>
                                            <TableCell className="text-center">{cp.type === "cycle" ? "Cycle" : "Programme"}</TableCell>
                                            <TableCell className="text-center">{cp.modules.map(m => m.title).join(", ")}</TableCell>
                                            <TableCell className="text-center">{`${new Date(cp.start_date).toLocaleDateString()} - ${new Date(cp.end_date).toLocaleDateString()}`}</TableCell>
                                            <TableCell className="text-center">{cp.budget}</TableCell>
                                            <TableCell className="text-center">{cp.archived ? "Oui" : "Non"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex gap-1 justify-center">
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
                                                                onClick={() => cp.archived ? handleUnarchive(cp) : handleArchive(cp)}
                                                            >
                                                                {cp.archived ? (
                                                                    <ArchiveRestore className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <Archive className="h-4 w-4 text-yellow-600" />
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{cp.archived ? "Désarchiver" : "Archiver"}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
            </div>
        </TooltipProvider>
    );
};

