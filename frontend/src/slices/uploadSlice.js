// src/slices/uploadSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Upload logo prestataire ───────────────────────────
export const uploadLogo = createAsyncThunk(
  "upload/logo",
  async (formData, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/upload/logo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'upload");
      return data.avatar; // chemin /uploads/logos/xxx.jpg
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Supprimer logo prestataire ────────────────────────
export const deleteLogo = createAsyncThunk(
  "upload/deleteLogo",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/upload/logo`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
      return null;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────
const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    loading: false,
    error:   null,
    success: false,
  },
  reducers: {
    clearUploadState: (state) => {
      state.loading = false;
      state.error   = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {

    // ── uploadLogo ──
    builder
      .addCase(uploadLogo.pending,   (state) => { state.loading = true;  state.error = null; state.success = false; })
      .addCase(uploadLogo.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(uploadLogo.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── deleteLogo ──
    builder
      .addCase(deleteLogo.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(deleteLogo.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(deleteLogo.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearUploadState } = uploadSlice.actions;
export default uploadSlice.reducer;