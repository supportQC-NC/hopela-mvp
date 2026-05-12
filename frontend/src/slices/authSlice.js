// src/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Thunk login ──────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur de connexion");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Thunk register ───────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password, nom, prenom, role }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, nom, prenom, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création du compte");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Thunk updateProfile ──────────────────────────────────────────────────────
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Thunk logout ─────────────────────────────────────────────────────────────
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await fetch(`${API_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────
const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  loading: false,
  updateLoading: false,
  error: null,
  updateError: null,
  updateSuccess: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      state.error = null;
      localStorage.removeItem("userInfo");
    },
    clearError: (state) => {
      state.error = null;
      state.updateError = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Register ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });

    // ── Update Profile ──
    builder
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        // Merge les données mises à jour dans userInfo
        state.userInfo = { ...state.userInfo, ...action.payload };
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });

    // ── Logout ──
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.error = null;
        localStorage.removeItem("userInfo");
      });
  },
});

export const { setCredentials, logout, clearError, clearUpdateSuccess } = authSlice.actions;

export default authSlice.reducer;