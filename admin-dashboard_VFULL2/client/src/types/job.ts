interface Competence {
  id_competencer: number;
  code_competencer: string;
  competencer: string;
  niveaur: number;
}


interface Emploi {
  id_emploi: number;
  nom_emploi: string;
  entite: string;
  formation: string;
  experience?: number; 
  codeemploi: string; 
  poidsemploi?: number; 
}

