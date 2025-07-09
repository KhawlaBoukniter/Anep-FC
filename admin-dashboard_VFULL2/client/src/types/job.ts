interface Competence {
  id_competencer: string; // Changed to string to match backend string conversion
  code_competencer: string;
  competencer: string;
  niveaur: number;
}

interface Job {
  id_emploi: string; // Changed to string to match backend string conversion
  nom_emploi: string;
  entite: string;
  formation: string;
  experience?: number | null;
  codeemploi: string;
  poidsemploi?: number;
  common_file?: string | null;
  archived: boolean;
  required_skills?: Competence[];
}

export type { Job, Competence };