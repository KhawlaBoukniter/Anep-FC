const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Import des routes
const employeeRoutes = require("./routes/employees")
const jobRoutes = require("./routes/jobs")
const skillRoutes = require("./routes/skills")
const analysisRoutes = require("./routes/analysis")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware de sécurité
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
})
app.use(limiter)

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
)

// Middleware pour parser JSON
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/employees", employeeRoutes)
app.use("/api/jobs", jobRoutes)
app.use("/api/skills", skillRoutes)
app.use("/api/analysis", analysisRoutes)

// Route de santé
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
})

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error("❌ Erreur:", err.stack)
  res.status(500).json({
    error: "Erreur interne du serveur",
    message: process.env.NODE_ENV === "development" ? err.message : "Une erreur est survenue",
  })
})

// Route 404
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" })
})

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`)
  console.log(`📊 Dashboard API disponible sur http://localhost:${PORT}`)
})

module.exports = app
