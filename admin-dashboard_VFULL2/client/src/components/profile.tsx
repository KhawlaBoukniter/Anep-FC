"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEmployee } from "../hooks/useEmployees";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button.tsx";
import { ArrowLeft, Shield, User } from "lucide-react";
import CompetencesByLevel from "./CompetencesByLevel.tsx";
import { Employee } from "../types/employee.ts";

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading, error } = useEmployee(id);

  const getRoleColor = (role: string) => {
    return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Erreur: Employé non trouvé</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => navigate("/employees")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la liste
      </Button>
      
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{employee.nom_complet}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="font-medium text-gray-700">Emplois:</span>
              <p className="text-gray-600">
                {(employee.emplois || []).map((e) => e.nom_emploi).join(", ") || "-"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <p className="text-gray-600">{employee.email || "-"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Téléphone 1:</span>
              <p className="text-gray-600">{employee.telephone1 || "-"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Téléphone 2:</span>
              <p className="text-gray-600">{employee.telephone2 || "-"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Adresse:</span>
              <p className="text-gray-600">{employee.adresse || "-"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date de Recrutement:</span>
              <p className="text-gray-600">
                {employee.date_recrutement
                  ? new Date(employee.date_recrutement).toLocaleDateString("fr-FR")
                  : "-"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date de Naissance:</span>
              <p className="text-gray-600">
                {employee.date_naissance
                  ? new Date(employee.date_naissance).toLocaleDateString("fr-FR")
                  : "-"}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">CIN:</span>
              <p className="text-gray-600">{employee.cin || "-"}</p>
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
              <p className="text-gray-600">{employee.categorie || "-"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Spécialité:</span>
              <p className="text-gray-600">{employee.specialite || "-"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Expérience:</span>
              <p className="text-gray-600">{employee.experience_employe || "-"} ans</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Statut:</span>
              <Badge variant={employee.archived ? "destructive" : "success"}>
                {employee.archived ? "Archivé" : "Actif"}
              </Badge>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-gray-700 block mb-2">Compétences:</span>
            {(employee.competences && employee.competences.length > 0) ? (
              <CompetencesByLevel competences={employee.competences} />
            ) : (
              <span className="text-gray-400 italic">Aucune compétence</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}