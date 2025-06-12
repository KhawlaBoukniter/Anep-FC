"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { useQuery, useMutation, useQueryClient } from "react-query"
import { Button } from "./ui/button.tsx"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog.tsx"
import { Input } from "./ui/input.tsx"
import { Label } from "./ui/label.tsx"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx"
import { ChevronLeft, ChevronRight, Plus, Briefcase, X } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx"
import { jobService, skillService } from "../services/api"
import type { Job, Competence } from "../types/job"
import { useSkills } from "../hooks/useReqSkills.js"
import { useToast } from "../hooks/use-toast.ts"

export function AddJobModal() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    nom_emploi: "",
    entite: "",
    formation: "",
    experience: "",
    codeemploi: "",
    poidsemploi: "",
  })
  const [requiredSkills, setRequiredSkills] = useState<Competence[]>([])
  const [newCompetence, setNewCompetence] = useState("")
  const [openCompetencePopover, setOpenCompetencePopover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isValidating, setIsValidating] = useState(false)
  const queryClient = useQueryClient()

  // Fetch available competences from the backend
  const { data: availableCompetences = [] } = useSkills()
  const { toast } = useToast()

  // Mutation to create a new job
  const createJobMutation = useMutation({
    mutationFn: (jobData: Job) => jobService.create(jobData),
    onSuccess: () => {
      toast({ title: "Succès", description: "Emploi créé avec succès." })
      resetForm()
    },
    onError: (error: any) => {
      console.error("Erreur lors de la création de l'emploi:", error)
      toast({ variant: "destructive", title: "Erreur", description: "Échec de la création de l'emploi." })
      setIsValidating(false)
    },
  })

  const validateForm = () => {
    if (!formData.nom_emploi?.trim() || formData.nom_emploi.length <= 2) {
      toast({ variant: "destructive", title: "Erreur", description: "Le nom de l'emploi doit contenir au moins trois caractères." })
      return false
    }

    if (!formData.entite?.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "L'entité est requise." })
      return false
    }

    if (!formData.formation?.trim()) {
      toast({ variant: "destructive", title: "Erreur", description: "La formation est requise." })
      return false
    }

    if (formData.experience && (Number(formData.experience) < 0 || !Number.isInteger(Number(formData.experience)))) {
      toast({ variant: "destructive", title: "Erreur", description: "L'expérience doit être un nombre entier positif ou zéro." })
      return false
    }

    if (!formData.codeemploi?.trim() || !/^[A-Z0-9]{3,10}$/.test(formData.codeemploi)) {
      toast({ variant: "destructive", title: "Erreur", description: "Le code emploi doit être alphanumérique (3-10 caractères)." })
      return false
    }

    if (formData.poidsemploi && (Number(formData.poidsemploi) <= 0 || !Number.isInteger(Number(formData.poidsemploi)))) {
      toast({ variant: "destructive", title: "Erreur", description: "Le poids de l'emploi doit être un nombre entier positif." })
      return false
    }

    if (requiredSkills.length > 0) {
      for (const competence of requiredSkills) {
        if (!competence.id_competencer || !Number.isInteger(Number(competence.niveaur)) || competence.niveaur < 1 || competence.niveaur > 4) {
          toast({ variant: "destructive", title: "Erreur", description: "Les compétences doivent avoir un niveau valide (1-4)." })
          return false
        }
      }
    }

    setIsValidating(false)
    return true
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setIsValidating(false) // Reset validating state on input change
  }

  const handleCompetenceLevelChange = (competenceId: string, niveaur: number) => {
    setRequiredSkills((prev) =>
      prev.map((competence) =>
        competence.id_competencer === competenceId ? { ...competence, niveaur } : competence
      )
    )
  }

  const addCompetence = (id_competencer: string) => {
    const competence = availableCompetences.find((s: Competence) => s.id_competencer === id_competencer)
    if (requiredSkills.some((c) => c.id_competencer === id_competencer)) {
      return
    }

    const newCompetenceItem: Competence = {
      id_competencer: id_competencer,
      competencer: competence.competencer,
      code_competencer: competence.code_competencer,
      niveaur: 1,
    }

    setRequiredSkills((prev) => [...prev, newCompetenceItem])
    setNewCompetence("")
    setOpenCompetencePopover(false)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newCompetence.trim()) {
      e.preventDefault()
      const matchedCompetence = availableCompetences.find(
        (competence: any) => competence.competencer.toLowerCase().includes(newCompetence.trim().toLowerCase())
      )
      if (matchedCompetence) {
        addCompetence(matchedCompetence)
      }
    }
  }

  const removeCompetence = (competenceId: string) => {
    setRequiredSkills((prev) => prev.filter((competence) => competence.id_competencer !== competenceId))
  }

  const handleSubmit = () => {
    setIsValidating(true)
    if (!validateForm()) return

    const jobData: Job = {
      nom_emploi: formData.nom_emploi,
      entite: formData.entite,
      formation: formData.formation,
      experience: formData.experience ? Number.parseInt(formData.experience) : null,
      codeemploi: formData.codeemploi,
      poidsemploi: formData.poidsemploi ? Number.parseInt(formData.poidsemploi) : 0,
      required_skills: requiredSkills.map((competence) => ({
        id_competencer: competence.id_competencer,
        niveaur: competence.niveaur,
      })),
    }

    createJobMutation.mutate(jobData)
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      nom_emploi: "",
      entite: "",
      formation: "",
      experience: "",
      codeemploi: "",
      poidsemploi: "",
    })
    setRequiredSkills([])
    setOpen(false)
  }

  const handleClose = () => {
    resetForm()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter Emploi
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Briefcase className="h-6 w-6 text-green-600" />
            <DialogTitle className="text-xl">Formulaire Emploi</DialogTitle>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="justify-items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === 1 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
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
                  currentStep === 2 ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="text-sm text-gray-600">Compétences Requises</span>
            </div>
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
                  value={formData.nom_emploi}
                  onChange={(e) => handleInputChange("nom_emploi", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entite">Entité</Label>
                <Input
                  id="entite"
                  placeholder="Entrez le nom de l'entité"
                  value={formData.entite}
                  onChange={(e) => handleInputChange("entite", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="formation">Formation</Label>
                <Input
                  id="formation"
                  placeholder="Entrez la formation"
                  value={formData.formation}
                  onChange={(e) => handleInputChange("formation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience (années)</Label>
                <Input
                  id="experience"
                  type="number"
                  min={0}
                  max={60}
                  placeholder="Entrez les années d'expérience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codeemploi">Code Emploi</Label>
                <Input
                  id="codeemploi"
                  placeholder="Entrez le code d'emploi"
                  value={formData.codeemploi}
                  onChange={(e) => handleInputChange("codeemploi", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poidsemploi">Poids Emploi</Label>
                <Input
                  id="poidsemploi"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Entrez le poids de l'emploi"
                  value={formData.poidsemploi}
                  onChange={(e) => handleInputChange("poidsemploi", e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Compétences & Niveaux</h3>
                <p className="text-sm text-gray-600">
                  Ajoutez les compétences requises pour cet emploi et indiquez le niveau de maîtrise pour chacune (1 =
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
                          setNewCompetence(value)
                          setOpenCompetencePopover(value.length > 0)
                        }}
                        onKeyDown={handleKeyDown}
                      />
                      {openCompetencePopover && (
                        <CommandList className="absolute top-10 w-full border shadow-md bg-white z-10">
                              <CommandEmpty>Aucune compétence trouvée.</CommandEmpty>
                              <CommandGroup>
                                {availableCompetences
                                  .filter((competence: Competence) =>
                                    competence.competencer.toLowerCase().includes(newCompetence.toLowerCase())
                                  )
                                  .map((competence: Competence) => (
                                    <CommandItem
                                      key={competence.id_competencer}
                                      onSelect={() => addCompetence(competence.id_competencer)}
                                      className="cursor-pointer"
                                    >
                                      <span>{competence.competencer}</span>
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
                      const matchedCompetence = availableCompetences.find((competence: any) =>
                        competence.competencer.toLowerCase().includes(newCompetence.trim().toLowerCase())
                      )
                      if (matchedCompetence) {
                        addCompetence(matchedCompetence)
                      }
                    }}
                    disabled={
                      !newCompetence.trim() ||
                      !availableCompetences.some((competence: any) =>
                        competence.competencer.toLowerCase().includes(newCompetence.trim().toLowerCase())
                      )
                    }
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {requiredSkills.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Aucune compétence ajoutée. Utilisez le champ ci-dessus pour ajouter des compétences.
                    </div>
                  ) : (
                    requiredSkills.map((competence) => (
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
                              onValueChange={(value) =>
                                handleCompetenceLevelChange(competence.id_competencer, Number.parseInt(value))
                              }
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
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              {currentStep === 2 && (
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Précédent
                </Button>
              )}
            </div>

            {currentStep === 1 ? (
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createJobMutation.isLoading || isValidating}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {createJobMutation.isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}