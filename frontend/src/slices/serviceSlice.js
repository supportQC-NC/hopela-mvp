// src/slices/serviceSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Get mes services (prestataire connecté) ───────────
export const fetchMesServices = createAsyncThunk(
  "service/fetchMes",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/services`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des services");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Get services actifs d'un prestataire (public) ─────
export const fetchServicesPrestataire = createAsyncThunk(
  "service/fetchByPrestataire",
  async (prestataireId, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/services/prestataire/${prestataireId}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des services");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Créer un service ──────────────────────────────────
export const createService = createAsyncThunk(
  "service/create",
  async ({ nom, description, duree }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nom, description, duree }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Modifier un service ───────────────────────────────
export const updateService = createAsyncThunk(
  "service/update",
  async ({ id, ...fields }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Toggle actif/inactif ──────────────────────────────
export const toggleService = createAsyncThunk(
  "service/toggle",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Supprimer un service ──────────────────────────────
export const deleteService = createAsyncThunk(
  "service/delete",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Upload image d'un service ─────────────────────────
export const uploadServiceImage = createAsyncThunk(
  "service/uploadImage",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/upload/service/${id}`, {
        method: "POST",
        credentials: "include",
        body: formData, // FormData — pas de Content-Type header, fetch le gère
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'upload");
      return { id, image: data.image };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Supprimer l'image d'un service ───────────────────
export const deleteServiceImage = createAsyncThunk(
  "service/deleteImage",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/upload/service/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────
const serviceSlice = createSlice({
  name: "service",
  initialState: {
    services:            [],  // mes services (prestataire connecté)
    servicesPrestataire: [],  // services publics d'un prestataire (vue fiche)
    loading:             false,
    error:               null,
    actionSuccess:       false,
    actionError:         null,
  },
  reducers: {
    clearServiceError:  (state) => { state.error = null; state.actionError = null; },
    clearActionSuccess: (state) => { state.actionSuccess = false; },
  },
  extraReducers: (builder) => {

    // ── fetchMesServices ──
    builder
      .addCase(fetchMesServices.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMesServices.fulfilled, (state, action) => { state.loading = false; state.services = action.payload; })
      .addCase(fetchMesServices.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── fetchServicesPrestataire ──
    builder
      .addCase(fetchServicesPrestataire.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchServicesPrestataire.fulfilled, (state, action) => { state.loading = false; state.servicesPrestataire = action.payload; })
      .addCase(fetchServicesPrestataire.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── createService ──
    builder
      .addCase(createService.pending,   (state) => { state.actionError = null; state.actionSuccess = false; })
      .addCase(createService.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.services.unshift(action.payload); // ajout en tête de liste
      })
      .addCase(createService.rejected,  (state, action) => { state.actionError = action.payload; });

    // ── updateService ──
    builder
      .addCase(updateService.fulfilled, (state, action) => {
        state.actionSuccess = true;
        const index = state.services.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.services[index] = action.payload;
      })
      .addCase(updateService.rejected, (state, action) => { state.actionError = action.payload; });

    // ── toggleService ──
    builder
      .addCase(toggleService.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) state.services[index].isActive = action.payload.isActive;
      })
      .addCase(toggleService.rejected, (state, action) => { state.actionError = action.payload; });

    // ── deleteService ──
    builder
      .addCase(deleteService.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.services = state.services.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => { state.actionError = action.payload; });

    // ── uploadServiceImage ──
    builder
      .addCase(uploadServiceImage.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s._id === action.payload.id);
        if (index !== -1) state.services[index].image = action.payload.image;
      })
      .addCase(uploadServiceImage.rejected, (state, action) => { state.actionError = action.payload; });

    // ── deleteServiceImage ──
    builder
      .addCase(deleteServiceImage.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s._id === action.payload);
        if (index !== -1) state.services[index].image = null;
      })
      .addCase(deleteServiceImage.rejected, (state, action) => { state.actionError = action.payload; });
  },
});

export const { clearServiceError, clearActionSuccess } = serviceSlice.actions;
export default serviceSlice.reducer;