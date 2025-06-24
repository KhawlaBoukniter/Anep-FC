"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEmployee } from "../hooks/useEmployees.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { Button } from "../components/ui/button.tsx";
import { ArrowLeft, User, Shield } from "lucide-react";
import CompetencesByLevel from "../components/CompetencesByLevel.tsx";

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
            <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
                <p className="text-lg font-medium text-green-700 animate-pulse">Chargement du profil...</p>
            </div>
        );
    }

    if (isError || !employee) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-red-600">
                <p className="text-lg font-semibold">Erreur: Impossible de charger le profil de l'employé.</p>
                <p className="text-sm text-gray-500 mt-2">{error?.message || "Employé non trouvé."}</p>
                <Button 
                    onClick={() => navigate(-1)} 
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
            </div>
        );
    }

    const getRoleColor = (role: "user" | "admin") => {
        return role === "admin" 
            ? "bg-purple-100 text-purple-800 hover:bg-purple-200" 
            : "bg-gray-100 text-gray-800 hover:bg-gray-200";
    };

    return (
        <div className="container mx-auto px-4 py-8 md:px-8 md:py-12 bg-gray-100 min-h-screen">
            <header className="flex items-center justify-between mb-8">
                <Button 
                    variant="outline" 
                    onClick={() => navigate(-1)}
                    className="border-indigo-300 text-white hover:bg-indigo-50 transition-colors duration-200" style={{ backgroundColor: '#06668C' }}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
                </Button>
                <Badge 
                    variant={employee.archived ? "destructive" : "secondary"}
                    className={`text-sm font-medium px-3 py-1 transition-colors duration-200 ${
                        employee.archived ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                >
                    {employee.archived ? "Archivé" : "Actif"}
                </Badge>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne de gauche : Informations principales */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-lg shadow-blue-900 hover:shadow-xl hover:shadow-blue-900 transition-shadow duration-300 rounded-xl border bg-blue-50"style={{ borderColor: '#06668C' }}>
                        <CardHeader className="text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-900 to-blue-100 mx-auto flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800">{employee.nom_complet}</CardTitle>
                            <CardDescription className="text-gray-500">{employee.email}</CardDescription>
                            <Badge 
                                className={`${getRoleColor(employee.role)} mt-2 px-3 py-1 text-sm font-medium bg-blue-200  hover:bg-blue-100 transition-colors duration-200`} 
                                variant="secondary" 
                            >
                                {employee.role === "admin" ? <Shield className="h-3 w-3 mr-1"   /> : <User className="h-3 w-3 mr-1 " style={{ color: '#06668C' }} />}
                                {employee.role === "admin" ? "Admin" : "Utilisateur"}
                            </Badge>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <div><strong className="" style={{ color: '#06668C' }}>CIN:</strong> <p className="text-gray-600">{employee.cin || "-"}</p></div>
                            <div><strong className="" style={{ color: '#06668C' }}>Téléphone 1:</strong> <p className="text-gray-600">{employee.telephone1 || "-"}</p></div>
                            <div><strong className="" style={{ color: '#06668C' }}>Téléphone 2:</strong> <p className="text-gray-600">{employee.telephone2 || "-"}</p></div>
                        </CardContent>
                    </Card>
                </div>

                {/* Colonne de droite : Détails et compétences */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-lg bg-blue-50 shadow-blue-900 hover:shadow-blue-800 hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold glow-light" style={{ color: '#06668C' }}>Détails Professionnels</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong className="text-green-700">Emplois:</strong>
                                <p className="text-gray-600">
                                    {[...new Set((employee.emplois || []).map((e) => e.nom_emploi))].join(", ") || "-"}
                                </p>
                            </div>
                            <div>
                                <strong className="text-green-700">Direction:</strong>
                                <p className="text-gray-600">
                                    {[...new Set((employee.emplois || []).map((e) => e.entite))].join(", ") || "-"}
                                </p>
                            </div>
                            <div>
                                <strong className="text-green-700">Statut:</strong>
                                <p className="text-gray-600">{employee.profile?.STATUT || "-"}</p>
                            </div>
                            <div>
                                <strong className="text-green-700">Catégorie:</strong>
                                <p className="text-gray-600">{employee.categorie || "-"}</p>
                            </div>
                            <div>
                                <strong className="text-green-700">Spécialité:</strong>
                                <p className="text-gray-600">{employee.specialite || "-"}</p>
                            </div>
                            <div>
                                <strong className="text-green-700">Expérience:</strong>
                                <p className="text-gray-600">{employee.experience_employe || "-"} ans</p>
                            </div>
                            <div>
                                <strong className="text-green-700">Date Recrutement:</strong>
                                <p className="text-gray-600">{formatDate(employee.profile?.DAT_REC)}</p>
                            </div>
                            <div>
                                <strong className="text-green-700">Grade:</strong>
                                <p className="text-gray-600">{employee.profile?.LIBELLE_GRADE || "-"}</p>
                            </div>
                            <div>
                                <strong className="text-green-700">Fonction:</strong>
                                <p className="text-gray-600">{employee.profile?.LIBELLE_FONCTION || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg bg-blue-50 shadow-blue-900 hover:shadow-blue-800 hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold glow-light" style={{ color: '#06668C' }}>Informations Personnelles</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div><strong className="text-green-700">Ville:</strong><p className="text-gray-600">{employee.profile?.LIBELLE_LOC || "-"}</p></div>
                            <div><strong className="text-green-700">Région:</strong><p className="text-gray-600">{employee.profile?.LIBELLE_REGION || "-"}</p></div>
                            <div><strong className="text-green-700">Adresse:</strong><p className="text-gray-600">{employee.profile?.ADRESSE || "-"}</p></div>
                            <div><strong className="text-green-700">Date de Naissance:</strong><p className="text-gray-600">{formatDate(employee.profile?.DATE_NAISS)}</p></div>
                            <div><strong className="text-green-700">Sexe:</strong><p className="text-gray-600">{employee.profile?.SEXE || "-"}</p></div>
                            <div><strong className="text-green-700">Situation Familiale:</strong><p className="text-gray-600">{employee.profile?.SIT_F_AG || "-"}</p></div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg bg-blue-50 shadow-blue-900 hover:shadow--800  hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold glow-light" style={{ color: '#06668C' }}>Compétences</CardTitle>
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