"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Button } from "./ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { Badge } from "./ui/badge.tsx";
import { ChevronLeft, ChevronRight, Edit, Briefcase, X } from "lucide-react";
import { Popover, PopoverTrigger } from "./ui/popover.tsx";
import { useJob, useUpdateJob } from "../hooks/useJobs";
import { Job, Competence } from "../types/job.ts";

interface EditJobModalProps {
  jobId: string;
}

export function EditJobModal({ jobId }: EditJobModalProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Job>>({});
  const [requiredCompetences, setRequiredCompetences] = useState<Competence[]>([]);
  const [newCompetence, setNewCompetence] = useState("");
  const [openCompetencePopover, setOpenCompetencePopover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch job data dynamically
  const { data: job, isLoading, isError, error } = useJob(jobId);

  // Mutation to update job
  const { mutate: updateJob, isLoading: isUpdating } = useUpdateJob();

  useEffect(() => {
    if (job && open) {
      setFormData({
        id_emploi: job.id_emploi,
        nom_emploi: job.nom_emploi,
        entite: job.entite,
        formation: job.formation,
        experience: job.experience,
        codeemploi: job.codeemploi,
        poidsemploi: job.poidsemploi,
      });
      setRequiredCompetences(job.required_skills || []);
    }
  }, [job, open]);

  const handleInputChange = (field: keyof Job, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompetenceLevelChange = (competenceId: string, level: number) => {
    setRequiredCompetences((prev) =>
      prev.map((competence) => 
        competence.id_competencer === competenceId ? { ...competence, niveaur: level } : competence
      )
    );
  };

  const addCompetence = (competenceName: string) => {
    if (requiredCompetences.some((c) => c.competencer.toLowerCase() === competenceName.toLowerCase())) {
      return;
    }
    const newCompetenceItem: Competence = {
      id_competencer: Date.now().toString(), // Temporary ID
      code_competencer: "", // Will be set by backend
      competencer: competenceName,
      niveaur: 1,
    };
    setRequiredCompetences((prev) => [...prev, newCompetenceItem]);
    setNewCompetence("");
    setOpenCompetencePopover(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newCompetence.trim()) {
      e.preventDefault();
      addCompetence(newCompetence.trim());
    }
  };

  const removeCompetence = (competenceId: string) => {
    setRequiredCompetences((prev) => prev.filter((c) => c.id_competencer !== competenceId));
  };

  const handleSubmit = () => {
    if (!jobId || !formData) return;

    const updatedJobData = {
      ...formData,
      required_skills: requiredCompetences,
    };

    updateJob({ id: jobId, data: updatedJobData }, {
      onSuccess: () => {
        alert("Emploi modifié avec succès!");
        setCurrentStep(1);
        setOpen(false);
      },
      onError: (error) => {
        console.error("Erreur lors de la mise à jour:", error);
        alert("Erreur lors de la mise à jour de l'emploi.");
      },
    });
  };

  const handleClose = () => {
    setCurrentStep(1);
    if (job) {
      setFormData({
        id_emploi: job.id_emploi,
        nom_emploi: job.nom_emploi,
        entite: job.entite,
        formation: job.formation,
        experience: job.experience,
        codeemploi: job.codeemploi,
        poidsemploi: job.poidsemploi,
      });
      setRequiredCompetences(job.required_skills || []);
    }
    setOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message || "An unknown error occurred"}</div>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Briefcase className="h-6 w-6 text-green-600" />
            <DialogTitle className="text-xl">Modifier l'Emploi</DialogTitle>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 1 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Données Emploi</span>
            <span>Compétences Requises</span>
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom_emploi">Nom Emploi</Label>
                <Input
                  id="nom_emploi"
                  placeholder="Entrez le nom de l'emploi"
                  value={formData.nom_emploi || ""}
                  onChange={(e) => handleInputChange("nom_emploi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entite">Entité</Label>
                <Input
                  id="entite"
                  placeholder="Entrez le nom de l'entité"
                  value={formData.entite || ""}
                  onChange={(e) => handleInputChange("entite", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formation">Formation</Label>
                <Input
                  id="formation"
                  placeholder="Entrer la formation"
                  value={formData.formation || ""}
                  onChange={(e) => handleInputChange("formation", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Input
                  id="experience"
                  type="number"
                  min={0}
                  max={60}
                  placeholder="Entrer les années d'expériences"
                  value={formData.experience || ""}
                  onChange={(e) => handleInputChange("experience", parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codeEmploi">Code Emploi</Label>
                <Input
                  id="codeEmploi"
                  placeholder="Entrer le code d'emploi"
                  value={formData.codeemploi || ""}
                  onChange={(e) => handleInputChange("codeemploi", e.target.value)}
                />
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Compétences & Niveaux</h3>
                <p className="text-sm text-gray-600">
                  Modifiez les compétences requises pour cet emploi et indiquez le niveau de maîtrise pour chacune (1 =
                  Débutant, 4 = Expert).
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Popover open={openCompetencePopover} onOpenChange={setOpenCompetencePopover}>
                    <PopoverTrigger asChild>
                      <div className="flex-1 relative">
                        <Input
                          ref={inputRef}
                          placeholder="Saisissez une compétence..."
                          value={newCompetence}
                          onChange={(e) => setNewCompetence(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={() => setOpenCompetencePopover(true)}
                        />
                      </div>
                    </PopoverTrigger>
                  </Popover>
                  <Button
                    type="button"
                    onClick={() => newCompetence.trim() && addCompetence(newCompetence.trim())}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isUpdating}
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {requiredCompetences.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune compétence ajoutée. Utilisez le champ ci-dessus pour ajouter des compétences.
                    </div>
                  ) : (
                    requiredCompetences.map((competence) => (
                      <div
                        key={competence.id_competencer}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⭐</span>
                          <span className="font-medium">{competence.competencer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Niveau:</span>
                            <Select
                              value={competence.niveaur.toString()}
                              onValueChange={(value) => handleCompetenceLevelChange(competence.id_competencer, Number.parseInt(value))}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-16">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCompetence(competence.id_competencer)}
                            className="h-8 w-8 text-gray-500 hover:text-red-500"
                            disabled={isUpdating}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isUpdating}>
                Annuler
              </Button>
              {currentStep === 2 && (
                <Button variant="outline" onClick={() => setCurrentStep(1)} disabled={isUpdating}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              )}
            </div>
            {currentStep === 1 ? (
              <Button onClick={() => setCurrentStep(2)} className="border-2 border-gray-100" disabled={isUpdating}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700" disabled={isUpdating}>
                Enregistrer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}