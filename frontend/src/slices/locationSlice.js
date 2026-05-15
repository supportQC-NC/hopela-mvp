// // /* eslint-disable react-hooks/exhaustive-deps */
// // // src/slices/locationSlice.js
// // import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// // const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// // // Prestataires publics (landing, sans auth)
// // export const fetchPrestatairesPublic = createAsyncThunk(
// //   "location/fetchPublic",
// //   async (_, thunkAPI) => {
// //     try {
// //       const res = await fetch(`${API_URL}/api/users/prestataires/positions/public`);
// //       if (!res.ok) throw new Error("Erreur fetch public");
// //       return await res.json();
// //     } catch (err) {
// //       return thunkAPI.rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // Prestataires filtrés par rayon (connecté)
// // export const fetchPrestatairesPositions = createAsyncThunk(
// //   "location/fetchPositions",
// //   async ({ lng, lat, rayon } = {}, thunkAPI) => {
// //     try {
// //       const params = new URLSearchParams();
// //       if (lng   != null) params.append("lng",   lng);
// //       if (lat   != null) params.append("lat",   lat);
// //       if (rayon != null) params.append("rayon", rayon);
// //       const res = await fetch(`${API_URL}/api/users/prestataires/positions?${params}`, {
// //         credentials: "include",
// //       });
// //       if (!res.ok) throw new Error("Erreur fetch positions");
// //       return await res.json();
// //     } catch (err) {
// //       return thunkAPI.rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // Mettre à jour sa position (prestataire, REST backup)
// // export const updateMyLocation = createAsyncThunk(
// //   "location/updateMyLocation",
// //   async ({ longitude, latitude }, thunkAPI) => {
// //     try {
// //       const res = await fetch(`${API_URL}/api/users/location`, {
// //         method: "PUT",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({ longitude, latitude }),
// //       });
// //       if (!res.ok) throw new Error("Erreur update location");
// //       return await res.json();
// //     } catch (err) {
// //       return thunkAPI.rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // Arrêter le partage (prestataire, REST)
// // export const stopMyTracking = createAsyncThunk(
// //   "location/stopMyTracking",
// //   async (_, thunkAPI) => {
// //     try {
// //       const res = await fetch(`${API_URL}/api/users/location/stop`, {
// //         method: "PUT",
// //         credentials: "include",
// //       });
// //       if (!res.ok) throw new Error("Erreur stop tracking");
// //       return await res.json();
// //     } catch (err) {
// //       return thunkAPI.rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // Mettre à jour le rayon (user)
// // export const updateRayon = createAsyncThunk(
// //   "location/updateRayon",
// //   async (rayon, thunkAPI) => {
// //     try {
// //       const res = await fetch(`${API_URL}/api/users/rayon`, {
// //         method: "PUT",
// //         headers: { "Content-Type": "application/json" },
// //         credentials: "include",
// //         body: JSON.stringify({ rayon }),
// //       });
// //       if (!res.ok) throw new Error("Erreur update rayon");
// //       return await res.json();
// //     } catch (err) {
// //       return thunkAPI.rejectWithValue(err.message);
// //     }
// //   }
// // );

// // // CRUD savedLocations
// // export const fetchSavedLocations = createAsyncThunk("location/fetchSaved", async (_, thunkAPI) => {
// //   const res = await fetch(`${API_URL}/api/users/locations`, { credentials: "include" });
// //   if (!res.ok) return thunkAPI.rejectWithValue("Erreur fetch adresses");
// //   return res.json();
// // });
// // export const addSavedLocation = createAsyncThunk("location/addSaved", async (data, thunkAPI) => {
// //   const res = await fetch(`${API_URL}/api/users/locations`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
// //   const json = await res.json();
// //   if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur ajout");
// //   return json;
// // });
// // export const updateSavedLocation = createAsyncThunk("location/updateSaved", async ({ locationId, ...data }, thunkAPI) => {
// //   const res = await fetch(`${API_URL}/api/users/locations/${locationId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
// //   const json = await res.json();
// //   if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur modif");
// //   return json;
// // });
// // export const deleteSavedLocation = createAsyncThunk("location/deleteSaved", async (locationId, thunkAPI) => {
// //   const res = await fetch(`${API_URL}/api/users/locations/${locationId}`, { method: "DELETE", credentials: "include" });
// //   const json = await res.json();
// //   if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur suppression");
// //   return json;
// // });
// // export const setDefaultSavedLocation = createAsyncThunk("location/setDefault", async (locationId, thunkAPI) => {
// //   const res = await fetch(`${API_URL}/api/users/locations/${locationId}/default`, { method: "PATCH", credentials: "include" });
// //   const json = await res.json();
// //   if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur");
// //   return json;
// // });

// // // ─── Slice ────────────────────────────────────────────────────────────────────
// // const locationSlice = createSlice({
// //   name: "location",
// //   initialState: {
// //     prestataires:          [],
// //     loading:               false,
// //     error:                 null,
// //     isSharing:             false,
// //     watchId:               null,
// //     gpsPosition:           null,   // { longitude, latitude }
// //     savedLocations:        [],
// //     savedLocationsLoading: false,
// //     savedLocationsError:   null,
// //     activeSource:          "gps", // "gps" | "saved:{id}"
// //     rayonActif:            10,
// //   },
// //   reducers: {
// //     // Socket temps réel
// //     updatePrestairePosition: (state, action) => {
// //       const { userId, longitude, latitude, prestaireData } = action.payload;
// //       const idx = state.prestataires.findIndex((p) => p._id === userId);
// //       if (idx !== -1) {
// //         // Prestataire déjà dans le tableau — mise à jour de la position
// //         state.prestataires[idx].location.coordinates = [longitude, latitude];
// //         state.prestataires[idx].location.updatedAt   = new Date().toISOString();
// //         state.prestataires[idx].isTracked = true;
// //       } else if (prestaireData) {
// //         // Prestataire absent (était hors ligne) — on l'ajoute avec ses données
// //         state.prestataires.push({
// //           ...prestaireData,
// //           location: {
// //             type: "Point",
// //             coordinates: [longitude, latitude],
// //             updatedAt: new Date().toISOString(),
// //           },
// //           isTracked: true,
// //         });
// //       }
// //       // Si pas de prestaireData et absent : le UseSocket va faire un fetch pour récupérer les infos
// //     },
// //     removePrestataire: (state, action) => {
// //       state.prestataires = state.prestataires.filter((p) => p._id !== action.payload.userId);
// //     },

// //     // Tracking local
// //     setSharing:  (state, action) => { state.isSharing = action.payload; },
// //     setWatchId:  (state, action) => { state.watchId   = action.payload; },

// //     // GPS user
// //     setGpsPosition: (state, action) => { state.gpsPosition = action.payload; },

// //     // Source active carte
// //     setActiveSource: (state, action) => { state.activeSource = action.payload; },

// //     // Rayon local
// //     setRayonLocal: (state, action) => { state.rayonActif = action.payload; },

// //     // Sync rayon depuis le profil au login
// //     syncRayonFromProfile: (state, action) => { state.rayonActif = action.payload; },

// //     // Reset déconnexion
// //     resetLocation: (state) => {
// //       state.prestataires          = [];
// //       state.loading               = false;
// //       state.error                 = null;
// //       state.isSharing             = false;
// //       state.watchId               = null;
// //       state.gpsPosition           = null;
// //       state.savedLocations        = [];
// //       state.activeSource          = "gps";
// //       state.rayonActif            = 10;
// //       state.savedLocationsError   = null;
// //     },
// //   },
// //   extraReducers: (builder) => {
// //     // fetchPrestatairesPublic
// //     builder
// //       .addCase(fetchPrestatairesPublic.fulfilled, (s, a) => { s.prestataires = a.payload; });

// //     // fetchPrestatairesPositions
// //     builder
// //       .addCase(fetchPrestatairesPositions.pending,   (s) => { s.loading = true;  s.error = null; })
// //       .addCase(fetchPrestatairesPositions.fulfilled, (s, a) => { s.loading = false; s.prestataires = a.payload; })
// //       .addCase(fetchPrestatairesPositions.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

// //     // updateMyLocation
// //     builder
// //       .addCase(updateMyLocation.fulfilled, (s) => { s.isSharing = true; })
// //       .addCase(updateMyLocation.rejected,  (s, a) => { s.error = a.payload; });

// //     // stopMyTracking
// //     builder
// //       .addCase(stopMyTracking.fulfilled, (s) => { s.isSharing = false; s.watchId = null; })
// //       .addCase(stopMyTracking.rejected,  (s, a) => { s.error = a.payload; });

// //     // updateRayon
// //     builder
// //       .addCase(updateRayon.fulfilled, (s, a) => { s.rayonActif = a.payload.rayonRecherche; });

// //     // savedLocations CRUD
// //     const saved = (s, a) => { s.savedLocationsLoading = false; s.savedLocations = a.payload; };
// //     builder
// //       .addCase(fetchSavedLocations.pending,   (s) => { s.savedLocationsLoading = true; })
// //       .addCase(fetchSavedLocations.fulfilled, saved)
// //       .addCase(fetchSavedLocations.rejected,  (s, a) => { s.savedLocationsLoading = false; s.savedLocationsError = a.payload; })
// //       .addCase(addSavedLocation.pending,      (s) => { s.savedLocationsLoading = true; })
// //       .addCase(addSavedLocation.fulfilled,    saved)
// //       .addCase(addSavedLocation.rejected,     (s, a) => { s.savedLocationsLoading = false; s.savedLocationsError = a.payload; })
// //       .addCase(updateSavedLocation.fulfilled, saved)
// //       .addCase(updateSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; })
// //       .addCase(deleteSavedLocation.fulfilled, saved)
// //       .addCase(deleteSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; })
// //       .addCase(setDefaultSavedLocation.fulfilled, saved)
// //       .addCase(setDefaultSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; });
// //   },
// // });

// // export const {
// //   updatePrestairePosition,
// //   removePrestataire,
// //   setSharing,
// //   setWatchId,
// //   setGpsPosition,
// //   setActiveSource,
// //   setRayonLocal,
// //   syncRayonFromProfile,
// //   resetLocation,
// // } = locationSlice.actions;

// // export default locationSlice.reducer;


// /* eslint-disable react-hooks/exhaustive-deps */
// // src/slices/locationSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// // Prestataires publics (landing, sans auth)
// export const fetchPrestatairesPublic = createAsyncThunk(
//   "location/fetchPublic",
//   async (_, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/prestataires/positions/public`);
//       if (!res.ok) throw new Error("Erreur fetch public");
//       return await res.json();
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // Prestataires filtrés par rayon (connecté)
// export const fetchPrestatairesPositions = createAsyncThunk(
//   "location/fetchPositions",
//   async ({ lng, lat, rayon } = {}, thunkAPI) => {
//     try {
//       const params = new URLSearchParams();
//       if (lng   != null) params.append("lng",   lng);
//       if (lat   != null) params.append("lat",   lat);
//       if (rayon != null) params.append("rayon", rayon);
//       const res = await fetch(`${API_URL}/api/users/prestataires/positions?${params}`, {
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Erreur fetch positions");
//       return await res.json();
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // Mettre à jour sa position (prestataire, REST backup)
// export const updateMyLocation = createAsyncThunk(
//   "location/updateMyLocation",
//   async ({ longitude, latitude }, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/location`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ longitude, latitude }),
//       });
//       if (!res.ok) throw new Error("Erreur update location");
//       return await res.json();
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // Arrêter le partage (prestataire, REST)
// export const stopMyTracking = createAsyncThunk(
//   "location/stopMyTracking",
//   async (_, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/location/stop`, {
//         method: "PUT",
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Erreur stop tracking");
//       return await res.json();
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // Mettre à jour le rayon (user)
// export const updateRayon = createAsyncThunk(
//   "location/updateRayon",
//   async (rayon, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/rayon`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ rayon }),
//       });
//       if (!res.ok) throw new Error("Erreur update rayon");
//       return await res.json();
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // CRUD savedLocations
// export const fetchSavedLocations = createAsyncThunk("location/fetchSaved", async (_, thunkAPI) => {
//   const res = await fetch(`${API_URL}/api/users/locations`, { credentials: "include" });
//   if (!res.ok) return thunkAPI.rejectWithValue("Erreur fetch adresses");
//   return res.json();
// });
// export const addSavedLocation = createAsyncThunk("location/addSaved", async (data, thunkAPI) => {
//   const res = await fetch(`${API_URL}/api/users/locations`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
//   const json = await res.json();
//   if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur ajout");
//   return json;
// });
// export const updateSavedLocation = createAsyncThunk("location/updateSaved", async ({ locationId, ...data }, thunkAPI) => {
//   const res = await fetch(`${API_URL}/api/users/locations/${locationId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
//   const json = await res.json();
//   if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur modif");
//   return json;
// });
// export const deleteSavedLocation = createAsyncThunk("location/deleteSaved", async (locationId, thunkAPI) => {
//   const res = await fetch(`${API_URL}/api/users/locations/${locationId}`, { method: "DELETE", credentials: "include" });
//   const json = await res.json();
//   if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur suppression");
//   return json;
// });
// export const setDefaultSavedLocation = createAsyncThunk("location/setDefault", async (locationId, thunkAPI) => {
//   const res = await fetch(`${API_URL}/api/users/locations/${locationId}/default`, { method: "PATCH", credentials: "include" });
//   const json = await res.json();
//   if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur");
//   return json;
// });

// // ─── Slice ────────────────────────────────────────────────────────────────────
// const locationSlice = createSlice({
//   name: "location",
//   initialState: {
//     prestataires:          [],
//     loading:               false,
//     error:                 null,
//     isSharing:             false,
//     watchId:               null,
//     gpsPosition:           null,   // { longitude, latitude }
//     savedLocations:        [],
//     savedLocationsLoading: false,
//     savedLocationsError:   null,
//     activeSource:          "gps", // "gps" | "saved:{id}"
//     rayonActif:            10,
//   },
//   reducers: {
//     // Socket temps réel
//     updatePrestairePosition: (state, action) => {
//       const { userId, longitude, latitude, prestaireData } = action.payload; // 'prestaireData' avec un 'e' pour correspondre à UseSocket.js
      
//       const idx = state.prestataires.findIndex((p) => p._id === userId);
      
//       if (idx !== -1) {
//         // Prestataire déjà dans le tableau — mise à jour de la position
//         state.prestataires[idx].location.coordinates = [longitude, latitude];
//         state.prestataires[idx].location.updatedAt   = new Date().toISOString();
//         state.prestataires[idx].isTracked = true;
//       } else {
//         // CORRECTION ICI :
//         // On ne se contente plus de vérifier "else if (prestaireData)".
//         // Si le prestataire n'est pas dans la liste (suite à un stop), on l'ajoute.
//         // Si prestaireData est dispo (fetch réussi), on l'utilise.
//         // Sinon (fetch a échoué ou pas encore dispo), on crée un objet minimal pour
//         // garantir l'affichage du marqueur sur la carte immédiatement.
        
//         if (prestaireData) {
//           state.prestataires.push({
//             ...prestaireData,
//             location: {
//               type: "Point",
//               coordinates: [longitude, latitude],
//               updatedAt: new Date().toISOString(),
//             },
//             isTracked: true,
//           });
//         } else {
//           // Fallback : Ajout avec données minimales pour que le marqueur s'affiche
//           // Cela évite le bug "doit charger la page" lors de la réactivation
//           state.prestataires.push({
//             _id: userId,
//             prenom: "En ligne",
//             nom: "",
//             metiers: [{ nom: "Inconnu" }],
//             location: {
//               type: "Point",
//               coordinates: [longitude, latitude],
//               updatedAt: new Date().toISOString(),
//             },
//             isTracked: true,
//           });
//         }
//       }
//     },
//     removePrestataire: (state, action) => {
//       state.prestataires = state.prestataires.filter((p) => p._id !== action.payload.userId);
//     },

//     // Tracking local
//     setSharing:  (state, action) => { state.isSharing = action.payload; },
//     setWatchId:  (state, action) => { state.watchId   = action.payload; },

//     // GPS user
//     setGpsPosition: (state, action) => { state.gpsPosition = action.payload; },

//     // Source active carte
//     setActiveSource: (state, action) => { state.activeSource = action.payload; },

//     // Rayon local
//     setRayonLocal: (state, action) => { state.rayonActif = action.payload; },

//     // Sync rayon depuis le profil au login
//     syncRayonFromProfile: (state, action) => { state.rayonActif = action.payload; },

//     // Reset déconnexion
//     resetLocation: (state) => {
//       state.prestataires          = [];
//       state.loading               = false;
//       state.error                 = null;
//       state.isSharing             = false;
//       state.watchId               = null;
//       state.gpsPosition           = null;
//       state.savedLocations        = [];
//       state.activeSource          = "gps";
//       state.rayonActif            = 10;
//       state.savedLocationsError   = null;
//     },
//   },
//   extraReducers: (builder) => {
//     // fetchPrestatairesPublic
//     builder
//       .addCase(fetchPrestatairesPublic.fulfilled, (s, a) => { s.prestataires = a.payload; });

//     // fetchPrestatairesPositions
//     builder
//       .addCase(fetchPrestatairesPositions.pending,   (s) => { s.loading = true;  s.error = null; })
//       .addCase(fetchPrestatairesPositions.fulfilled, (s, a) => { s.loading = false; s.prestataires = a.payload; })
//       .addCase(fetchPrestatairesPositions.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

//     // updateMyLocation
//     builder
//       .addCase(updateMyLocation.fulfilled, (s) => { s.isSharing = true; })
//       .addCase(updateMyLocation.rejected,  (s, a) => { s.error = a.payload; });

//     // stopMyTracking
//     builder
//       .addCase(stopMyTracking.fulfilled, (s) => { s.isSharing = false; s.watchId = null; })
//       .addCase(stopMyTracking.rejected,  (s, a) => { s.error = a.payload; });

//     // updateRayon
//     builder
//       .addCase(updateRayon.fulfilled, (s, a) => { s.rayonActif = a.payload.rayonRecherche; });

//     // savedLocations CRUD
//     const saved = (s, a) => { s.savedLocationsLoading = false; s.savedLocations = a.payload; };
//     builder
//       .addCase(fetchSavedLocations.pending,   (s) => { s.savedLocationsLoading = true; })
//       .addCase(fetchSavedLocations.fulfilled, saved)
//       .addCase(fetchSavedLocations.rejected,  (s, a) => { s.savedLocationsLoading = false; s.savedLocationsError = a.payload; })
//       .addCase(addSavedLocation.pending,      (s) => { s.savedLocationsLoading = true; })
//       .addCase(addSavedLocation.fulfilled,    saved)
//       .addCase(addSavedLocation.rejected,     (s, a) => { s.savedLocationsLoading = false; s.savedLocationsError = a.payload; })
//       .addCase(updateSavedLocation.fulfilled, saved)
//       .addCase(updateSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; })
//       .addCase(deleteSavedLocation.fulfilled, saved)
//       .addCase(deleteSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; })
//       .addCase(setDefaultSavedLocation.fulfilled, saved)
//       .addCase(setDefaultSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; });
//   },
// });

// export const {
//   updatePrestairePosition,
//   removePrestataire,
//   setSharing,
//   setWatchId,
//   setGpsPosition,
//   setActiveSource,
//   setRayonLocal,
//   syncRayonFromProfile,
//   resetLocation,
// } = locationSlice.actions;

// export default locationSlice.reducer;


/* eslint-disable react-hooks/exhaustive-deps */
// src/slices/locationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Prestataires publics (landing, sans auth)
export const fetchPrestatairesPublic = createAsyncThunk(
  "location/fetchPublic",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/prestataires/positions/public`);
      if (!res.ok) throw new Error("Erreur fetch public");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Prestataires filtrés par rayon (connecté)
export const fetchPrestatairesPositions = createAsyncThunk(
  "location/fetchPositions",
  async ({ lng, lat, rayon } = {}, thunkAPI) => {
    try {
      const params = new URLSearchParams();
      if (lng   != null) params.append("lng",   lng);
      if (lat   != null) params.append("lat",   lat);
      if (rayon != null) params.append("rayon", rayon);
      const res = await fetch(`${API_URL}/api/users/prestataires/positions?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur fetch positions");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Mettre à jour sa position (prestataire, REST backup)
export const updateMyLocation = createAsyncThunk(
  "location/updateMyLocation",
  async ({ longitude, latitude }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/location`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ longitude, latitude }),
      });
      if (!res.ok) throw new Error("Erreur update location");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Arrêter le partage (prestataire, REST)
export const stopMyTracking = createAsyncThunk(
  "location/stopMyTracking",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/location/stop`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur stop tracking");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Mettre à jour le rayon (user)
export const updateRayon = createAsyncThunk(
  "location/updateRayon",
  async (rayon, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/rayon`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rayon }),
      });
      if (!res.ok) throw new Error("Erreur update rayon");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// CRUD savedLocations
export const fetchSavedLocations = createAsyncThunk("location/fetchSaved", async (_, thunkAPI) => {
  const res = await fetch(`${API_URL}/api/users/locations`, { credentials: "include" });
  if (!res.ok) return thunkAPI.rejectWithValue("Erreur fetch adresses");
  return res.json();
});
export const addSavedLocation = createAsyncThunk("location/addSaved", async (data, thunkAPI) => {
  const res = await fetch(`${API_URL}/api/users/locations`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur ajout");
  return json;
});
export const updateSavedLocation = createAsyncThunk("location/updateSaved", async ({ locationId, ...data }, thunkAPI) => {
  const res = await fetch(`${API_URL}/api/users/locations/${locationId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(data) });
  const json = await res.json();
  if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur modif");
  return json;
});
export const deleteSavedLocation = createAsyncThunk("location/deleteSaved", async (locationId, thunkAPI) => {
  const res = await fetch(`${API_URL}/api/users/locations/${locationId}`, { method: "DELETE", credentials: "include" });
  const json = await res.json();
  if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur suppression");
  return json;
});
export const setDefaultSavedLocation = createAsyncThunk("location/setDefault", async (locationId, thunkAPI) => {
  const res = await fetch(`${API_URL}/api/users/locations/${locationId}/default`, { method: "PATCH", credentials: "include" });
  const json = await res.json();
  if (!res.ok) return thunkAPI.rejectWithValue(json.message || "Erreur");
  return json;
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const locationSlice = createSlice({
  name: "location",
  initialState: {
    prestataires:          [],
    loading:               false,
    error:                 null,
    isSharing:             false,
    watchId:               null,
    gpsPosition:           null,   // { longitude, latitude }
    savedLocations:        [],
    savedLocationsLoading: false,
    savedLocationsError:   null,
    activeSource:          "gps", // "gps" | "saved:{id}"
    rayonActif:            10,
  },
  reducers: {
    // Socket temps réel
    updatePrestairePosition: (state, action) => {
      // IMPORTANT: On utilise 'prestaireData' (avec un 'e') car c'est le nom envoyé par UseSocket.js
      const { userId, longitude, latitude, prestaireData } = action.payload;

      const idx = state.prestataires.findIndex((p) => p._id === userId);
      
      if (idx !== -1) {
        // Cas 1: Le prestataire est déjà dans la liste (mise à jour simple)
        state.prestataires[idx].location.coordinates = [longitude, latitude];
        state.prestataires[idx].location.updatedAt   = new Date().toISOString();
        state.prestataires[idx].isTracked = true;
      } else {
        // Cas 2: Le prestataire n'est PAS dans la liste (Il vient de se connecter / réactiver)
        // On l'ajoute forcément pour qu'il apparaisse, même si on n'a pas toutes ses données
        
        if (prestaireData) {
          // On a les données complètes du fetch public
          state.prestataires.push({
            ...prestaireData,
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
              updatedAt: new Date().toISOString(),
            },
            isTracked: true,
          });
        } else {
          // On n'a PAS les données (fetch public a échoué ou lag), mais on ajoute quand même
          // pour ne pas avoir le bug "doit recharger la page".
          state.prestataires.push({
            _id: userId,
            prenom: "En ligne",
            nom: "",
            // Metier inconnu pour éviter de casser le filtre si celui-ci est strict
            metiers: [], 
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
              updatedAt: new Date().toISOString(),
            },
            isTracked: true,
          });
        }
      }
    },
    removePrestataire: (state, action) => {
      state.prestataires = state.prestataires.filter((p) => p._id !== action.payload.userId);
    },

    // Tracking local
    setSharing:  (state, action) => { state.isSharing = action.payload; },
    setWatchId:  (state, action) => { state.watchId   = action.payload; },

    // GPS user
    setGpsPosition: (state, action) => { state.gpsPosition = action.payload; },

    // Source active carte
    setActiveSource: (state, action) => { state.activeSource = action.payload; },

    // Rayon local
    setRayonLocal: (state, action) => { state.rayonActif = action.payload; },

    // Sync rayon depuis le profil au login
    syncRayonFromProfile: (state, action) => { state.rayonActif = action.payload; },

    // Reset déconnexion
    resetLocation: (state) => {
      state.prestataires          = [];
      state.loading               = false;
      state.error                 = null;
      state.isSharing             = false;
      state.watchId               = null;
      state.gpsPosition           = null;
      state.savedLocations        = [];
      state.activeSource          = "gps";
      state.rayonActif            = 10;
      state.savedLocationsError   = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPrestatairesPublic
    builder
      .addCase(fetchPrestatairesPublic.fulfilled, (s, a) => { 
        // Merge stratégique : on ne veut pas effacer les users ajoutés par le socket si l'API est lente
        const apiIds = new Set(a.payload.map(p => p._id));
        const socketOnlyUsers = s.prestataires.filter(p => !apiIds.has(p._id));
        s.prestataires = [...a.payload, ...socketOnlyUsers]; 
      });

    // fetchPrestatairesPositions
    builder
      .addCase(fetchPrestatairesPositions.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchPrestatairesPositions.fulfilled, (s, a) => { 
        s.loading = false;
        // CORRECTION ICI : Merge au lieu de remplacer
        // Si le socket a ajouté un user que l'API (base de données) n'a pas encore enregistré,
        // on garde ce user dans la liste pour ne pas le faire disparaître.
        const apiList = a.payload || [];
        const apiIds = new Set(apiList.map(p => p._id));
        
        // On garde ceux qui ne sont pas dans la réponse API (ceux venant du socket en temps réel)
        const socketOnlyUsers = s.prestataires.filter(p => !apiIds.has(p._id));
        
        // Pour ceux qui sont dans les deux, on prend la version de l'API (plus complète)
        // et on y ajoute les users "socket only"
        s.prestataires = [...apiList, ...socketOnlyUsers];
      })
      .addCase(fetchPrestatairesPositions.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // updateMyLocation
    builder
      .addCase(updateMyLocation.fulfilled, (s) => { s.isSharing = true; })
      .addCase(updateMyLocation.rejected,  (s, a) => { s.error = a.payload; });

    // stopMyTracking
    builder
      .addCase(stopMyTracking.fulfilled, (s) => { s.isSharing = false; s.watchId = null; })
      .addCase(stopMyTracking.rejected,  (s, a) => { s.error = a.payload; });

    // updateRayon
    builder
      .addCase(updateRayon.fulfilled, (s, a) => { s.rayonActif = a.payload.rayonRecherche; });

    // savedLocations CRUD
    const saved = (s, a) => { s.savedLocationsLoading = false; s.savedLocations = a.payload; };
    builder
      .addCase(fetchSavedLocations.pending,   (s) => { s.savedLocationsLoading = true; })
      .addCase(fetchSavedLocations.fulfilled, saved)
      .addCase(fetchSavedLocations.rejected,  (s, a) => { s.savedLocationsLoading = false; s.savedLocationsError = a.payload; })
      .addCase(addSavedLocation.pending,      (s) => { s.savedLocationsLoading = true; })
      .addCase(addSavedLocation.fulfilled,    saved)
      .addCase(addSavedLocation.rejected,     (s, a) => { s.savedLocationsLoading = false; s.savedLocationsError = a.payload; })
      .addCase(updateSavedLocation.fulfilled, saved)
      .addCase(updateSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; })
      .addCase(deleteSavedLocation.fulfilled, saved)
      .addCase(deleteSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; })
      .addCase(setDefaultSavedLocation.fulfilled, saved)
      .addCase(setDefaultSavedLocation.rejected,  (s, a) => { s.savedLocationsError = a.payload; });
  },
});

export const {
  updatePrestairePosition,
  removePrestataire,
  setSharing,
  setWatchId,
  setGpsPosition,
  setActiveSource,
  setRayonLocal,
  syncRayonFromProfile,
  resetLocation,
} = locationSlice.actions;

export default locationSlice.reducer;