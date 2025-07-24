import type React from "react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#06668C] text-white py-12">
      <div className="mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <img src="/images/logo1.png" alt="Description" />
              </div>
            </div>
            <p className="text-gray-300 mb-4 text-left ml-20">
             L’Agence Nationale des Équipements Publics (ANEP) est un établissement public chargé de la maîtrise d’ouvrage déléguée pour la réalisation d’équipements publics. Elle œuvre aussi pour le développement des compétences à travers des actions de formation continue destinées à ses collaborateurs.            </p>
          </div>

        

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold text-white mt-4">Contact</h3>
            <div className="space-y-2 text-gray-300 mt-6 text-left ml-20 ">
              <p className="font-medium">Email: N.elasri@anep.ma</p>
              <p className="font-medium">Tél: +212 772-000605 </p>
              <p className="font-medium">WhatsApp: +212 664-431935 </p>
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
