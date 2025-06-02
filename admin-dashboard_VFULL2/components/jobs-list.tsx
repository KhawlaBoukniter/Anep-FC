"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, Filter, Briefcase, TrendingUp, Award } from "lucide-react"
import { AddJobModal } from "@/components/add-job-modal"
import { EditJobModal } from "@/components/edit-job-modal"
import { DeleteJobModal } from "@/components/delete-job-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

const mockJobs: Job[] = [
  {
    id: "1",
    entite: "Département IT",
    formation: "Master en Informatique",
    experience: "3-5 ans",
    codeEmploi: "DEV-001",
    poidEmploi: "85%",
    requiredSkills: [
      { name: "Programmation", level: 4, icon: "💻" },
      { name: "Gestion d'équipe", level: 2, icon: "👥" },
      { name: "Langues étrangères", level: 3, icon: "🌍" },
    ],
  },
  {
    id: "2",
    entite: "Département Design",
    formation: "Master en Design",
    experience: "2-4 ans",
    codeEmploi: "DES-002",
    poidEmploi: "90%",
    requiredSkills: [
      { name: "Design", level: 4, icon: "🎨" },
      { name: "Rédaction", level: 3, icon: "✏️" },
      { name: "Communication", level: 3, icon: "💬" },
    ],
  },
  {
    id: "3",
    entite: "Département Management",
    formation: "MBA ou équivalent",
    experience: "5+ ans",
    codeEmploi: "MAN-003",
    poidEmploi: "100%",
    requiredSkills: [
      { name: "Gestion d'équipe", level: 4, icon: "👥" },
      { name: "Communication", level: 4, icon: "💬" },
      { name: "Stratégie", level: 3, icon: "🎯" },
    ],
  },
  {
    id: "4",
    entite: "Département Marketing",
    formation: "Master Marketing Digital",
    experience: "1-3 ans",
    codeEmploi: "MKT-004",
    poidEmploi: "75%",
    requiredSkills: [
      { name: "Marketing", level: 3, icon: "📊" },
      { name: "Analyse de données", level: 2, icon: "📈" },
      { name: "Communication", level: 3, icon: "💬" },
    ],
  },
  {
    id: "5",
    entite: "Département IT",
    formation: "BTS Informatique",
    experience: "1-2 ans",
    codeEmploi: "DEV-005",
    poidEmploi: "60%",
    requiredSkills: [
      { name: "Programmation", level: 2, icon: "💻" },
      { name: "Langues étrangères", level: 1, icon: "🌍" },
    ],
  },
  {
    id: "6",
    entite: "Département RH",
    formation: "Master RH",
    experience: "3-4 ans",
    codeEmploi: "RH-006",
    poidEmploi: "80%",
    requiredSkills: [
      { name: "Gestion d'équipe", level: 3, icon: "👥" },
      { name: "Communication", level: 4, icon: "💬" },
      { name: "Rédaction", level: 3, icon: "✏️" },
    ],
  },
]

export function JobsList() {
  const [jobs] = useState<Job[]>(mockJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEntite, setFilterEntite] = useState("all")

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.entite.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.codeEmploi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.formation.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEntite = filterEntite === "all" || job.entite === filterEntite

    return matchesSearch && matchesEntite
  })

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

  const getLevelText = (level: number) => {
    switch (level) {
      case 1:
        return "Débutant"
      case 2:
        return "Intermédiaire"
      case 3:
        return "Avancé"
      case 4:
        return "Expert"
      default:
        return "Non défini"
    }
  }

  const getEntiteColor = (entite: string) => {
    const colors = {
      "Département IT": "bg-blue-100 text-blue-800",
      "Département Design": "bg-purple-100 text-purple-800",
      "Département Management": "bg-indigo-100 text-indigo-800",
      "Département Marketing": "bg-pink-100 text-pink-800",
      "Département RH": "bg-teal-100 text-teal-800",
    }
    return colors[entite as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const stats = {
    total: jobs.length,
    entites: new Set(jobs.map((j) => j.entite)).size,
    competencesTotal: jobs.reduce((acc, job) => acc + job.requiredSkills.length, 0),
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* En-tête avec statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Emplois</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Entités</p>
                  <p className="text-2xl font-bold">{stats.entites}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compétences</p>
                  <p className="text-2xl font-bold">{stats.competencesTotal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de recherche et filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par entité, code ou formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={filterEntite} onValueChange={setFilterEntite}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Entité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les entités</SelectItem>
                    <SelectItem value="Département IT">Département IT</SelectItem>
                    <SelectItem value="Département Design">Département Design</SelectItem>
                    <SelectItem value="Département Management">Département Management</SelectItem>
                    <SelectItem value="Département Marketing">Département Marketing</SelectItem>
                    <SelectItem value="Département RH">Département RH</SelectItem>
                  </SelectContent>
                </Select>

                <AddJobModal />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tableau des emplois */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Liste des Emplois</CardTitle>
              <Badge variant="secondary">{filteredJobs.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Entité</TableHead>
                    <TableHead>Formation</TableHead>
                    <TableHead>Expérience</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{job.codeEmploi}</TableCell>
                      <TableCell>
                        <Badge className={getEntiteColor(job.entite)} variant="secondary">
                          {job.entite}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{job.formation}</TableCell>
                      <TableCell className="text-gray-600">{job.experience}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {job.entite} - {job.codeEmploi}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6 pr-2">
                                    {/* Informations générales */}
                                    <div>
                                      <h4 className="font-medium mb-3 text-gray-900">Informations générales</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-700">Code emploi:</span>
                                          <p className="text-gray-600">{job.codeEmploi}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Entité:</span>
                                          <Badge className={getEntiteColor(job.entite)} variant="secondary">
                                            {job.entite}
                                          </Badge>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Formation requise:</span>
                                          <p className="text-gray-600">{job.formation}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Expérience:</span>
                                          <p className="text-gray-600">{job.experience}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Poids emploi:</span>
                                          <p className="text-gray-600">{job.poidEmploi}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Compétences requises */}
                                    <div>
                                      <h4 className="font-medium mb-3 text-gray-900">
                                        Compétences requises ({job.requiredSkills.length})
                                      </h4>
                                      <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {job.requiredSkills.map((skill, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                          >
                                            <div className="flex items-center gap-3">
                                              <span className="text-xl">{skill.icon}</span>
                                              <span className="font-medium">{skill.name}</span>
                                            </div>
                                            <Badge className={getLevelColor(skill.level)}>Niveau {skill.level}</Badge>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Voir les détails</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <EditJobModal job={job} />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Modifier l'emploi</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DeleteJobModal jobId={job.id} jobCode={job.codeEmploi} />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Supprimer l'emploi</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun emploi trouvé</h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche ou d'ajouter un nouvel emploi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
