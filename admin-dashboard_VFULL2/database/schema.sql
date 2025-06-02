-- Base de données PostgreSQL pour le système RH

-- Table des départements
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des emplois/postes
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    formation TEXT,
    experience VARCHAR(50),
    weight_percentage INTEGER CHECK (weight_percentage >= 0 AND weight_percentage <= 100),
    department_id INTEGER REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des compétences
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10) DEFAULT '⭐',
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des employés
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    job_id INTEGER REFERENCES jobs(id),
    department_id INTEGER REFERENCES departments(id),
    category VARCHAR(50),
    specialty VARCHAR(100),
    hire_date DATE,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison employés-compétences (many-to-many)
CREATE TABLE employee_skills (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    level INTEGER CHECK (level >= 1 AND level <= 4),
    acquired_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(employee_id, skill_id)
);

-- Table de liaison emplois-compétences requises (many-to-many)
CREATE TABLE job_required_skills (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 4),
    UNIQUE(job_id, skill_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_job ON employees(job_id);
CREATE INDEX idx_employee_skills_employee ON employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill ON employee_skills(skill_id);
CREATE INDEX idx_job_skills_job ON job_required_skills(job_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données de test
INSERT INTO departments (name, description) VALUES
('IT', 'Département Informatique'),
('Design', 'Département Design'),
('Management', 'Département Management'),
('Marketing', 'Département Marketing'),
('RH', 'Département Ressources Humaines');

INSERT INTO skills (name, icon, category) VALUES
('Programmation', '💻', 'Technique'),
('Langues étrangères', '🌍', 'Communication'),
('Gestion d''équipe', '👥', 'Management'),
('Rédaction', '✏️', 'Communication'),
('Design', '🎨', 'Créatif'),
('Communication', '💬', 'Soft Skills'),
('Marketing', '📊', 'Business'),
('Comptabilité', '🧮', 'Finance'),
('Vente', '🤝', 'Commercial'),
('Analyse de données', '📈', 'Analytique');

INSERT INTO jobs (code, title, entity, formation, experience, weight_percentage, department_id) VALUES
('DEV-001', 'Développeur Full Stack', 'Département IT', 'Master en Informatique', '3-5 ans', 85, 1),
('DES-002', 'Designer UX/UI', 'Département Design', 'Master en Design', '2-4 ans', 90, 2),
('MAN-003', 'Chef de Projet', 'Département Management', 'MBA ou équivalent', '5+ ans', 100, 3),
('MKT-004', 'Analyste Marketing', 'Département Marketing', 'Master Marketing Digital', '1-3 ans', 75, 4),
('DEV-005', 'Développeur Frontend', 'Département IT', 'BTS Informatique', '1-2 ans', 60, 1),
('RH-006', 'Responsable RH', 'Département RH', 'Master RH', '3-4 ans', 80, 5);
