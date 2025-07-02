import type React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface LoginModalProps {
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState<"email" | "password" | "newPassword">("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`/api/employees/check-email?email=${encodeURIComponent(email)}`);
            if (!response.ok) {
                throw new Error("Erreur lors de la vérification de l'email");
            }
            const { exists, hasPassword } = await response.json();
            if (!exists) {
                setError("L'email est erroné, vérifiez votre email");
            } else if (hasPassword) {
                setStep("password");
            } else {
                setStep("newPassword");
            }
        } catch (err) {
            setError("Une erreur s'est produite lors de la vérification de l'email");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/employees/check-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error("Mot de passe incorrect");
            }
            const { isValid } = await response.json();
            if (isValid) {
                navigate("/");
                onClose();
            } else {
                setError("Mot de passe incorrect");
            }
        } catch (err) {
            setError("Une erreur s'est produite lors de la vérification du mot de passe");
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("/api/employees/save-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, confirmPassword }),
            });
            if (!response.ok) {
                throw new Error("Erreur lors de l'enregistrement du mot de passe");
            }
            const { isSaved } = await response.json();
            if (isSaved) {
                navigate("/");
                onClose();
            } else {
                setError("Les mots de passe ne correspondent pas");
            }
        } catch (err) {
            setError("Une erreur s'est produite lors de l'enregistrement du mot de passe");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-[#06668C] mb-4">Connexion</h2>
                <div
                    className="text-gray-600 mb-4 cursor-pointer text-right"
                    onClick={onClose}
                >
                    Fermer
                </div>

                {step === "email" && (
                    <form onSubmit={handleEmailCheck}>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-[#06668C] mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06668C]"
                                placeholder="Entrez votre email"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-[#06668C] text-white py-2 rounded-lg hover:bg-[#055c7a] duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? "Vérification..." : "Check"}
                        </button>
                    </form>
                )}

                {step === "password" && (
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-[#06668C] mb-2">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06668C]"
                                placeholder="Entrez votre mot de passe"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-[#06668C] text-white py-2 rounded-lg hover:bg-[#055c7a] duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </button>
                    </form>
                )}

                {step === "newPassword" && (
                    <form onSubmit={handleNewPasswordSubmit}>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-[#06668C] mb-2">
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06668C]"
                                placeholder="Entrez votre nouveau mot de passe"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-[#06668C] mb-2">
                                Confirmer le mot de passe
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06668C]"
                                placeholder="Confirmez votre mot de passe"
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <button
                            type="submit"
                            className="w-full bg-[#06668C] text-white py-2 rounded-lg hover:bg-[#055c7a] duration-200"
                            disabled={isLoading}
                        >
                            {isLoading ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginModal;