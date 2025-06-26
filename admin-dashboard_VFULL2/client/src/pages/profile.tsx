"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEmployee } from "../hooks/useEmployees.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card.tsx";
import { Badge } from "../components/ui/badge.tsx";
import { Button } from "../components/ui/button.tsx";
import { ArrowLeft, User, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

// Fonction pour formater les dates
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fr-FR");
};

type Competence = {
    id_competencea: number;
    competencea: string;
    niveaua: number;
    niveau_requis?: number;
};

function CompetencesTable({
    competences,
}: {
    competences: Competence[];
}) {
    const renderStars = (niveau: number) => {
        return (
            <div className="flex">
                {[1, 2, 3, 4].map((i) => (
                    <span key={i} className={i <= niveau ? "text-yellow-600" : "text-gray-300"}>
                        ★
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="overflow-x-auto mt-4">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Compétence
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Niveau Acquis
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Niveau Requis
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Écart
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {competences.map((comp) => {
                        const ecart = comp.niveau_requis ? comp.niveaua - comp.niveau_requis : 0;
                        const ecartColor = ecart >= 0 ? "text-green-600" : "text-red-600";

                        return (
                            <tr key={comp.id_competencea} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {comp.competencea}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {renderStars(comp.niveaua)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {comp.niveau_requis ? renderStars(comp.niveau_requis) : "-"}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${ecartColor}`}>
                                    {comp.niveau_requis ? (ecart >= 0 ? `+${ecart}` : ecart) : "-"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default function ProfilePage() {
    const { employeeId } = useParams<{ employeeId: string }>();
    const navigate = useNavigate();
    const { data: employee, isLoading, isError, error } = useEmployee(employeeId);
    const [showCompetences, setShowCompetences] = useState(false);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-gray-100">
                <p className="text-lg font-medium text-green-600 animate-pulse">Chargement du profil...</p>
            </div>
        );
    }

    if (isError || !employee) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-red-600">
                <p className="text-lg font-semibold">Erreur: Impossible de charger le profil de l'employé.</p>
                <p className="text-sm text-gray-600 mt-2">{error?.message || "Employé non trouvé."}</p>
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

    const competencesWithRequiredLevel = employee.competences?.map(comp => {
        return {
            ...comp,
            niveau_requis: Math.floor(Math.random() * 4) + 1
        };
    }) || [];

    return (
        <div className="mx-auto px-4 py-8 md:px-8 md:py-12 bg-gray-100 min-h-screen">
            <header className="flex items-center justify-between mb-8">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="border-indigo-300 text-white hover:bg-indigo-50 transition-colors duration-200"
                    style={{ backgroundColor: '#0066cc' }}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste
                </Button>
                <Badge
                    variant={employee.archived ? "destructive" : "secondary"}
                    className={`text-sm font-bold px-3 py-1 transition-colors duration-200 ${employee.archived ? "bg-red-100 text-red-800 hover:bg-red-200 shadow-lg shadow-red-900 " : "bg-blue-100 text-blue-800 hover:bg-blue-200 shadow-lg shadow-blue-900 "}`}
                >
                    {employee.archived ? "Archivé" : "Actif"}
                </Badge>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-lg shadow-blue-900 hover:shadow-xl hover:shadow-blue-900 transition-shadow duration-300 rounded-xl border bg-blue-50" style={{ borderColor: '#0066cc' }}>
                        <CardHeader className="text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-900 to-blue-100 mx-auto flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-800">{employee.nom_complet}</CardTitle>
                            <CardDescription className="text-gray-600">{employee.email}</CardDescription>
                            <Badge
                                className={`${getRoleColor(employee.role)} mt-2 px-3 py-1 text-sm font-medium bg-blue-200 hover:bg-blue-100 transition-colors duration-200`}
                                variant="secondary"
                            >
                                {employee.role === "admin" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" style={{ color: '#0066cc' }} />}
                                {employee.role === "admin" ? "Admin" : "Utilisateur"}
                            </Badge>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <div><strong style={{ color: '#0066cc' }}>CIN:</strong> <p className="text-gray-600">{employee.cin || "-"}</p></div>
                            <div><strong style={{ color: '#0066cc' }}>Téléphone 1:</strong> <p className="text-gray-600">{employee.telephone1 || "-"}</p></div>
                            <div><strong style={{ color: '#0066cc' }}>Téléphone 2:</strong> <p className="text-gray-600">{employee.telephone2 || "-"}</p></div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-lg bg-blue-50 shadow-blue-900 hover:shadow-blue-800 hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold glow-light" style={{ color: '#0066cc' }}>Détails Professionnels</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <strong className="text-green-600">Emplois:</strong>
                                <p className="text-gray-600">
                                    {[...new Set((employee.emplois || []).map((e) => e.nom_emploi))].join(", ") || "-"}
                                </p>
                            </div>
                            <div>
                                <strong className="text-green-600">Direction:</strong>
                                <p className="text-gray-600">
                                    {[...new Set((employee.emplois || []).map((e) => e.entite))].join(", ") || "-"}
                                </p>
                            </div>
                            <div>
                                <strong className="text-green-600">Statut:</strong>
                                <p className="text-gray-600">{employee.profile?.STATUT || "-"}</p>
                            </div>
                            <div>
                                <strong className="text-green-600">Catégorie:</strong>
                                <p className="text-gray-600">{employee.categorie || "-"}</p>
                            </div>
                            <div>
                                <strong className="text-green-600">Spécialité:</strong>
                                <p className="text-gray-600">{employee.specialite || "-"}</p>
                            </div>
                            <div>
                                <strong className="text-green-600">Expérience:</strong>
                                <p className="text-gray-600">{employee.experience_employe || "-"} ans</p>
                            </div>
                            <div>
                                <strong className="text-green-600">Date Recrutement:</strong>
                                <p className="text-gray-600">{formatDate(employee.profile?.DAT_REC)}</p>
                            </div>
                            <div>
                                <strong className="text-green-600">Grade:</strong>
                                <p className="text-gray-600">{employee.profile?.LIBELLE_GRADE || "-"}</p>
                            </div>
                            <div>
                                <strong className="text-green-600">Fonction:</strong>
                                <p className="text-gray-600">{employee.profile?.LIBELLE_FONCTION || "-"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg bg-blue-50 shadow-blue-900 hover:shadow-blue-800 hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold glow-light" style={{ color: '#0066cc' }}>Informations Personnelles</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div><strong className="text-green-600">Ville:</strong><p className="text-gray-600">{employee.profile?.LIBELLE_LOC || "-"}</p></div>
                            <div><strong className="text-green-600">Région:</strong><p className="text-gray-600">{employee.profile?.LIBELLE_REGION || "-"}</p></div>
                            <div><strong className="text-green-600">Adresse:</strong><p className="text-gray-600">{employee.profile?.ADRESSE || "-"}</p></div>
                            <div><strong className="text-green-600">Date de Naissance:</strong><p className="text-gray-600">{formatDate(employee.profile?.DATE_NAISS)}</p></div>
                            <div><strong className="text-green-600">Sexe:</strong><p className="text-gray-600">{employee.profile?.SEXE || "-"}</p></div>
                            <div><strong className="text-green-600">Situation Familiale:</strong><p className="text-gray-600">{employee.profile?.SIT_F_AG || "-"}</p></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <Card className="m-20 shadow-lg bg-blue-50 shadow-blue-900 hover:shadow-blue-800 hover:shadow-xl transition-shadow duration-300 rounded-xl border border-gray-200">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-bold glow-light" style={{ color: '#0066cc' }}>Compétences</CardTitle>
                        <Button
                            onClick={() => setShowCompetences(!showCompetences)}
                            variant="ghost"
                            className="flex items-center gap-2"
                        >
                            {showCompetences ? (
                                <>
                                    <span>Masquer les compétences</span>
                                    <ChevronUp className="h-4 w-4" />
                                </>
                            ) : (
                                <>
                                    <span>Afficher les compétences</span>
                                    <ChevronDown className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {employee.competences && employee.competences.length > 0 ? (
                        showCompetences ? (
                            <CompetencesTable
                                competences={competencesWithRequiredLevel}
                            />
                        ) : (
                            <p className="text-gray-600 italic">Cliquez sur "Afficher les compétences" pour voir la liste</p>
                        )
                    ) : (
                        <p className="text-gray-600 italic">Aucune compétence enregistrée.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}