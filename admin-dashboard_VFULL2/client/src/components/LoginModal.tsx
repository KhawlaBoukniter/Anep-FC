import type React from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const LoginModal: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logique de connexion ici (par exemple, appel API)
        console.log("Email:", email, "Password:", password);
        // Redirection après connexion réussie (exemple)
        navigate("/dashboard");
    };

    const handleClose = () => {
        // Rediriger vers la page d'accueil ou une autre page
        navigate("/");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-[#06668C] mb-4">Connexion</h2>
                <div
                    className="text-gray-600 mb-4 cursor-pointer text-right"
                    onClick={handleClose}
                >
                    Fermer
                </div>
                <form onSubmit={handleSubmit}>
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
                    <button
                        type="submit"
                        className="w-full bg-[#06668C] text-white py-2 rounded-lg hover:bg-[#055c7a] duration-200"
                    >
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;