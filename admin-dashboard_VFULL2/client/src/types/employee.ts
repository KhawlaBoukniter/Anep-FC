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
  email: string | null;
  telephone1?: string | null;
  telephone2?: string | null;
  categorie?: string | null;
  specialite?: string | null;
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
  id_profile?: number;
  "NOM PRENOM": string;
  ADRESSE?: string | null;
  DATE_NAISS?: string | null;
  DAT_REC?: string | null;
  CIN?: string | null;
  DETACHE?: 'O' | 'N' | null;
  SEXE?: 'F' | 'M' | null;
  SIT_F_AG?: 'M' | 'C' | 'D' | null;
  STATUT?: 'activite' | 'sortie de service' | null;
  DAT_POS?: string | null;
  LIBELLE_GRADE?: string | null;
  GRADE_ASSIMILE?: string | null;
  LIBELLE_FONCTION?: string | null;
  DAT_FCT?: string | null;
  LIBELLE_LOC?: string | null;
  LIBELLE_REGION?: string | null;
}


export type { Employee, Competence, Emploi, Profile };