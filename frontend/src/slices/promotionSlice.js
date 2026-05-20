// src/slices/promotionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Fetch promotions publiques d'un prestataire ───────────────────────────────
export const fetchPromotionsPubliques = createAsyncThunk(
  "promotion/fetchPubliques",
  async (prestataireId, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/promotions/prestataire/${prestataireId}`);
      if (!res.ok) throw new Error("Erreur chargement promotions");
      return await res.json();
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Fetch mes promotions (prestataire connecté) ───────────────────────────────
export const fetchMesPromotions = createAsyncThunk(
  "promotion/fetchMes",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/promotions/mes-promotions`, { credentials: "include" });
      if (!res.ok) throw new Error("Erreur chargement promotions");
      return await res.json();
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Créer une promotion ───────────────────────────────────────────────────────
export const createPromotion = createAsyncThunk(
  "promotion/create",
  async (data, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/promotions`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Erreur création");
      return json;
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Modifier une promotion ────────────────────────────────────────────────────
export const updatePromotion = createAsyncThunk(
  "promotion/update",
  async ({ id, ...data }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/promotions/${id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Erreur modification");
      return json;
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Supprimer une promotion ───────────────────────────────────────────────────
export const deletePromotion = createAsyncThunk(
  "promotion/delete",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/promotions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Erreur suppression");
      return id;
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Ajouter une image ─────────────────────────────────────────────────────────
export const addImagePromotion = createAsyncThunk(
  "promotion/addImage",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/promotions/${id}/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Erreur upload image");
      return json; // promotion complète mise à jour
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Supprimer une image ───────────────────────────────────────────────────────
export const deleteImagePromotion = createAsyncThunk(
  "promotion/deleteImage",
  async ({ id, imageIndex }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/promotions/${id}/images/${imageIndex}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Erreur suppression image");
      return json; // promotion complète mise à jour
    } catch (err) { return thunkAPI.rejectWithValue(err.message); }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const promotionSlice = createSlice({
  name: "promotion",
  initialState: {
    // Mes promotions (prestataire dashboard)
    mesPromotions:       [],
    // Promotions publiques d'un prestataire consulté
    promotionsPubliques: [],
    loading:             false,
    error:               null,
    actionSuccess:       false,
    actionError:         null,
  },
  reducers: {
    clearPromotionError:  (state) => { state.error = null; state.actionError = null; },
    clearActionSuccess:   (state) => { state.actionSuccess = false; },
    resetPromotionsPubliques: (state) => { state.promotionsPubliques = []; },
  },
  extraReducers: (builder) => {
    // fetchPromotionsPubliques
    builder
      .addCase(fetchPromotionsPubliques.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchPromotionsPubliques.fulfilled, (s, a) => { s.loading = false; s.promotionsPubliques = a.payload; })
      .addCase(fetchPromotionsPubliques.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // fetchMesPromotions
    builder
      .addCase(fetchMesPromotions.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchMesPromotions.fulfilled, (s, a) => { s.loading = false; s.mesPromotions = a.payload; })
      .addCase(fetchMesPromotions.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // createPromotion
    builder
      .addCase(createPromotion.pending,   (s) => { s.actionError = null; s.actionSuccess = false; })
      .addCase(createPromotion.fulfilled, (s, a) => { s.actionSuccess = true; s.mesPromotions.unshift(a.payload); })
      .addCase(createPromotion.rejected,  (s, a) => { s.actionError = a.payload; });

    // updatePromotion
    builder
      .addCase(updatePromotion.fulfilled, (s, a) => {
        s.actionSuccess = true;
        const i = s.mesPromotions.findIndex((p) => p._id === a.payload._id);
        if (i !== -1) s.mesPromotions[i] = a.payload;
      })
      .addCase(updatePromotion.rejected, (s, a) => { s.actionError = a.payload; });

    // deletePromotion
    builder
      .addCase(deletePromotion.fulfilled, (s, a) => {
        s.actionSuccess = true;
        s.mesPromotions = s.mesPromotions.filter((p) => p._id !== a.payload);
      })
      .addCase(deletePromotion.rejected, (s, a) => { s.actionError = a.payload; });

    // addImagePromotion / deleteImagePromotion — on reçoit la promo complète mise à jour
    const replacePromo = (s, a) => {
      const i = s.mesPromotions.findIndex((p) => p._id === a.payload._id);
      if (i !== -1) s.mesPromotions[i] = a.payload;
    };
    builder
      .addCase(addImagePromotion.fulfilled,    replacePromo)
      .addCase(deleteImagePromotion.fulfilled, replacePromo)
      .addCase(addImagePromotion.rejected,    (s, a) => { s.actionError = a.payload; })
      .addCase(deleteImagePromotion.rejected, (s, a) => { s.actionError = a.payload; });
  },
});

export const { clearPromotionError, clearActionSuccess, resetPromotionsPubliques } = promotionSlice.actions;
export default promotionSlice.reducer;