import type React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import LoginModal from "./LoginModal.tsx";

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleLoginModal = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
    };

    return (
        <header className="top-0 z-50 bg-[#ffffff]">
            <div className="mx-auto px-4 py-2 flex items-center justify-between">
                {/* Logo - Aligné à gauche */}
                <div className="flex-shrink-0">
                    <Link to="/">
                        <div className="w-20 h-12 rounded-full flex items-center justify-center">
                            <img src="/images/logo1.png" alt="Description" />
                        </div>
                    </Link>
                </div>

                {/* Navigation - Centré */}
                <nav className="hidden md:flex space-x-8 mx-auto">
                    <Link to="/" className="text-[#06668C] font-bold duration-200">
                        Accueil
                    </Link>
                    <Link to="/about" className="text-[#06668C] font-bold duration-200">
                        À propos
                    </Link>
                    <Link to="/services" className="text-[#06668C] font-bold duration-200">
                        Nos Services
                    </Link>
                </nav>

                {/* Connexion - Aligné à droite */}
                <div className="flex items-center">
                    <button
                        onClick={toggleLoginModal}
                        className="bg-[#06668c] text-white font-medium px-4 py-2 rounded-lg duration-200"
                    >
                        Connexion
                    </button>

                    {/* Mobile menu button */}
                    <button
                        className="md:hidden text-[#06668C] ml-4"
                        onClick={toggleMobileMenu}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white shadow-lg">
                    <nav className="flex flex-col space-y-4 px-4 py-4">
                        <Link
                            to="/"
                            className="text-[#06668C] font-bold duration-200"
                            onClick={toggleMobileMenu}
                        >
                            Accueil
                        </Link>
                        <Link
                            to="/about"
                            className="text-[#06668C] font-bold duration-200"
                            onClick={toggleMobileMenu}
                        >
                            À propos
                        </Link>
                        <Link
                            to="/services"
                            className="text-[#06668C] font-bold duration-200"
                            onClick={toggleMobileMenu}
                        >
                            Nos Services
                        </Link>
                        <button
                            className="text-[#06668C] font-bold duration-200 text-left"
                            onClick={() => {
                                toggleMobileMenu();
                                toggleLoginModal();
                            }}
                        >
                            Connexion
                        </button>
                    </nav>
                </div>
            )}

            {/* Login Modal */}
            {isLoginModalOpen && <LoginModal onClose={toggleLoginModal} />}
        </header>
    );
};

export default Header;