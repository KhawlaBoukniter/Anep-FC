CREATE TABLE emploi (
    id_emploi SERIAL PRIMARY KEY,
    nom_emploi varchar(255) not null,
    entite VARCHAR(100) NOT NULL,
    formation VARCHAR(255) NOT NULL,
    experience INT,
    codeemploi VARCHAR(50) UNIQUE,
    poidsemploi INTEGER DEFAULT 0      
);

CREATE TABLE employe (
    id_employe SERIAL PRIMARY KEY,
    nom_complet VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    adresse VARCHAR(255),
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


\copy emploi(entite, formation, experience, codeemploi, poidsemploi, nom_emploi) FROM 'C:\xampp\htdocs\Anep-FC\csv\tableau_emploi.csv' DELIMITER ';' CSV HEADER;
\copy employe(nom_complet, email, adresse, telephone1, telephone2, categorie, specialite, experience_employe) FROM 'C:\xampp\htdocs\Anep-FC\csv\tableau_employe.csv' DELIMITER ';' CSV HEADER;
\copy emploi_employe(id_emploi, id_employe) FROM 'C:\xampp\htdocs\Anep-FC\csv\tableau_emploi_employe.csv' DELIMITER ';' CSV HEADER;
\copy competencesr(code_competencer, competencer) FROM 'C:\xampp\htdocs\Anep-FC\csv\competencer.csv' DELIMITER ';' CSV HEADER;
\copy competencesa(code_competencea, competencea) FROM 'C:\xampp\htdocs\Anep-FC\csv\competencea.csv' DELIMITER ';' CSV HEADER;
\copy emploi_competencer(id_emploi,id_competencer,niveaur) FROM 'C:\xampp\htdocs\Anep-FC\csv\emploi_competencer.csv' DELIMITER ';' CSV HEADER;
\copy employe_competencea(id_employe,id_competencea, niveaua) FROM 'C:\xampp\htdocs\Anep-FC\csv\employe_competencea.csv' DELIMITER ';' CSV HEADER;