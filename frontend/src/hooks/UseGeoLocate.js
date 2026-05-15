// /* eslint-disable react-hooks/exhaustive-deps */
// // src/hooks/UseGeoLocate.js
// import { useDispatch, useSelector } from "react-redux";
// import { setSharing, setWatchId } from "../slices/locationSlice";
// import useSocket from "./UseSocket";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// const useGeolocate = () => {
//   const dispatch = useDispatch();
//   const { isSharing, watchId } = useSelector((s) => s.location);
//   const { userInfo }           = useSelector((s) => s.auth);
//   const { emitLocation, emitStopTracking } = useSocket();

//   // Retourne une Promise qui resolve avec true si OK, false si refus géoloc
//   const startTracking = () => {
//     return new Promise((resolve) => {
//       if (!navigator.geolocation) {
//         resolve({ ok: false, reason: "unsupported" });
//         return;
//       }
//       if (!userInfo?._id) {
//         resolve({ ok: false, reason: "no_user" });
//         return;
//       }

//       const id = navigator.geolocation.watchPosition(
//         ({ coords }) => {
//           // Premier succès — on active le partage maintenant qu'on sait que c'est ok
//           dispatch(setWatchId(id));
//           dispatch(setSharing(true));
//           emitLocation(userInfo._id, coords.longitude, coords.latitude);
//           resolve({ ok: true });
//         },
//         (err) => {
//           // Géoloc refusée ou erreur — on ne met pas isSharing à true
//           dispatch(setWatchId(null));
//           dispatch(setSharing(false));
//           if (err.code === 1) {
//             resolve({ ok: false, reason: "denied" });
//           } else {
//             resolve({ ok: false, reason: "error", message: err.message });
//           }
//         },
//         { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
//       );

//       // watchPosition ne résout pas la Promise immédiatement —
//       // elle sera résolue dans le callback succès ou erreur ci-dessus
//       dispatch(setWatchId(id)); // stocker l'id pour pouvoir clearWatch si besoin
//     });
//   };

//   const stopTracking = async () => {
//     if (watchId !== null) {
//       navigator.geolocation.clearWatch(watchId);
//     }
//     dispatch(setWatchId(null));
//     if (userInfo?._id) emitStopTracking(userInfo._id);
//     try {
//       await fetch(`${API_URL}/api/users/location/stop`, {
//         method: "PUT",
//         credentials: "include",
//       });
//     } catch (e) {
//       console.error("Stop tracking REST:", e.message);
//     }
//     dispatch(setSharing(false));
//   };

//   return { isSharing, startTracking, stopTracking };
// };

// export default useGeolocate;

/* eslint-disable react-hooks/exhaustive-deps */
// src/hooks/UseGeoLocate.js
import { useDispatch, useSelector } from "react-redux";
import { setSharing, setWatchId } from "../slices/locationSlice";
import useSocket from "./UseSocket";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const useGeolocate = () => {
  const dispatch = useDispatch();
  const { isSharing, watchId } = useSelector((s) => s.location);
  const { userInfo }           = useSelector((s) => s.auth);
  const { emitLocation, emitStopTracking } = useSocket();

  // Retourne une Promise { ok, reason }
  const startTracking = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ ok: false, reason: "unsupported" });
        return;
      }
      if (!userInfo?._id) {
        resolve({ ok: false, reason: "no_user" });
        return;
      }

      let resolved = false;

      const id = navigator.geolocation.watchPosition(
        ({ coords }) => {
          dispatch(setWatchId(id));
          dispatch(setSharing(true));
          emitLocation(userInfo._id, coords.longitude, coords.latitude);
          if (!resolved) { resolved = true; resolve({ ok: true }); }
        },
        (err) => {
          navigator.geolocation.clearWatch(id);
          dispatch(setWatchId(null));
          dispatch(setSharing(false));
          if (!resolved) {
            resolved = true;
            resolve({ ok: false, reason: err.code === 1 ? "denied" : "error" });
          }
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );

      // Stocker l'id immédiatement pour pouvoir clearWatch si besoin
      dispatch(setWatchId(id));
    });
  };

  const stopTracking = async () => {
    // 1. Stopper le watchPosition GPS
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    dispatch(setWatchId(null));

    // 2. Émettre stop_tracking via socket → retire le marqueur de la carte chez tous les users
    if (userInfo?._id) {
      emitStopTracking(userInfo._id);
    }

    // 3. Appel REST pour persister isTracked: false en BDD
    try {
      await fetch(`${API_URL}/api/users/location/stop`, {
        method: "PUT",
        credentials: "include",
      });
    } catch (e) {
      console.error("Stop tracking REST:", e.message);
    }

    // 4. Mettre à jour l'état local
    dispatch(setSharing(false));
  };

  return { isSharing, startTracking, stopTracking };
};

export default useGeolocate;