"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "react-query";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import useApiAxios from "../config/axios";
import { useToast } from "../hooks/use-toast.ts";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";

interface CycleProgram {
    title: string;
    type: "cycle" | "program";
    description: string;
    start_date: string;
    end_date: string;
    budget: number;
    entity: string;
    training_sheet: File | null;
    training_sheet_url: string;
    support: File | null;
    support_url: string;
    photos: File[];
    evaluation: File | null;
    evaluation_url: string;
    facilitator: string;
    attendance_list: File | null;
    attendance_list_url: string;
    trainer_name: string;
    module_ids: string[];
}

export function AddCycleProgramModal({ onCycleProgramCreated }) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [cycleProgram, setCycleProgram] = useState<CycleProgram>({
        title: "",
        type: "cycle",
        description: "",
        start_date: "",
        end_date: "",
        budget: 0,
        entity: "",
        training_sheet: null,
        training_sheet_url: "",
        support: null,
        support_url: "",
        photos: [],
        evaluation: null,
        evaluation_url: "",
        facilitator: "",
        attendance_list: null,
        attendance_list_url: "",
        trainer_name: "",
        module_ids: [],
    });
    const [isMardiDuPartage, setIsMardiDuPartage] = useState(false);

    const { data: modules = [] } = useQuery("modules", () =>
        useApiAxios.get("/courses").then((res) => res.data)
    );

    const createCycleProgram = useMutation(
        (formData: FormData) => useApiAxios.post("/cycles-programs", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }),
        {
            onSuccess: () => {
                toast({ title: "Succès", description: "Cycle/Programme créé avec succès." });
                setOpen(false);
                setCycleProgram({
                    title: "",
                    type: "cycle",
                    description: "",
                    start_date: "",
                    end_date: "",
                    budget: 0,
                    entity: "",
                    training_sheet: null,
                    training_sheet_url: "",
                    support: null,
                    support_url: "",
                    photos: [],
                    evaluation: null,
                    evaluation_url: "",
                    facilitator: "",
                    attendance_list: null,
                    attendance_list_url: "",
                    trainer_name: "",
                    module_ids: [],
                });
                setIsMardiDuPartage(false);
                onCycleProgramCreated();
            },
            onError: (error) => {
                toast({
                    variant: "destructive",
                    title: "Erreur",
                    description: error.response?.data?.message || "Échec de la création.",
                });
            },
        }
    );

    const handleInputChange = (field: keyof CycleProgram, value: any) => {
        setCycleProgram((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (field: keyof CycleProgram, files: FileList | null) => {
        if (field === "photos") {
            setCycleProgram((prev) => ({ ...prev, photos: files ? Array.from(files) : [] }));
        } else {
            setCycleProgram((prev) => ({ ...prev, [field]: files ? files[0] : null }));
        }
    };

    const handleModuleChange = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
        handleInputChange("module_ids", selectedIds);
    };

    const moduleOptions = modules.map(module => ({
        value: module._id,
        label: module.title,
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("title", cycleProgram.title);
        formData.append("type", cycleProgram.type);
        formData.append("description", cycleProgram.description);
        formData.append("start_date", cycleProgram.start_date);
        formData.append("end_date", cycleProgram.end_date);
        formData.append("budget", cycleProgram.budget.toString());
        if (cycleProgram.type === "program") {
            formData.append("entity", cycleProgram.entity);
            if (cycleProgram.training_sheet) {
                formData.append("training_sheet", cycleProgram.training_sheet);
            } else if (cycleProgram.training_sheet_url) {
                formData.append("training_sheet_url", cycleProgram.training_sheet_url);
            }
            if (cycleProgram.support) {
                formData.append("support", cycleProgram.support);
            } else if (cycleProgram.support_url) {
                formData.append("support_url", cycleProgram.support_url);
            }
            cycleProgram.photos.forEach((photo) => formData.append("photos", photo));
            if (cycleProgram.evaluation) {
                formData.append("evaluation", cycleProgram.evaluation);
            } else if (cycleProgram.evaluation_url) {
                formData.append("evaluation_url", cycleProgram.evaluation_url);
            }
            if (isMardiDuPartage) {
                formData.append("facilitator", cycleProgram.facilitator);
                if (cycleProgram.attendance_list) {
                    formData.append("attendance_list", cycleProgram.attendance_list);
                } else if (cycleProgram.attendance_list_url) {
                    formData.append("attendance_list_url", cycleProgram.attendance_list_url);
                }
            }
        } else {
            formData.append("trainer_name", cycleProgram.trainer_name);
            if (cycleProgram.evaluation) {
                formData.append("evaluation", cycleProgram.evaluation);
            } else if (cycleProgram.evaluation_url) {
                formData.append("evaluation_url", cycleProgram.evaluation_url);
            }
            if (cycleProgram.attendance_list) {
                formData.append("attendance_list", cycleProgram.attendance_list);
            } else if (cycleProgram.attendance_list_url) {
                formData.append("attendance_list_url", cycleProgram.attendance_list_url);
            }
        }
        formData.append("module_ids", JSON.stringify(cycleProgram.module_ids));

        createCycleProgram.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-gray-50 rounded-xl border-blue-700">
                    <Plus className="h-5 w-5" /> Créer Cycle/Programme
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Créer un Cycle ou Programme</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input
                            id="title"
                            value={cycleProgram.title}
                            onChange={(e) => {
                                handleInputChange("title", e.target.value);
                                setIsMardiDuPartage(e.target.value.toLowerCase().includes("mardi du partage"));
                            }}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={cycleProgram.type}
                            onValueChange={(value) => {
                                handleInputChange("type", value);
                                setIsMardiDuPartage(value === "program" && cycleProgram.title.toLowerCase().includes("mardi du partage"));
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cycle">Cycle</SelectItem>
                                <SelectItem value="program">Programme</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <ReactQuill
                            theme="snow"
                            value={cycleProgram.description}
                            onChange={(content) => handleInputChange("description", content)}
                            className="bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="start_date">Date de début</Label>
                        <Input
                            type="datetime-local"
                            value={cycleProgram.start_date}
                            onChange={(e) => handleInputChange("start_date", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="end_date">Date de fin</Label>
                        <Input
                            type="datetime-local"
                            value={cycleProgram.end_date}
                            onChange={(e) => handleInputChange("end_date", e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                            type="number"
                            value={cycleProgram.budget}
                            onChange={(e) => handleInputChange("budget", Number(e.target.value))}
                            required
                        />
                    </div>
                    {cycleProgram.type === "program" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="entity">Entité</Label>
                                <Input
                                    id="entity"
                                    value={cycleProgram.entity}
                                    onChange={(e) => handleInputChange("entity", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="training_sheet_url">Fiche de formation (URL ou fichier)</Label>
                                <Input
                                    id="training_sheet_url"
                                    type="url"
                                    value={cycleProgram.training_sheet_url}
                                    onChange={(e) => handleInputChange("training_sheet_url", e.target.value)}
                                    placeholder="Entrez une URL ou sélectionnez un fichier"
                                />
                                <Input
                                    type="file"
                                    id="training_sheet"
                                    onChange={(e) => handleFileChange("training_sheet", e.target.files)}
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="support_url">Support (URL ou fichier)</Label>
                                <Input
                                    id="support_url"
                                    type="url"
                                    value={cycleProgram.support_url}
                                    onChange={(e) => handleInputChange("support_url", e.target.value)}
                                    placeholder="Entrez une URL ou sélectionnez un fichier"
                                />
                                <Input
                                    type="file"
                                    id="support"
                                    onChange={(e) => handleFileChange("support", e.target.files)}
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="photos">Photos</Label>
                                <Input
                                    type="file"
                                    id="photos"
                                    multiple
                                    onChange={(e) => handleFileChange("photos", e.target.files)}
                                    accept="image/*"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="evaluation_url">Évaluation (URL ou fichier)</Label>
                                <Input
                                    id="evaluation_url"
                                    type="url"
                                    value={cycleProgram.evaluation_url}
                                    onChange={(e) => handleInputChange("evaluation_url", e.target.value)}
                                    placeholder="Entrez une URL ou sélectionnez un fichier"
                                />
                                <Input
                                    type="file"
                                    id="evaluation"
                                    onChange={(e) => handleFileChange("evaluation", e.target.files)}
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                            {isMardiDuPartage && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="facilitator">Animateur</Label>
                                        <Input
                                            id="facilitator"
                                            value={cycleProgram.facilitator}
                                            onChange={(e) => handleInputChange("facilitator", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="attendance_list_url">Liste de présence (URL ou fichier)</Label>
                                        <Input
                                            id="attendance_list_url"
                                            type="url"
                                            value={cycleProgram.attendance_list_url}
                                            onChange={(e) => handleInputChange("attendance_list_url", e.target.value)}
                                            placeholder="Entrez une URL ou sélectionnez un fichier"
                                        />
                                        <Input
                                            type="file"
                                            id="attendance_list"
                                            onChange={(e) => handleFileChange("attendance_list", e.target.files)}
                                            accept=".pdf,.doc,.docx"
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                    {cycleProgram.type === "cycle" && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="trainer_name">Nom du formateur</Label>
                                <Input
                                    id="trainer_name"
                                    value={cycleProgram.trainer_name}
                                    onChange={(e) => handleInputChange("trainer_name", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="evaluation_url">Évaluation (URL ou fichier)</Label>
                                <Input
                                    id="evaluation_url"
                                    type="url"
                                    value={cycleProgram.evaluation_url}
                                    onChange={(e) => handleInputChange("evaluation_url", e.target.value)}
                                    placeholder="Entrez une URL ou sélectionnez un fichier"
                                />
                                <Input
                                    type="file"
                                    id="evaluation"
                                    onChange={(e) => handleFileChange("evaluation", e.target.files)}
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="attendance_list_url">Liste de présence (URL ou fichier)</Label>
                                <Input
                                    id="attendance_list_url"
                                    type="url"
                                    value={cycleProgram.attendance_list_url}
                                    onChange={(e) => handleInputChange("attendance_list_url", e.target.value)}
                                    placeholder="Entrez une URL ou sélectionnez un fichier"
                                />
                                <Input
                                    type="file"
                                    id="attendance_list"
                                    onChange={(e) => handleFileChange("attendance_list", e.target.files)}
                                    accept=".pdf,.doc,.docx"
                                />
                            </div>
                        </>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="module_ids">Modules</Label>
                        <Select
                            isMulti
                            options={moduleOptions}
                            value={moduleOptions.filter(option => cycleProgram.module_ids.includes(option.value))}
                            onChange={handleModuleChange}
                            placeholder="Sélectionner les modules"
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
                            Créer
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddCycleProgramModal;