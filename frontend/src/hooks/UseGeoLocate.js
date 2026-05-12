// src/hooks/useGeolocate.js
import { useDispatch, useSelector } from "react-redux";
import { setSharing, setWatchId } from "../slices/locationSlice";
import useSocket from "./UseSocket";

const useGeolocate = () => {
  const dispatch = useDispatch();
  const { isSharing, watchId } = useSelector((state) => state.location);
  const { userInfo } = useSelector((state) => state.auth);
  const { emitLocation, emitStopTracking } = useSocket();

  // Démarrer le partage de position GPS
  const startTracking = () => {
    if (!navigator.geolocation) {
      console.error("Géolocalisation non supportée par ce navigateur");
      return;
    }

    if (!userInfo?._id) {
      console.error("Utilisateur non connecté");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        emitLocation(userInfo._id, longitude, latitude);
      },
      (error) => {
        console.error("Erreur géolocalisation:", error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,   // Utiliser une position en cache max 5s
        timeout: 10000,     // Timeout après 10s
      }
    );

    dispatch(setWatchId(id));
    dispatch(setSharing(true));
  };

  // Arrêter le partage
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      dispatch(setWatchId(null));
    }

    if (userInfo?._id) {
      emitStopTracking(userInfo._id);
    }

    dispatch(setSharing(false));
  };

  return { isSharing, startTracking, stopTracking };
};

export default useGeolocate;