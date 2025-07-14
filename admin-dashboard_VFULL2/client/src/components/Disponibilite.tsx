"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface AvailabilitySlot {
  id: number
  date: string
  startTime: string
  endTime: string
  status: "confirmed" | "pending" | "available"
  project: string
  location: string
  bookedBy?: string
}

const availabilityData: AvailabilitySlot[] = [
  {
    id: 1,
    date: "2025-07-15",
    startTime: "09:00",
    endTime: "12:00",
    status: "confirmed",
    project: "Projet Alpha",
    location: "Bureau Paris",
    bookedBy: "Jean Dupont",
  },
  {
    id: 2,
    date: "2025-07-16",
    startTime: "14:00",
    endTime: "17:00",
    status: "pending",
    project: "Projet Beta",
    location: "Télétravail",
  },
  {
    id: 3,
    date: "2025-07-17",
    startTime: "10:00",
    endTime: "13:00",
    status: "available",
    project: "Aucun",
    location: "Bureau Lyon",
  },
]

const Disponibilite: React.FC = () => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(availabilityData)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"toutes" | "confirmed" | "pending" | "available">("toutes")

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Confirmé</span>
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">En attente</span>
      case "available":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Disponible</span>
      default:
        return null
    }
  }

  const getFilteredSlots = () => {
    switch (selectedTab) {
      case "confirmed":
        return slots.filter((s) => s.status === "confirmed")
      case "pending":
        return slots.filter((s) => s.status === "pending")
      case "available":
        return slots.filter((s) => s.status === "available")
      default:
        return slots
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const totalSlots = slots.length
  const confirmedSlots = slots.filter((s) => s.status === "confirmed").length
  const pendingSlots = slots.filter((s) => s.status === "pending").length
  const availableSlots = slots.filter((s) => s.status === "available").length

  return (
    <div className="min-h-screen bg-gray-50">
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
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Mes Disponibilités</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Gérez vos créneaux horaires et suivez vos réservations</p>
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
            <div className="text-center p-6 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{confirmedSlots}</div>
              <div className="text-sm opacity-90">Confirmés</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{pendingSlots}</div>
              <div className="text-sm opacity-90">En attente</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl">
              <div className="text-3xl font-bold mb-2">{availableSlots}</div>
              <div className="text-sm opacity-90">Disponibles</div>
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
              onClick={() => setSelectedTab("confirmed")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedTab === "confirmed"
                  ? "bg-[#06668C] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Confirmés ({confirmedSlots})
            </button>
            <button
              onClick={() => setSelectedTab("pending")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedTab === "pending"
                  ? "bg-[#06668C] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              En attente ({pendingSlots})
            </button>
            <button
              onClick={() => setSelectedTab("available")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedTab === "available"
                  ? "bg-[#06668C] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Disponibles ({availableSlots})
            </button>
          </div>
        </div>
      </section>

      {/* Availability List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {getFilteredSlots().length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucun créneau trouvé</h3>
              <p className="text-gray-600 mb-8">
                {selectedTab === "toutes"
                  ? "Vous n'avez aucun créneau de disponibilité pour le moment."
                  : `Aucun créneau ${selectedTab === "confirmed" ? "confirmé" : selectedTab === "pending" ? "en attente" : "disponible"} trouvé.`}
              </p>
              <button className="bg-[#06668C] text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Ajouter un créneau
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {getFilteredSlots().map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {formatDate(slot.date)} {slot.startTime} - {slot.endTime}
                      </h3>
                      {getStatusBadge(slot.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Projet:</span>
                        <div className="font-medium">{slot.project}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Lieu:</span>
                        <div className="font-medium">{slot.location}</div>
                      </div>
                      {slot.bookedBy && (
                        <div>
                          <span className="text-gray-500">Réservé par:</span>
                          <div className="font-medium">{slot.bookedBy}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {slot.status === "available" ? (
                        <button
                          className="w-full bg-gradient-to-r from-[#06668C] to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                        >
                          Réserver ce créneau
                        </button>
                      ) : (
                        <>
                          <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300">
                            Détails
                          </button>
                          <button className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#06668C] hover:text-[#06668C] transition-colors duration-300">
                            ✏️
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Disponibilite