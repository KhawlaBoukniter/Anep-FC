"use client";
import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import Carousel from "../components/carousel.tsx";
import AnimatedCards from "../components/AnimatedCards.tsx";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const HomePage: React.FC = () => {
    // State for statistics
    const [stats, setStats] = useState({
        totalCycles: 0,
        totalPrograms: 0,
        totalModules: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [programsResponse, modulesResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/cycles-programs`),
                    axios.get(`${API_BASE_URL}/courses`)
                ]);

                const cyclesCount = programsResponse.data.filter((p: any) => p.type === "cycle").length;
                const programmesCount = programsResponse.data.filter((p: any) => p.type === "program").length;
                const modulesCount = modulesResponse.data.length;

                setStats({
                    totalCycles: cyclesCount,
                    totalPrograms: programmesCount,
                    totalModules: modulesCount
                });
            } catch (err: any) {
                console.error("Erreur lors de la récupération des statistiques:", err);
                setError("Impossible de charger les statistiques.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            {/* Hero Section avec vidéo en arrière-plan */}
            <section
                className="relative h-screen flex items-center justify-center overflow-hidden"
                style={{
                    backgroundImage: `url("/images/bg.jpeg")`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    height: "590px",
                    width: "100%",
                }}
            >
                {/* Fallback background si la vidéo ne charge pas */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#fffff] z-0"></div>

                {/* Overlay sombre pour améliorer la lisibilité */}
                <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

                {/* Contenu du hero */}
                <div className="relative z-20 text-center text-white px-4 max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        Bienvenue sur Notre
                        <span className="block text-[#11516a] shadow-lg px-4 py-2 rounded-lg inline-block mt-2">
                            Plateforme
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl font-medium mb-8 opacity-90">
                        ANEP Formation : votre avenir se construit ici.
                    </p>
                </div>
            </section>
            {/* Section des cartes animées */}
            <AnimatedCards />
            {/* Section Carousel */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#06668C] mb-4">
                            Extrait de la Banque des Photos
                        </h2>
                    </div>
                    <Carousel />
                </div>
            </section>
            {/* Statistics Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#06668C] mb-4">
                            Nos Statistiques
                        </h2>
                        <p className="text-xl text-gray-600">
                            Découvrez l'ampleur de notre plateforme de formation
                        </p>
                    </div>
                    {loading ? (
                        <div className="text-center text-gray-600">Chargement des statistiques...</div>
                    ) : error ? (
                        <div className="text-center text-red-600">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-blue-50 p-6 rounded-lg text-center border-l-4 border-blue-800 shadow-lg shadow-blue-800">
                                <h3 className="text-5xl font-bold text-[#06668C] mb-2">{stats.totalCycles}</h3>
                                <p className="text-xl text-gray-700">Cycles de Formation</p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-lg text-center border-l-4 border-purple-800 shadow-lg shadow-purple-800">
                                <h3 className="text-5xl font-bold text-[#06668C] mb-2">{stats.totalPrograms}</h3>
                                <p className="text-xl text-gray-700">Programmes</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg text-center border-l-4 border-green-800 shadow-lg shadow-green-800">
                                <h3 className="text-5xl font-bold text-[#06668C] mb-2">{stats.totalModules}</h3>
                                <p className="text-xl text-gray-700">Modules</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;