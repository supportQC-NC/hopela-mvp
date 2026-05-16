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
import userRoutes      from "./routes/userRoutes.js";
import categorieRoutes from "./routes/categorieRoutes.js";
import metierRoutes    from "./routes/metierRoutes.js";
import serviceRoutes   from "./routes/serviceRoutes.js";
import uploadRoutes    from "./routes/uploadRoutes.js";
import photoRoutes     from "./routes/photoRoutes.js";
import contactRoutes   from "./routes/contactRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();
const httpServer = createServer(app);

// ==========================================
// SOCKET.IO
// ==========================================
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Socket connecté : ${socket.id}`);

  // Mise à jour position — tous rôles (user, admin, prestataire)
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

      io.emit("location_updated", { userId, longitude, latitude });
      console.log(`📍 Position mise à jour — user: ${userId} [${longitude}, ${latitude}]`);
    } catch (error) {
      console.error("Erreur update_location:", error.message);
      socket.emit("location_error", { message: "Erreur lors de la mise à jour de la position" });
    }
  });

  socket.on("stop_tracking", async ({ userId }) => {
    try {
      await User.findByIdAndUpdate(userId, { isTracked: false });
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
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// FICHIERS STATIQUES & DOSSIERS UPLOADS
// ==========================================
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Création automatique des dossiers nécessaires au démarrage
const uploadDirs = [
  "./uploads",
  "./uploads/logos",    // logos des prestataires
  "./uploads/services", // images des services
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé: ${dir}`);
  }
});

// ==========================================
// ROUTE DE BASE
// ==========================================
app.get("/", (req, res) => {
  res.send("API HOPELA is running...");
});

// ==========================================
// ROUTES API
// ==========================================
app.use("/api/users",      userRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/metiers",    metierRoutes);
app.use("/api/services",   serviceRoutes);
app.use("/api/upload",     uploadRoutes);
app.use("/api/photos",     photoRoutes);
app.use("/api/contact",    contactRoutes);

// ==========================================
// ERROR MIDDLEWARES
// ==========================================
app.use(notFound);
app.use(errorHandler);

// ==========================================
// DÉMARRAGE
// ==========================================
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready`);
});