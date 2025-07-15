"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import Header from "./header.tsx"
import Footer from "./footer.tsx"

interface Indisponibilite {
  id_indisponibilite: number
  id_employe: number
  type_indisponibilite: "CONGE" | "REUNION_HEBDOMADAIRE" | "AUTRE"
  date_debut: string
  date_fin: string
  description: string | null
  created_at: string
  updated_at: string
  archived: boolean
}

interface NewIndisponibilite {
  type_indisponibilite: "CONGE" | "REUNION_HEBDOMADAIRE" | "AUTRE"
  date_debut: string
  date_fin: string
  description: string
}

const Disponibilite: React.FC = () => {
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"toutes" | "CONGE" | "REUNION_HEBDOMADAIRE" | "AUTRE">("toutes")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<NewIndisponibilite>({
    type_indisponibilite: "CONGE",
    date_debut: "",
    date_fin: "",
    description: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Assume user ID is obtained from authentication context (e.g., JWT token)
  const userId = 1 // Replace with actual user ID from auth context

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    fetchIndisponibilites()

    return () => clearTimeout(timer)
  }, [])

  const fetchIndisponibilites = async () => {
    try {
      const response = await fetch(`/api/indisponibilites?userId=${userId}`)
      if (!response.ok) throw new Error("Erreur lors du chargement des indisponibilités")
      const data = await response.json()
      setIndisponibilites(data)
    } catch (err) {
      setError("Impossible de charger les indisponibilités")
    }
  }

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validate date range
    if (new Date(formData.date_debut) >= new Date(formData.date_fin)) {
      setError("La date de fin doit être postérieure à la date de début")
      return
    }
    // Validate description for AUTRE type
    if (formData.type_indisponibilite === "AUTRE" && !formData.description.trim()) {
      setError("Une description est requise pour le type 'Autre'")
      return
    }

    try {
      const url = editingId ? `/api/indisponibilites/${editingId}` : "/api/indisponibilites"
      const method = editingId ? "PUT" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id_employe: userId }),
      })

      if (!response.ok) throw new Error("Erreur lors de l'enregistrement")
      await fetchIndisponibilites()
      setIsModalOpen(false)
      setFormData({ type_indisponibilite: "CONGE", date_debut: "", date_fin: "", description: "" })
      setEditingId(null)
      setError(null)
    } catch (err) {
      setError("Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const response = await fetch(`/api/indisponibilites/${deleteId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      await fetchIndisponibilites()
      setIsDeleteModalOpen(false)
      setDeleteId(null)
    } catch (err) {
      setError("Erreur lors de la suppression")
    }
  }

  const openDeleteModal = (id: number) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
  }

  const handleEdit = (indisponibilite: Indisponibilite) => {
    setFormData({
      type_indisponibilite: indisponibilite.type_indisponibilite,
      date_debut: indisponibilite.date_debut,
      date_fin: indisponibilite.date_fin,
      description: indisponibilite.description || "",
    })
    setEditingId(indisponibilite.id_indisponibilite)
    setIsModalOpen(true)
  }

  const getStatusBadge = (type: string) => {
    switch (type) {
      case "CONGE":
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Congé</span>
      case "REUNION_HEBDOMADAIRE":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            Réunion Hebdomadaire
          </span>
        )
      case "AUTRE":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Autre</span>
      default:
        return null
    }
  }

  const getFilteredIndisponibilites = () => {
    if (selectedTab === "toutes") return indisponibilites.filter((i) => !i.archived)
    return indisponibilites.filter((i) => i.type_indisponibilite === selectedTab && !i.archived)
  }

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), "dd MMMM yyyy HH:mm", { locale: fr })
  }

  const totalSlots = indisponibilites.filter((i) => !i.archived).length
  const congeSlots = indisponibilites.filter((i) => i.type_indisponibilite === "CONGE" && !i.archived).length
  const reunionSlots = indisponibilites.filter(
    (i) => i.type_indisponibilite === "REUNION_HEBDOMADAIRE" && !i.archived
  ).length
  const autreSlots = indisponibilites.filter((i) => i.type_indisponibilite === "AUTRE" && !i.archived).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-[#06668C] via-blue-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Mes Indisponibilités</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Gérez vos indisponibilités et suivez vos créneaux
            </p>
          </div>
        </div>
      </section>

      {/* Stats Dashboard */}
      <section className="py-12 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-[#06668C] to-blue-700 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{totalSlots}</div>
              <div className="text-sm opacity-90">Créneaux totaux</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{congeSlots}</div>
              <div className="text-sm opacity-90">Congés</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{reunionSlots}</div>
              <div className="text-sm opacity-90">Réunions</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{autreSlots}</div>
              <div className="text-sm opacity-90">Autres</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setSelectedTab("toutes")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedTab === "toutes"
                  ? "bg-[#06668C] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Toutes ({totalSlots})
            </button>
            <button
              onClick={() => setSelectedTab("CONGE")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedTab === "CONGE"
                  ? "bg-[#06668C] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Congés ({congeSlots})
            </button>
            <button
              onClick={() => setSelectedTab("REUNION_HEBDOMADAIRE")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedTab === "REUNION_HEBDOMADAIRE"
                  ? "bg-[#06668C] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Réunions ({reunionSlots})
            </button>
            <button
              onClick={() => setSelectedTab("AUTRE")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedTab === "AUTRE"
                  ? "bg-[#06668C] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Autres ({autreSlots})
            </button>
          </div>
        </div>
      </section>

      {/* Modal for Adding/Editing */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? "Modifier l'indisponibilité" : "Ajouter une indisponibilité"}
            </h2>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            <form onSubmit={handleAddOrUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type_indisponibilite}
                  onChange={(e) =>
                    setFormData({ ...formData, type_indisponibilite: e.target.value as any })
                  }
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="CONGE">Congé</option>
                  <option value="REUNION_HEBDOMADAIRE">Réunion Hebdomadaire</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date de début</label>
                <input
                  type="datetime-local"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Date de fin</label>
                <input
                  type="datetime-local"
                  value={formData.date_fin}
                  onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  Description {formData.type_indisponibilite === "AUTRE" && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  required={formData.type_indisponibilite === "AUTRE"}
                ></textarea>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    setError(null)
                    setEditingId(null)
                    setFormData({ type_indisponibilite: "CONGE", date_debut: "", date_fin: "", description: "" })
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#06668C] text-white py-3 px-4 rounded-lg hover:bg-blue-700"
                >
                  {editingId ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Confirmer la suppression</h2>
            <p className="text-gray-600 mb-6">
              Voulez-vous vraiment supprimer cette indisponibilité ?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indisponibilites List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-right">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#06668C] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Ajouter un créneau
            </button>
          </div>
          {getFilteredIndisponibilites().length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucune indisponibilité trouvée</h3>
              <p className="text-gray-600 mb-8">
                {selectedTab === "toutes"
                  ? "Vous n'avez aucune indisponibilité pour le moment."
                  : `Aucune indisponibilité de type ${
                      selectedTab === "CONGE"
                        ? "congé"
                        : selectedTab === "REUNION_HEBDOMADAIRE"
                        ? "réunion hebdomadaire"
                        : "autre"
                    } trouvée.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {getFilteredIndisponibilites().map((indisponibilite) => (
                <div
                  key={indisponibilite.id_indisponibilite}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {formatDateTime(indisponibilite.date_debut)} - {formatDateTime(indisponibilite.date_fin)}
                      </h3>
                      {getStatusBadge(indisponibilite.type_indisponibilite)}
                    </div>
                    <div className="grid grid-cols-1 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Description:</span>
                        <div className="font-medium">{indisponibilite.description || "Aucune"}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(indisponibilite)}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => openDeleteModal(indisponibilite.id_indisponibilite)}
                        className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-600 hover:text-red-600 transition-colors duration-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Disponibilite