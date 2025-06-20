"use client"

import { useState, useRef } from "react"
import * as XLSX from "xlsx"
import { Button } from "./ui/button.tsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Label } from "./ui/label.tsx"
import { Checkbox } from "./ui/checkbox.tsx"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table.tsx"
import { BarChart3, AlertTriangle, Download } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command.tsx"
import { Input } from "./ui/input.tsx"
import { useSkillsAnalysis } from "../hooks/useAnalysis"

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

interface SelectedSkill {
  name: string
  acquiredLevels: number[]
  requiredLevels: number[]
}

interface AnalysisResult {
  employee: Employee
  matchedSkills: Array<{
    name: string
    currentLevel: number | null
    requiredLevel: number | null
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
  const [analysisType, setAnalysisType] = useState<"union" | "intersection">("union")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAnalyzeDisabled, setIsAnalyzeDisabled] = useState(false)
  const resultsPerPage = 10
  const inputRef = useRef<HTMLInputElement>(null)
  const { data, isLoading, error } = useSkillsAnalysis()

  const addSkill = (skillName: string) => {
    if (!selectedSkills.some((s) => s.name === skillName)) {
      setSelectedSkills([...selectedSkills, { name: skillName, acquiredLevels: [], requiredLevels: [] }])
      setSearchSkill("")
      setOpenSkillPopover(false)
    }
  }

  const removeSkill = (skillName: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s.name !== skillName))
  }

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
          const requiredLevel = jobReq ? jobReq.requiredLevel : null

          const matchesAcquired = currentLevel !== null && selectedSkill.acquiredLevels.includes(currentLevel)
          const matchesRequired = requiredLevel !== null && selectedSkill.requiredLevels.includes(requiredLevel)

          return {
            name: selectedSkill.name,
            currentLevel,
            requiredLevel,
            matchesAcquired,
            matchesRequired,
          }
        })

        const allSkillsMatch = analysisType === "union"
          ? matchedSkills.some((s) => s.matchesAcquired && s.matchesRequired)
          : matchedSkills.every((s) => s.matchesAcquired && s.matchesRequired)

        return {
          employee,
          matchedSkills,
          allSkillsMatch,
        }
      })
      .filter((result) => result.allSkillsMatch)

    setAnalysisResults(results)
    setHasAnalyzed(true)
    setCurrentPage(1)
    setIsAnalyzeDisabled(true) // Disable "Analyser" button after click
  }

  const resetAnalysis = () => {
    setSelectedSkills([])
    setSearchSkill("")
    setAnalysisResults([])
    setHasAnalyzed(false)
    setOpenSkillPopover(false)
    setAnalysisType("union")
    setCurrentPage(1)
    setIsAnalyzeDisabled(false) // Re-enable "Analyser" button after reset
  }

  const handleDownloadExcel = () => {
    if (analysisResults.length === 0) {
      return
    }

    const dataToExport = analysisResults.map(result => {
      const row: { [key: string]: any } = {
        'Employé': result.employee.nom_complet,
        'Email': result.employee.email,
        'Poste': result.employee.poste,
        'Département': result.employee.departement,
      }

      result.matchedSkills.forEach(skill => {
        const skillValue = skill.currentLevel 
          ? `Acquis: ${skill.currentLevel} (Requis: ${skill.requiredLevel || "N/A"})` 
          : `Non acquise (Requis: ${skill.requiredLevel || "N/A"})`
        row[skill.name] = skillValue
      })

      return row
    })

    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Résultats Analyse")
    XLSX.writeFile(workbook, `analyse_competences_${analysisType}.xlsx`)
  }

  const getLevelColor = (level: number | null) => {
    if (!level) return "bg-gray-100 text-gray-800"
    switch (level) {
      case 1: return "bg-red-100 text-red-800"
      case 2: return "bg-yellow-100 text-yellow-800"
      case 3: return "bg-blue-100 text-blue-800"
      case 4: return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const totalPages = Math.ceil(analysisResults.length / resultsPerPage)
  const indexOfLastResult = currentPage * resultsPerPage
  const indexOfFirstResult = indexOfLastResult - resultsPerPage
  const currentResults = analysisResults.slice(indexOfFirstResult, indexOfLastResult)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page)
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
        <CardHeader className="bg-gray-100">
          <div className="flex items-center gap-3 ">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-purple-900">Analyse des Compétences</CardTitle>
              <p className="text-sm text-gray-600">
                Sélectionnez des compétences et leurs niveaux pour identifier les employés correspondants
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-gray-100">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900">Paramètres d'Analyse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2 ">
            
          <div className="space-y-2 w-full ">
            <Label>Ajouter une compétence</Label>
            <div className="flex-1 relative">
              <Command className="rounded-lg border border-purple-800 bg-white">
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
           <div className="space-y-2 w-full">
            <Label>Type d'analyse</Label>
            <div className="flex gap-4">
              <Button 
                variant={analysisType === "union" ? "default" : "outline"}
                onClick={() => setAnalysisType("union")}
                className={analysisType === "union" ? "bg-purple-200  w-full py-[22px] " : "w-full bg-purple-600 py-[22px] hover:bg-purple-700 text-white"} 
              >
                Union
              </Button>
              <Button
                variant={analysisType === "intersection" ? "default" : "outline"}
                onClick={() => setAnalysisType("intersection")}
                className={analysisType === "intersection" ? "bg-purple-200  w-full py-[22px]" : "w-full bg-purple-600 py-[22px] hover:bg-purple-700 text-white"}
              >
                Intersection
              </Button>
            </div>
          </div>
          </div>
          
          {selectedSkills.length > 0 && (
            <div className="space-y-4 ">
              <Label>Compétences sélectionnées</Label>
              {selectedSkills.map((skill) => (
                <Card key={skill.name} className="p-4 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{skill.name}</span>
                    </div>
                    <Button className="text-yellow-400" variant="ghost" size="sm" onClick={() => removeSkill(skill.name)}>
                      Supprimer
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block text-purple-800">Niveaux acquis</Label>
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className="flex items-center space-x-2 mb-2">
                          <Checkbox
                            className="border border-yellow-500"
                            id={`${skill.name}-acquired-${level}`}
                            checked={skill.acquiredLevels.includes(level)}
                            onCheckedChange={(checked) => updateAcquiredLevels(skill.name, level, checked as boolean)}
                          />
                          <Label htmlFor={`${skill.name}-acquired-${level}`}>Niveau {level}</Label>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label className="mb-2 block text-purple-800">Niveaux requis</Label>
                      {[1, 2, 3, 4].map((level) => (
                        <div key={level} className="flex items-center space-x-2 mb-2">
                          <Checkbox 
                            className="border border-yellow-500"
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
              disabled={isAnalyzeDisabled || selectedSkills.length === 0 || selectedSkills.some((s) => s.acquiredLevels.length === 0 || s.requiredLevels.length === 0)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2 text-yellow-400" />
              Analyser
            </Button>
            {hasAnalyzed && (
              <Button 
                variant="outline" 
                onClick={resetAnalysis} 
                disabled={!isAnalyzeDisabled}
                className="bg-yellow-500"
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {hasAnalyzed && (
        <Card className="bg-gray-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-yellow-500">Résultats de l'analyse ({analysisType === "union" ? "Union" : "Intersection"})</CardTitle>
                <p className="text-sm text-gray-600">
                  {analysisType === "union" 
                    ? "Employés correspondant à au moins une compétence sélectionnée" 
                    : "Employés correspondant à toutes les compétences sélectionnées"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-purple-800">{analysisResults.length} résultat(s)</Badge>
                {analysisResults.length > 0 && (
                  <Button className="bg-purple-800 text-white" variant="outline" size="sm" onClick={handleDownloadExcel}>
                    <Download className="h-4 w-4 mr-2 text-yellow-300" />
                    Télécharger (Excel)
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analysisResults.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table className="bg-white w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-purple-800">Employé</TableHead>
                      <TableHead className="text-purple-800">Poste</TableHead>
                      <TableHead className="text-purple-800">Département</TableHead>
                      {selectedSkills.map((skill) => (
                        <TableHead className="text-yellow-500" key={skill.name}>{skill.name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentResults.map((result) => (
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
                                  Requis: {skill.requiredLevel || "N/A"}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="text-sm text-gray-600 text-center md:text-left">
                      Affichage de {indexOfFirstResult + 1} à{" "}
                      {Math.min(indexOfLastResult, analysisResults.length)} sur {analysisResults.length} résultats
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 md:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Précédent
                      </Button>
                      {(() => {
                        const pages: React.ReactNode[] = [];
                        const showPages: (number | "start-ellipsis" | "end-ellipsis")[] = [1];
                        if (currentPage > 3) showPages.push("start-ellipsis");
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                          if (i > 1 && i < totalPages) showPages.push(i);
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
                        return <>{pages}</>;
                      })()}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Suivant
                      </Button>
                    </div>
                  </div>
                )}
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