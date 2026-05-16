// src/slices/categorieSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Get catégories actives (public) ──────────────────
export const fetchCategories = createAsyncThunk(
  "categorie/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Get toutes les catégories (admin) ─────────────────
export const fetchAllCategoriesAdmin = createAsyncThunk(
  "categorie/fetchAllAdmin",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/categories/admin/all`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Créer une catégorie (admin) ───────────────────────
export const createCategorie = createAsyncThunk(
  "categorie/create",
  async ({ nom, description, icone, ordre }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ nom, description, icone, ordre }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Modifier une catégorie (admin) ────────────────────
export const updateCategorie = createAsyncThunk(
  "categorie/update",
  async ({ id, ...fields }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(fields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Toggle actif/inactif (admin) ──────────────────────
export const toggleCategorie = createAsyncThunk(
  "categorie/toggle",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}/toggle`, {
        method:      "PATCH",
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

// ── Supprimer une catégorie (admin) ───────────────────
export const deleteCategorie = createAsyncThunk(
  "categorie/delete",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method:      "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
      return id; // on retourne l'id pour le retirer du state
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────
const categorieSlice = createSlice({
  name: "categorie",
  initialState: {
    categories:    [],
    loading:       false,
    error:         null,
    actionSuccess: false,
    actionError:   null,
  },
  reducers: {
    clearCategorieError:  (state) => { state.error = null; state.actionError = null; },
    clearActionSuccess:   (state) => { state.actionSuccess = false; },
  },
  extraReducers: (builder) => {

    // ── fetchCategories ──
    builder
      .addCase(fetchCategories.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload; })
      .addCase(fetchCategories.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── fetchAllCategoriesAdmin ──
    builder
      .addCase(fetchAllCategoriesAdmin.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchAllCategoriesAdmin.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload; })
      .addCase(fetchAllCategoriesAdmin.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── createCategorie ──
    builder
      .addCase(createCategorie.pending,   (state) => { state.actionError = null; state.actionSuccess = false; })
      .addCase(createCategorie.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.categories.push(action.payload);
      })
      .addCase(createCategorie.rejected,  (state, action) => { state.actionError = action.payload; });

    // ── updateCategorie ──
    builder
      .addCase(updateCategorie.fulfilled, (state, action) => {
        state.actionSuccess = true;
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.categories[index] = action.payload;
      })
      .addCase(updateCategorie.rejected, (state, action) => { state.actionError = action.payload; });

    // ── toggleCategorie ──
    builder
      .addCase(toggleCategorie.fulfilled, (state, action) => {
        const index = state.categories.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.categories[index].isActive = action.payload.isActive;
      })
      .addCase(toggleCategorie.rejected, (state, action) => { state.actionError = action.payload; });

    // ── deleteCategorie ──
    builder
      .addCase(deleteCategorie.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.categories = state.categories.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCategorie.rejected, (state, action) => { state.actionError = action.payload; });
  },
});

export const { clearCategorieError, clearActionSuccess } = categorieSlice.actions;
export default categorieSlice.reducer;