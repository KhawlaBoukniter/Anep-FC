"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select as RadixSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import useApiAxios from "../config/axios";
import { useToast } from "../hooks/use-toast.ts";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Edit } from "lucide-react";
import Select from "react-select";
import "./styles/react-select.css";

interface CycleProgram {
    id: number;
    title: string;
    type: "cycle" | "program";
    program_type?: "mardi_du_partage" | "bati_pro" | "other";
    description: string;
    start_date: string;
    end_date: string;
    budget: number;
    entity: string;
    training_sheet_url: string | null;
    support_url: string | null;
    photos_url: string[];
    evaluation_url: string | null;
    facilitator: string;
    attendance_list_url: string | null;
    module_ids: string[];
}

interface EditCycleProgramModalProps {
    cycleProgram: CycleProgram;
    onCycleProgramUpdated: () => void;
}

export function EditCycleProgramModal({ cycleProgram, onCycleProgramUpdated }: EditCycleProgramModalProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const formatDateForInput = (isoDate: string): string => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    console.log("cycleProgram.start_date:", cycleProgram.start_date);
    const [formData, setFormData] = useState<CycleProgram>({
        id: cycleProgram.id,
        title: cycleProgram.title,
        type: cycleProgram.type,
        program_type: cycleProgram.program_type || "other",
        description: cycleProgram.description,
        start_date: formatDateForInput(cycleProgram.start_date) || new Date().toISOString().slice(0, 16).replace("Z", ""),
        end_date: formatDateForInput(cycleProgram.end_date) || new Date().toISOString().slice(0, 16).replace("Z", ""),
        budget: cycleProgram.budget ?? 0,
        entity: cycleProgram.entity || "",
        training_sheet_url: cycleProgram.training_sheet_url || "",
        support_url: cycleProgram.support_url || "",
        photos_url: cycleProgram.photos_url || [],
        evaluation_url: cycleProgram.evaluation_url || "",
        facilitator: cycleProgram.facilitator || "",
        attendance_list_url: cycleProgram.attendance_list_url || "",
        module_ids: cycleProgram.modules ? cycleProgram.modules.map(module => module._id) : [],
    });
    const [trainingSheetFile, setTrainingSheetFile] = useState<File | null>(null);
    const [supportFile, setSupportFile] = useState<File | null>(null);
    const [evaluationFile, setEvaluationFile] = useState<File | null>(null);
    const [attendanceListFile, setAttendanceListFile] = useState<File | null>(null);
    const [photosFiles, setPhotosFiles] = useState<File[]>([]);

    const { data: modules = [] } = useQuery("modules", () =>
        useApiAxios.get("/courses").then((res) => res.data)
    );

    const updateCycleProgram = useMutation(
        (formData: FormData) => useApiAxios.put(`/api/cycles-programs/${cycleProgram.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
        {
            onSuccess: () => {
                toast({ title: "Succès", description: "Cycle/Programme mis à jour avec succès." });
                setOpen(false);
                queryClient.invalidateQueries(["cycles-programs", {archived: false}])
                onCycleProgramUpdated();
            },
            onError: (error) => {
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: error.response?.data?.message || "Échec de la mise à jour.",
                });
            },
        }
    );

    const handleInputChange = (field: keyof CycleProgram, value: any) => {
        if (field === "start_date" || field === "end_date") {
            if (value === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
                setFormData((prev) => ({...prev, [field]: value}))
            }
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
        
    };

    const handleFileChange = (field: string, files: FileList | null) => {
        if (field === "photos") {
            setPhotosFiles(files ? Array.from(files) : []);
        } else if (field === "training_sheet") {
            setTrainingSheetFile(files ? files[0] : null);
        } else if (field === "support") {
            setSupportFile(files ? files[0] : null);
        } else if (field === "evaluation") {
            setEvaluationFile(files ? files[0] : null);
        } else if (field === "attendance_list") {
            setAttendanceListFile(files ? files[0] : null);
        }
    };

    const handleModuleChange = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map((option) => option.value) : [];
        handleInputChange("module_ids", selectedIds);
    };

    const moduleOptions = modules.map((module) => ({
        value: module._id,
        label: module.title,
    }));

    // Update the handleSubmit function
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        formDataToSend.append("title", formData.title || "");
        formDataToSend.append("type", formData.type);
        if (formData.type === "program") {
            formDataToSend.append("program_type", formData.program_type || "other");
            if (formData.program_type === "bati_pro" || formData.program_type === "other") {
                formDataToSend.append("entity", formData.entity);
                if (trainingSheetFile) {
                    formDataToSend.append("training_sheet", trainingSheetFile);
                } else if (formData.training_sheet_url) {
                    formDataToSend.append("training_sheet_url", formData.training_sheet_url);
                }
            }
            if (supportFile) {
                formDataToSend.append("support", supportFile);
            } else if (formData.support_url) {
                formDataToSend.append("support_url", formData.support_url);
            }
            photosFiles.forEach((photo) => formDataToSend.append("photos", photo));
            if (evaluationFile) {
                formDataToSend.append("evaluation", evaluationFile);
            } else if (formData.evaluation_url) {
                formDataToSend.append("evaluation_url", formData.evaluation_url);
            }
            if (formData.program_type === "mardi_du_partage" || formData.program_type === "other") {
                formDataToSend.append("facilitator", formData.facilitator);
                if (attendanceListFile) {
                    formDataToSend.append("attendance_list", attendanceListFile);
                } else if (formData.attendance_list_url) {
                    formDataToSend.append("attendance_list_url", formData.attendance_list_url);
                }
            }
        } else {
            if (supportFile) {
                formDataToSend.append("support", supportFile);
            } else if (formData.support_url) {
                formDataToSend.append("support_url", formData.support_url);
            }
            if (evaluationFile) {
                formDataToSend.append("evaluation", evaluationFile);
            } else if (formData.evaluation_url) {
                formDataToSend.append("evaluation_url", formData.evaluation_url);
            }
            if (attendanceListFile) {
                formDataToSend.append("attendance_list", attendanceListFile);
            } else if (formData.attendance_list_url) {
                formDataToSend.append("attendance_list_url", formData.attendance_list_url);
            }
        }
        formDataToSend.append("description", formData.description || "");
        
        const startDateStr = formData.start_date || "";
        const endDateStr = formData.end_date || "";
        console.log("formData.start_date:", formData.start_date);
        const startDate = startDateStr ? new Date(startDateStr) : null;
        const endDate = endDateStr ? new Date(endDateStr) : null;

        if (!startDateStr || isNaN(startDate.getTime())) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "La date de début est invalide.",
            });
            return;
        }
        if (!endDateStr || isNaN(endDate.getTime())) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "La date de fin est invalide.",
            });
            return;
        }

        formDataToSend.append("start_date", startDate.toISOString());
        formDataToSend.append("end_date", endDate.toISOString());
        
        // Append budget with fallback
        console.log("formData.budget:", formData.budget);
        formDataToSend.append("budget", (formData.budget ?? 0).toString());
        formDataToSend.append("module_ids", JSON.stringify(formData.module_ids));

        updateCycleProgram.mutate(formDataToSend);
        onCycleProgramUpdated();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Modifier Cycle/Programme</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleInputChange("title", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <RadixSelect
                            value={formData.type}
                            onValueChange={(value: "cycle" | "program") => handleInputChange("type", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cycle">Cycle</SelectItem>
                                <SelectItem value="program">Programme</SelectItem>
                            </SelectContent>
                        </RadixSelect>
                    </div>
                    {formData.type === "program" && (
                        <div className="space-y-2">
                            <Label htmlFor="program_type">Type de Programme</Label>
                            <RadixSelect
                                value={formData.program_type}
                                onValueChange={(value: "mardi_du_partage" | "bati_pro" | "other") =>
                                    handleInputChange("program_type", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner le type de programme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mardi_du_partage">Mardi du Partage</SelectItem>
                                    <SelectItem value="bati_pro">Bati Pro</SelectItem>
                                    <SelectItem value="other">Autre Programme</SelectItem>
                                </SelectContent>
                            </RadixSelect>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <ReactQuill
                            theme="snow"
                            value={formData.description}
                            onChange={(content) => handleInputChange("description", content)}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="start_date">Date de début</Label>
                        <Input
                            type="datetime-local"
                            value={formData.start_date || ""}
                            onChange={(e) => handleInputChange("start_date", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_date">Date de fin</Label>
                        <Input
                            type="datetime-local"
                            value={formData.end_date || ""}
                            onChange={(e) => handleInputChange("end_date", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                            type="number"
                            value={formData.budget ?? ""}
                            onChange={(e) => handleInputChange("budget", e.target.value === "" ? 0 : Number(e.target.value))}
                            required
                        />
                    </div>
                    {formData.type === "program" && (formData.program_type === "bati_pro" || formData.program_type === "other") && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="entity">Entité</Label>
                                <Input
                                    id="entity"
                                    value={formData.entity}
                                    onChange={(e) => handleInputChange("entity", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="training_sheet_url">Fiche de formation (URL ou fichier)</Label>
                                <Input
                                    id="training_sheet_url"
                                    type="url"
                                    value={formData.training_sheet_url}
                                    onChange={(e) => handleInputChange("training_sheet_url", e.target.value)}
                                    placeholder="Entrez une URL ou sélectionnez un fichier"
                                />
                                <Input
                                    type="file"
                                    id="training_sheet"
                                    onChange={(e) => handleFileChange("training_sheet", e.target.files)}
                                    accept=".pdf,.doc,.docx"
                                />
                                {formData.training_sheet_url && !trainingSheetFile && (
                                    <a href={formData.training_sheet_url} target="_blank" rel="noopener noreferrer">
                                        Voir la fiche actuelle
                                    </a>
                                )}
                            </div>
                        </>
                    )}
                    {(formData.type === "cycle" || formData.type === "program") && (
                        <div className="space-y-2">
                            <Label htmlFor="support_url">Support (URL ou fichier)</Label>
                            <Input
                                id="support_url"
                                type="url"
                                value={formData.support_url}
                                onChange={(e) => handleInputChange("support_url", e.target.value)}
                                placeholder="Entrez une URL ou sélectionnez un fichier"
                            />
                            <Input
                                type="file"
                                id="support"
                                onChange={(e) => handleFileChange("support", e.target.files)}
                                accept=".pdf,.doc,.docx"
                            />
                            {formData.support_url && !supportFile && (
                                <a href={formData.support_url} target="_blank" rel="noopener noreferrer">
                                    Voir le support actuel
                                </a>
                            )}
                        </div>
                    )}
                    {formData.type === "program" && (
                        <div className="space-y-2">
                            <Label htmlFor="photos">Photos</Label>
                            <Input
                                type="file"
                                id="photos"
                                multiple
                                onChange={(e) => handleFileChange("photos", e.target.files)}
                                accept="image/*"
                            />
                            {formData.photos_url.length > 0 && (
                                <div className="flex gap-2">
                                    {formData.photos_url.map((url, index) => (
                                        <img
                                            key={index}
                                            src={url}
                                            alt={`Photo ${index + 1}`}
                                            className="w-24 h-24 object-cover"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {(formData.type === "cycle" || formData.type === "program") && (
                        <div className="space-y-2">
                            <Label htmlFor="evaluation_url">Évaluation (URL ou fichier)</Label>
                            <Input
                                id="evaluation_url"
                                type="url"
                                value={formData.evaluation_url}
                                onChange={(e) => handleInputChange("evaluation_url", e.target.value)}
                                placeholder="Entrez une URL ou sélectionnez un fichier"
                            />
                            <Input
                                type="file"
                                id="evaluation"
                                onChange={(e) => handleFileChange("evaluation", e.target.files)}
                                accept=".pdf,.doc,.docx"
                            />
                            {formData.evaluation_url && !evaluationFile && (
                                <a href={formData.evaluation_url} target="_blank" rel="noopener noreferrer">
                                    Voir l'évaluation actuelle
                                </a>
                            )}
                        </div>
                    )}
                    {(formData.type === "cycle" || (formData.type === "program" && (formData.program_type === "mardi_du_partage" || formData.program_type === "other"))) && (
                        <div className="space-y-2">
                            <Label htmlFor="attendance_list_url">Liste de présence (URL ou fichier)</Label>
                            <Input
                                id="attendance_list_url"
                                type="url"
                                value={formData.attendance_list_url}
                                onChange={(e) => handleInputChange("attendance_list_url", e.target.value)}
                                placeholder="Entrez une URL ou sélectionnez un fichier"
                            />
                            <Input
                                type="file"
                                id="attendance_list"
                                onChange={(e) => handleFileChange("attendance_list", e.target.files)}
                                accept=".pdf,.doc,.docx"
                            />
                            {formData.attendance_list_url && !attendanceListFile && (
                                <a href={formData.attendance_list_url} target="_blank" rel="noopener noreferrer">
                                    Voir la liste actuelle
                                </a>
                            )}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="module_ids">Modules</Label>
                        <Select
                            isMulti
                            options={moduleOptions}
                            value={moduleOptions.filter((option) => formData.module_ids.includes(option.value))}
                            onChange={handleModuleChange}
                            placeholder="Sélectionner les modules"
                            className="basic-multi-select"
                            classNamePrefix="select"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-xl border-gray-300"
                        >
                            Annuler
                        </Button>
                        <Button type="submit" className="bg-blue-600 text-white rounded-xl">
                            Sauvegarder
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditCycleProgramModal;