// src/components/admin/AdminSidebar.jsx
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout, logoutUser } from "../../slices/authSlice";
import logo from "../../logo.png";
import "./AdminSidebar.scss";

const NAV = [
  { section: "Principal" },
  { icon: "📊", label: "Vue d'ensemble", key: "overview" },
  { icon: "🗺️", label: "Carte live", key: "map" },
  { divider: true },
  { section: "Gestion" },
  { icon: "👥", label: "Utilisateurs", key: "users" },
  { icon: "📂", label: "Catalogues", key: "catalogues" },
  { divider: true },
  { section: "Communication" },
  { icon: "📬", label: "Messages", key: "contact" },
];

const AdminSidebar = ({ activeNav, setActiveNav, counts = {} }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(logout());
    navigate("/");
  };

  return (
    <aside className="as-sidebar">
      <Link to="/" className="as-logo">
        <img src={logo} alt="Hopela" className="as-logo-img" />
        <span className="as-logo-name">Hopela</span>
      </Link>

      {NAV.map((item, i) => {
        if (item.section)
          return <div key={i} className="as-section-label">{item.section}</div>;
        if (item.divider)
          return <div key={i} className="as-divider" />;
        const count = counts[item.key];
        return (
          <button
            key={item.key}
            className={`as-nav-item${activeNav === item.key ? " active" : ""}`}
            onClick={() => setActiveNav(item.key)}
          >
            <span className="as-nav-icon">{item.icon}</span>
            {item.label}
            {count > 0 && (
              <span
                className="as-nav-badge"
                style={
                  item.key === "contact"
                    ? { background: "rgba(251,191,36,0.15)", color: "#d97706", borderColor: "rgba(251,191,36,0.3)" }
                    : {}
                }
              >
                {count}
              </span>
            )}
          </button>
        );
      })}

      <div className="as-footer">
        <div className="as-user-info">
          <div className="as-user-avatar">
            {userInfo?.prenom?.[0]}
            {userInfo?.nom?.[0]}
          </div>
          <div>
            <div className="as-user-name">{userInfo?.prenom} {userInfo?.nom}</div>
            <div className="as-user-role">Administrateur</div>
          </div>
        </div>
        <button className="as-logout-btn" onClick={handleLogout}>
          <span>⏻</span> Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
