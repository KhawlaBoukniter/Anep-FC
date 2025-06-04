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
    1: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", icon: "text-red-400" },
    2: { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", icon: "text-yellow-400" },
    3: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", icon: "text-blue-400" },
    4: { bg: "bg-green-50", border: "border-green-300", text: "text-green-700", icon: "text-green-400" },
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto font-sans">
      {Object.entries(grouped)
        .sort((a, b) => Number(a[0]) - Number(b[0])) 
        .map(([levelStr, comps]) => {
          const level = parseInt(levelStr);
          const isOpen = openLevels[level] ?? true;
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
                    className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 cursor-default"
                  >
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
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
    </div>
  );
}
