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

// ── Guards ───────────────────────────────────────────────────────────────────
import PrivateRoute     from "./components/Utils/PrivateRoute";
import AdminRoute       from "./components/Utils/AdminRoute";
import PrestataireRoute from "./components/Utils/PrestataireRoute";

// ── Screens publics ──────────────────────────────────────────────────────────
import LandingScreen  from "./screens/public/LandingScreen";
import LoginScreen    from "./screens/public/LoginScreen";
import NotFoundScreen from "./screens/NotFoundScreen";

// ── Dashboards ───────────────────────────────────────────────────────────────
import UserDashboard        from "./screens/user/UserDashboard";
import PrestataireDashboard from "./screens/prestataire/PrestataireDashboard";
import AdminDashboard       from "./screens/admin/AdminDashboard";

// import ForgotPasswordScreen from "./screens/public/ForgotPasswordScreen";
// import ResetPasswordScreen  from "./screens/public/ResetPasswordScreen";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>

      {/* ── Public ── */}
      <Route index element={<LandingScreen />} />
      <Route path="login" element={<LoginScreen />} />
      {/* <Route path="forgot-password" element={<ForgotPasswordScreen />} /> */}
      {/* <Route path="reset-password/:token" element={<ResetPasswordScreen />} /> */}

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

// StrictMode uniquement en production
// En dev : désactivé pour éviter les doubles montages Socket.io
root.render(
  process.env.NODE_ENV === "production"
    ? <React.StrictMode>{app}</React.StrictMode>
    : app
);