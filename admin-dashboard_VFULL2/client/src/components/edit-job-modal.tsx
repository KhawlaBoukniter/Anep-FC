"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "./ui/button.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { ChevronLeft, ChevronRight, Edit, Briefcase, X, Check } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx";
import { useUpdateJob } from "../hooks/useJobs";
import { useSkills } from "../hooks/useReqSkills"; 
import { Job, Competence } from "../types/job.ts";
import { useToast } from "../hooks/use-toast.ts";

interface EditJobModalProps {
  job: Job;
}

export function EditJobModal({ job }: EditJobModalProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Job>>({
    id_emploi: job.id_emploi,
    nom_emploi: job.nom_emploi,
    entite: job.entite,
    formation: job.formation,
    experience: job.experience,
    codeemploi: job.codeemploi,
    poidsemploi: job.poidsemploi,
  });
  const [selectedCompetences, setSelectedCompetences] = useState<Competence[]>(
    (job.required_skills || []).map((skill) => ({
      id_competencer: skill.id_competencer,
      code_competencer: skill.code_competencer,
      competencer: skill.competencer,
      niveaur: skill.niveaur,
    }))
  );
  const [newCompetence, setNewCompetence] = useState("");
  const [openCompetencePopover, setOpenCompetencePopover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { mutate: updateJob, isLoading } = useUpdateJob();
  const { data: availableSkills = [], isLoading: isSkillsLoading } = useSkills();
  const { toast } = useToast();

  const validateForm = () => {
    setIsValidating(true);

    if (!formData.nom_emploi?.trim() || formData.nom_emploi.length <= 2) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom de l'emploi doit contenir au moins trois caractères." });
      return false;
    }

    if (!formData.entite?.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "L'entité est requise." });
      return false;
    }

    if (!formData.formation?.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "La formation est requise." });
      return false;
    }

    if (formData.experience && (formData.experience < 0 || !Number.isInteger(Number(formData.experience)))) {
      toast({ variant: "destructive", title: "Erreur", description: "L'expérience doit être un nombre entier positif ou zéro." });
      return false;
    }

    if (!formData.codeemploi?.trim() || !/^[A-Z0-9]{3,10}$/.test(formData.codeemploi)) {
      toast({ variant: "destructive", title: "Erreur", description: "Le code emploi doit être alphanumérique (3-10 caractères)." });
      return false;
    }

    if (formData.poidsemploi && (formData.poidsemploi <= 0 || !Number.isInteger(Number(formData.poidsemploi)))) {
      toast({ variant: "destructive", title: "Erreur", description: "Le poids de l'emploi doit être un nombre entier positif." });
      return false;
    }

    if (selectedCompetences.length > 0) {
      for (const competence of selectedCompetences) {
        if (!competence.id_competencer || !Number.isInteger(Number(competence.niveaur)) || competence.niveaur < 1 || competence.niveaur > 4) {
          toast({ variant: "destructive", title: "Erreur", description: "Les compétences doivent avoir un niveau valide (1-4)." });
          return false;
        }
      }
    }

    setIsValidating(false);
    return true;
  };

  const handleInputChange = (field: keyof Job, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompetenceLevelChange = (competenceId: string, niveaur: number) => {
    setSelectedCompetences((prev) =>
      prev.map((competence) =>
        competence.id_competencer === competenceId ? { ...competence, niveaur } : competence
      )
    );
  };

  const addCompetence = (competenceId: string) => {
    const skill = availableSkills.find((s: Competence) => s.id_competencer === competenceId);
    if (!skill || selectedCompetences.some((s) => s.id_competencer === competenceId)) return;

    const newCompetenceItem: Competence = {
      id_competencer: competenceId,
      code_competencer: skill.code_competencer,
      competencer: skill.competencer,
      niveaur: 1,
    };

    setSelectedCompetences((prev) => [...prev, newCompetenceItem]);
    setNewCompetence("");
    setOpenCompetencePopover(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newCompetence.trim()) {
      e.preventDefault();
      const skill = availableSkills.find((s: Competence) =>
        s.competencer?.toLowerCase().includes(newCompetence.trim().toLowerCase())
      );
      if (skill) addCompetence(skill.id_competencer);
    }
  };

  const removeCompetence = (competenceId: string) => {
    setSelectedCompetences((prev) => prev.filter((competence) => competence.id_competencer !== competenceId));
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const updatedJobData = {
      nom_emploi: formData.nom_emploi || "",
      entite: formData.entite || "",
      formation: formData.formation || "",
      experience: formData.experience || null,
      codeemploi: formData.codeemploi || "",
      poidsemploi: formData.poidsemploi || 0,
      required_skills: selectedCompetences.map((s) => ({
        id_competencer: s.id_competencer,
        niveaur: s.niveaur,
      })),
    };

    updateJob(
      { id: job.id_emploi, data: updatedJobData },
      {
        onSuccess: () => {
          toast({ title: "Succès", description: "Emploi mis à jour avec succès." });
          setCurrentStep(1);
          setOpen(false);
        },
        onError: (error: any) => {
          console.error("Update error details:", error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: error.response?.data?.error || "Échec de la mise à jour de l'emploi.",
          });
        },
      }
    );
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      id_emploi: job.id_emploi,
      nom_emploi: job.nom_emploi,
      entite: job.entite,
      formation: job.formation,
      experience: job.experience,
      codeemploi: job.codeemploi,
      poidsemploi: job.poidsemploi,
    });
    setSelectedCompetences(
      (job.required_skills || []).map((skill) => ({
        id_competencer: skill.id_competencer,
        code_competencer: skill.code_competencer,
        competencer: skill.competencer,
        niveaur: skill.niveaur,
      }))
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Briefcase className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-xl">Modifier l'Emploi</DialogTitle>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="text-sm text-gray-600">Données Emploi</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-sm text-gray-600">Compétences</span>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-6 mt-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom_emploi">Nom Emploi *</Label>
                <Input
                  id="nom_emploi"
                  placeholder="Entrez le nom de l'emploi"
                  value={formData.nom_emploi || ""}
                  onChange={(e) => handleInputChange("nom_emploi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entite">Entité *</Label>
                <Input
                  id="entite"
                  placeholder="Entrez le nom de l'entité"
                  value={formData.entite || ""}
                  onChange={(e) => handleInputChange("entite", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="formation">Formation *</Label>
                <Input
                  id="formation"
                  placeholder="Entrez la formation"
                  value={formData.formation || ""}
                  onChange={(e) => handleInputChange("formation", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Expérience (années)</Label>
                <Input
                  id="experience"
                  type="number"
                  min={0}
                  placeholder="Entrez les années d'expérience"
                  value={formData.experience ?? ""}
                  onChange={(e) => handleInputChange("experience", parseInt(e.target.value) || undefined)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codeEmploi">Code Emploi *</Label>
                <Input
                  id="codeEmploi"
                  placeholder="Entrez le code d'emploi"
                  value={formData.codeemploi || ""}
                  onChange={(e) => handleInputChange("codeemploi", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poidsemploi">Poids Emploi</Label>
                <Input
                  id="poidsemploi"
                  type="number"
                  min={0}
                  placeholder="Entrez le poids de l'emploi"
                  value={formData.poidsemploi ?? ""}
                  onChange={(e) => handleInputChange("poidsemploi", parseInt(e.target.value) || undefined)}
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
                  <div className="flex-1 relative">
                    <Command className="rounded-lg border">
                      <CommandInput
                        ref={inputRef}
                        placeholder="Saisissez ou recherchez une compétence..."
                        value={newCompetence}
                        onValueChange={(value) => {
                          setNewCompetence(value);
                          setOpenCompetencePopover(value.length > 0);
                        }}
                        onKeyDown={handleKeyDown}
                      />
                      {openCompetencePopover && (
                        <CommandList className="absolute top-10 w-full border shadow-md bg-white z-10">
                          <CommandEmpty>Aucune compétence trouvée.</CommandEmpty>
                          <CommandGroup>
                            {availableSkills
                              .filter((skill: Competence) =>
                                skill.competencer?.toLowerCase().includes(newCompetence.trim().toLowerCase())
                              )
                              .map((skill: Competence) => (
                                <CommandItem
                                  key={skill.id_competencer}
                                  onSelect={() => addCompetence(skill.id_competencer)}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${
                                      selectedCompetences.some((s) => s.id_competencer === skill.id_competencer)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                  <span>{skill.competencer}</span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      )}
                    </Command>
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      const skill = availableSkills.find((s: Competence) =>
                        s.competencer?.toLowerCase().includes(newCompetence.trim().toLowerCase())
                      );
                      if (skill) addCompetence(skill.id_competencer);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!newCompetence.trim() || isLoading || isSkillsLoading}
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {isSkillsLoading ? (
                    <div className="text-center py-8 text-gray-500">Chargement des compétences...</div>
                  ) : selectedCompetences.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune compétence ajoutée. Utilisez le champ ci-dessus pour ajouter des compétences.
                    </div>
                  ) : (
                    selectedCompetences.map((competence) => (
                      <div
                        key={competence.id_competencer}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{competence.competencer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Niveau:</span>
                            <Select
                              value={competence.niveaur.toString()}
                              onValueChange={(value) => handleCompetenceLevelChange(competence.id_competencer, Number.parseInt(value))}
                              disabled={isLoading || isSkillsLoading}
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
                            disabled={isLoading || isSkillsLoading}
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
              <Button variant="outline" onClick={handleClose} disabled={isLoading || isSkillsLoading}>
                Annuler
              </Button>
              {currentStep === 2 && (
                <Button variant="outline" onClick={() => setCurrentStep(1)} disabled={isLoading || isSkillsLoading}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              )}
            </div>
            {currentStep === 1 ? (
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || isSkillsLoading}
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading || isValidating || isSkillsLoading}
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}