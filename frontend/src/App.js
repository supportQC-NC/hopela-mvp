// src/App.js
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./index.css";
import ScrollToTop from "./components/Utils/ScrollToTop";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/services",
  "/comment-ca-marche",
  "/contact",
  "/mentions-legales",
  "/cgu",
  "/cgv",
  "/confidentialite",
  "/cookies",
];

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { pathname }  = useLocation();

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/reset-password/");

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