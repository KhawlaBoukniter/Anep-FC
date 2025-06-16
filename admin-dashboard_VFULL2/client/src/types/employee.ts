interface Competence {
  id_competencea: number;
  code_competencea: string;
  competencea: string;
  niveaua: number;
}

interface Emploi {
  id_emploi: string;
  nom_emploi: string;
  codeemploi: string;
}

interface Employee {
  id: string;
  nom_complet: string;
  email: string;
  adresse?: string;
  telephone1?: string;
  telephone2?: string;
  categorie?: string;
  specialite?: string;
  experience_employe?: number;
  role: "user" | "admin";
  date_naissance?: string;
  date_recrutement?: string;
  cin?: string;
  archived: boolean;
  competences?: Competence[];
  emplois?: Emploi[];
}

export type { Employee, Competence, Emploi };