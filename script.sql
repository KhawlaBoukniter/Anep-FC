CREATE TYPE detache_enum AS ENUM ('O', 'N');
CREATE TYPE sexe_enum AS ENUM ('F', 'M');
CREATE TYPE situation_familiale_enum AS ENUM ('M', 'C', 'D');
CREATE TYPE statut_enum AS ENUM ('activite', 'sortie de service');

ALTER TYPE situation_familiale_enum ADD VALUE 'AUTRE';

CREATE TABLE emploi (
    id_emploi SERIAL PRIMARY KEY,
    nom_emploi varchar(255) not null,
    entite VARCHAR(100) NOT NULL,
    formation VARCHAR(255) NOT NULL,
    experience INT,
    codeemploi VARCHAR(50) UNIQUE,
    poidsemploi INTEGER DEFAULT 0      
);

CREATE TABLE profile (
    id_profile SERIAL PRIMARY KEY,
    "NOM PRENOM" VARCHAR(255),
    "ADRESSE" VARCHAR(255) NULL,
    "DATE NAISS" DATE NULL,
    "DAT_REC" DATE NULL,
    "CIN" VARCHAR(20) NULL,
    "DETACHE" detache_enum,
    "SEXE" sexe_enum,
    "SIT_F_AG" situation_familiale_enum,
    "STATUT" statut_enum,
    "DAT_POS" DATE NULL,
    "LIBELLE GRADE" VARCHAR(200) NULL,
    "GRADE ASSIMILE" VARCHAR(200) NULL,
    "LIBELLE FONCTION" VARCHAR(200) NULL,
    "DAT_FCT" DATE NULL,
    "LIBELLE LOC" VARCHAR(200) NULL,
    "LIBELLE REGION" VARCHAR(200) NULL
);

CREATE TABLE employe (
    id_employe SERIAL PRIMARY KEY,
    nom_complet VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telephone1 VARCHAR(20),
    telephone2 VARCHAR(20),
    categorie VARCHAR(50),
    specialite VARCHAR(100),
    experience_employe int
);

CREATE TABLE emploi_employe (
    id SERIAL PRIMARY KEY,
    id_emploi int not null,
    id_employe int not null
);

CREATE TABLE competencesR (
    id_competencer serial primary key,
    code_competencer varchar(50),
    competencer varchar(255)
);

CREATE TABLE competencesa (
    id_competencea serial primary key,
    code_competencea varchar(50),
    competencea varchar(255)
);

CREATE TABLE emploi_competencer (
    id_emploi_competencer SERIAL primary key,
    id_emploi int,
    id_competencer int,
    niveaur int CHECK (niveaur in (1, 2, 3, 4))
);

CREATE TABLE employe_competencea (
    id_employe_competencea SERIAL primary key,
    id_employe int,
    id_competencea int,
    niveaua int CHECK (niveaua in (1, 2, 3, 4))
);

CREATE TABLE import_history (
  id SERIAL PRIMARY KEY,
  imported_at TIMESTAMP DEFAULT NOW(),
  identifier TEXT NOT NULL,
  action TEXT CHECK (action IN ('insert', 'update')),
  previous_data JSONB,
  new_data JSONB
);


ALTER TABLE employe_competencea DROP CONSTRAINT employe_competencea_niveaua_check;
ALTER TABLE employe_competencea ADD CONSTRAINT employe_competencea_niveaua_check CHECK (niveaua IN (0, 1, 2, 3, 4));


ALTER TABLE employe ADD COLUMN role varchar(50) not null check (role in ('user', 'admin')) DEFAULT 'user';
-- ALTER TABLE employe ADD COLUMN date_naissance DATE ;
-- ALTER TABLE employe ADD COLUMN date_recrutement DATE;
ALTER TABLE employe ADD COLUMN cin varchar(50);
ALTER TABLE employe ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE employe ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE employe ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE emploi ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE competencesr ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE competencesa ADD COLUMN archived BOOLEAN DEFAULT FALSE;
ALTER TABLE employe ADD COLUMN profile_id INTEGER REFERENCES profile(id_profile);

ALTER TABLE employe_competencea ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE employe_competencea ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE emploi_employe ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE emploi_employe ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE competencesa ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE competencesa ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE competencesr ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE competencesr ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE emploi ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE emploi ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

alter table profile add column created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
alter table profile add column updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

ALTER TABLE emploi_employe
ADD CONSTRAINT fk_emploi_employe_emploi
FOREIGN KEY (id_emploi) REFERENCES emploi(id_emploi) ON DELETE CASCADE;

ALTER TABLE emploi_employe
ADD CONSTRAINT fk_emploi_employe_employe
FOREIGN KEY (id_employe) REFERENCES employe(id_employe) ON DELETE CASCADE;

ALTER TABLE emploi_competencer
ADD CONSTRAINT fk_emploi_competencer_emploi
FOREIGN KEY (id_emploi) REFERENCES emploi(id_emploi) ON DELETE CASCADE;

ALTER TABLE emploi_competencer
ADD CONSTRAINT fk_emploi_competencer_competencer
FOREIGN KEY (id_competencer) REFERENCES competencesR(id_competencer) ON DELETE CASCADE;

ALTER TABLE employe_competencea
ADD CONSTRAINT fk_employe_competencea_employe
FOREIGN KEY (id_employe) REFERENCES employe(id_employe) ON DELETE CASCADE;

ALTER TABLE employe_competencea
ADD CONSTRAINT fk_employe_competencea_competencea
FOREIGN KEY (id_competencea) REFERENCES competencesa(id_competencea) ON DELETE CASCADE;



\copy emploi(entite, formation, experience, codeemploi, poidsemploi, nom_emploi) FROM 'C:\xampp\htdocs\Anep-FC\csv\tableau_emploi.csv' DELIMITER ';' CSV HEADER;
\copy employe(nom_complet, email, telephone1, telephone2, categorie, specialite, experience_employe) FROM 'C:\xampp\htdocs\Anep-FC\csv\tableau_employe1.csv' DELIMITER ';' CSV HEADER;
\copy emploi_employe(id_emploi, id_employe) FROM 'C:\xampp\htdocs\Anep-FC\csv\tableau_emploi_employe.csv' DELIMITER ';' CSV HEADER;
\copy competencesr(code_competencer, competencer) FROM 'C:\xampp\htdocs\Anep-FC\csv\competencer.csv' DELIMITER ';' CSV HEADER;
\copy competencesa(code_competencea, competencea) FROM 'C:\xampp\htdocs\Anep-FC\csv\competencea.csv' DELIMITER ';' CSV HEADER;
\copy emploi_competencer(id_emploi,id_competencer,niveaur) FROM 'C:\xampp\htdocs\Anep-FC\csv\emploi_competencer.csv' DELIMITER ';' CSV HEADER;
\copy employe_competencea(id_employe,id_competencea, niveaua) FROM 'C:\xampp\htdocs\Anep-FC\csv\employe_competencea.csv' DELIMITER ';' CSV HEADER;
\copy profile("CIN", "NOM PRENOM", "DATE NAISS", "DETACHE", "SEXE", "SIT_F_AG", "DAT_REC", "STATUT", "DAT_POS", "LIBELLE GRADE", "GRADE ASSIMILE", "LIBELLE FONCTION", "DAT_FCT", "LIBELLE LOC", "LIBELLE REGION", "ADRESSE") FROM 'C:\xampp\htdocs\Anep-FC\csv\profile.csv' DELIMITER ';' CSV HEADER;