"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Header from "../components/header.tsx"
import Footer from "../components/footer.tsx"

interface Section {
    id: string
    title: string
    icon: string
    content: React.ReactNode
}

interface FAQ {
    question: string
    answer: string
    category: string
}

const DocumentationPage: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false)
    const [activeSection, setActiveSection] = useState("introduction")
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    const faqData: FAQ[] = [
        {
            question: "Comment créer un compte sur la plateforme ?",
            answer:
                "Cliquez sur le bouton 'Connexion' dans l'en-tête, puis saisissez votre email ainsi que votre mot de passe.",
            category: "Compte",
        },
        {
            question: "Comment m'inscrire à une formation ?",
            answer:
                "Allez dans la section 'Formations', choisissez un cycle ou programme qui vous intéresse, cliquez sur 'candidater' ou sur 'voir formation' pour le programme .",
            category: "Formations",
        },
        {
            question: "Où puis-je voir mes formations en cours ?",
            answer:
                "Rendez-vous dans 'Mes Formations' (visible une fois connecté) pour voir toutes vos formations retenues, en attentes et rejetées.",
            category: "Formations",
        },
        {
            question: "Comment utiliser l'outil d'évaluation ?",
            answer:
                "Dans la page 'mes formations', cliquez sur le bouton continuer puis sur evaluer ce moduel , ensuite cliquez sur les points du graphique pour noter vos évaluations de 1 à 5 sur chaque axe, puis téléchargez ou envoyez vos résultats.",
            category: "Évaluation",
        },
        {
            question: "Comment contacter le support ?",
            answer:
                "Vous pouvez nous contacter via les informations dans le pied de la page .",
            category: "Support",
        },
    ]

    const sections: Section[] = [
        {
            id: "introduction",
            title: "Introduction",
            icon: "🏠",
            content: (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-[#06668C] to-green-600 text-white p-6 rounded-xl">
                        <h3 className="text-2xl font-bold mb-4">Bienvenue sur notre plateforme !</h3>
                        <p className="text-lg opacity-90">
                            Cette documentation vous guidera à travers toutes les fonctionnalités de notre application de formation et
                            d'évaluation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="text-3xl mb-3">🎯</div>
                            <h4 className="text-lg font-bold text-[#06668C] mb-2">Objectif</h4>
                            <p className="text-gray-600">
                                Faciliter votre inscription et évaluer vos formations de manière interactive.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="text-3xl mb-3">👥</div>
                            <h4 className="text-lg font-bold text-[#06668C] mb-2">Public cible</h4>
                            <p className="text-gray-600">
                                Employés souhaitant développer leurs compétences.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="text-lg font-bold text-blue-800 mb-3">Fonctionnalités principales</h4>
                        <ul className="space-y-2 text-blue-700">
                            <li className="flex items-center">
                                <span className="mr-2">✓</span> Catalogue de formations (modules)
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✓</span> Suivi personnalisé
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✓</span> Outil d'évaluation des formations
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2">✓</span> Interface responsive et moderne
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            id: "navigation",
            title: "Navigation",
            icon: "🧭",
            content: (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-[#06668C] mb-4">Structure de l'application</h3>

                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b">
                            <h4 className="font-bold text-gray-800">En-tête(Navigation principale)</h4>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">🏠 Accueil</span>
                                <span className="text-sm text-gray-600">Page d'accueil avec présentation</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">🛠️ Guide</span>
                                <span className="text-sm text-gray-600">Documentation pour l'utilisation</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-medium text-blue-800">📚 Formations</span>
                                <span className="text-sm text-blue-600">Catalogue des formations disponibles</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-medium text-blue-800">📖 Mes Formations</span>
                                <span className="text-sm text-blue-600">Vos formations (retenue , rejetée , en attente)</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-medium text-blue-800">📅 Indisponibilité</span>
                                <span className="text-sm text-blue-600">Outil de gestion des indisponibilités</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="font-medium text-blue-800">👤profile</span>
                                <span className="text-sm text-blue-600">Voir le détail des informations </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="text-lg font-bold text-yellow-800 mb-3">💡 Conseil de navigation</h4>
                        <p className="text-yellow-700">
                            Les sections "Formation" "Mes Formations" , "Indisponibilités" , "profile" ne sont visibles qu'après connexion. Utilisez le bouton
                            "Connexion" pour accéder à ces fonctionnalités personnalisées.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            id: "formations",
            title: "Formations",
            icon: "📚",
            content: (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-[#06668C] mb-4">Guide des formations</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-left">
                            <h4 className="text-lg font-bold text-[#06668C] mb-4">📋 Catalogue des cycles </h4>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">1.</span>
                                    <div>
                                        <strong>Parcourir</strong>
                                        <p className="text-sm text-gray-600">Explorez notre catalogue de cycle </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">2.</span>
                                    <div>
                                        <strong>Détails</strong>
                                        <p className="text-sm text-gray-600">Cliquez sur "Détails" pour voir le détail du cycle</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">3.</span>
                                    <div>
                                        <strong>Candidature</strong>
                                        <p className="text-sm text-gray-600">Cliquez sur "Candidater" pour envoyer la candidature du cycle</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 text-left">
                            <h4 className="text-lg font-bold text-[#06668C] mb-4">📋 Catalogue des programmes</h4>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">1.</span>
                                    <div>
                                        <strong>Parcourir</strong>
                                        <p className="text-sm text-gray-600">Explorez notre catalogue de programmes</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">2.</span>
                                    <div>
                                        <strong>Détails</strong>
                                        <p className="text-sm text-gray-600">Cliquez sur "Voir formations" pour voir les formations de ce programme </p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-green-500 mr-2 mt-1">3.</span>
                                    <div>
                                        <strong>Candidature</strong>
                                        <p className="text-sm text-gray-600">Cochez les boutons ou bien cliquez sur "Tout Sélectionner" pour candidater à une ou plusieurs formations</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-bold text-[#06668C] mb-4">📖 Mes formations</h4>
                            <div className="space-y-3">
                                <div className="flex items-center p-2 bg-blue-50 rounded">
                                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                                    <span className="text-sm">
                                        <strong>Retenue</strong> - La candidature est accéptée
                                    </span>
                                </div>
                                <div className="flex items-center p-2 bg-green-50 rounded">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                                    <span className="text-sm">
                                        <strong>en attente</strong> - La candidature est en cours de traitement
                                    </span>
                                </div>
                                <div className="flex items-center p-2 bg-gray-50 rounded">
                                    <span className="w-3 h-3 bg-gray-500 rounded-full mr-3"></span>
                                    <span className="text-sm">
                                        <strong>Rejeté</strong> - La candidature est refusée
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "evaluation",
            title: "Évaluation",
            icon: "📊",
            content: (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-[#06668C] mb-4">Guide d'évaluation des formations</h3>

                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-xl">
                        <h4 className="text-xl font-bold mb-3">🎯 Outil d'évaluation</h4>
                        <p className="opacity-90">
                            Évaluez vos formations (après une clique sur le boutton "Continuer" puis le lien "Évaluer ce module") sur 5 axes principaux avec notre graphique interactif.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-bold text-[#06668C] mb-4">📐 Les 5 axes d'évaluation</h4>
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-[#06668C] rounded-full mr-3"></div>
                                    <span>
                                        <strong>Apports d'informations</strong>
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-green-600 rounded-full mr-3"></div>
                                    <span>
                                        <strong>Réponse aux Objectifs</strong>
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
                                    <span>
                                        <strong>Conditions Logistiques</strong>
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-red-600 rounded-full mr-3"></div>
                                    <span>
                                        <strong>Conception de la démarche</strong>
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-4 h-4 bg-orange-600 rounded-full mr-3"></div>
                                    <span>
                                        <strong>Qualité de l'animation</strong>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-bold text-[#06668C] mb-4">🎚️ Échelle de notation</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                    <span className="font-bold text-red-700">1-2</span>
                                    <span className="text-sm text-red-600">Débutant - À développer</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                    <span className="font-bold text-yellow-700">3</span>
                                    <span className="text-sm text-yellow-600">Intermédiaire - Correct</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                    <span className="font-bold text-blue-700">4</span>
                                    <span className="text-sm text-blue-600">Avancé - Très bien</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                    <span className="font-bold text-green-700">5</span>
                                    <span className="text-sm text-green-600">Expert - Excellence</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-bold text-[#06668C] mb-4">📋 Comment utiliser l'évaluation</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="w-8 h-8 bg-[#06668C] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                                    1
                                </div>
                                <strong>Cliquer</strong>
                                <p className="text-sm text-gray-600 mt-2">
                                    Cliquez sur les points du graphique ou utilisez les boutons numériques
                                </p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                                    2
                                </div>
                                <strong>Envoyer</strong>
                                <p className="text-sm text-gray-600 mt-2">Envoyez vos résultats</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                                    3
                                </div>
                                <strong>Télécharger PDF</strong>
                                <p className="text-sm text-gray-600 mt-2">Téléchargez en PDF vos résultats</p>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "compte",
            title: "Gestion du compte",
            icon: "👤",
            content: (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-[#06668C] mb-4">Gestion de votre compte</h3>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-bold text-[#06668C] mb-4">🔐 Connexion</h4>
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h5 className="font-bold text-blue-800 mb-2">Première connexion</h5>
                                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                                    <li>Cliquez sur "Connexion" dans l'en-tête</li>
                                    <li>Saisissez votre adresse email</li>
                                    <li>Cliquez sur "Check" pour vérifier</li>
                                    <li>Si l'email existe et le mot de passe n'existe pas, créez votre mot de passe</li>
                                    <li>Si l'email existe et le mot de passe existe, saisissez votre mot de passe</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-bold text-[#06668C] mb-4">📊  Interface employé</h4>
                            <p className="text-gray-600 mb-4">Une fois connecté, accédez à :</p>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>formation</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>profile</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Vos formations (Mes fomrations)</span>
                                </li>
                                <li className="flex items-center">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span>Indisponibilité</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h4 className="text-lg font-bold text-[#06668C] mb-4">🔒 Sécurité</h4>
                            <div className="space-y-3">
                                <div className="p-3 bg-gray-50 rounded">
                                    <strong className="text-sm">Mot de passe</strong>
                                    <p className="text-xs text-gray-600">Minimum 6 caractères requis</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                    <strong className="text-sm">Données</strong>
                                    <p className="text-xs text-gray-600">Vos informations sont sécurisées</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded">
                                    <strong className="text-sm">Session</strong>
                                    <p className="text-xs text-gray-600">Déconnexion automatique après inactivité</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            id: "support",
            title: "Support & FAQ",
            icon: "❓",
            content: (
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-[#06668C] mb-4">Support et questions fréquentes</h3>

                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-xl">
                        <h4 className="text-xl font-bold mb-3">💬 Besoin d'aide ?</h4>
                        <p className="opacity-90">Consultez notre FAQ ci-dessous ou contactez notre équipe support.</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-bold text-[#06668C] mb-4">📞 Nous contacter</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl mb-2">📧</div>
                                <strong>Email</strong>
                                <p className="text-sm text-gray-600 mt-1">n.elasri@anep.ma</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl mb-2">📱</div>
                                <strong>Téléphone</strong>
                                <p className="text-sm text-gray-600 mt-1">📱Tél: +212 772-000605</p>
                                <p className="text-sm text-gray-600 mt-1">📱WhatsApp: +212 664-431935</p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl mb-2">⏰</div>
                                <strong>Horaires</strong>
                                <p className="text-sm text-gray-600 mt-1">Lun-Ven 9h-16h</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-bold text-[#06668C] mb-4">❓ Questions fréquentes</h4>
                        <div className="space-y-3">
                            {faqData.map((faq, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg">
                                    <button
                                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                        className="w-full text-left p-4 hover:bg-gray-50 transition-colors duration-200 flex justify-between items-center"
                                    >
                                        <span className="font-medium">{faq.question}</span>
                                        <span
                                            className={`transform transition-transform duration-200 ${expandedFAQ === index ? "rotate-180" : ""}`}
                                        >
                                            ▼
                                        </span>
                                    </button>
                                    {expandedFAQ === index && (
                                        <div className="px-4 pb-4 text-gray-600 border-t border-gray-100">
                                            <div className="pt-3">
                                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                                                    {faq.category}
                                                </span>
                                                <p>{faq.answer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ),
        },
    ]

    const filteredSections = sections.filter(
        (section) =>
            section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            section.content.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-br from-[#06668C] via-blue-700 to-green-600 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
                    <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div
                        className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">📖 Documentation</h1>
                        <p className="text-xl md:text-2xl mb-8 opacity-90">Guide complet d'utilisation de la plateforme</p>
                    </div>
                </div>
            </section>

            {/* Navigation des sections */}
            <section className="py-8 bg-white border-b sticky top-0 z-30">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeSection === section.id
                                        ? "bg-[#06668C] text-white shadow-lg"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                <span className="mr-2">{section.icon}</span>
                                {section.title}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contenu principal */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        {filteredSections.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucun résultat trouvé</h3>
                                <p className="text-gray-600">Essayez avec d'autres mots-clés</p>
                            </div>
                        ) : (
                            filteredSections
                                .filter((section) => section.id === activeSection)
                                .map((section) => (
                                    <div key={section.id} className="animate-fade-in">
                                        {section.content}
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </section>

            {/* Section d'aide rapide */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-[#06668C] mb-8">Aide rapide</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl">
                                <div className="text-3xl mb-3">🎯</div>
                                <h3 className="text-lg font-bold mb-2">Démarrage rapide</h3>
                                <p className="text-sm opacity-90">Connectez-vous et explorez les formations</p>
                            </div>

                            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl">
                                <div className="text-3xl mb-3">📚</div>
                                <h3 className="text-lg font-bold mb-2">Formations</h3>
                                <p className="text-sm opacity-90">Inscrivez-vous et voir le détail des formations</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl">
                                <div className="text-3xl mb-3">📊</div>
                                <h3 className="text-lg font-bold mb-2">Évaluation</h3>
                                <p className="text-sm opacity-90">Evaluer vos formations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}

export default DocumentationPage