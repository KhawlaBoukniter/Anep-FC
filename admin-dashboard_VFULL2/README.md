# Dashboard Admin RH

Un système de gestion des ressources humaines avec React, Node.js, Express et PostgreSQL.

## 🚀 Fonctionnalités

- **Gestion des employés** : CRUD complet avec compétences
- **Gestion des emplois** : Définition des postes et compétences requises
- **Analyse des compétences** : Identification des écarts et besoins de formation
- **Dashboard interactif** : Interface moderne avec sidebar collapsible
- **API REST** : Backend robuste avec validation et gestion d'erreurs

## 🛠️ Technologies

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** avec requêtes optimisées
- **Joi** pour la validation
- **Helmet** pour la sécurité
- **CORS** et rate limiting

### Frontend
- **React 18** avec hooks
- **React Query** pour la gestion d'état serveur
- **Tailwind CSS** + **shadcn/ui**
- **Axios** pour les requêtes HTTP
- **React Router** pour la navigation

## 📦 Installation

### Prérequis
- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### 1. Cloner le projet
\`\`\`bash
git clone <repository-url>
cd hr-dashboard
\`\`\`

### 2. Configuration de la base de données
\`\`\`bash
# Créer la base de données
createdb hr_dashboard

# Exécuter le script SQL
psql -d hr_dashboard -f database/schema.sql
\`\`\`

### 3. Configuration du serveur
\`\`\`bash
cd server
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer le serveur
npm run dev
\`\`\`

### 4. Configuration du client
\`\`\`bash
cd client
npm install

# Démarrer l'application React
npm start
\`\`\`

## 🗄️ Structure de la base de données

\`\`\`sql
-- Tables principales
departments (id, name, description)
jobs (id, code, title, entity, formation, experience, weight_percentage, department_id)
skills (id, name, icon, category)
employees (id, first_name, last_name, email, phone, job_id, department_id, category, specialty, hire_date, role)

-- Tables de liaison
employee_skills (employee_id, skill_id, level)
job_required_skills (job_id, skill_id, required_level)
\`\`\`

## 🔌 API Endpoints

### Employés
- `GET /api/employees` - Liste des employés
- `POST /api/employees` - Créer un employé
- `PUT /api/employees/:id` - Modifier un employé
- `DELETE /api/employees/:id` - Supprimer un employé

### Emplois
- `GET /api/jobs` - Liste des emplois
- `POST /api/jobs` - Créer un emploi
- `PUT /api/jobs/:id` - Modifier un emploi
- `DELETE /api/jobs/:id` - Supprimer un emploi

### Compétences
- `GET /api/skills` - Liste des compétences
- `GET /api/skills/meta/categories` - Catégories de compétences

### Analyses
- `GET /api/analysis/skills-gap` - Analyse des écarts de compétences
- `GET /api/analysis/skills-distribution` - Distribution des compétences
- `GET /api/analysis/job-matching` - Correspondance emploi-employé

## 🎯 Utilisation

1. **Gestion des employés** : Ajoutez des employés avec leurs compétences et niveaux
2. **Définition des emplois** : Créez des postes avec les compétences requises
3. **Analyse des écarts** : Identifiez qui a besoin de formation pour quelles compétences
4. **Tableaux de bord** : Visualisez les statistiques et tendances

## 🔒 Sécurité

- Validation des données avec Joi
- Protection CORS configurée
- Rate limiting pour éviter les abus
- Helmet pour les en-têtes de sécurité
- Requêtes préparées contre l'injection SQL

## 🚀 Déploiement

### Production
\`\`\`bash
# Backend
cd server
npm start

# Frontend
cd client
npm run build
# Servir les fichiers statiques avec nginx ou autre
\`\`\`

### Variables d'environnement de production
\`\`\`env
NODE_ENV=production
DB_HOST=your-db-host
DB_NAME=hr_dashboard
DB_USER=your-db-user
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-key
CORS_ORIGIN=https://your-domain.com
\`\`\`

## 📈 Performances

- Requêtes SQL optimisées avec index
- Cache React Query côté client
- Pagination pour les grandes listes
- Lazy loading des composants

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
