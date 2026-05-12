// src/components/Utils/PrestataireRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const PrestataireRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) return <Navigate to="/login" replace />;
  if (userInfo.role !== "prestataire") return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PrestataireRoute;