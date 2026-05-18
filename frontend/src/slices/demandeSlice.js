// src/slices/demandeSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS — CLIENT
// ─────────────────────────────────────────────────────────────────────────────

// ── Créer une demande ─────────────────────────────────
// Payload : { description, categorie, metier, telephoneContact, longitude, latitude, adresse? }
export const creerDemande = createAsyncThunk(
  "demande/creer",
  async (demandeData, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/demandes`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(demandeData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la création de la demande");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Récupérer ses propres demandes (client) ───────────
export const fetchMesDemandes = createAsyncThunk(
  "demande/fetchMes",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/demandes/mes-demandes`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors du chargement des demandes");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Annuler une demande (client propriétaire) ─────────
// Payload : id (string)
export const annulerDemande = createAsyncThunk(
  "demande/annuler",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/demandes/${id}/annuler`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'annulation");
      // On retourne la demande mise à jour pour synchroniser le state
      return data.demande;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Clôturer une demande (client propriétaire) ────────
// Payload : id (string)
export const cloturerDemande = createAsyncThunk(
  "demande/cloturer",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/demandes/${id}/cloturer`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la clôture");
      return data.demande;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS — PRESTATAIRE
// ─────────────────────────────────────────────────────────────────────────────

// ── Liste des demandes actives triées par distance ────
// Utilisée pour la vue liste du dashboard prestataire
export const fetchDemandesPrestataire = createAsyncThunk(
  "demande/fetchPrestataireListe",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/demandes/prestataire/liste`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors du chargement des demandes");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Marqueurs carte (données légères) ────────────────
// Utilisée pour l'affichage des pins Mapbox — séparée de la liste
// pour ne charger que les champs nécessaires à la carte.
export const fetchDemandesCarte = createAsyncThunk(
  "demande/fetchCarte",
  async (_, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/demandes/prestataire/carte`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors du chargement des marqueurs");
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// THUNKS — ADMIN
// ─────────────────────────────────────────────────────────────────────────────

// ── Toutes les demandes avec filtres et pagination ────
// Payload : { statut?, metier?, categorie?, client?, page?, limit? }
export const fetchAllDemandesAdmin = createAsyncThunk(
  "demande/fetchAdmin",
  async (params = {}, thunkAPI) => {
    try {
      const query = new URLSearchParams();
      if (params.statut)    query.set("statut",    params.statut);
      if (params.metier)    query.set("metier",    params.metier);
      if (params.categorie) query.set("categorie", params.categorie);
      if (params.client)    query.set("client",    params.client);
      if (params.page)      query.set("page",      params.page);
      if (params.limit)     query.set("limit",     params.limit);

      const res = await fetch(`${API_URL}/api/demandes/admin?${query.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors du chargement des demandes");
      // Retourne { total, page, totalPages, demandes }
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Modifier le statut d'une demande (admin) ─────────
// Payload : { id, statut }
export const modifierStatutAdmin = createAsyncThunk(
  "demande/modifierStatut",
  async ({ id, statut }, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/demandes/admin/${id}/statut`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ statut }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour du statut");
      return data.demande;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ── Supprimer une demande (admin) ─────────────────────
// Payload : id (string)
export const supprimerDemandeAdmin = createAsyncThunk(
  "demande/supprimerAdmin",
  async (id, thunkAPI) => {
    try {
      const res = await fetch(`${API_URL}/api/demandes/admin/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de la suppression");
      // On retourne l'id supprimé pour filtrer le state côté admin
      return id;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────────────────────────────────────

const initialState = {
  // ── Client ─────────────────────────────────────────
  // Liste complète des demandes du client connecté (tous statuts)
  mesDemandes:  [],

  // ── Prestataire ────────────────────────────────────
  // Liste triée par distance (vue dashboard prestataire)
  demandesListe: [],
  // Données légères pour les marqueurs Mapbox
  demandesCarte: [],

  // ── Admin ──────────────────────────────────────────
  // Liste paginée de toutes les demandes
  demandesAdmin: [],
  totalAdmin:    0,
  pageAdmin:     1,
  totalPagesAdmin: 0,

  // ── États de chargement ────────────────────────────
  // Chargement initial d'une liste
  loading:       false,
  // Chargement d'une action (créer, annuler, clôturer, supprimer, modifier statut)
  actionLoading: false,

  // ── Erreurs ────────────────────────────────────────
  error:         null,
  actionError:   null,

  // ── Succès d'action ────────────────────────────────
  // Utilisé pour déclencher un feedback UI (toast, fermeture de modale, etc.)
  actionSuccess: false,
};

const demandeSlice = createSlice({
  name: "demande",
  initialState,
  reducers: {
    // Réinitialise les flags d'erreur (appelé à l'ouverture d'une modale par exemple)
    clearDemandeError: (state) => {
      state.error       = null;
      state.actionError = null;
    },
    // Réinitialise le flag de succès (appelé après affichage du feedback UI)
    clearActionSuccess: (state) => {
      state.actionSuccess = false;
    },
    // Réinitialise l'état carte (utile au démontage du composant carte)
    clearDemandesCarte: (state) => {
      state.demandesCarte = [];
    },
  },
  extraReducers: (builder) => {

    // ── creerDemande ──────────────────────────────────
    builder
      .addCase(creerDemande.pending, (state) => {
        state.actionLoading = true;
        state.actionError   = null;
        state.actionSuccess = false;
      })
      .addCase(creerDemande.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Ajout en tête de liste pour un retour UI immédiat
        state.mesDemandes.unshift(action.payload);
      })
      .addCase(creerDemande.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError   = action.payload;
      });

    // ── fetchMesDemandes ──────────────────────────────
    builder
      .addCase(fetchMesDemandes.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchMesDemandes.fulfilled, (state, action) => {
        state.loading     = false;
        state.mesDemandes = action.payload;
      })
      .addCase(fetchMesDemandes.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── annulerDemande ────────────────────────────────
    builder
      .addCase(annulerDemande.pending, (state) => {
        state.actionLoading = true;
        state.actionError   = null;
      })
      .addCase(annulerDemande.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Mise à jour locale du statut dans mesDemandes
        const index = state.mesDemandes.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) state.mesDemandes[index] = action.payload;
      })
      .addCase(annulerDemande.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError   = action.payload;
      });

    // ── cloturerDemande ───────────────────────────────
    builder
      .addCase(cloturerDemande.pending, (state) => {
        state.actionLoading = true;
        state.actionError   = null;
      })
      .addCase(cloturerDemande.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        const index = state.mesDemandes.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) state.mesDemandes[index] = action.payload;
      })
      .addCase(cloturerDemande.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError   = action.payload;
      });

    // ── fetchDemandesPrestataire ──────────────────────
    builder
      .addCase(fetchDemandesPrestataire.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchDemandesPrestataire.fulfilled, (state, action) => {
        state.loading        = false;
        state.demandesListe  = action.payload;
      })
      .addCase(fetchDemandesPrestataire.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── fetchDemandesCarte ────────────────────────────
    builder
      .addCase(fetchDemandesCarte.pending, (state) => {
        // Pas de loading global pour ne pas bloquer l'UI carte
        state.error = null;
      })
      .addCase(fetchDemandesCarte.fulfilled, (state, action) => {
        state.demandesCarte = action.payload;
      })
      .addCase(fetchDemandesCarte.rejected, (state, action) => {
        state.error = action.payload;
      });

    // ── fetchAllDemandesAdmin ─────────────────────────
    builder
      .addCase(fetchAllDemandesAdmin.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAllDemandesAdmin.fulfilled, (state, action) => {
        state.loading          = false;
        state.demandesAdmin    = action.payload.demandes;
        state.totalAdmin       = action.payload.total;
        state.pageAdmin        = action.payload.page;
        state.totalPagesAdmin  = action.payload.totalPages;
      })
      .addCase(fetchAllDemandesAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });

    // ── modifierStatutAdmin ───────────────────────────
    builder
      .addCase(modifierStatutAdmin.pending, (state) => {
        state.actionLoading = true;
        state.actionError   = null;
      })
      .addCase(modifierStatutAdmin.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Mise à jour locale dans la liste admin sans refetch
        const index = state.demandesAdmin.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) state.demandesAdmin[index] = action.payload;
      })
      .addCase(modifierStatutAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError   = action.payload;
      });

    // ── supprimerDemandeAdmin ─────────────────────────
    builder
      .addCase(supprimerDemandeAdmin.pending, (state) => {
        state.actionLoading = true;
        state.actionError   = null;
      })
      .addCase(supprimerDemandeAdmin.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Suppression locale sans refetch — action.payload = id supprimé
        state.demandesAdmin = state.demandesAdmin.filter((d) => d._id !== action.payload);
        if (state.totalAdmin > 0) state.totalAdmin -= 1;
      })
      .addCase(supprimerDemandeAdmin.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError   = action.payload;
      });
  },
});

export const {
  clearDemandeError,
  clearActionSuccess,
  clearDemandesCarte,
} = demandeSlice.actions;

export default demandeSlice.reducer;