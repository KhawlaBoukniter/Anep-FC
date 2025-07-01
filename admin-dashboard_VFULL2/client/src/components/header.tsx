import type React from "react"

const Header: React.FC = () => {
    return (
        <header className="top-0 z-50">
            <div className="mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo - Aligné à gauche */}
                <div className="flex-shrink-0">
                    <div className="w-20 h-12 rounded-full flex items-center justify-center">
                        <img src="/images/logo1.png" alt="Description" />
                    </div>
                </div>

                {/* Navigation - Centré */}
                <nav className="hidden md:flex space-x-8 mx-auto">
                    <a href="#home" className="text-[#06668C] font-bold  duration-200">
                        Accueil
                    </a>
                    <a href="#about" className="text-[#06668C] font-bold  duration-200">
                        À propos
                    </a>
                    <a href="#services" className="text-[#06668C] font-bold  duration-200">
                        Nos Services
                    </a>
                </nav>

                {/* Connexion - Aligné à droite */}
                <div className="flex items-center">
                    <a
                        href="#login"
                        className="bg-[#06668c] text-white font-medium px-4 py-2 rounded-lg duration-200"
                    >
                        Connexion
                    </a>

                    {/* Mobile menu button */}
                    <button className="md:hidden text-[#06668C] ml-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header