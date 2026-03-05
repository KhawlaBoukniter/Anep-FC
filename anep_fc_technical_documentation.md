# Documentation Technique : ANEP - Gestion de la Formation Continue (Anep-FC)

## 1. Présentation du projet

### Contexte
L'application **Anep-FC** est une plateforme centralisée conçue pour l'Agence Nationale d'Édition et de Publicité (ANEP). Elle vise à moderniser et automatiser la gestion du plan de formation continue des employés.

### Objectifs de l'application
- **Centralisation des données RH** : Regrouper les profils des employés, leurs compétences et leurs historiques de formation.
- **Gestion du catalogue de formation** : Création, planification et suivi des modules de formation.
- **Analyse des écarts de compétences** : Identifier les besoins en formation en comparant les compétences actuelles des employés aux exigences de leurs postes.
- **Suivi des évaluations** : Mesurer l'efficacité des formations via des évaluations à chaud et à froid.

### Problématique résolue
Le projet remplace les processus manuels et les données fragmentées par une solution intégrée permettant une meilleure visibilité sur le capital humain et une optimisation du budget alloué à la formation.

---

## 2. Architecture générale

### Architecture Globale
L'application suit une architecture **MERN (avec une variante SQL)** :
- **Frontend** : Application Single Page (SPA) développée avec **React.js**.
- **Backend** : API RESTful construite avec **Node.js** et **Express**.
- **Bases de données hybrides** :
    - **MongoDB (NoSQL)** : Utilisée pour les données flexibles (cours, évaluations, notifications).
    - **PostgreSQL (Relationnel)** : Utilisée pour les données structurées RH (employés, fiches de poste, référentiels de compétences).

### Technologies utilisées
| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Frontend** | React, Tailwind CSS, MUI | Interface utilisateur et design system |
| **Backend** | Node.js, Express | Logique métier et API REST |
| **BDD NoSQL** | MongoDB (Mongoose) | Stockage des formations et logs |
| **BDD SQL** | PostgreSQL (PG Pool) | Données RH et structure organisationnelle |
| **Temps Réel** | Socket.io | Notifications instantanées |
| **Sécurité** | JWT, Bcrypt, Helmet | Authentification et protection |

---

## 3. Structure du projet

### Arborescence Simplifiée

#### Backend (`/server`)
- `config/` : Configuration des connexions bases de données (Mongo/PG).
- `controllers/` : Logique de traitement des requêtes (ex: [courseController.js](file:///c:/xampp/htdocs/Anep-FC/admin-dashboard_VFULL2/server/controllers/courseController.js)).
- `models/` : Définitions des schémas NoSQL et requêtes SQL complexes.
- `routes/` : Définition des points d'entrée de l'API.
- `utils/` : Services transversaux (gestion des sockets, upload de fichiers).
- `validators/` : Schémas de validation des données (Joi/Express-validator).
- [server.js](file:///c:/xampp/htdocs/Anep-FC/admin-dashboard_VFULL2/server/server.js) : Point d'entrée de l'application backend.

#### Frontend (`/client`)
- `src/components/` : Composants UI réutilisables (boutons, formulaires, tableaux).
- `src/pages/` : Vues complètes (Dashboard, Profil, Gestion des cours).
- `src/hooks/` : Hooks React personnalisés pour la gestion d'état.
- `src/services/` : Client API (Axios) pour communiquer avec le backend.
- `src/layout/` : Structure de navigation et de mise en page.

---

## 4. Modélisation des données

### MongoDB (Mongoose)
Les modèles MongoDB privilégient la flexibilité :
- **User** : Stocke l'authentification et les préférences.
- **Course** : Détails des formations, budget, participants, et commentaires.
- **Category** : Classification des modules de formation.
- **UserNeed** : Besoins exprimés par les collaborateurs.

### PostgreSQL
La structure SQL assure l'intégrité référentielle des données RH :
- **Employe** : Nom, email, role, et lien vers le profil détaillé.
- **Emploi (Job)** : Fiches de poste avec code emploi et entité.
- **Competences** : Référentiel des compétences (techniques et soft skills).
- **Profile** : Données administratives détaillées importées des systèmes tiers.

---

## 5. API Backend

### Endpoints Principaux (MongoDB)
| Route | Méthode | Description |
| :--- | :--- | :--- |
| `/users` | `GET, POST, PUT` | Gestion des utilisateurs et rôles |
| `/courses` | `GET, POST, DELETE` | Gestion du catalogue de formation |
| `/evaluations` | `POST, GET` | Soumission et lecture des évaluations |
| `/statistics` | `GET` | Données agrégées pour le dashboard |

### Endpoints Principaux (PostgreSQL)
| Route | Méthode | Description |
| :--- | :--- | :--- |
| `/api/employees` | `GET, POST, PUT` | Gestion du personnel |
| `/api/jobs` | `GET, POST` | Gestion des référentiels métiers |
| `/api/skills` | `GET, POST` | Référentiel de compétences |
| `/api/analysis` | `GET` | Calcul de l'écart (gap analysis) |
| `/api/sync` | `POST` | Synchronisation entre les profils et les employés |

Example de réponse JSON (`/api/employees/1`) :
```json
{
  "id": "1",
  "nom_complet": "Jean Dupont",
  "email": "j.dupont@anep.dz",
  "role": "manager",
  "competences": [
    {"code_competencea": "COMP01", "niveaua": 4}
  ]
}
```

---

## 6. Fonctionnalités principales

1. **Gestion des employés** : Cycle de vie complet du collaborateur, de l'importation du profil à l'archivage.
2. **Gestion des compétences** : Évaluation des niveaux actuels vs requis.
3. **Modules de formation** : Planification de sessions avec gestion des formateurs (internes/externes).
4. **Cycles de formation** : Regroupement de modules sur une période donnée (Plan de formation annuel).
5. **Évaluations** : Feedback multilatéral après formation.
6. **Authentification** : Gestion par rôles (Admin, Manager, Employé).

---

## 7. Flux de fonctionnement

1. **Collecte** : Le système importe les profils depuis PostgreSQL.
2. **Analyse** : Le module d'analyse compare les `competences_employe` aux `competences_requises` du job associé.
3. **Planification** : L'admin crée des `Courses` (MongoDB) pour combler les écarts identifiés.
4. **Exécution** : Les employés sont notifiés via **Socket.io** et s'inscrivent aux cours.
5. **Clôture** : Après la formation, les évaluations sont enregistrées et les statistiques mises à jour.

---

## 8. Sécurité

- **JWT (JSON Web Token)** : Utilisation de tokens pour sécuriser chaque requête API.
- **CORS** : Restriction des domaines autorisés à interagir avec l'API.
- **Environment Variables** : Sécurisation des credentials via fichiers `.env`.
- **Validation** : Double validation (Frontend via Formik/Regex, Backend via Joi/Validator).

---

## 9. Installation et déploiement

### Prérequis
- Node.js (v16+)
- MongoDB et PostgreSQL installés localement ou accessibles via URI.

### Installation
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm start
```

---

## 10. Améliorations possibles

- **Optimisation** : Mise en cache Redis pour les statistiques lourdes.
- **Scalabilité** : Conteneurisation (Docker) pour faciliter le déploiement.
- **Sécurité** : Intégration d'un système 2FA pour les accès administratifs.
