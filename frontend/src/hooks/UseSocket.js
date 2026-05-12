// src/hooks/useSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import {
  updatePrestairePosition,
  removePrestataire,
} from "../slices/locationSlice";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socketInstance = null; // singleton — une seule connexion pour toute l'app

const useSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    // Réutiliser la connexion existante si déjà ouverte
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });
    }

    socketRef.current = socketInstance;

    // ── Écouter les mises à jour de position ──
    socketRef.current.on("location_updated", ({ userId, longitude, latitude }) => {
      dispatch(updatePrestairePosition({ userId, longitude, latitude }));
    });

    // ── Écouter l'arrêt du tracking ──
    socketRef.current.on("tracking_stopped", ({ userId }) => {
      dispatch(removePrestataire({ userId }));
    });

    socketRef.current.on("connect", () => {
      console.log("🔌 Socket connecté :", socketRef.current.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket déconnecté");
    });

    return () => {
      // Nettoyer les listeners sans fermer la connexion (singleton)
      socketRef.current.off("location_updated");
      socketRef.current.off("tracking_stopped");
      socketRef.current.off("connect");
      socketRef.current.off("disconnect");
    };
  }, [dispatch]);

  // ── Envoyer sa position (prestataire) ──
  const emitLocation = (userId, longitude, latitude) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("update_location", { userId, longitude, latitude });
    }
  };

  // ── Arrêter le partage (prestataire) ──
  const emitStopTracking = (userId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("stop_tracking", { userId });
    }
  };

  return { emitLocation, emitStopTracking, socket: socketRef.current };
};

export default useSocket;