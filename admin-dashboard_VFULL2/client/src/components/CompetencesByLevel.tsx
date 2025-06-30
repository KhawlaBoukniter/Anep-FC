import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Competence = { 
  id_competencea: number; 
  competencea: string; 
  niveaua: number;
  niveau_requis?: number; // Ajout du niveau requis
};

export default function CompetencesByLevel({ 
  competences,
  showAllCompetences,
  setShowAllCompetences 
}: { 
  competences: Competence[];
  showAllCompetences: boolean;
  setShowAllCompetences: (show: boolean) => void;
}) {
  const grouped = competences.reduce<Record<number, Competence[]>>((acc, comp) => {
    if (!acc[comp.niveaua]) acc[comp.niveaua] = [];
    acc[comp.niveaua].push(comp);
    return acc;
  }, {});

  const [openLevels, setOpenLevels] = useState<Record<number, boolean>>({});

  const toggleLevel = (level: number) => {
    setOpenLevels((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const levelColors = {
    1: { bg: "bg-red-200", border: "border-red-300", text: "text-red-700", icon: "text-red-400" },
    2: { bg: "bg-yellow-200", border: "border-yellow-300", text: "text-yellow-700", icon: "text-yellow-400" },
    3: { bg: "bg-blue-200", border: "border-blue-300", text: "text-blue-700", icon: "text-blue-400" },
    4: { bg: "bg-green-200", border: "border-green-300", text: "text-green-700", icon: "text-green-400" },
  };

  // Fonction pour afficher le niveau sous forme d'étoiles
  const renderStars = (niveau: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4].map((i) => (
          <span key={i} className={i <= niveau ? "text-yellow-500" : "text-gray-300"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      <Button 
        onClick={() => setShowAllCompetences(!showAllCompetences)}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white"
      >
        {showAllCompetences ? "Masquer la liste" : "Afficher toutes les compétences"}
      </Button>

      {showAllCompetences ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Liste complète des compétences</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compétence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau Acquis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau Requis</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Écart</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competences.map((comp) => {
                const ecart = comp.niveaua - (comp.niveau_requis || 0);
                return (
                  <tr key={comp.id_competencea}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comp.competencea}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderStars(comp.niveaua)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {comp.niveau_requis ? renderStars(comp.niveau_requis) : "-"}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      ecart >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {ecart >= 0 ? `+${ecart}` : ecart}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        Object.entries(grouped)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([levelStr, comps]) => {
            const level = parseInt(levelStr);
            const isOpen = openLevels[level] ?? false;
            const colors = levelColors[level] || levelColors[1];

            return (
              <section
                key={level}
                className={`rounded-lg border ${colors.border} shadow-sm`}
                aria-labelledby={`niveau-${level}`}
              >
                <button
                  onClick={() => toggleLevel(level)}
                  id={`niveau-${level}`}
                  aria-expanded={isOpen}
                  className={`flex justify-between items-center w-full px-6 py-4 text-lg font-semibold rounded-t-lg
                  ${colors.bg} ${colors.text} hover:brightness-95 transition`}
                >
                  <span>
                    Niveau {level}{" "}
                    <span className="text-gray-500 font-normal text-sm">
                      ({comps.length} compétence{comps.length > 1 ? "s" : ""})
                    </span>
                  </span>
                  {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>

                <ul
                  className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-in-out
                  px-6 py-4 space-y-3 ${
                    isOpen ? "max-h-[1000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-3"
                  }`}
                >
                  {comps.map((comp) => (
                    <li
                      key={comp.id_competencea}
                      className="flex justify-between items-center gap-3 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className={`${colors.icon} flex-shrink-0`}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          width={20}
                          height={20}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-800 font-medium">{comp.competencea}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Acquis:</span> {renderStars(comp.niveaua)}
                        </div>
                        {comp.niveau_requis && (
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">Requis:</span> {renderStars(comp.niveau_requis)}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
      )}
    </div>
  );
}