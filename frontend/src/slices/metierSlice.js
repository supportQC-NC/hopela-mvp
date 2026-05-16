// // src/slices/metierSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// // ── Get métiers actifs (public) ───────────────────────
// export const fetchMetiers = createAsyncThunk(
//   "metier/fetchAll",
//   async (_, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/metiers`);
//       if (!res.ok) throw new Error("Erreur lors du chargement des métiers");
//       return await res.json();
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Get tous les métiers (admin) ──────────────────────
// export const fetchAllMetiersAdmin = createAsyncThunk(
//   "metier/fetchAllAdmin",
//   async (_, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/metiers/admin/all`, {
//         credentials: "include",
//       });
//       if (!res.ok) throw new Error("Erreur lors du chargement des métiers");
//       return await res.json();
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Créer un métier (admin) ───────────────────────────
// export const createMetier = createAsyncThunk(
//   "metier/create",
//   async ({ nom, description, icone }, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/metiers`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ nom, description, icone }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors de la création");
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Modifier un métier (admin) ────────────────────────
// export const updateMetier = createAsyncThunk(
//   "metier/update",
//   async ({ id, ...fields }, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/metiers/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(fields),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Toggle actif/inactif (admin) ──────────────────────
// export const toggleMetier = createAsyncThunk(
//   "metier/toggle",
//   async (id, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/metiers/${id}/toggle`, {
//         method: "PATCH",
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur");
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Supprimer un métier (admin) ───────────────────────
// export const deleteMetier = createAsyncThunk(
//   "metier/delete",
//   async (id, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/metiers/${id}`, {
//         method: "DELETE",
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
//       return id; // on retourne l'id pour le retirer du state
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Slice ─────────────────────────────────────────────
// const metierSlice = createSlice({
//   name: "metier",
//   initialState: {
//     metiers:       [],
//     loading:       false,
//     error:         null,
//     actionSuccess: false,
//     actionError:   null,
//   },
//   reducers: {
//     clearMetierError:   (state) => { state.error = null; state.actionError = null; },
//     clearActionSuccess: (state) => { state.actionSuccess = false; },
//   },
//   extraReducers: (builder) => {

//     // ── fetchMetiers ──
//     builder
//       .addCase(fetchMetiers.pending,   (state) => { state.loading = true;  state.error = null; })
//       .addCase(fetchMetiers.fulfilled, (state, action) => { state.loading = false; state.metiers = action.payload; })
//       .addCase(fetchMetiers.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

//     // ── fetchAllMetiersAdmin ──
//     builder
//       .addCase(fetchAllMetiersAdmin.pending,   (state) => { state.loading = true;  state.error = null; })
//       .addCase(fetchAllMetiersAdmin.fulfilled, (state, action) => { state.loading = false; state.metiers = action.payload; })
//       .addCase(fetchAllMetiersAdmin.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

//     // ── createMetier ──
//     builder
//       .addCase(createMetier.pending,   (state) => { state.actionError = null; state.actionSuccess = false; })
//       .addCase(createMetier.fulfilled, (state, action) => {
//         state.actionSuccess = true;
//         state.metiers.push(action.payload);
//       })
//       .addCase(createMetier.rejected,  (state, action) => { state.actionError = action.payload; });

//     // ── updateMetier ──
//     builder
//       .addCase(updateMetier.fulfilled, (state, action) => {
//         state.actionSuccess = true;
//         const index = state.metiers.findIndex((m) => m._id === action.payload._id);
//         if (index !== -1) state.metiers[index] = action.payload;
//       })
//       .addCase(updateMetier.rejected, (state, action) => { state.actionError = action.payload; });

//     // ── toggleMetier ──
//     builder
//       .addCase(toggleMetier.fulfilled, (state, action) => {
//         const index = state.metiers.findIndex((m) => m._id === action.payload._id);
//         if (index !== -1) state.metiers[index].isActive = action.payload.isActive;
//       })
//       .addCase(toggleMetier.rejected, (state, action) => { state.actionError = action.payload; });

//     // ── deleteMetier ──
//     builder
//       .addCase(deleteMetier.fulfilled, (state, action) => {
//         state.actionSuccess = true;
//         state.metiers = state.metiers.filter((m) => m._id !== action.payload);
//       })
//       .addCase(deleteMetier.rejected, (state, action) => { state.actionError = action.payload; });
//   },
// });

// export const { clearMetierError, clearActionSuccess } = metierSlice.actions;
// export default metierSlice.reducer;


// src/slices/metierSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Get métiers actifs (public) ───────────────────────
export const fetchMetiers = createAsyncThunk(
  "metier/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/metiers`);
      if (!res.ok) throw new Error("Erreur lors du chargement des métiers");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Get tous les métiers (admin) ──────────────────────
export const fetchAllMetiersAdmin = createAsyncThunk(
  "metier/fetchAllAdmin",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/metiers/admin/all`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des métiers");
      return await res.json();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Créer un métier (admin) ───────────────────────────
// Payload attendu : { nom, description, icone, categorieId }
export const createMetier = createAsyncThunk(
  "metier/create",
  async ({ nom, description, icone, categorieId }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/metiers`, {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify({ nom, description, icone, categorieId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Modifier un métier (admin) ────────────────────────
// Payload attendu : { id, nom?, description?, icone?, categorieId?, isActive? }
export const updateMetier = createAsyncThunk(
  "metier/update",
  async ({ id, ...fields }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/metiers/${id}`, {
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
export const toggleMetier = createAsyncThunk(
  "metier/toggle",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/metiers/${id}/toggle`, {
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

// ── Supprimer un métier (admin) ───────────────────────
export const deleteMetier = createAsyncThunk(
  "metier/delete",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/metiers/${id}`, {
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
const metierSlice = createSlice({
  name: "metier",
  initialState: {
    metiers:       [],
    loading:       false,
    error:         null,
    actionSuccess: false,
    actionError:   null,
  },
  reducers: {
    clearMetierError:   (state) => { state.error = null; state.actionError = null; },
    clearActionSuccess: (state) => { state.actionSuccess = false; },
  },
  extraReducers: (builder) => {

    // ── fetchMetiers ──
    builder
      .addCase(fetchMetiers.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchMetiers.fulfilled, (state, action) => { state.loading = false; state.metiers = action.payload; })
      .addCase(fetchMetiers.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── fetchAllMetiersAdmin ──
    builder
      .addCase(fetchAllMetiersAdmin.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchAllMetiersAdmin.fulfilled, (state, action) => { state.loading = false; state.metiers = action.payload; })
      .addCase(fetchAllMetiersAdmin.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── createMetier ──
    builder
      .addCase(createMetier.pending,   (state) => { state.actionError = null; state.actionSuccess = false; })
      .addCase(createMetier.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.metiers.push(action.payload);
      })
      .addCase(createMetier.rejected,  (state, action) => { state.actionError = action.payload; });

    // ── updateMetier ──
    builder
      .addCase(updateMetier.fulfilled, (state, action) => {
        state.actionSuccess = true;
        const index = state.metiers.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.metiers[index] = action.payload;
      })
      .addCase(updateMetier.rejected, (state, action) => { state.actionError = action.payload; });

    // ── toggleMetier ──
    builder
      .addCase(toggleMetier.fulfilled, (state, action) => {
        const index = state.metiers.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.metiers[index].isActive = action.payload.isActive;
      })
      .addCase(toggleMetier.rejected, (state, action) => { state.actionError = action.payload; });

    // ── deleteMetier ──
    builder
      .addCase(deleteMetier.fulfilled, (state, action) => {
        state.actionSuccess = true;
        state.metiers = state.metiers.filter((m) => m._id !== action.payload);
      })
      .addCase(deleteMetier.rejected, (state, action) => { state.actionError = action.payload; });
  },
});

export const { clearMetierError, clearActionSuccess } = metierSlice.actions;
export default metierSlice.reducer;