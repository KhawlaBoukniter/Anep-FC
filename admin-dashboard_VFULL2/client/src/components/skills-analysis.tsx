"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { BarChart3, Users, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Input } from "./ui/input"

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

interface AnalysisResult {
  employee: Employee
  currentLevel: number | null
  gap: number
  hasSkill: boolean
}

// Données mockées des employés (même que dans employees-list)
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
      { name: "Programmation", level: 4, icon: "💻" },
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

export function SkillsAnalysis() {
  const [selectedSkill, setSelectedSkill] = useState("")
  const [requiredLevel, setRequiredLevel] = useState<number>(1)
  const [useGapFilter, setUseGapFilter] = useState(false)
  const [specificGap, setSpecificGap] = useState<number>(1)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)
  const [openSkillPopover, setOpenSkillPopover] = useState(false)

  const analyzeSkill = () => {
    if (!selectedSkill) return

    const results: AnalysisResult[] = mockEmployees.map((employee) => {
      const skill = employee.skills.find((s) => s.name.toLowerCase() === selectedSkill.toLowerCase())
      const currentLevel = skill ? skill.level : null
      const gap = currentLevel ? requiredLevel - currentLevel : requiredLevel

      return {
        employee,
        currentLevel,
        gap,
        hasSkill: !!skill,
      }
    })

    // Filtrer selon les critères
    let filteredResults = results

    if (useGapFilter) {
      // Afficher seulement les employés avec l'écart spécifique
      filteredResults = results.filter((result) => result.gap === specificGap)
    } else {
      // Afficher tous les employés qui ont besoin de formation (gap > 0 ou n'ont pas la compétence)
      filteredResults = results.filter((result) => result.gap > 0 || !result.hasSkill)
    }

    setAnalysisResults(filteredResults)
    setHasAnalyzed(true)
  }

  const resetAnalysis = () => {
    setSelectedSkill("")
    setRequiredLevel(1)
    setUseGapFilter(false)
    setSpecificGap(1)
    setAnalysisResults([])
    setHasAnalyzed(false)
  }

  const getLevelColor = (level: number) => {
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

  const getGapColor = (gap: number) => {
    if (gap <= 0) return "bg-green-100 text-green-800"
    if (gap === 1) return "bg-yellow-100 text-yellow-800"
    if (gap === 2) return "bg-orange-100 text-orange-800"
    return "bg-red-100 text-red-800"
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

  const selectedSkillIcon = availableSkills.find((skill) => skill.name === selectedSkill)?.icon || "⭐"

  const stats = hasAnalyzed
    ? {
        total: analysisResults.length,
        needTraining: analysisResults.filter((r) => r.gap > 0 || !r.hasSkill).length,
        hasSkill: analysisResults.filter((r) => r.hasSkill).length,
        noSkill: analysisResults.filter((r) => !r.hasSkill).length,
      }
    : { total: 0, needTraining: 0, hasSkill: 0, noSkill: 0 }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Analyse des Compétences</CardTitle>
              <p className="text-sm text-gray-600">
                Analysez les écarts de compétences et identifiez les besoins de formation
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Formulaire d'analyse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paramètres d'Analyse</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sélection de compétence */}
            <div className="space-y-2">
              <Label>Compétence à analyser</Label>
              <Popover open={openSkillPopover} onOpenChange={setOpenSkillPopover}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      placeholder="Rechercher une compétence..."
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
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
                          .filter((skill) => skill.name.toLowerCase().includes(selectedSkill.toLowerCase()))
                          .map((skill) => (
                            <CommandItem
                              key={skill.name}
                              onSelect={() => {
                                setSelectedSkill(skill.name)
                                setOpenSkillPopover(false)
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
            </div>

            {/* Niveau requis */}
            <div className="space-y-2">
              <Label>Niveau requis</Label>
              <Select value={requiredLevel.toString()} onValueChange={(value) => setRequiredLevel(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Niveau 1</SelectItem>
                  <SelectItem value="2">Niveau 2</SelectItem>
                  <SelectItem value="3">Niveau 3</SelectItem>
                  <SelectItem value="4">Niveau 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options de filtrage */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useGapFilter"
                checked={useGapFilter}
                onChange={(e) => setUseGapFilter(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="useGapFilter">Filtrer par écart spécifique</Label>
            </div>

            {useGapFilter && (
              <div className="ml-6 space-y-2">
                <Label>Écart de niveau spécifique</Label>
                <Select value={specificGap.toString()} onValueChange={(value) => setSpecificGap(Number(value))}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Écart de 1 niveau</SelectItem>
                    <SelectItem value="2">Écart de 2 niveaux</SelectItem>
                    <SelectItem value="3">Écart de 3 niveaux</SelectItem>
                    <SelectItem value="4">Écart de 4 niveaux</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  Affiche uniquement les employés avec exactement cet écart de niveau
                </p>
              </div>
            )}

            {!useGapFilter && (
              <p className="text-sm text-gray-600 ml-6">
                Affiche tous les employés qui ont besoin de formation (niveau insuffisant ou compétence manquante)
              </p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3">
            <Button onClick={analyzeSkill} disabled={!selectedSkill} className="bg-purple-600 hover:bg-purple-700">
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

      {/* Statistiques */}
      {hasAnalyzed && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employés analysés</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Besoin formation</p>
                  <p className="text-2xl font-bold">{stats.needTraining}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ont la compétence</p>
                  <p className="text-2xl font-bold">{stats.hasSkill}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sans la compétence</p>
                  <p className="text-2xl font-bold">{stats.noSkill}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Résultats */}
      {hasAnalyzed && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedSkillIcon}</span>
                <div>
                  <CardTitle className="text-lg">
                    Analyse: {selectedSkill} (Niveau requis: {requiredLevel})
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {useGapFilter
                      ? `Employés avec un écart de ${specificGap} niveau(x)`
                      : "Employés ayant besoin de formation"}
                  </p>
                </div>
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
                      <TableHead>Niveau actuel</TableHead>
                      <TableHead>Niveau requis</TableHead>
                      <TableHead>Écart</TableHead>
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
                        <TableCell>
                          {result.currentLevel ? (
                            <Badge className={getLevelColor(result.currentLevel)}>Niveau {result.currentLevel}</Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              Non acquise
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(requiredLevel)}>Niveau {requiredLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGapColor(result.gap)}>
                            {result.gap > 0 ? `+${result.gap}` : result.gap === 0 ? "0" : result.gap}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun employé trouvé</h3>
                <p className="text-gray-600">
                  {useGapFilter
                    ? `Aucun employé n'a un écart de ${specificGap} niveau(x) pour cette compétence.`
                    : "Tous les employés ont le niveau requis pour cette compétence."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
