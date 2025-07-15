const { Pool } = require("pg")
const mongoose = require("mongoose");
require("dotenv").config()

const pool = process.env.NODE_ENV === "production"
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  : new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: false,
  });

console.log("✅ SERVEUR DÉMARRÉ depuis:", __dirname);

pool.on("connect", () => {
  console.log("✅ Connecté à PostgreSQL")
})

pool.on("error", (err) => {
  console.error("❌ Erreur PostgreSQL:", err)
})

const testPostgresConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ PostgreSQL test de connexion OK");
  } catch (err) {
    console.error("❌ PostgreSQL erreur:", err.message);
    process.exit(1);
  }
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successful');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️ MongoDB déconnecté. Reconnexion...");
    setTimeout(connectDB, 5000);
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ Erreur MongoDB:", err.message);
  });
};

process.on("unhandledRejection", (err) => {
  console.error("❌ Rejection non gérée:", err);
  process.exit(1);
});



module.exports = {
  pool,
  connectDB,
  testPostgresConnection,
};