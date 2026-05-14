// src/hooks/UseSocket.js
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useDispatch } from "react-redux";
import {
  updatePrestairePosition,
  removePrestataire,
} from "../slices/locationSlice";

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Singleton — une seule connexion socket pour toute l'app
const getSocket = () => {
  if (!window.__hopela_socket__ || window.__hopela_socket__.disconnected) {
    window.__hopela_socket__ = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    window.__hopela_socket__.on("connect", () =>
      console.log("🔌 Socket connecté :", window.__hopela_socket__.id)
    );
    window.__hopela_socket__.on("disconnect", (reason) =>
      console.log("❌ Socket déconnecté :", reason)
    );
    window.__hopela_socket__.on("connect_error", (e) =>
      console.error("🔴 Socket erreur :", e.message)
    );
    // Reconnexion automatique — réémet la position si le prestataire était en train de tracker
    window.__hopela_socket__.on("reconnect", () =>
      console.log("🔄 Socket reconnecté")
    );
  }
  return window.__hopela_socket__;
};

const useSocket = () => {
  const dispatch    = useDispatch();
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    const socket = getSocket();

    // ── Fonctions nommées — INDISPENSABLE pour retirer uniquement CE listener
    // sans .off("event") sans argument (qui retire TOUS les listeners)
    const onLocationUpdated = ({ userId, longitude, latitude }) => {
      const state = window.__hopela_redux_store__?.getState?.();
      const prestataires = state?.location?.prestataires || [];
      const existe = prestataires.some((p) => p._id === userId);

      if (existe) {
        // Prestataire connu — simple mise à jour de position
        dispatchRef.current(updatePrestairePosition({ userId, longitude, latitude }));
      } else {
        // Prestataire inconnu (était hors ligne, vient de se remettre en ligne)
        // On fetch ses infos depuis l'API pour l'ajouter à la carte
        fetch(`${SOCKET_URL}/api/users/prestataires/positions/public`)
          .then((r) => r.ok ? r.json() : [])
          .then((prestataires) => {
            const prestaireData = prestataires.find((p) => p._id === userId);
            dispatchRef.current(updatePrestairePosition({
              userId, longitude, latitude, prestaireData: prestaireData || null,
            }));
          })
          .catch(() => {
            // Fallback sans données complètes
            dispatchRef.current(updatePrestairePosition({ userId, longitude, latitude }));
          });
      }
    };

    const onTrackingStopped = ({ userId }) => {
      dispatchRef.current(removePrestataire({ userId }));
    };

    // Quand le socket se reconnecte, on re-fetch les positions
    // pour remettre à jour la carte avec l'état réel de la BDD
    const onReconnect = () => {
      console.log("🔄 Socket reconnecté — resync positions");
    };

    socket.on("location_updated", onLocationUpdated);
    socket.on("tracking_stopped", onTrackingStopped);
    socket.on("reconnect",        onReconnect);

    return () => {
      // Retirer UNIQUEMENT ce listener précis, pas tous les listeners de l'événement
      socket.off("location_updated", onLocationUpdated);
      socket.off("tracking_stopped", onTrackingStopped);
      socket.off("reconnect",        onReconnect);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const emitLocation = (userId, longitude, latitude) => {
    const s = getSocket();
    if (s.connected) {
      s.emit("update_location", { userId, longitude, latitude });
    } else {
      console.warn("⚠️ Socket non connecté — position non émise");
    }
  };

  const emitStopTracking = (userId) => {
    const s = getSocket();
    if (s.connected) {
      s.emit("stop_tracking", { userId });
    }
  };

  return { emitLocation, emitStopTracking };
};

export default useSocket;