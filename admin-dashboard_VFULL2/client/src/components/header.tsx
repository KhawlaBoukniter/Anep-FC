import type React from "react"

const Header: React.FC = () => {
    return (
        <header className="top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center">
                    <div className="w-20 h-12  rounded-full flex items-center justify-center">
                        <img src="/images/logo1.png" alt="Description" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex space-x-8">
                    <a href="#home" className="text-[#06668C] hover:text-green-600 font-medium transition-colors duration-200">
                        Accueil
                    </a>
                    <a href="#about" className="text-[#06668C] hover:text-green-600 font-medium transition-colors duration-200">
                        À propos
                    </a>
                    <a
                        href="#login"
                        className="bg-[#06668C] text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                    >
                        Connexion
                    </a>
                </nav>

                {/* Mobile menu button */}
                <button className="md:hidden text-[#06668C]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
    )
}

export default Header
