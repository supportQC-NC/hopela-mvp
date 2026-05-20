// src/slices/favoriSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Mes favoris ───────────────────────────────────────────────────────────────
export const fetchMesFavoris = createAsyncThunk(
  "favori/fetchMes",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/favoris`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement favoris");
      return await res.json();
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Vérifier si un prestataire est en favori ──────────────────────────────────
export const checkFavori = createAsyncThunk(
  "favori/check",
  async (prestataireId, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/favoris/check/${prestataireId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur vérification favori");
      const data = await res.json();
      return { prestataireId, isFavori: data.isFavori };
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Ajouter un favori ─────────────────────────────────────────────────────────
export const addFavori = createAsyncThunk(
  "favori/add",
  async (prestataireId, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/favoris/${prestataireId}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur ajout favori");
      return { prestataireId, favoriId: data.favoriId };
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Retirer un favori ─────────────────────────────────────────────────────────
export const removeFavori = createAsyncThunk(
  "favori/remove",
  async (prestataireId, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/favoris/${prestataireId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur suppression favori");
      return prestataireId;
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Compteur public (sans auth) ───────────────────────────────────────────────
export const fetchFavoriCount = createAsyncThunk(
  "favori/count",
  async (prestataireId, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/favoris/count/${prestataireId}`);
      if (!res.ok) throw new Error("Erreur compteur favoris");
      const data = await res.json();
      return { prestataireId, count: data.count };
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const favoriSlice = createSlice({
  name: "favori",
  initialState: {
    mesFavoris:   [], // liste des { favoriId, prestataire, createdAt }
    // Map prestataireId → boolean pour l'état du bouton toggle rapide
    favoriStatus: {},
    // Map prestataireId → number pour les compteurs publics
    favoriCounts: {},
    loading:      false,
    error:        null,
  },
  reducers: {
    clearFavoriError: (state) => { state.error = null; },
    // Optimistic toggle local (pour réactivité UI immédiate)
    toggleFavoriOptimistic: (state, action) => {
      const id = action.payload;
      state.favoriStatus[id] = !state.favoriStatus[id];
      // Ajuste le compteur local
      if (state.favoriCounts[id] !== undefined) {
        state.favoriCounts[id] += state.favoriStatus[id] ? 1 : -1;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchMesFavoris
    builder
      .addCase(fetchMesFavoris.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchMesFavoris.fulfilled, (s, a) => {
        s.loading = false;
        s.mesFavoris = a.payload;
        // Peuple favoriStatus depuis la liste
        a.payload.forEach((f) => {
          if (f.prestataire?._id) s.favoriStatus[f.prestataire._id] = true;
        });
      })
      .addCase(fetchMesFavoris.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // checkFavori
    builder
      .addCase(checkFavori.fulfilled, (s, a) => {
        s.favoriStatus[a.payload.prestataireId] = a.payload.isFavori;
      });

    // addFavori
    builder
      .addCase(addFavori.fulfilled, (s, a) => {
        s.favoriStatus[a.payload.prestataireId] = true;
        if (s.favoriCounts[a.payload.prestataireId] !== undefined) {
          s.favoriCounts[a.payload.prestataireId] += 1;
        }
      })
      .addCase(addFavori.rejected, (s, a) => { s.error = a.payload; });

    // removeFavori
    builder
      .addCase(removeFavori.fulfilled, (s, a) => {
        const id = a.payload;
        s.favoriStatus[id] = false;
        s.mesFavoris = s.mesFavoris.filter((f) => f.prestataire?._id !== id);
        if (s.favoriCounts[id] !== undefined) {
          s.favoriCounts[id] = Math.max(0, s.favoriCounts[id] - 1);
        }
      })
      .addCase(removeFavori.rejected, (s, a) => { s.error = a.payload; });

    // fetchFavoriCount
    builder
      .addCase(fetchFavoriCount.fulfilled, (s, a) => {
        s.favoriCounts[a.payload.prestataireId] = a.payload.count;
      });
  },
});

export const { clearFavoriError, toggleFavoriOptimistic } = favoriSlice.actions;
export default favoriSlice.reducer;