import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Competence = { id_competencea: number; competencea: string; niveaua: number };

export default function CompetencesByLevel({ competences }: { competences: Competence[] }) {
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
    1: { bg: "bg-red-200", text: "text-red-700", dot: "bg-red-500" },
    2: { bg: "bg-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500" },
    3: { bg: "bg-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
    4: { bg: "bg-green-200", text: "text-green-700", dot: "bg-green-500" },
  };

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([levelStr, comps]) => {
        const level = parseInt(levelStr);
        const isOpen = openLevels[level] ?? false;
        const colors = levelColors[level];

        return (
          <div key={level} className="border rounded-lg shadow-sm overflow-hidden">
            <button
              onClick={() => toggleLevel(level)}
              aria-expanded={isOpen}
              className={`
                w-full flex justify-between items-center px-5 py-3 font-semibold 
                ${colors.bg} ${colors.text} 
                hover:brightness-90
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${colors.text.replace("text-", "")}
                transition duration-200
              `}
            >
              <span>
                Niveau {level} <span className="text-gray-600 font-normal">({comps.length} compétence{comps.length > 1 ? "s" : ""})</span>
              </span>
              {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>
            {isOpen && (
              <ul className="px-8 py-4 bg-white space-y-2">
                {comps.map((comp) => (
                  <li
                    key={comp.id_competencea}
                    className="flex items-center gap-3 text-gray-800 text-base font-medium rounded-md p-2 hover:bg-gray-50 cursor-pointer transition"
                  >
                    <span className={`w-3 h-3 rounded-full ${colors.dot} flex-shrink-0`}></span>
                    {comp.competencea}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
