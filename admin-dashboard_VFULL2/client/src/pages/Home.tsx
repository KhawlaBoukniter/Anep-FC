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

            {/* Section de texte */}
           

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default HomePage;