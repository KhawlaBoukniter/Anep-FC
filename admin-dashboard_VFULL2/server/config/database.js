const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "anep-fc",
  password: process.env.DB_PASSWORD || "postgres",
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Test de connexion
pool.on("connect", () => {
  console.log("✅ Connecté à PostgreSQL")
})

pool.on("error", (err) => {
  console.error("❌ Erreur PostgreSQL:", err)
})

module.exports = pool
