// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import "./index.css";
import App from "./App";

// ── Guards ────────────────────────────────────────────
import PrivateRoute     from "./components/Utils/PrivateRoute";
import AdminRoute       from "./components/Utils/AdminRoute";
import PrestataireRoute from "./components/Utils/PrestataireRoute";

// ── Screens publics ───────────────────────────────────
import LandingScreen        from "./screens/public/LandingScreen";
import LoginScreen          from "./screens/public/LoginScreen";
import NotFoundScreen       from "./screens/NotFoundScreen";

// import RegisterScreen       from "./screens/public/RegisterScreen";
import ForgotPasswordScreen from "./screens/public/ForgotPasswordScreen";
import ResetPasswordScreen  from "./screens/public/ResetPasswordScreen";

// ── Pages légales ─────────────────────────────────────
import MentionLegalesScreen  from "./screens/public/legal/MentionLegalesScreen";
import CguScreen             from "./screens/public/legal/CguScreen";

import ConfidentialiteScreen from "./screens/public/legal/ConfidentialiteScreen";
import CookiesScreen         from "./screens/public/legal/CookiesScreen";

// ── Dashboards ────────────────────────────────────────
import UserDashboard        from "./screens/user/UserDashboard";
import PrestataireDashboard from "./screens/prestataire/PrestataireDashboard";
import AdminDashboard       from "./screens/admin/AdminDashboard";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* ── Public ── */}
      <Route index element={<LandingScreen />} />
      <Route path="login"    element={<LoginScreen />} />
      <Route path="register" element={<LoginScreen />} />
      <Route path="forgot-password"            element={<ForgotPasswordScreen />} />
      <Route path="reset-password/:token"      element={<ResetPasswordScreen />} />

      {/* ── Pages légales ── */}
      <Route path="mentions-legales"  element={<MentionLegalesScreen />} />
      <Route path="cgu"               element={<CguScreen />} />
      <Route path="confidentialite"   element={<ConfidentialiteScreen />} />
      <Route path="cookies"           element={<CookiesScreen />} />

      {/* ── Utilisateur connecté (tous rôles) ── */}
      <Route element={<PrivateRoute />}>
        <Route path="dashboard" element={<UserDashboard />} />
      </Route>

      {/* ── Prestataire uniquement ── */}
      <Route element={<PrestataireRoute />}>
        <Route path="prestataire/dashboard" element={<PrestataireDashboard />} />
      </Route>

      {/* ── Admin uniquement ── */}
      <Route element={<AdminRoute />}>
        <Route path="admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* ── 404 ── */}
      <Route path="*" element={<NotFoundScreen />} />

    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById("root"));

const app = (
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);

/*
 * StrictMode en DEV uniquement.
 * En développement, StrictMode double-monte intentionnellement les composants
 * pour détecter les effets de bord — c'est le comportement voulu.
 * En production, on le désactive pour éviter les connexions socket dupliquées.
 */
root.render(
  process.env.NODE_ENV !== "production"
    ? <React.StrictMode>{app}</React.StrictMode>
    : app
);