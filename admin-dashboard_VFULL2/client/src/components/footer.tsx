import type React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#06668C] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <img src="/images/logo1.png" alt="Description" />
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Votre description d'entreprise ici. Nous offrons des services de qualité pour répondre à tous vos besoins.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-300 hover:text-green-400 transition-colors">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-green-400 transition-colors">
                  À propos
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-300 hover:text-green-400 transition-colors">
                  Services
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">Contact</h3>
            <div className="space-y-2 text-gray-300">
              <p className="font-medium">Email: contact@example.com</p>
              <p className="font-medium">Tél: +33 1 23 45 67 89</p>
              <p className="font-medium">Adresse: 123 Rue Example, Paris</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-900">© {new Date().getFullYear()} Anep. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
