require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env.production')

dotenv.config({ path: envPath });
console.log(`✅ Chargement config depuis: ${envPath}`);

// DB Connections
const { connectDB, pool, testPostgresConnection } = require('./config/database'); // Mongo + PostgreSQL

// Import socket
const setupSocket = require('./utils/socketManager');

// Express app
const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const { io, broadcastMessage } = setupSocket(server);

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
console.log("CORS origin:", corsOptions.origin);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions))


// Security
app.use(helmet());

const isDev = process.env.NODE_ENV === "development";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1000,
  message: {
    error: "Trop de requêtes envoyées. Veuillez réessayer plus tard.",
  },
});
app.use(limiter);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes MongoDB
app.use('/users', require('./routes/users'));
app.use('/courses', require('./routes/courses'));
// app.use('/auth', require('./routes/authontification'));
app.use('/evaluations', require('./routes/evaluations'));
app.use('/user-needs', require('./routes/UserNeedRoutes'));
app.use('/category', require('./routes/category'));
app.use('/statistics', require('./routes/statistics'));

// Routes PostgreSQL
app.use('/api/employees', require('./routes/employees'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/req-skills', require('./routes/reqSkills'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/profiles', require('./routes/profileImportRoutes'));
app.use('/api', require('./routes/syncRoutes'));
app.get("/api/employee-profiles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM profile");
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur lors de la récupération des profils PG :", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des profils." });
  }
});
app.use('/api/cycles-programs', require('./routes/cycleProgram'))
// Après les autres app.use()
app.use('/api/indisponibilites', require('./routes/indisponibilite'));

app.use('/api/evaluations', require('./routes/evaluations'));
// Test Message (Mongo)
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({ content: String });
const Message = mongoose.model('Message', messageSchema);

app.post('/messages', async (req, res) => {
  try {
    const { message } = req.body;
    const newMessage = new Message({ content: message });
    await newMessage.save();
    res.status(201).send('Message saved successfully');
  } catch (error) {
    res.status(500).send('Error saving message');
  }
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), environment: process.env.NODE_ENV });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Erreur:", err.stack);
  res.status(500).json({ error: "Erreur interne", message: process.env.NODE_ENV === "development" ? err.message : undefined });
});

// Start server
const startServer = async () => {
  try {
    await testPostgresConnection();
    await connectDB();

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`🚀 Serveur démarré sur le port ${port}`);
    });

    broadcastMessage('🛰 Notification test envoyée');
  } catch (err) {
    console.error('❌ Échec du démarrage:', err);
    process.exit(1);
  }
};
console.log("✅ Le BON serveur a démarré depuis :", __dirname);


startServer();

module.exports = app;
