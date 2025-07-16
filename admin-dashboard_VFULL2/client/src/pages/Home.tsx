import type React from "react";
import Header from "../components/header.tsx";
import Footer from "../components/footer.tsx";
import Carousel from "../components/carousel.tsx";
import AnimatedCards from "../components/AnimatedCards.tsx";

const HomePage: React.FC = () => {
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
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                        Découvrez nos services exceptionnels et rejoignez des milliers de clients satisfaits
                    </p>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        Commencer maintenant
                    </button>
                </div>
            </section>
            {/* Section des cartes animées */}
            <AnimatedCards />
            {/* Section Carousel */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-[#06668C] mb-4">Nos Services</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Découvrez la gamme complète de nos services conçus pour répondre à tous vos besoins
                        </p>
                    </div>
                    <Carousel />
                </div>
            </section>

            {/* Section de texte */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-[#06668C] mb-6">Pourquoi nous choisir ?</h2>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Nous sommes une entreprise leader dans notre domaine, offrant des solutions innovantes et
                                    personnalisées à nos clients. Notre équipe d'experts travaille sans relâche pour vous garantir les
                                    meilleurs résultats.
                                </p>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Avec plus de 10 ans d'expérience, nous avons développé une expertise unique qui nous permet de
                                    répondre aux défis les plus complexes. Notre approche centrée sur le client nous distingue de la
                                    concurrence.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                                        <span className="text-gray-700">Qualité garantie</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                                        <span className="text-gray-700">Support 24/7</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                                        <span className="text-gray-700">Prix compétitifs</span>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="bg-gradient-to-br from-[#06668C] to-green-600 rounded-lg p-8 text-white shadow-xl">
                                    <h3 className="text-2xl font-bold mb-4">Nos chiffres</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center border-b border-white border-opacity-20 pb-2">
                                            <span>Clients satisfaits</span>
                                            <span className="text-2xl font-bold">1000+</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-white border-opacity-20 pb-2">
                                            <span>Projets réalisés</span>
                                            <span className="text-2xl font-bold">500+</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Années d'expérience</span>
                                            <span className="text-2xl font-bold">10+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;