// src/slices/locationSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// =============================================
// THUNK — charger les positions initiales via API REST
// =============================================
export const fetchPrestatairesPositions = createAsyncThunk(
  "location/fetchPositions",
  async (_, thunkAPI) => {
    try {
      const response = await fetch("/api/users/prestataires/positions");
      if (!response.ok) throw new Error("Erreur lors du chargement des positions");
      return await response.json();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// =============================================
// SLICE
// =============================================
const locationSlice = createSlice({
  name: "location",
  initialState: {
    // Liste des prestataires avec leur position
    // { _id, prenom, nom, isTracked, location: { coordinates: [lng, lat] } }
    prestataires: [],

    // Statut du chargement initial
    loading: false,
    error: null,

    // Tracking de l'utilisateur connecté (prestataire)
    isSharing: false,
    watchId: null, // ID du navigator.geolocation.watchPosition
  },
  reducers: {
    // Mise à jour temps réel via Socket.io — un prestataire bouge
    updatePrestairePosition: (state, action) => {
      const { userId, longitude, latitude } = action.payload;
      const index = state.prestataires.findIndex((p) => p._id === userId);

      if (index !== -1) {
        state.prestataires[index].location.coordinates = [longitude, latitude];
        state.prestataires[index].location.updatedAt = new Date().toISOString();
      }
    },

    // Un prestataire a coupé son tracking — on le retire de la liste
    removePrestataire: (state, action) => {
      const { userId } = action.payload;
      state.prestataires = state.prestataires.filter((p) => p._id !== userId);
    },

    // Le prestataire connecté active le partage
    setSharing: (state, action) => {
      state.isSharing = action.payload;
    },

    // Stocker l'ID du watchPosition pour pouvoir le stopper
    setWatchId: (state, action) => {
      state.watchId = action.payload;
    },

    // Reset complet (déconnexion)
    resetLocation: (state) => {
      state.prestataires = [];
      state.isSharing = false;
      state.watchId = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrestatairesPositions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrestatairesPositions.fulfilled, (state, action) => {
        state.loading = false;
        state.prestataires = action.payload;
      })
      .addCase(fetchPrestatairesPositions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
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