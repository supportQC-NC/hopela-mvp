/* eslint-disable react-hooks/exhaustive-deps */
// src/hooks/UseSocket.js
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { updatePrestairePosition, removePrestataire } from "../slices/locationSlice";

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const getSocket = () => {
  if (!window.__hopela_socket__ || window.__hopela_socket__.disconnected) {
    window.__hopela_socket__ = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    window.__hopela_socket__.on("connect",    () => console.log("🔌 Socket connecté :", window.__hopela_socket__.id));
    window.__hopela_socket__.on("disconnect", (r) => console.log("❌ Socket déconnecté :", r));
    window.__hopela_socket__.on("connect_error", (e) => console.error("🔴 Socket erreur :", e.message));
  }
  return window.__hopela_socket__;
};

const useSocket = () => {
  const dispatch    = useDispatch();
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    const socket = getSocket();
    const onLocationUpdated = ({ userId, longitude, latitude }) =>
      dispatchRef.current(updatePrestairePosition({ userId, longitude, latitude }));
    const onTrackingStopped = ({ userId }) =>
      dispatchRef.current(removePrestataire({ userId }));
    socket.on("location_updated", onLocationUpdated);
    socket.on("tracking_stopped", onTrackingStopped);
    return () => {
      socket.off("location_updated", onLocationUpdated);
      socket.off("tracking_stopped", onTrackingStopped);
    };
  }, []);

  const emitLocation = (userId, longitude, latitude) => {
    const s = getSocket();
    if (s.connected) s.emit("update_location", { userId, longitude, latitude });
    else console.warn("Socket non connecte");
  };

  const emitStopTracking = (userId) => {
    const s = getSocket();
    if (s.connected) s.emit("stop_tracking", { userId });
  };

  return { emitLocation, emitStopTracking };
};

export default useSocket;