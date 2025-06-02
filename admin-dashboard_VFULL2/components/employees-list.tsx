"use client"

import { CommandItem } from "@/components/ui/command"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Search, Filter, Users, Award, MapPin, User, Shield, X } from "lucide-react"
import { AddEmployeeModal } from "@/components/add-employee-modal"
import { EditEmployeeModal } from "@/components/edit-employee-modal"
import { DeleteEmployeeModal } from "@/components/delete-employee-modal"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

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

export function EmployeesList() {
  const [employees] = useState<Employee[]>(mockEmployees)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEmploi, setFilterEmploi] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [openEmploiPopover, setOpenEmploiPopover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Base de données des emplois disponibles (simulée)
  const availableJobs = [
    { code: "DEV-001", title: "Développeur - DEV001", description: "Développeur Full Stack" },
    { code: "DEV-002", title: "Développeur Senior - DEV002", description: "Développeur Senior" },
    { code: "DEV-003", title: "Développeur Frontend - DEV003", description: "Développeur Frontend" },
    { code: "DES-001", title: "Designer - DES001", description: "Designer UX/UI" },
    { code: "DES-002", title: "Designer UX/UI - DES002", description: "Designer UX/UI" },
    { code: "MAN-001", title: "Manager - MAN001", description: "Chef de Projet" },
    { code: "MAN-002", title: "Chef de Projet - MAN002", description: "Chef de Projet" },
    { code: "MKT-001", title: "Marketing - MKT001", description: "Analyste Marketing" },
    { code: "MKT-002", title: "Analyste Marketing - MKT002", description: "Analyste Marketing" },
    { code: "RH-001", title: "RH - RH001", description: "Responsable RH" },
    { code: "RH-002", title: "Responsable RH - RH002", description: "Responsable RH" },
  ]

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.poste.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEmploi = !filterEmploi || employee.poste.toLowerCase().includes(filterEmploi.toLowerCase())
    const matchesRole = filterRole === "all" || employee.role === filterRole

    return matchesSearch && matchesEmploi && matchesRole
  })

  const selectEmploi = (emploi: string) => {
    setFilterEmploi(emploi)
    setOpenEmploiPopover(false)
  }

  const clearEmploiFilter = () => {
    setFilterEmploi("")
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

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
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

  const stats = {
    total: employees.length,
    admins: employees.filter((e) => e.role === "admin").length,
    emplois: new Set(employees.map((e) => e.poste)).size,
    competencesTotal: employees.reduce((acc, emp) => acc + emp.skills.length, 0),
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
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Employés</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Administrateurs</p>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Emplois</p>
                  <p className="text-2xl font-bold">{stats.emplois}</p>
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
                  placeholder="Rechercher par nom, poste ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                {/* Filtre par emploi avec recherche */}
                <div className="relative">
                  <Popover open={openEmploiPopover} onOpenChange={setOpenEmploiPopover}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          placeholder="Filtrer par emploi..."
                          value={filterEmploi}
                          onChange={(e) => setFilterEmploi(e.target.value)}
                          onFocus={() => setOpenEmploiPopover(true)}
                          className="w-48 pl-8 pr-8 cursor-text"
                        />
                        <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        {filterEmploi && (
                          <X
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 cursor-pointer hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              clearEmploiFilter()
                            }}
                          />
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="p-0" align="start" side="bottom" sideOffset={5}>
                      <Command>
                        <CommandInput placeholder="Rechercher un emploi..." />
                        <CommandList>
                          <CommandEmpty>Aucun emploi trouvé.</CommandEmpty>
                          <CommandGroup>
                            {availableJobs
                              .filter(
                                (job) =>
                                  job.title.toLowerCase().includes(filterEmploi.toLowerCase()) ||
                                  job.description.toLowerCase().includes(filterEmploi.toLowerCase()) ||
                                  job.code.toLowerCase().includes(filterEmploi.toLowerCase()),
                              )
                              .map((job) => (
                                <CommandItem
                                  key={job.code}
                                  onSelect={() => {
                                    selectEmploi(job.description)
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{job.title}</span>
                                    <span className="text-sm text-gray-500">{job.description}</span>
                                  </div>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>

                <AddEmployeeModal />
              </div>
            </div>

            {/* Affichage du filtre actif */}
            {filterEmploi && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">Filtre actif:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filterEmploi}
                  <X className="h-3 w-3 cursor-pointer hover:bg-gray-300 rounded" onClick={clearEmploiFilter} />
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tableau des employés */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Liste des Employés</CardTitle>
              <Badge variant="secondary">{filteredEmployees.length} résultat(s)</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {employee.prenom} {employee.nom}
                      </TableCell>
                      <TableCell>{employee.poste}</TableCell>
                      <TableCell className="text-gray-600">{employee.email}</TableCell>
                      <TableCell>
                        <Badge className={getDepartementColor(employee.departement)} variant="secondary">
                          {employee.departement}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(employee.role)} variant="secondary">
                          {employee.role === "admin" ? (
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              User
                            </div>
                          )}
                        </Badge>
                      </TableCell>
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
                                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>
                                      {employee.prenom} {employee.nom}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6 pr-2">
                                    {/* Informations personnelles */}
                                    <div>
                                      <h4 className="font-medium mb-3 text-gray-900">Informations personnelles</h4>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-700">Poste:</span>
                                          <p className="text-gray-600">{employee.poste}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Département:</span>
                                          <Badge
                                            className={getDepartementColor(employee.departement)}
                                            variant="secondary"
                                          >
                                            {employee.departement}
                                          </Badge>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Email:</span>
                                          <p className="text-gray-600">{employee.email}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Téléphone:</span>
                                          <p className="text-gray-600">{employee.telephone}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Date d'embauche:</span>
                                          <p className="text-gray-600">
                                            {new Date(employee.dateEmbauche).toLocaleDateString("fr-FR")}
                                          </p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Rôle:</span>
                                          <Badge className={getRoleColor(employee.role)} variant="secondary">
                                            {employee.role === "admin" ? (
                                              <div className="flex items-center gap-1">
                                                <Shield className="h-3 w-3" />
                                                Admin
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                User
                                              </div>
                                            )}
                                          </Badge>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Catégorie:</span>
                                          <p className="text-gray-600">{employee.categorie}</p>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Spécialité:</span>
                                          <p className="text-gray-600">{employee.specialite}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Compétences */}
                                    <div>
                                      <h4 className="font-medium mb-3 text-gray-900">
                                        Compétences ({employee.skills.length})
                                      </h4>
                                      <div className="space-y-3">
                                        {employee.skills.map((skill, index) => (
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
                              <EditEmployeeModal employee={employee} />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Modifier l'employé</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DeleteEmployeeModal
                                employeeId={employee.id}
                                employeeName={`${employee.prenom} ${employee.nom}`}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Supprimer l'employé</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredEmployees.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun employé trouvé</h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche ou d'ajouter un nouvel employé.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
