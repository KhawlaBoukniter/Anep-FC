require('dotenv').config();

const { Pool } = require('pg');
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path based on your project structure

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

async function syncProfiles() {
    try {
        const result = await pool.query('SELECT id_profile, "NOM PRENOM" FROM profile');
        console.log(`Found ${result.rowCount} profiles to sync`);

        for (const profile of result.rows) {
            console.log(`Syncing profile: id_profile=${profile.id_profile}, name=${profile["NOM PRENOM"]}`);
            // Generate a unique email if not provided (e.g., based on id_profile)
            const email = `user_${profile.id_profile}@anep.local`; // Temporary unique email
            await User.findOneAndUpdate(
                { name: profile["NOM PRENOM"] }, // Match by name
                { profileId: profile.id_profile, name: profile["NOM PRENOM"], email }, // Include email
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        console.log("Sync completed");
    } catch (error) {
        console.error('Sync error:', error);
    } finally {
        await pool.end();
        mongoose.connection.close();
        console.log('Database connections closed');
    }
}

syncProfiles().catch(console.error);