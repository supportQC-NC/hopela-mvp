// // src/App.jsx
// import { Outlet, useLocation, Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import "./index.css";

// // Routes accessibles sans être connecté
// const PUBLIC_ROUTES = [
//   "/",
//   "/login",
//   "/register",
//   "/forgot-password",
//   "/mentions-legales",
//   "/cgu",
//   "/confidentialite",
//   "/cookies",
// ];

// const App = () => {
//   const { userInfo } = useSelector((state) => state.auth);
//   const { pathname }  = useLocation();

//   const isPublicRoute =
//     PUBLIC_ROUTES.includes(pathname) ||
//     pathname.startsWith("/reset-password/");

//   // Non connecté sur une route protégée → login
//   if (!userInfo && !isPublicRoute) {
//     return <Navigate to="/login" replace />;
//   }

//   // Dans tous les cas on rend l'Outlet
//   // Header/Footer sont gérés par chaque screen (LandingScreen les inclut déjà)
//   return <Outlet />;
// };

// export default App;
// src/App.jsx
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./index.css";

// Utils
import ScrollToTop from "./components/Utils/ScrollToTop";

// Routes accessibles sans être connecté
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/mentions-legales",
  "/cgu",
  "/confidentialite",
  "/cookies",
];

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/reset-password/");

  // Non connecté sur une route protégée → login
  if (!userInfo && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
};

export default App;