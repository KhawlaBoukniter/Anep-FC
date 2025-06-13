"use client"

import { useState, useRef } from "react"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Label } from "./ui/label.tsx"
import { Checkbox } from "./ui/checkbox.tsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx"
import { BarChart3, AlertTriangle } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx"
import { Input } from "./ui/input.tsx"
import { useSkillsAnalysis } from "../hooks/useAnalysis"

// Interface pour les employés
interface Employee {
  id: string
  nom_complet: string
  email: string
  telephone: string
  categorie: string
  specialite: string
  dateEmbauche: string
  role: "user" | "admin"
  poste: string
  departement: string
  skills: Array<{
    name: string
    level: number
  }>
}

// Interface pour une compétence sélectionnée
interface SelectedSkill {
  name: string
  acquiredLevels: number[]
  requiredLevels: number[]
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

export function SkillsAnalysis() {
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([])
  const [searchSkill, setSearchSkill] = useState("")
  const [openSkillPopover, setOpenSkillPopover] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch data using the hook
  const { data, isLoading, error } = useSkillsAnalysis()

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

    if (!data?.employees) {
      return
    }

    const results: AnalysisResult[] = data.employees
      .map((employee: Employee) => {
        const matchedSkills = selectedSkills.map((selectedSkill) => {
          const employeeSkill = employee.skills.find((s) => s.name.toLowerCase() === selectedSkill.name.toLowerCase())
          const currentLevel = employeeSkill ? employeeSkill.level : null
          const jobReq = data.jobRequirements[employee.poste]?.find((req: any) => req.name.toLowerCase() === selectedSkill.name.toLowerCase())
          const jobRequiredLevel = jobReq ? jobReq.requiredLevel : null

          const matchesAcquired = currentLevel !== null && selectedSkill.acquiredLevels.includes(currentLevel)
          const matchesRequired = jobRequiredLevel !== null && selectedSkill.requiredLevels.includes(jobRequiredLevel)

          return {
            name: selectedSkill.name,
            currentLevel,
            matchesAcquired,
            matchesRequired,
          }
        })

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
    setOpenSkillPopover(false)
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

  if (isLoading) {
    return <div>Chargement des données...</div>
  }

  if (error) {
    return <div>Erreur lors du chargement des données : {(error as any).message}</div>
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
            <div className="flex-1 relative">
              <Command className="rounded-lg border">
                <CommandInput
                  ref={inputRef}
                  placeholder="Saisissez ou recherchez une compétence..."
                  value={searchSkill}
                  onValueChange={(value) => {
                    setSearchSkill(value)
                    setOpenSkillPopover(value.length > 0)
                  }}
                />
                {openSkillPopover && (
                  <CommandList className="absolute top-10 w-full border shadow-md bg-white z-10">
                    <CommandEmpty>Aucune compétence trouvée.</CommandEmpty>
                    <CommandGroup>
                      {data?.availableSkills
                        ?.filter((skill: any) => skill.name.toLowerCase().includes(searchSkill.toLowerCase()))
                        .map((skill: any) => (
                          <CommandItem
                            key={skill.id}
                            onSelect={() => addSkill(skill.name)}
                            disabled={selectedSkills.some((s) => s.name === skill.name)}
                          >
                            <span>{skill.name}</span>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                )}
              </Command>
            </div>
          </div>

          {selectedSkills.length > 0 && (
            <div className="space-y-4">
              <Label>Compétences sélectionnées</Label>
              {selectedSkills.map((skill) => (
                <Card key={skill.name} className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
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
                          {result.employee.nom_complet}
                        </TableCell>
                        <TableCell>{result.employee.poste}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
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
                                  {data?.jobRequirements[result.employee.poste]?.find((req: any) => req.name === skill.name)?.requiredLevel || "N/A"}
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