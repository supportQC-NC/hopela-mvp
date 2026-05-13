// backend/seeder.js
import dotenv from "dotenv";
import colors from "colors";

// Config
import connectDB from "./config/db.js";

// Models
import User    from "./models/UserModel.js";
import Metier  from "./models/MetierModel.js";
import Service from "./models/ServiceModel.js";

// Data — 1 fichier par modèle
import usersData    from "./data/users.js";
import metiersData  from "./data/metiers.js";
import servicesData from "./data/services.js";

dotenv.config();
connectDB();

// ─────────────────────────────────────────────────────
const importData = async () => {
  try {
    // 1. Nettoyage complet (ordre inverse des dépendances)
    await Service.deleteMany();
    await User.deleteMany();
    await Metier.deleteMany();
    console.log("🗑️  Base de données nettoyée".yellow);

    // 2. Créer les métiers
    const createdMetiers = await Metier.insertMany(metiersData);
    console.log(`✅ ${createdMetiers.length} métier(s) créé(s)`.green);

    // Map nom → ObjectId
    const metierMap = {};
    createdMetiers.forEach((m) => { metierMap[m.nom] = m._id; });

    // 3. Créer les users
    const createdUsers = [];
    for (const userData of usersData) {
      const { metierNom, ...cleanUser } = userData;
      if (metierNom && metierMap[metierNom]) {
        cleanUser.metiers = [metierMap[metierNom]];
      }
      const user = await User.create(cleanUser);
      createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} utilisateur(s) créé(s)`.green);

    // Map email → ObjectId pour lier les services aux prestataires
    const userMap = {};
    createdUsers.forEach((u) => { userMap[u.email] = u._id; });

    // 4. Créer les services
    const servicesReady = [];
    for (const s of servicesData) {
      const { prestataireEmail, ...cleanService } = s;
      const prestataireId = userMap[prestataireEmail];
      if (!prestataireId) {
        console.warn(`⚠️  Prestataire introuvable: ${prestataireEmail}`.yellow);
        continue;
      }
      servicesReady.push({ ...cleanService, prestataire: prestataireId });
    }
    const createdServices = await Service.insertMany(servicesReady);
    console.log(`✅ ${createdServices.length} service(s) créé(s)`.green);

    console.log("=".repeat(50).cyan);
    console.log("🚀 Données importées avec succès !".green.bold);
    process.exit();
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`.red.bold);
    console.error(error);
    process.exit(1);
  }
};

// ─────────────────────────────────────────────────────
const destroyData = async () => {
  try {
    await Service.deleteMany();
    await User.deleteMany();
    await Metier.deleteMany();
    console.log("🗑️  Toutes les données ont été supprimées !".red.bold);
    process.exit();
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`.red.bold);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}