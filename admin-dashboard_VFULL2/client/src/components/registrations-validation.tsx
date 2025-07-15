// components/registrations-validation.tsx

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button.tsx";
import { Check, X } from "lucide-react";

interface Registration {
  id: number;
  user: { id: number; name: string; email: string };
  CycleProgram: { id: number; title: string; type: "cycle" | "program" };
  status: "accepted" | "rejected" | "pending";
  modules: { id: string; title: string; status: "accepted" | "rejected" | "pending" }[];
}

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const RegistrationsValidation: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Veuillez vous connecter.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/cycles-programs/pending-registrations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRegistrations(response.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || "Erreur lors de la récupération des inscriptions.");
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  const handleUpdateStatus = async (registrationId: number, status: "accepted" | "rejected", moduleStatuses?: { module_id: string; status: "accepted" | "rejected" | "pending" }[]) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_BASE_URL}/api/cycles-programs/registrations/${registrationId}/status`,
        { status, moduleStatuses },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRegistrations((prev) =>
        prev.filter((reg) => reg.id !== registrationId)
      );
      alert(`Inscription ${status === "accepted" ? "acceptée" : "rejetée"} avec succès.`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la mise à jour du statut.");
    }
  };

  const handleProgramModuleStatus = async (registrationId: number, moduleId: string, status: "accepted" | "rejected") => {
    const registration = registrations.find((reg) => reg.id === registrationId);
    if (!registration) return;

    const updatedModuleStatuses = registration.modules.map((mod) => ({
      module_id: mod.id,
      status: mod.id === moduleId ? status : mod.status,
    }));

    await handleUpdateStatus(registrationId, registration.status, updatedModuleStatuses);
  };

  if (loading) return <div className="text-center py-16">Chargement...</div>;
  if (error) return <div className="text-center text-red-600 py-16">{error}</div>;
  if (registrations.length === 0) return <div className="text-center py-16">Aucune inscription en attente.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Validation des Inscriptions</h2>
      <div className="grid grid-cols-1 gap-6">
        {registrations.map((registration) => (
          <div key={registration.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{registration.CycleProgram.title}</h3>
                <p className="text-gray-600">Type: {registration.CycleProgram.type === "cycle" ? "Cycle" : "Programme"}</p>
                <p className="text-gray-600">Utilisateur: {registration.user.name} ({registration.user.email})</p>
                <p className="text-gray-600">Statut: {registration.status}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleUpdateStatus(registration.id, "accepted")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="mr-2" /> Accepter
                </Button>
                <Button
                  onClick={() => handleUpdateStatus(registration.id, "rejected")}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <X className="mr-2" /> Rejeter
                </Button>
              </div>
            </div>
            {registration.CycleProgram.type === "program" && registration.modules.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-2">Modules</h4>
                <div className="space-y-2">
                  {registration.modules.map((module) => (
                    <div key={module.id} className="flex justify-between items-center">
                      <span>{module.title} (Statut: {module.status})</span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleProgramModuleStatus(registration.id, module.id, "accepted")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={module.status === "accepted"}
                        >
                          Accepter
                        </Button>
                        <Button
                          onClick={() => handleProgramModuleStatus(registration.id, module.id, "rejected")}
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={module.status === "rejected"}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};