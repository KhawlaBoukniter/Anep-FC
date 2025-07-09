import type React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LoginModal from "./LoginModal.tsx";

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<{ id: string; email: string } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("/api/employees/verify-session", {
                        headers: { Authorization: `Bearer ${token}` },
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setIsAuthenticated(true);
                        setUser({ id: data.id, email: data.email });
                    } else {
                        localStorage.removeItem("token");
                        setIsAuthenticated(false);
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Error verifying session:", error);
                    localStorage.removeItem("token");
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
        };
        checkAuth();
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleLoginModal = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
        setIsMobileMenuOpen(false);
        navigate("/");
    };

    return (
        <header className="top-0 z-50">
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
                    {isAuthenticated && user && (
                        <>
                            <Link to="/formation" className="text-[#06668C] font-bold duration-200">
                                Formation
                            </Link>
                            <Link to={`/profile/${user.id}`} className="text-[#06668C] font-bold duration-200">
                                Profile
                            </Link>
                        </>
                    )}
                </nav>

                {/* Connexion/Déconnexion - Aligné à droite */}
                <div className="flex items-center">
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="bg-[#06668c] text-white font-medium px-4 py-2 rounded-lg duration-200"
                        >
                            Déconnexion
                        </button>
                    ) : (
                        <button
                            onClick={toggleLoginModal}
                            className="bg-[#06668c] text-white font-medium px-4 py-2 rounded-lg duration-200"
                        >
                            Connexion
                        </button>
                    )}

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
                        {isAuthenticated && user && (
                            <>
                                <Link
                                    to="/formation"
                                    className="text-[#06668C] font-bold duration-200"
                                    onClick={toggleMobileMenu}
                                >
                                    Formation
                                </Link>
                                <Link
                                    to={`/profile/${user.id}`}
                                    className="text-[#06668C] font-bold duration-200"
                                    onClick={toggleMobileMenu}
                                >
                                    Profile
                                </Link>
                                <button
                                    className="text-[#06668C] font-bold duration-200 text-left"
                                    onClick={handleLogout}
                                >
                                    Déconnexion
                                </button>
                            </>
                        )}
                        {!isAuthenticated && (
                            <button
                                className="text-[#06668C] font-bold duration-200 text-left"
                                onClick={() => {
                                    toggleMobileMenu();
                                    toggleLoginModal();
                                }}
                            >
                                Connexion
                            </button>
                        )}
                    </nav>
                </div>
            )}

            {/* Login Modal */}
            {isLoginModalOpen && (
                <LoginModal
                    onClose={() => {
                        toggleLoginModal();
                    }}
                    onLoginSuccess={(userData) => {
                        setIsAuthenticated(true);
                        setUser(userData);
                        toggleLoginModal();
                    }}
                />
            )}
        </header>
    );
};

export default Header;