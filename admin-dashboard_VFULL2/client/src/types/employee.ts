interface Competence {
  id_competencea: number;
  code_competencea: string;
  competencea: string;
  niveaua: number;
  created_at?: string;
  updated_at?: string;
}

interface Emploi {
  id_emploi: number;
  nom_emploi: string;
  entite: string;
  formation: string;
  experience?: number;
  codeemploi: string;
  poidsemploi: number;
  created_at?: string;
  updated_at?: string;
}

interface Employee {
  id_employe: number;
  profile: Profile | null;
  nom_complet: string;
  email: string;
  telephone1?: string;
  telephone2?: string;
  categorie?: string;
  specialite?: string;
  experience_employe?: number;
  role: "user" | "admin";
  archived: boolean;
  profile_id: number | null;
  cin: string | null;
  created_at?: string;
  updated_at?: string;
  competences?: Competence[];
  emplois?: Emploi[];
}

interface Profile {
  id_profile: number;
  "NOM PRENOM": string;
  ADRESSE?: string;
  DATE_NAISS?: string;
  DAT_REC?: string;
  CIN?: string;
  DETACHE: "O" | "N";
  SEXE: "F" | "M";
  SIT_F_AG: "M" | "C" | "D";
  STATUT: "activite" | "sortie de service";
  DAT_POS?: string;
  LIBELLE_GRADE?: string;
  GRADE_ASSIMILE?: string;
  LIBELLE_FONCTION?: string;
  DAT_FCT?: string;
  LIBELLE_LOC?: string;
  LIBELLE_REGION?: string;
}


export type { Employee, Competence, Emploi, Profile };