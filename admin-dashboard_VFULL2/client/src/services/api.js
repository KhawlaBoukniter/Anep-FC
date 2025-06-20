import axios from "axios"

// Configuration de base d'Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Gestion globale des erreurs
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem("authToken")
      window.location.href = "/login"
    }

    console.error("Erreur API:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Services pour les employés
export const employeeService = {
  getAll: (params = {}) => api.get("/employees", { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post("/employees", data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  createSkill: (data) => api.post("/skills", data),
  archive: (id) => api.put(`/employees/${id}/archive`),
  unarchive: (id) => api.put(`/employees/${id}/unarchive`),
}

// Services pour les emplois
export const jobService = {
  getAll: (params = {}) => api.get("/jobs", { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post("/jobs", data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  archive: (id) => api.put(`/jobs/${id}/archive`), 
  unarchive: (id) => api.put(`/jobs/${id}/unarchive`),
}

// Services pour les compétences
export const skillService = {
  getAll: (params = {}) => api.get("/skills", { params }),
  getById: (id) => api.get(`/skills/${id}`),
  create: (data) => api.post("/skills", data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
}

export const reqSkillService = {
  getAll: (params = {}) => api.get("/req-skills", { params }),
  getById: (id) => api.get(`/req-skills/${id}`),
  create: (data) => api.post("/req-skills", data),
  update: (id, data) => api.put(`/req-skills/${id}`, data),
  delete: (id) => api.delete(`/req-skills/${id}`),
  getLatestCode: () => api.get("/req-skills/latest-code"),
}

// Services pour les analyses
export const analysisService = {
  getSkillsGap: (params) => api.get("/analysis/skills-gap", { params }),
  getSkillsDistribution: () => api.get("/analysis/skills-distribution"),
  getDepartmentSkills: () => api.get("/analysis/department-skills"),
  getJobMatching: (jobId) => api.get("/analysis/job-matching", { params: { job_id: jobId } }),
  getSkillsAnalysis: () => api.get("/analysis/skills-analysis"),
}

// Service de santé de l'API
export const healthService = {
  check: () => api.get("/health"),
}

export default api
