// src/services/socketManager.js
// ─────────────────────────────────────────────────────────────────────────────
// Module singleton : une seule instance Socket.io pour toute la durée de vie
// de l'application, indépendante du cycle de vie React et résistante au HMR.
// ─────────────────────────────────────────────────────────────────────────────
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Stocker le singleton sur window en dev pour survivre au HMR Webpack
// En prod, la variable de module suffit car il n'y a pas de HMR
const SINGLETON_KEY = "__hopela_socket__";

const createSocket = () => {
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("🔌 Socket connecté :", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Socket déconnecté :", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("🔴 Socket erreur :", err.message);
  });

  return socket;
};

// ── Récupérer ou créer l'instance unique ──────────────────────────────────────
const getSocket = () => {
  if (process.env.NODE_ENV === "development") {
    // En dev : stocker sur window pour survivre aux rechargements HMR de Webpack
    if (!window[SINGLETON_KEY]) {
      window[SINGLETON_KEY] = createSocket();
    }
    return window[SINGLETON_KEY];
  }

  // En prod : variable de module suffit
  if (!getSocket._instance) {
    getSocket._instance = createSocket();
  }
  return getSocket._instance;
};

export default getSocket;