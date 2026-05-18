// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice }       from "./slices/apiSlice";
import authReducer        from "./slices/authSlice";
import locationReducer    from "./slices/locationSlice";
import metierReducer      from "./slices/metierSlice";
import categorieReducer   from "./slices/categorieSlice";
import serviceReducer     from "./slices/serviceSlice";
import uploadReducer      from "./slices/uploadSlice";
import demandeReducer     from "./slices/demandeSlice";

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth:      authReducer,
    location:  locationReducer,
    metier:    metierReducer,
    categorie: categorieReducer,
    service:   serviceReducer,
    upload:    uploadReducer,
    demande:   demandeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

window.__hopela_redux_store__ = store;

export default store;