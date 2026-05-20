// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import "./styles/main.scss";
import App from "./App";

// ── Guards ────────────────────────────────────────────
import PrivateRoute     from "./components/Utils/PrivateRoute";
import AdminRoute       from "./components/Utils/AdminRoute";
import PrestataireRoute from "./components/Utils/PrestataireRoute";

// ── Screens publics ───────────────────────────────────
import LandingScreen          from "./screens/public/LandingScreen";
import LoginScreen            from "./screens/public/LoginScreen";
import ForgotPasswordScreen   from "./screens/public/ForgotPasswordScreen";
import ResetPasswordScreen    from "./screens/public/ResetPasswordScreen";
import ServicesScreen         from "./screens/public/ServicesScreen";
import CategorieScreen        from "./screens/public/CategorieScreen";  // ← nouveau
import CommentCaMarcheScreen  from "./screens/public/CommentCaMarcheScreen";
import ContactScreen          from "./screens/public/ContactScreen";
import PrestairePublicPage    from "./screens/public/PrestatairePublicPage";
import NotFoundScreen         from "./screens/NotFoundScreen";

// ── Pages légales ─────────────────────────────────────
import MentionLegalesScreen  from "./screens/public/legal/MentionLegalesScreen";
import CguScreen             from "./screens/public/legal/CguScreen";
import CgvScreen             from "./screens/public/legal/CgvScreen";
import ConfidentialiteScreen from "./screens/public/legal/ConfidentialiteScreen";
import CookiesScreen         from "./screens/public/legal/CookiesScreen";

// ── Dashboards ────────────────────────────────────────
import UserDashboard        from "./screens/user/UserDashboard";
import CarteUserScreen      from "./screens/user/CarteUserScreen";
import PrestataireDashboard from "./screens/prestataire/PrestataireDashboard";
import CartePrestaireScreen from "./screens/prestataire/CartePrestaireScreen";
import AdminDashboard       from "./screens/admin/AdminDashboard";

// ── Carte publique ─────────────────────────────────────
import CarteScreen from "./screens/public/CarteScreen";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* ── Public ── */}
      <Route index                                  element={<LandingScreen />} />
      <Route path="login"                           element={<LoginScreen />} />
      <Route path="forgot-password"                 element={<ForgotPasswordScreen />} />
      <Route path="reset-password/:token"           element={<ResetPasswordScreen />} />
      <Route path="services"                        element={<ServicesScreen />} />
      <Route path="services/categories/:id"         element={<CategorieScreen />} />  {/* ← nouveau */}
      <Route path="comment-ca-marche"               element={<CommentCaMarcheScreen />} />
      <Route path="contact"                         element={<ContactScreen />} />
      <Route path="prestataire/:id"                 element={<PrestairePublicPage />} />
      <Route path="carte"                           element={<CarteScreen />} />

      {/* ── Pages légales ── */}
      <Route path="mentions-legales"  element={<MentionLegalesScreen />} />
      <Route path="cgu"               element={<CguScreen />} />
      <Route path="cgv"               element={<CgvScreen />} />
      <Route path="confidentialite"   element={<ConfidentialiteScreen />} />
      <Route path="cookies"           element={<CookiesScreen />} />

      {/* ── Utilisateur connecté ── */}
      <Route element={<PrivateRoute />}>
        <Route path="dashboard"       element={<UserDashboard />} />
        <Route path="dashboard/carte" element={<CarteUserScreen />} />
      </Route>

      {/* ── Prestataire ── */}
      <Route element={<PrestataireRoute />}>
        <Route path="prestataire/dashboard" element={<PrestataireDashboard />} />
        <Route path="prestataire/carte"     element={<CartePrestaireScreen />} />
      </Route>

      {/* ── Admin ── */}
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

root.render(
  process.env.NODE_ENV !== "production"
    ? <React.StrictMode>{app}</React.StrictMode>
    : app
);