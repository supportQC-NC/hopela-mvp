// // src/slices/authSlice.js
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// // ── Login ────────────────────────────────────────────
// export const loginUser = createAsyncThunk(
//   "auth/login",
//   async ({ email, password }, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur de connexion");
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Register ─────────────────────────────────────────
// export const registerUser = createAsyncThunk(
//   "auth/register",
//   async ({ email, password, nom, prenom, role }, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email, password, nom, prenom, role }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors de la création du compte");
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Get profil ───────────────────────────────────────
// export const fetchProfile = createAsyncThunk(
//   "auth/fetchProfile",
//   async (_, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/profile`, {
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors du chargement du profil");
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Update profil ────────────────────────────────────
// export const updateProfile = createAsyncThunk(
//   "auth/updateProfile",
//   async (profileData, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/profile`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(profileData),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour");
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Update rayon de recherche ────────────────────────
// export const updateRayon = createAsyncThunk(
//   "auth/updateRayon",
//   async (rayon, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/rayon`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ rayon }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour du rayon");
//       return data;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Forgot password ──────────────────────────────────
// export const forgotPassword = createAsyncThunk(
//   "auth/forgotPassword",
//   async (email, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/forgot-password`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ email }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur");
//       return data.message;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Reset password ───────────────────────────────────
// export const resetPassword = createAsyncThunk(
//   "auth/resetPassword",
//   async ({ token, password }, thunkAPI) => {
//     try {
//       const res = await fetch(`${API_URL}/api/users/reset-password/${token}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ password }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || "Erreur");
//       return data.message;
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Logout ───────────────────────────────────────────
// export const logoutUser = createAsyncThunk(
//   "auth/logout",
//   async (_, thunkAPI) => {
//     try {
//       await fetch(`${API_URL}/api/users/logout`, {
//         method: "POST",
//         credentials: "include",
//       });
//     } catch (err) {
//       return thunkAPI.rejectWithValue(err.message);
//     }
//   }
// );

// // ── Slice ────────────────────────────────────────────
// const initialState = {
//   userInfo: localStorage.getItem("userInfo")
//     ? JSON.parse(localStorage.getItem("userInfo"))
//     : null,
//   loading:         false,
//   updateLoading:   false,
//   error:           null,
//   updateError:     null,
//   updateSuccess:   false,
//   resetSuccess:    false,
//   forgotSuccess:   false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, action) => {
//       state.userInfo = action.payload;
//       localStorage.setItem("userInfo", JSON.stringify(action.payload));
//     },
//     logout: (state) => {
//       state.userInfo = null;
//       state.error    = null;
//       localStorage.removeItem("userInfo");
//     },
//     clearError: (state) => {
//       state.error       = null;
//       state.updateError = null;
//     },
//     clearUpdateSuccess: (state) => {
//       state.updateSuccess = false;
//     },
//     clearResetSuccess: (state) => {
//       state.resetSuccess  = false;
//       state.forgotSuccess = false;
//     },
//   },
//   extraReducers: (builder) => {

//     // ── Login ──
//     builder
//       .addCase(loginUser.pending,   (state) => { state.loading = true;  state.error = null; })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading  = false;
//         state.userInfo = action.payload;
//         localStorage.setItem("userInfo", JSON.stringify(action.payload));
//       })
//       .addCase(loginUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

//     // ── Register ──
//     builder
//       .addCase(registerUser.pending,   (state) => { state.loading = true;  state.error = null; })
//       .addCase(registerUser.fulfilled, (state, action) => {
//         state.loading  = false;
//         state.userInfo = action.payload;
//         localStorage.setItem("userInfo", JSON.stringify(action.payload));
//       })
//       .addCase(registerUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

//     // ── Fetch profil ──
//     builder
//       .addCase(fetchProfile.pending,   (state) => { state.loading = true;  state.error = null; })
//       .addCase(fetchProfile.fulfilled, (state, action) => {
//         state.loading  = false;
//         state.userInfo = { ...state.userInfo, ...action.payload };
//         localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
//       })
//       .addCase(fetchProfile.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

//     // ── Update profil ──
//     builder
//       .addCase(updateProfile.pending,   (state) => { state.updateLoading = true;  state.updateError = null; state.updateSuccess = false; })
//       .addCase(updateProfile.fulfilled, (state, action) => {
//         state.updateLoading = false;
//         state.updateSuccess = true;
//         state.userInfo      = { ...state.userInfo, ...action.payload };
//         localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
//       })
//       .addCase(updateProfile.rejected,  (state, action) => { state.updateLoading = false; state.updateError = action.payload; });

//     // ── Update rayon ──
//     builder
//       .addCase(updateRayon.fulfilled, (state, action) => {
//         if (state.userInfo) {
//           state.userInfo.rayonRecherche = action.payload.rayonRecherche;
//           localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
//         }
//       });

//     // ── Forgot password ──
//     builder
//       .addCase(forgotPassword.pending,   (state) => { state.loading = true;  state.error = null; })
//       .addCase(forgotPassword.fulfilled, (state) => { state.loading = false; state.forgotSuccess = true; })
//       .addCase(forgotPassword.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

//     // ── Reset password ──
//     builder
//       .addCase(resetPassword.pending,   (state) => { state.loading = true;  state.error = null; })
//       .addCase(resetPassword.fulfilled, (state) => { state.loading = false; state.resetSuccess = true; })
//       .addCase(resetPassword.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

//     // ── Logout ──
//     builder
//       .addCase(logoutUser.fulfilled, (state) => {
//         state.userInfo = null;
//         state.error    = null;
//         localStorage.removeItem("userInfo");
//       });
//   },
// });

// export const {
//   setCredentials,
//   logout,
//   clearError,
//   clearUpdateSuccess,
//   clearResetSuccess,
// } = authSlice.actions;

// export default authSlice.reducer;

// src/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Login ────────────────────────────────────────────
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

// ── Register ─────────────────────────────────────────
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password, nom, prenom, role, telephoneContact, ridet }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, nom, prenom, role, telephoneContact, ridet }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création du compte");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Get profil ───────────────────────────────────────
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors du chargement du profil");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Update profil ────────────────────────────────────
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

// ── Update rayon de recherche ────────────────────────
export const updateRayon = createAsyncThunk(
  "auth/updateRayon",
  async (rayon, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/rayon`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rayon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour du rayon");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Forgot password ──────────────────────────────────
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      return data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Reset password ───────────────────────────────────
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/users/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      return data.message;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Logout ───────────────────────────────────────────
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

// ── Slice ────────────────────────────────────────────
const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  loading:         false,
  updateLoading:   false,
  error:           null,
  updateError:     null,
  updateSuccess:   false,
  resetSuccess:    false,
  forgotSuccess:   false,
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
      state.error    = null;
      localStorage.removeItem("userInfo");
    },
    clearError: (state) => {
      state.error       = null;
      state.updateError = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearResetSuccess: (state) => {
      state.resetSuccess  = false;
      state.forgotSuccess = false;
    },
  },
  extraReducers: (builder) => {

    // ── Login ──
    builder
      .addCase(loginUser.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading  = false;
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── Register ──
    builder
      .addCase(registerUser.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading  = false;
        state.userInfo = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── Fetch profil ──
    builder
      .addCase(fetchProfile.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading  = false;
        state.userInfo = { ...state.userInfo, ...action.payload };
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      })
      .addCase(fetchProfile.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── Update profil ──
    builder
      .addCase(updateProfile.pending,   (state) => { state.updateLoading = true;  state.updateError = null; state.updateSuccess = false; })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;
        state.userInfo      = { ...state.userInfo, ...action.payload };
        localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
      })
      .addCase(updateProfile.rejected,  (state, action) => { state.updateLoading = false; state.updateError = action.payload; });

    // ── Update rayon ──
    builder
      .addCase(updateRayon.fulfilled, (state, action) => {
        if (state.userInfo) {
          state.userInfo.rayonRecherche = action.payload.rayonRecherche;
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
        }
      });

    // ── Forgot password ──
    builder
      .addCase(forgotPassword.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(forgotPassword.fulfilled, (state) => { state.loading = false; state.forgotSuccess = true; })
      .addCase(forgotPassword.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── Reset password ──
    builder
      .addCase(resetPassword.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(resetPassword.fulfilled, (state) => { state.loading = false; state.resetSuccess = true; })
      .addCase(resetPassword.rejected,  (state, action) => { state.loading = false; state.error = action.payload; });

    // ── Logout ──
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.userInfo = null;
        state.error    = null;
        localStorage.removeItem("userInfo");
      });
  },
});

export const {
  setCredentials,
  logout,
  clearError,
  clearUpdateSuccess,
  clearResetSuccess,
} = authSlice.actions;

export default authSlice.reducer;