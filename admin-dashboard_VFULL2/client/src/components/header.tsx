import type React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import LoginModal from "./LoginModal.tsx";

const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState<{ id: string; email: string; role?: string } | null>(null);
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("/api/employees/verify-session", {
                        headers: { Authorization: `Bearer ${token}` },
                        credentials: 'include',
                    });
                    const text = await response.text();
                    console.log("Verify session response:", response.status, text);
                    if (response.ok) {
                        const data = JSON.parse(text);
                        setIsAuthenticated(true);
                        setUser({ id: data.id, email: data.email, role: data.role });
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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
        setIsUserMenuOpen(false);
        navigate("/");
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
        const handleSwitchToProfile = () => {
            if (user?.id) {
                navigate(`/profile/${user.id}`);
                setIsMobileMenuOpen(false);
            }
        };
    }
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
                                {user.role === "admin" && (
                                    <Link to="/dashboard" className="text-[#06668C] font-bold duration-200">
                                        Tableau de bord
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    {/* Connexion/Déconnexion et Menu Utilisateur - Aligné à droite */}
                    <div className="flex items-center relative">
                        {isAuthenticated ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={toggleUserMenu}
                                    className="text-[#06668C] font-medium px-4 py-2 rounded-lg"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.31 0-6 2.69-6 6v1h12v-1c0-3.31-2.69-6-6-6z" />
                                    </svg>
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-lg py-2 z-50">
                                        <Link
                                            to="/disponibilite"
                                            className="flex items-center px-4 py-2 text-[#06668C] hover:bg-gray-100"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Disponibilité
                                        </Link>
                                        <Link
                                            to="/formationPersonnel"
                                            className="flex items-center px-4 py-2 text-[#06668C] hover:bg-gray-100"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 7l-9-5 9-5 9 5-9 5z" />
                                            </svg>
                                            Mes formations
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center px-4 py-2 text-[#06668C] hover:bg-gray-100 w-full text-left"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Déconnexion
                                        </button>
                                    </div>

                                )}
                            </div>

                        ) : (
                            <button
                                onClick={toggleLoginModal}
                                className="bg-[#06668C] text-white font-medium px-4 py-2 rounded-lg duration-200"
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
                                        to="/disponibilite"
                                        className="text-[#06668C] font-bold duration-200"
                                        onClick={toggleMobileMenu}
                                    >
                                        Disponibilité
                                    </Link>
                                    <Link
                                        to="/formationPersonnel"
                                        className="text-[#06668C] font-bold duration-200"
                                        onClick={toggleMobileMenu}
                                    >
                                        Mes formations
                                    </Link>
                                    <Link
                                        to={`/profile/${user.id}`}
                                        className="text-[#06668C] font-bold duration-200"
                                        onClick={toggleMobileMenu}
                                    >
                                        Profile
                                    </Link>
                                    {user.role === "admin" && (
                                        <>
                                            <Link
                                                to="/dashboard"
                                                className="text-[#06668C] font-bold duration-200"
                                                onClick={toggleMobileMenu}
                                            >
                                                Tableau de bord
                                            </Link>
                                            <button
                                                className="text-[#06668C] font-bold duration-200 text-left"
                                                onClick={handleSwitchToProfile}
                                            >
                                                Mon Profil
                                            </button>
                                        </>
                                    )}
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