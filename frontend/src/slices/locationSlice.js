// src/slices/locationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Charger les prestataires proches (filtrés par rayon en BDD) ───────────────
export const fetchPrestatairesPositions = createAsyncThunk(
  "location/fetchPositions",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/prestataires/positions`, {
        credentials: "include", // cookie JWT requis — route protégée
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des positions");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Mettre à jour sa propre position (REST) ───────────────────────────────────
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
      if (!res.ok) throw new Error("Erreur lors de la mise à jour de la position");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Arrêter le partage de position (REST) ─────────────────────────────────────
export const stopMyTracking = createAsyncThunk(
  "location/stopMyTracking",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/location/stop`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors de l'arrêt du tracking");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const locationSlice = createSlice({
  name: "location",
  initialState: {
    prestataires: [],   // liste des prestataires dans le rayon
    loading:      false,
    error:        null,
    isSharing:    false,  // l'user connecté partage-t-il sa position ?
    watchId:      null,   // ID navigator.geolocation.watchPosition
  },
  reducers: {

    // Socket.io — un prestataire met à jour sa position en temps réel
    updatePrestairePosition: (state, action) => {
      const { userId, longitude, latitude } = action.payload;
      const index = state.prestataires.findIndex((p) => p._id === userId);
      if (index !== -1) {
        state.prestataires[index].location.coordinates = [longitude, latitude];
        state.prestataires[index].location.updatedAt   = new Date().toISOString();
      } else {
        // Prestataire pas encore dans la liste — pas ajouté automatiquement
        // (il sera récupéré au prochain fetchPrestatairesPositions)
      }
    },

    // Socket.io — un prestataire a coupé son tracking
    removePrestataire: (state, action) => {
      state.prestataires = state.prestataires.filter((p) => p._id !== action.payload.userId);
    },

    // Activer/désactiver l'indicateur de partage local
    setSharing: (state, action) => {
      state.isSharing = action.payload;
    },

    // Stocker l'ID du watchPosition pour pouvoir le clearWatch()
    setWatchId: (state, action) => {
      state.watchId = action.payload;
    },

    // Reset complet à la déconnexion
    resetLocation: (state) => {
      state.prestataires = [];
      state.isSharing    = false;
      state.watchId      = null;
      state.error        = null;
    },
  },
  extraReducers: (builder) => {

    // ── fetchPrestatairesPositions ──
    builder
      .addCase(fetchPrestatairesPositions.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchPrestatairesPositions.fulfilled, (state, action) => {
        state.loading      = false;
        state.prestataires = action.payload;
      })
      .addCase(fetchPrestatairesPositions.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── updateMyLocation ──
    builder
      .addCase(updateMyLocation.fulfilled, (state) => { state.isSharing = true; })
      .addCase(updateMyLocation.rejected,  (state, action) => { state.error = action.payload; });

    // ── stopMyTracking ──
    builder
      .addCase(stopMyTracking.fulfilled, (state) => {
        state.isSharing = false;
        state.watchId   = null;
      })
      .addCase(stopMyTracking.rejected, (state, action) => { state.error = action.payload; });
  },
});

export const {
  updatePrestairePosition,
  removePrestataire,
  setSharing,
  setWatchId,
  resetLocation,
} = locationSlice.actions;

export default locationSlice.reducer;