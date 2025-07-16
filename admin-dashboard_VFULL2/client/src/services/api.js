import axios from "axios"

// Configuration de base d'Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
})


// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem("token")
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
      localStorage.removeItem("token")
      window.location.href = "/"
    }

    console.error("Erreur API:", error.response?.data || error.message)
    return Promise.reject(error)
  },
)

// Services pour les employés
export const employeeService = {
  getAllProfiles: (params = {}) => api.get("/api/employee-profiles", { params }),
  getAll: (params = {}) => api.get("/api/employees", { params }),
  getById: (id) => api.get(`/api/employees/${id}`),
  create: (data) => api.post("/api/employees", data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  delete: (id) => api.delete(`/api/employees/${id}`),
  createSkill: (data) => api.post("/api/skills", data),
  archive: (id) => api.put(`/api/employees/${id}/archive`),
  unarchive: (id) => api.put(`/api/employees/${id}/unarchive`),
}

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});
// Services pour les emplois
export const jobService = {
  getAll: (params = {}) => api.get("/api/jobs", { params }),
  getById: (id) => api.get(`/api/jobs/${id}`),
  create: (data) => api.post("/api/jobs", data),
  update: (id, data) => api.put(`/api/jobs/${id}`, data),
  delete: (id) => api.delete(`/api/jobs/${id}`),
  archive: (id) => api.put(`/api/jobs/${id}/archive`),
  unarchive: (id) => api.put(`/api/jobs/${id}/unarchive`),
  importFile: async (formData) => {
    return api.post("/api/jobs/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

// Services pour les compétences
export const skillService = {
  getAll: (params = {}) => api.get("/api/skills", { params }),
  getById: (id) => api.get(`/api/skills/${id}`),
  create: (data) => api.post("/api/skills", data),
  update: (id, data) => api.put(`/api/skills/${id}`, data),
  delete: (id) => api.delete(`/api/skills/${id}`),
}

export const reqSkillService = {
  getAll: (params = {}) => api.get("/api/req-skills", { params }),
  getById: (id) => api.get(`/api/req-skills/${id}`),
  create: (data) => api.post("/api/req-skills", data),
  update: (id, data) => api.put(`/api/req-skills/${id}`, data),
  delete: (id) => api.delete(`/api/req-skills/${id}`),
  getLatestCode: () => api.get("/api/req-skills/latest-code"),
  archive: (id) => api.put(`/api/req-skills/${id}/archive`),
  unarchive: (id) => api.put(`/api/req-skills/${id}/unarchive`),
}

// Services pour les analyses
export const analysisService = {
  getSkillsGap: (params) => api.get("/api/analysis/skills-gap", { params }),
  getSkillsDistribution: () => api.get("/api/analysis/skills-distribution"),
  getDepartmentSkills: () => api.get("/api/analysis/department-skills"),
  getJobMatching: (jobId) => api.get("/api/analysis/job-matching", { params: { job_id: jobId } }),
  getSkillsAnalysis: () => api.get("/api/analysis/skills-analysis"),
}

// Services pour les indisponibilités
export const indisponibiliteService = {
  getAll: (params = {}) => api.get("/api/indisponibilites", { params }),
  getById: (id) => api.get(`/api/indisponibilites/${id}`),
  getByEmployeId: (employeId) => api.get(`/api/indisponibilites/employe/${employeId}`),
  create: (data) => api.post("/api/indisponibilites", data),
  update: (id, data) => api.put(`/api/indisponibilites/${id}`, data),
  delete: (id) => api.delete(`/api/indisponibilites/${id}`),
};
// Service de santé de l'API
export const healthService = {
  check: () => api.get("/api/health"),
}

export default api
