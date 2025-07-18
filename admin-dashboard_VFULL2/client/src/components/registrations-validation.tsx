"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Button } from "./ui/button.tsx"
import { Card, CardContent } from "./ui/card.tsx"
import { Badge } from "./ui/badge.tsx"
import { Alert, AlertDescription } from "./ui/alert.tsx"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs.tsx"
import { Input } from "./ui/input.tsx"
import { Separator } from "./ui/separator.tsx"
import { useToast } from "../hooks/use-toast.ts"
import {
  Check,
  X,
  Mail,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  GraduationCap,
  Users,
  Search,
  User,
} from "lucide-react"

interface Registration {
  id: number
  user: { id: number; name: string; email: string }
  CycleProgram: { id: number; title: string; type: "cycle" | "program" }
  status: "accepted" | "rejected" | "pending"
  modules: { id: string; title: string; status: "accepted" | "rejected" | "pending" }[]
}

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

const StatusIndicator = ({ status }: { status: "accepted" | "rejected" | "pending" }) => {
  const config = {
    accepted: {
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50",
      icon: CheckCircle2,
      label: "Accepté",
    },
    rejected: {
      color: "bg-rose-500",
      textColor: "text-rose-700",
      bgColor: "bg-rose-50",
      icon: XCircle,
      label: "Rejeté",
    },
    pending: {
      color: "bg-amber-500",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50",
      icon: Clock,
      label: "En attente",
    },
  }

  const { color, textColor, bgColor, icon: Icon, label } = config[status]

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgColor}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`}></div>
      <Icon className={`w-3.5 h-3.5 ${textColor}`} />
      <span className={`text-xs font-medium ${textColor}`}>{label}</span>
    </div>
  )
}

const LoadingCard = () => (
  <Card className="overflow-hidden bg-white/70 backdrop-blur-sm">
    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse"></div>
    <CardContent className="p-4 space-y-3">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
        <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
      </div>
    </CardContent>
  </Card>
)

const RegistrationCard = ({ registration, isProcessing, onUpdateStatus, onModuleStatus }: any) => {
  return (
    <Card className="group overflow-hidden bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
      <div
        className={`h-1 ${registration.CycleProgram.type === "cycle"
            ? "bg-gradient-to-r from-blue-800 to-blue-400"
            : "bg-gradient-to-r from-green-800 to-green-500"
          }`}
      ></div>

      <CardContent className="p-4 space-y-4">
        <div className="bg-gray-50/80 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {registration.user.name}
              </h3>
            </div>
            <StatusIndicator status={registration.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 ml-6">
            <Mail className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{registration.user.email}</span>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {registration.CycleProgram.type === "cycle" ? (
                <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
              ) : (
                <BookOpen className="w-4 h-4 text-green-600 flex-shrink-0" />
              )}
              <span className="font-medium text-gray-900 truncate">{registration.CycleProgram.title}</span>
            </div>
            <Badge
              variant="outline"
              className={`text-xs flex-shrink-0 ${registration.CycleProgram.type === "cycle"
                  ? "border-blue-200 text-blue-700 bg-blue-50"
                  : "border-green-200 text-green-700 bg-green-50"
                }`}
            >
              {registration.CycleProgram.type === "cycle" ? "Cycle" : "Programme"}
            </Badge>
          </div>

          {registration.CycleProgram.type === "program" && registration.modules.length > 0 && (
            <div className="bg-purple-50/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Modules</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {registration.modules.length}
                </Badge>
              </div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {registration.modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-2 bg-white/60 rounded-md">
                    <span className="text-xs text-gray-700 truncate flex-1 mr-2">{module.title}</span>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => onModuleStatus(registration.id, module.id, "accepted")}
                        disabled={module.status === "accepted" || isProcessing}
                        size="sm"
                        variant={module.status === "accepted" ? "secondary" : "default"}
                        className={`h-5 w-5 p-0 ${module.status === "accepted"
                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-100"
                            : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </Button>
                      <Button
                        onClick={() => onModuleStatus(registration.id, module.id, "rejected")}
                        disabled={module.status === "rejected" || isProcessing}
                        size="sm"
                        variant={module.status === "rejected" ? "secondary" : "destructive"}
                        className={`h-5 w-5 p-0 ${module.status === "rejected" ? "bg-rose-100 text-rose-600 hover:bg-rose-100" : ""
                          }`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onUpdateStatus(registration.id, "accepted")}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-200"
            size="sm"
          >
            <Check className="w-4 h-4 mr-1" />
            Accepter
          </Button>
          <Button
            onClick={() => onUpdateStatus(registration.id, "rejected")}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-rose-500/25 transition-all duration-200"
            size="sm"
          >
            <X className="w-4 h-4 mr-1" />
            Rejeter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export const RegistrationsValidation: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const stats = useMemo(() => {
    const cycles = registrations.filter((r) => r.CycleProgram.type === "cycle")
    const programs = registrations.filter((r) => r.CycleProgram.type === "program")
    return {
      total: registrations.length,
      cycles: cycles.length,
      programs: programs.length,
    }
  }, [registrations])

  const filteredRegistrations = useMemo(() => {
    let filtered = registrations
    if (activeTab === "cycles") {
      filtered = filtered.filter((r) => r.CycleProgram.type === "cycle")
    } else if (activeTab === "programs") {
      filtered = filtered.filter((r) => r.CycleProgram.type === "program")
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.CycleProgram.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered
  }, [registrations, activeTab, searchTerm])

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Veuillez vous connecter.")
          setLoading(false)
          return
        }

        const response = await axios.get(`${API_BASE_URL}/api/cycles-programs/pending-registrations`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        setRegistrations(response.data)
        setLoading(false)
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors de la récupération des inscriptions.")
        setLoading(false)
      }
    }

    fetchRegistrations()
  }, [])

  const handleUpdateStatus = async (
    registrationId: number,
    status: "accepted" | "rejected" | "pending"
  ) => {
    setProcessingIds((prev) => new Set(prev).add(registrationId))

    try {
      const token = localStorage.getItem("token")
      await axios.put(
        `${API_BASE_URL}/api/cycles-programs/registrations/${registrationId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setRegistrations((prev) => prev.filter((reg) => reg.id !== registrationId))

      toast({
        title: status === "accepted" ? "✅ Inscription acceptée" : "❌ Inscription rejetée",
        description: `L'inscription a été ${status === "accepted" ? "acceptée" : "rejetée"} avec succès.`,
      })
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Erreur lors de la mise à jour du statut.",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(registrationId)
        return newSet
      })
    }
  }

  const handleProgramModuleStatus = async (
    registrationId: number,
    moduleId: string,
    status: "accepted" | "rejected" | "pending"
  ) => {
    setProcessingIds((prev) => new Set(prev).add(registrationId))

    try {
      const registration = registrations.find((reg) => reg.id === registrationId)
      if (!registration) return

      const updatedModuleStatuses = registration.modules.map((mod) => ({
        module_id: mod.id,
        status: mod.id === moduleId ? status : mod.status,
      }))

      const token = localStorage.getItem("token")
      await axios.put(
        `${API_BASE_URL}/api/cycles-programs/registrations/${registrationId}/status`,
        { status: registration.status, moduleStatuses: updatedModuleStatuses },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId
            ? {
              ...reg,
              modules: reg.modules.map((mod) =>
                mod.id === moduleId ? { ...mod, status } : mod
              ),
              status: updatedModuleStatuses.every((mod) => mod.status === "accepted")
                ? "accepted"
                : updatedModuleStatuses.every((mod) => mod.status === "rejected")
                  ? "rejected"
                  : "pending",
            }
            : reg
        )
      )

      toast({
        title: status === "accepted" ? "✅ Module accepté" : "❌ Module rejeté",
        description: `Le module a été ${status === "accepted" ? "accepté" : "rejeté"} avec succès.`,
      })
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Erreur lors de la mise à jour du statut du module.",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(registrationId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (registrations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Tout est à jour !</h3>
            <p className="text-gray-600">Aucune inscription en attente de validation.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Validation des Inscriptions
                </h1>
              </div>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher par nom, email ou formation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-white/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-white/20 p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold"
            >
              Toutes ({stats.total})
            </TabsTrigger>
            <TabsTrigger
              value="cycles"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-blue-600 data-[state=active]:text-white font-semibold"
            >
              Cycles ({stats.cycles})
            </TabsTrigger>
            <TabsTrigger
              value="programs"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-green-600 data-[state=active]:text-white font-semibold"
            >
              Programmes ({stats.programs})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRegistrations.map((registration) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                  isProcessing={processingIds.has(registration.id)}
                  onUpdateStatus={handleUpdateStatus}
                  onModuleStatus={handleProgramModuleStatus}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cycles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRegistrations.map((registration) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                  isProcessing={processingIds.has(registration.id)}
                  onUpdateStatus={handleUpdateStatus}
                  onModuleStatus={handleProgramModuleStatus}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRegistrations.map((registration) => (
                <RegistrationCard
                  key={registration.id}
                  registration={registration}
                  isProcessing={processingIds.has(registration.id)}
                  onUpdateStatus={handleUpdateStatus}
                  onModuleStatus={handleProgramModuleStatus}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredRegistrations.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche.</p>
          </div>
        )}
      </div>
    </div>
  )
}