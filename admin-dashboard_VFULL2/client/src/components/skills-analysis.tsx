"use client"

import { useState } from "react"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Label } from "./ui/label.tsx"
import { Checkbox } from "./ui/checkbox.tsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx"
import { BarChart3, Users, CheckCircle, AlertTriangle } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover.tsx"
import { Input } from "./ui/input.tsx"

// Interface pour les employés
interface Employee {
  id: string
  nom: string
  prenom: string
  poste: string
  email: string
  telephone: string
  categorie: string
  specialite: string
  dateEmbauche: string
  departement: string
  role: "user" | "admin"
  skills: Array<{
    name: string
    level: number
    icon: string
  }>
}

// Interface pour une compétence sélectionnée
interface SelectedSkill {
  name: string
  acquiredLevels: number[] // Niveaux acquis sélectionnés (1 à 4)
  requiredLevels: number[] // Niveaux requis sélectionnés (1 à 4)
}

// Interface pour les résultats d'analyse
interface AnalysisResult {
  employee: Employee
  matchedSkills: Array<{
    name: string
    currentLevel: number | null
    matchesAcquired: boolean
    matchesRequired: boolean
  }>
}

// Données mockées des employés
const mockEmployees: Employee[] = [
  {
    id: "1",
    nom: "Dupont",
    prenom: "Jean",
    poste: "Développeur Senior",
    email: "jean.dupont@company.com",
    telephone: "+33 1 23 45 67 89",
    categorie: "Technique",
    specialite: "Full Stack",
    dateEmbauche: "2022-03-15",
    departement: "IT",
    role: "admin",
    skills: [
      { name: "Programmation", level: 3, icon: "💻" },
      { name: "Langues étrangères", level: 3, icon: "🌍" },
      { name: "Gestion d'équipe", level: 2, icon: "👥" },
    ],
  },
  {
    id: "2",
    nom: "Martin",
    prenom: "Sophie",
    poste: "Designer UX/UI",
    email: "sophie.martin@company.com",
    telephone: "+33 1 98 76 54 32",
    categorie: "Créatif",
    specialite: "Interface Design",
    dateEmbauche: "2021-09-10",
    departement: "Design",
    role: "user",
    skills: [
      { name: "Design", level: 4, icon: "🎨" },
      { name: "Rédaction", level: 3, icon: "✏️" },
      { name: "Langues étrangères", level: 2, icon: "🌍" },
    ],
  },
  {
    id: "3",
    nom: "Bernard",
    prenom: "Pierre",
    poste: "Chef de Projet",
    email: "pierre.bernard@company.com",
    telephone: "+33 1 11 22 33 44",
    categorie: "Management",
    specialite: "Gestion de Projet",
    dateEmbauche: "2020-01-20",
    departement: "Management",
    role: "admin",
    skills: [
      { name: "Gestion d'équipe", level: 4, icon: "👥" },
      { name: "Communication", level: 4, icon: "💬" },
      { name: "Programmation", level: 2, icon: "💻" },
    ],
  },
  {
    id: "4",
    nom: "Leroy",
    prenom: "Marie",
    poste: "Analyste Marketing",
    email: "marie.leroy@company.com",
    telephone: "+33 1 55 66 77 88",
    categorie: "Marketing",
    specialite: "Digital Marketing",
    dateEmbauche: "2023-06-01",
    departement: "Marketing",
    role: "user",
    skills: [
      { name: "Marketing", level: 3, icon: "📊" },
      { name: "Analyse de données", level: 4, icon: "📈" },
      { name: "Communication", level: 3, icon: "💬" },
    ],
  },
  {
    id: "5",
    nom: "Dubois",
    prenom: "Thomas",
    poste: "Développeur Frontend",
    email: "thomas.dubois@company.com",
    telephone: "+33 1 77 88 99 00",
    categorie: "Technique",
    specialite: "React/Vue.js",
    dateEmbauche: "2023-08-15",
    departement: "IT",
    role: "user",
    skills: [
      { name: "Programmation", level: 3, icon: "💻" },
      { name: "Design", level: 2, icon: "🎨" },
    ],
  },
  {
    id: "6",
    nom: "Moreau",
    prenom: "Claire",
    poste: "Responsable RH",
    email: "claire.moreau@company.com",
    telephone: "+33 1 44 55 66 77",
    categorie: "RH",
    specialite: "Recrutement",
    dateEmbauche: "2019-05-10",
    departement: "RH",
    role: "admin",
    skills: [
      { name: "Gestion d'équipe", level: 4, icon: "👥" },
      { name: "Communication", level: 4, icon: "💬" },
      { name: "Rédaction", level: 3, icon: "✏️" },
    ],
  },
]

// Liste des compétences disponibles
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

// Exigences par poste
const jobRequirements: Record<string, Array<{ name: string; requiredLevel: number }>> = {
  "Développeur Senior": [
    { name: "Programmation", requiredLevel: 4 },
    { name: "Gestion d'équipe", requiredLevel: 2 },
  ],
  "Designer UX/UI": [
    { name: "Design", requiredLevel: 4 },
    { name: "Communication", requiredLevel: 3 },
  ],
  "Chef de Projet": [
    { name: "Gestion d'équipe", requiredLevel: 4 },
    { name: "Communication", requiredLevel: 4 },
  ],
  "Analyste Marketing": [
    { name: "Marketing", requiredLevel: 3 },
    { name: "Analyse de données", requiredLevel: 4 },
  ],
  "Développeur Frontend": [
    { name: "Programmation", requiredLevel: 3 },
    { name: "Design", requiredLevel: 2 },
  ],
  "Responsable RH": [
    { name: "Gestion d'équipe", requiredLevel: 4 },
    { name: "Communication", requiredLevel: 4 },
  ],
}

export function SkillsAnalysis() {
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([])
  const [searchSkill, setSearchSkill] = useState("")
  const [openSkillPopover, setOpenSkillPopover] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  // Ajouter une compétence à la liste
  const addSkill = (skillName: string) => {
    if (!selectedSkills.some((s) => s.name === skillName)) {
      setSelectedSkills([...selectedSkills, { name: skillName, acquiredLevels: [], requiredLevels: [] }])
      setSearchSkill("")
      setOpenSkillPopover(false)
    }
  }

  // Supprimer une compétence
  const removeSkill = (skillName: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s.name !== skillName))
  }

  // Mettre à jour les niveaux acquis pour une compétence
  const updateAcquiredLevels = (skillName: string, level: number, checked: boolean) => {
    setSelectedSkills(
      selectedSkills.map((s) =>
        s.name === skillName
          ? {
              ...s,
              acquiredLevels: checked
                ? [...s.acquiredLevels, level]
                : s.acquiredLevels.filter((l) => l !== level),
            }
          : s
      )
    )
  }

  // Mettre à jour les niveaux requis pour une compétence
  const updateRequiredLevels = (skillName: string, level: number, checked: boolean) => {
    setSelectedSkills(
      selectedSkills.map((s) =>
        s.name === skillName
          ? {
              ...s,
              requiredLevels: checked
                ? [...s.requiredLevels, level]
                : s.requiredLevels.filter((l) => l !== level),
            }
          : s
      )
    )
  }

  // Analyser les compétences
  const analyzeSkills = () => {
    if (selectedSkills.length === 0 || selectedSkills.some((s) => s.acquiredLevels.length === 0 || s.requiredLevels.length === 0)) {
      return
    }

    const results: AnalysisResult[] = mockEmployees
      .map((employee) => {
        const matchedSkills = selectedSkills.map((selectedSkill) => {
          const employeeSkill = employee.skills.find((s) => s.name.toLowerCase() === selectedSkill.name.toLowerCase())
          const currentLevel = employeeSkill ? employeeSkill.level : null
          const jobReq = jobRequirements[employee.poste]?.find((req) => req.name.toLowerCase() === selectedSkill.name.toLowerCase())
          const jobRequiredLevel = jobReq ? jobReq.requiredLevel : null

          // Vérifier si le niveau acquis correspond
          const matchesAcquired = currentLevel !== null && selectedSkill.acquiredLevels.includes(currentLevel)

          // Vérifier si le niveau requis correspond à celui du poste
          const matchesRequired = jobRequiredLevel !== null && selectedSkill.requiredLevels.includes(jobRequiredLevel)

          return {
            name: selectedSkill.name,
            currentLevel,
            matchesAcquired,
            matchesRequired,
          }
        })

        // L'employé doit correspondre à au moins un critère pour une compétence
        const allSkillsMatch = matchedSkills.some((s) => s.matchesAcquired && s.matchesRequired)

        return {
          employee,
          matchedSkills,
          allSkillsMatch,
        }
      })
      .filter((result) => result.allSkillsMatch)

    setAnalysisResults(results)
    setHasAnalyzed(true)
  }

  // Réinitialiser
  const resetAnalysis = () => {
    setSelectedSkills([])
    setSearchSkill("")
    setAnalysisResults([])
    setHasAnalyzed(false)
  }

  // Couleurs pour les niveaux et départements
  const getLevelColor = (level: number | null) => {
    if (!level) return "bg-gray-100 text-gray-800"
    switch (level) {
      case 1:
        return "bg-red-100 text-red-800"
      case 2:
        return "bg-yellow-100 text-yellow-800"
      case 3:
        return "bg-blue-100 text-blue-800"
      case 4:
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDepartementColor = (departement: string) => {
    const colors = {
      IT: "bg-blue-100 text-blue-800",
      Design: "bg-purple-100 text-purple-800",
      Management: "bg-indigo-100 text-indigo-800",
      Marketing: "bg-pink-100 text-pink-800",
      RH: "bg-teal-100 text-teal-800",
    }
    return colors[departement as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Analyse des Compétences</CardTitle>
              <p className="text-sm text-gray-600">
                Sélectionnez des compétences et leurs niveaux pour identifier les employés correspondants
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paramètres d'Analyse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Ajouter une compétence</Label>
            <Popover open={openSkillPopover} onOpenChange={setOpenSkillPopover}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    placeholder="Rechercher une compétence..."
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    onFocus={() => setOpenSkillPopover(true)}
                    className="cursor-text"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Command>
                  <CommandInput placeholder="Rechercher une compétence..." />
                  <CommandList>
                    <CommandEmpty>Aucune compétence trouvée.</CommandEmpty>
                    <CommandGroup>
                      {availableSkills
                        .filter((skill) => skill.name.toLowerCase().includes(searchSkill.toLowerCase()))
                        .map((skill) => (
                          <CommandItem
                            key={skill.name}
                            onSelect={() => addSkill(skill.name)}
                            disabled={selectedSkills.some((s) => s.name === skill.name)}
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
          </div>

          {selectedSkills.length > 0 && (
            <div className="space-y-4">
              <Label>Compétences sélectionnées</Label>
              {selectedSkills.map((skill) => (
                <Card key={skill.name} className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{availableSkills.find((s) => s.name === skill.name)?.icon}</span>
                      <span className="font-medium">{skill.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeSkill(skill.name)}>
                      Supprimer
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Niveaux acquis</Label>
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`${skill.name}-acquired-${level}`}
                            checked={skill.acquiredLevels.includes(level)}
                            onCheckedChange={(checked) => updateAcquiredLevels(skill.name, level, checked as boolean)}
                          />
                          <Label htmlFor={`${skill.name}-acquired-${level}`}>Niveau {level}</Label>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label className="mb-2 block">Niveaux requis</Label>
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            id={`${skill.name}-required-${level}`}
                            checked={skill.requiredLevels.includes(level)}
                            onCheckedChange={(checked) => updateRequiredLevels(skill.name, level, checked as boolean)}
                          />
                          <Label htmlFor={`${skill.name}-required-${level}`}>Niveau {level}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={analyzeSkills}
              disabled={selectedSkills.length === 0 || selectedSkills.some((s) => s.acquiredLevels.length === 0 || s.requiredLevels.length === 0)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyser
            </Button>
            {hasAnalyzed && (
              <Button variant="outline" onClick={resetAnalysis}>
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {hasAnalyzed && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Résultats de l'analyse</CardTitle>
                <p className="text-sm text-gray-600">Employés correspondant à au moins un critère</p>
              </div>
              <Badge variant="secondary">{analysisResults.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {analysisResults.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employé</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Département</TableHead>
                      {selectedSkills.map((skill) => (
                        <TableHead key={skill.name}>{skill.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResults.map((result) => (
                      <TableRow key={result.employee.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {result.employee.prenom} {result.employee.nom}
                        </TableCell>
                        <TableCell>{result.employee.poste}</TableCell>
                        <TableCell>
                          <Badge className={getDepartementColor(result.employee.departement)} variant="secondary">
                            {result.employee.departement}
                          </Badge>
                        </TableCell>
                        {result.matchedSkills.map((skill) => (
                          <TableCell key={skill.name}>
                            <div className="space-y-1">
                              <Badge className={getLevelColor(skill.currentLevel)}>
                                {skill.currentLevel ? `Niveau ${skill.currentLevel}` : "Non acquise"}
                              </Badge>
                              <div>
                                <span className="text-xs text-gray-600">
                                  Requis (poste):{" "}
                                  {jobRequirements[result.employee.poste]?.find((req) => req.name === skill.name)?.requiredLevel || "N/A"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun employé trouvé</h3>
                <p className="text-gray-600">
                  Aucun employé ne correspond aux critères de compétences et d'exigences sélectionnés.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}