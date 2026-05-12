// src/App.jsx
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./screens/public/LoginScreen";
import "./index.css";

const PUBLIC_ROUTES = ["/", "/login", "/forgot-password"];

const App = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/reset-password/");

  if (!userInfo && !isPublicRoute) {
    return <Login />;
  }

  if (!userInfo && isPublicRoute) {
    return <Outlet />;
  }

  return (
    <>
      <div className="app">
        <div className="app-body">
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
};

export default App;