// backend/server.js
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
dotenv.config();

import connectDB from "./config/db.js";
import User from "./models/UserModel.js";

// Import des routes
import userRoutes from "./routes/userRoutes.js";

// =======================================
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const PORT = process.env.PORT || 5000;

// Connexion à la base de données
connectDB();

const app = express();

// Créer le serveur HTTP à partir d'Express
const httpServer = createServer(app);

// Initialiser Socket.io sur le serveur HTTP
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

// ==========================================
// SOCKET.IO — Gestion des événements
// ==========================================
io.on("connection", (socket) => {
  console.log(`🔌 Socket connecté : ${socket.id}`);

  // Le prestataire envoie sa position
  socket.on("update_location", async ({ userId, longitude, latitude }) => {
    try {
      await User.findByIdAndUpdate(userId, {
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
          updatedAt: new Date(),
        },
        isTracked: true,
      });

      // Broadcast à tous les clients connectés (landing page incluse)
      io.emit("location_updated", { userId, longitude, latitude });

      console.log(`📍 Position mise à jour — user: ${userId} [${longitude}, ${latitude}]`);
    } catch (error) {
      console.error("Erreur update_location:", error.message);
      socket.emit("location_error", { message: "Erreur lors de la mise à jour de la position" });
    }
  });

  // Le prestataire coupe son tracking
  socket.on("stop_tracking", async ({ userId }) => {
    try {
      await User.findByIdAndUpdate(userId, { isTracked: false });

      // Broadcast pour retirer le marqueur de la carte
      io.emit("tracking_stopped", { userId });

      console.log(`🔴 Tracking arrêté — user: ${userId}`);
    } catch (error) {
      console.error("Erreur stop_tracking:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket déconnecté : ${socket.id}`);
  });
});

// ==========================================
// MIDDLEWARES EXPRESS
// ==========================================

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Cookie parser
app.use(cookieParser());

// Parser JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Créer les dossiers uploads si nécessaire
const uploadDirs = ["./uploads"];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé: ${dir}`);
  }
});

// Route de base
app.get("/", (req, res) => {
  res.send("API HOPELA is running...");
});

// ==========================================
// ROUTES API
// ==========================================
app.use("/api/users", userRoutes);

// ==========================================
// ERROR MIDDLEWARES
// ==========================================
app.use(notFound);
app.use(errorHandler);

// ==========================================
// DÉMARRAGE — httpServer et non app.listen
// ==========================================
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready`);
});