// backend/seeder.js
import dotenv from "dotenv";
import colors from "colors";

// Config
import connectDB from "./config/db.js";

// Models
import Categorie from "./models/CategorieModel.js";
import Metier    from "./models/MetierModel.js";
import User      from "./models/UserModel.js";
import Service   from "./models/ServiceModel.js";
import Demande   from "./models/DemandeModel.js";

// Data — 1 fichier par modèle
import categoriesData from "./data/categories.js";
import metiersData    from "./data/metiers.js";
import usersData      from "./data/users.js";
import servicesData   from "./data/services.js";
import demandesData   from "./data/demandes.js";

dotenv.config();
connectDB();

// ─────────────────────────────────────────────────────
const importData = async () => {
  try {
    // 1. Nettoyage complet (ordre inverse des dépendances)
    await Demande.deleteMany();
    await Service.deleteMany();
    await User.deleteMany();
    await Metier.deleteMany();
    await Categorie.deleteMany();
    console.log("🗑️  Base de données nettoyée".yellow);

    // 2. Créer les catégories
    const createdCategories = await Categorie.insertMany(categoriesData);
    console.log(`✅ ${createdCategories.length} catégorie(s) créée(s)`.green);

    // Map nom → ObjectId catégorie
    const categorieMap = {};
    createdCategories.forEach((c) => { categorieMap[c.nom] = c._id; });

    // 3. Créer les métiers (résolution de la catégorie par nom)
    const metiersReady = metiersData.map((m) => {
      const { categorieNom, ...cleanMetier } = m;
      const categorieId = categorieMap[categorieNom];

      if (!categorieId) {
        throw new Error(
          `Catégorie introuvable pour le métier "${m.nom}" : "${categorieNom}"`
        );
      }

      return { ...cleanMetier, categorie: categorieId };
    });

    const createdMetiers = await Metier.insertMany(metiersReady);
    console.log(`✅ ${createdMetiers.length} métier(s) créé(s)`.green);

    // Map nom → ObjectId métier
    const metierMap = {};
    createdMetiers.forEach((m) => { metierMap[m.nom] = m._id; });

    // 4. Créer les users (résolution du métier par nom)
    const createdUsers = [];
    for (const userData of usersData) {
      const { metierNom, ...cleanUser } = userData;

      if (metierNom) {
        const metierId = metierMap[metierNom];
        if (!metierId) {
          throw new Error(
            `Métier introuvable pour le prestataire "${userData.email}" : "${metierNom}"`
          );
        }
        cleanUser.metiers = [metierId];
      }

      const user = await User.create(cleanUser);
      createdUsers.push(user);
    }
    console.log(`✅ ${createdUsers.length} utilisateur(s) créé(s)`.green);

    // Map email → ObjectId (utilisé par les services ET les demandes)
    const userMap = {};
    createdUsers.forEach((u) => { userMap[u.email] = u._id; });

    // 5. Créer les services
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

    // 6. Créer les demandes
    // Résolution : clientEmail → ObjectId user
    //              metierNom  → ObjectId metier
    //              categorieNom → ObjectId categorie
    const demandesReady = [];

    for (const d of demandesData) {
      const { clientEmail, metierNom, categorieNom, longitude, latitude, adresse, statut, ...cleanDemande } = d;

      const clientId = userMap[clientEmail];
      if (!clientId) {
        console.warn(`⚠️  Client introuvable pour la demande: ${clientEmail}`.yellow);
        continue;
      }

      const metierId = metierMap[metierNom];
      if (!metierId) {
        console.warn(`⚠️  Métier introuvable pour la demande de ${clientEmail}: "${metierNom}"`.yellow);
        continue;
      }

      const categorieId = categorieMap[categorieNom];
      if (!categorieId) {
        console.warn(`⚠️  Catégorie introuvable pour la demande de ${clientEmail}: "${categorieNom}"`.yellow);
        continue;
      }

      // Calcul de expireAt : pour les demandes "expirees" en seed, on force une date passée.
      // Pour toutes les autres, le hook pre-save calcule createdAt + 48h normalement.
      const expireAt = statut === "expiree"
        ? new Date(Date.now() - 1000)           // 1 seconde dans le passé → déjà expirée
        : new Date(Date.now() + 48 * 60 * 60 * 1000); // + 48h → active

      demandesReady.push({
        ...cleanDemande,
        client:    clientId,
        metier:    metierId,
        categorie: categorieId,
        location: {
          type:        "Point",
          coordinates: [longitude, latitude],
          adresse:     adresse || null,
        },
        statut,
        expireAt,
      });
    }

    // insertMany contourne le hook pre-save pour expireAt — c'est voulu ici
    // puisque nous calculons expireAt explicitement ci-dessus.
    const createdDemandes = await Demande.insertMany(demandesReady);
    console.log(`✅ ${createdDemandes.length} demande(s) créée(s)`.green);

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
    await Demande.deleteMany();
    await Service.deleteMany();
    await User.deleteMany();
    await Metier.deleteMany();
    await Categorie.deleteMany();
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