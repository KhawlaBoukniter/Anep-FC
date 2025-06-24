"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEmployee } from "../hooks/useEmployees.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { Button } from "../components/ui/button.tsx";
import { ArrowLeft, User, Shield } from "lucide-react";
import CompetencesByLevel from "../components/CompetencesByLevel.tsx"; // Réutilisez ce composant

// Fonction pour formater les dates
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
};

export default function ProfilePage() {
    const { employeeId } = useParams<{ employeeId: string }>();
    const navigate = useNavigate();

    // Utilisez le hook useEmployee pour récupérer les données d'un seul employé
    const { data: employee, isLoading, isError, error } = useEmployee(employeeId);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Chargement du profil...</p>
            </div>
        );
    }

    if (isError || !employee) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-600">
                <p>Erreur: Impossible de charger le profil de l'employé.</p>
                <p className="text-sm text-gray-500">{error?.message || "Employé non trouvé."}</p>
                <Button onClick={() => navigate(-1)} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
            </div>
        );
    }

    const getRoleColor = (role: "user" | "admin") => {
        return role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800";
    };

    return (
        <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
            <header className="flex items-center justify-between mb-6">
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
                </Button>
                <Badge variant={employee.archived ? "destructive" : "secondary"}>
                    {employee.archived ? "Archivé" : "Actif"}
                </Badge>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne de gauche : Informations principales */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="w-24 h-24 rounded-full bg-indigo-200 mx-auto flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-indigo-700" />
                            </div>
                            <CardTitle className="text-2xl">{employee.nom_complet}</CardTitle>
                            <CardDescription>{employee.email}</CardDescription>
                            <Badge className={getRoleColor(employee.role)} variant="secondary">
                                {employee.role === "admin" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                                {employee.role === "admin" ? "Admin" : "Utilisateur"}
                            </Badge>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div><strong>CIN:</strong> <p className="text-gray-600">{employee.cin || "-"}</p></div>
                            <div><strong>Téléphone 1:</strong> <p className="text-gray-600">{employee.telephone1 || "-"}</p></div>
                            <div><strong>Téléphone 2:</strong> <p className="text-gray-600">{employee.telephone2 || "-"}</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne de droite : Détails et compétences */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Détails Professionnels</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong>Emplois:</strong>
                                <p className="text-gray-600">
                                    {[...new Set((employee.emplois || []).map((e) => e.nom_emploi))].join(", ") || "-"}
                                </p>
                            </div>
                            <div>
                                <strong>Direction:</strong>
                                <p className="text-gray-600">
                                    {[...new Set((employee.emplois || []).map((e) => e.entite))].join(", ") || "-"}
                                </p>
                            </div>
                            <div>
                                <strong>Statut:</strong>
                                <p className="text-gray-600">{employee.profile?.STATUT || "-"}</p>
                            </div>
                            <div>
                                <strong>Catégorie:</strong>
                                <p className="text-gray-600">{employee.categorie || "-"}</p>
                            </div>
                            <div>
                                <strong>Spécialité:</strong>
                                <p className="text-gray-600">{employee.specialite || "-"}</p>
                            </div>
                            <div>
                                <strong>Expérience:</strong>
                                <p className="text-gray-600">{employee.experience_employe || "-"} ans</p>
                            </div>
                            <div>
                                <strong>Date Recrutement:</strong>
                                <p className="text-gray-600">{formatDate(employee.profile?.DAT_REC)}</p>
                            </div>
                            <div>
                                <strong>Grade:</strong>
                                <p className="text-gray-600">{employee.profile?.LIBELLE_GRADE || "-"}</p>
                            </div>
                            <div>
                                <strong>Fonction:</strong>
                                <p className="text-gray-600">{employee.profile?.LIBELLE_FONCTION || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informations Personnelles</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div><strong>Ville:</strong><p className="text-gray-600">{employee.profile?.LIBELLE_LOC || "-"}</p></div>
                            <div><strong>Région:</strong><p className="text-gray-600">{employee.profile?.LIBELLE_REGION || "-"}</p></div>
                            <div><strong>Adresse:</strong><p className="text-gray-600">{employee.profile?.ADRESSE || "-"}</p></div>
                            <div><strong>Date de Naissance:</strong><p className="text-gray-600">{formatDate(employee.profile?.DATE_NAISS)}</p></div>
                            <div><strong>Sexe:</strong><p className="text-gray-600">{employee.profile?.SEXE || "-"}</p></div>
                            <div><strong>Situation Familliale:</strong><p className="text-gray-600">{employee.profile?.SIT_F_AG || "-"}</p></div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Compétences</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {employee.competences && employee.competences.length > 0 ? (
                                <CompetencesByLevel competences={employee.competences} />
                            ) : (
                                <p className="text-gray-500 italic">Aucune compétence enregistrée.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}