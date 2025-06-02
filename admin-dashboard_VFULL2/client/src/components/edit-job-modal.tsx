"use client"

import { useState, useRef, type KeyboardEvent } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { ChevronLeft, ChevronRight, Edit, Briefcase, X } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

interface Skill {
  id: string
  name: string
  icon: string
  level: number
}

interface Job {
  id: string
  entite: string
  formation: string
  experience: string
  codeEmploi: string
  poidEmploi: string
  requiredSkills: Array<{
    name: string
    level: number
    icon: string
  }>
}

interface EditJobModalProps {
  job: Job
}

// Liste des compétences disponibles pour les suggestions
const availableSkills = [
  { name: "Programmation", icon: "💻" },
  { name: "Langues étrangères", icon: "🌍" },
  { name: "Gestion d'équipe", icon: "👥" },
  { name: "Rédaction", icon: "✏️" },
  { name: "Design", icon: "🎨" },
  { name: "Communication", icon: "💬" },
  { name: "Marketing", icon: "📊" },
  { name: "Comptabilité", icon: "🧮" },
  { name: "Vente", icon: "🤝" },
  { name: "Analyse de données", icon: "📈" },
]

export function EditJobModal({ job }: EditJobModalProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    entite: job.entite,
    formation: job.formation,
    experience: job.experience,
    codeEmploi: job.codeEmploi,
    poidEmploi: job.poidEmploi,
  })

  const [requiredSkills, setRequiredSkills] = useState<Skill[]>(
    job.requiredSkills.map((skill, index) => ({
      id: `${index}`,
      name: skill.name,
      icon: skill.icon,
      level: skill.level,
    })),
  )
  const [newSkill, setNewSkill] = useState("")
  const [openSkillPopover, setOpenSkillPopover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSkillLevelChange = (skillId: string, level: number) => {
    setRequiredSkills((prev) => prev.map((skill) => (skill.id === skillId ? { ...skill, level } : skill)))
  }

  const addSkill = (skillName: string) => {
    // Vérifier si la compétence existe déjà
    if (requiredSkills.some((skill) => skill.name.toLowerCase() === skillName.toLowerCase())) {
      return
    }

    // Trouver l'icône correspondante ou utiliser une icône par défaut
    const matchedSkill = availableSkills.find((skill) => skill.name.toLowerCase() === skillName.toLowerCase())
    const icon = matchedSkill?.icon || "⭐"

    const newSkillItem: Skill = {
      id: Date.now().toString(),
      name: skillName,
      icon: icon,
      level: 1,
    }

    setRequiredSkills((prev) => [...prev, newSkillItem])
    setNewSkill("")
    setOpenSkillPopover(false)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSkill.trim()) {
      e.preventDefault()
      addSkill(newSkill.trim())
    }
  }

  const removeSkill = (skillId: string) => {
    setRequiredSkills((prev) => prev.filter((skill) => skill.id !== skillId))
  }

  const handleSubmit = () => {
    console.log("Données emploi modifiées:", formData)
    console.log("Compétences requises modifiées:", requiredSkills)
    alert("Emploi modifié avec succès!")

    // Close modal
    setCurrentStep(1)
    setOpen(false)
  }

  const handleClose = () => {
    // Reset to original values
    setCurrentStep(1)
    setFormData({
      entite: job.entite,
      formation: job.formation,
      experience: job.experience,
      codeEmploi: job.codeEmploi,
      poidEmploi: job.poidEmploi,
    })
    setRequiredSkills(
      job.requiredSkills.map((skill, index) => ({
        id: `${index}`,
        name: skill.name,
        icon: skill.icon,
        level: skill.level,
      })),
    )
    setOpen(false)
  }

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
            <Briefcase className="h-6 w-6 text-blue-600" />
            <DialogTitle className="text-xl">Modifier l'Emploi</DialogTitle>
            <Badge variant="secondary">2 étapes</Badge>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
            >
              1
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}
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
                  placeholder="Entrer la formation"
                  value={formData.formation}
                  onChange={(e) => handleInputChange("formation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience</Label>
                <Input
                  id="experience"
                  placeholder="Entrer les années d'expériences"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codeEmploi">Code Emploi</Label>
                <Input
                  id="codeEmploi"
                  placeholder="Entrer le code d'emploi"
                  value={formData.codeEmploi}
                  onChange={(e) => handleInputChange("codeEmploi", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="poidEmploi">Poid Emploi (conteur)</Label>
                <Input
                  id="poidEmploi"
                  placeholder="Entrer le poids d'emploi"
                  value={formData.poidEmploi}
                  onChange={(e) => handleInputChange("poidEmploi", e.target.value)}
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
                  <Popover open={openSkillPopover} onOpenChange={setOpenSkillPopover}>
                    <PopoverTrigger asChild>
                      <div className="flex-1">
                        <Input
                          ref={inputRef}
                          placeholder="Saisissez une compétence..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={handleKeyDown}
                          onFocus={() => setOpenSkillPopover(true)}
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
                      <Command>
                        <CommandInput placeholder="Rechercher une compétence..." />
                        <CommandList>
                          <CommandEmpty>Aucune compétence trouvée.</CommandEmpty>
                          <CommandGroup>
                            {availableSkills
                              .filter((skill) => skill.name.toLowerCase().includes(newSkill.toLowerCase()))
                              .map((skill) => (
                                <CommandItem
                                  key={skill.name}
                                  onSelect={() => {
                                    addSkill(skill.name)
                                  }}
                                >
                                  <span className="mr-2">{skill.icon}</span>
                                  <span>{skill.name}</span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="button"
                    onClick={() => newSkill.trim() && addSkill(newSkill.trim())}
                    className="bg-blue-600 hover:bg-blue-700"
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
                    requiredSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{skill.icon}</span>
                          <span className="font-medium">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Niveau:</span>
                            <Select
                              value={skill.level.toString()}
                              onValueChange={(value) => handleSkillLevelChange(skill.id, Number.parseInt(value))}
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
                            onClick={() => removeSkill(skill.id)}
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
              <Button onClick={() => setCurrentStep(2)} className="bg-blue-600 hover:bg-blue-700">
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                Enregistrer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
