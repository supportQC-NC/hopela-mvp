// src/components/admin/AdminSidebar.jsx
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout, logoutUser } from "../../slices/authSlice";
import logo from "../../logo.png";
import "./AdminSidebar.scss";

const NAV = [
  { section: "Principal" },
  { icon: "📊", label: "Vue d'ensemble", key: "overview" },
  { icon: "🗺️", label: "Carte live",     key: "map" },
  { divider: true },
  { section: "Gestion" },
  { icon: "👥", label: "Utilisateurs",   key: "users" },
  { icon: "📂", label: "Catalogues",     key: "catalogues" },
  { icon: "🏷️", label: "Promotions",    key: "promotions" },
  { icon: "❤️", label: "Favoris",       key: "favoris" },
  { divider: true },
  { section: "Communication" },
  { icon: "📬", label: "Messages",       key: "contact" },
];

const AdminSidebar = ({ activeNav, setActiveNav, counts = {}, collapsed, onToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    dispatch(logout());
    navigate("/");
  };

  return (
    <aside className={`as-sidebar${collapsed ? " collapsed" : ""}`}>

      {/* ── Barre du haut : toggle + logo ── */}
      <div className="as-logo-bar">
        <div className="as-top">

          {/* Toggle replier/déplier — toujours visible en haut à gauche */}
          <button
            className="as-toggle"
            onClick={onToggle}
            aria-label={collapsed ? "Déplier la sidebar" : "Replier la sidebar"}
            title={collapsed ? "Déplier" : "Replier"}
          >
            <span className="as-toggle-icon">{collapsed ? "▶" : "◀"}</span>
          </button>

          {/* Logo — masqué quand replié */}
          <Link to="/" className="as-logo" title="Accueil">
            <img src={logo} alt="Hopela" className="as-logo-img" />
            <span className="as-logo-name">Hopela</span>
          </Link>

        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="as-nav">
        {NAV.map((item, i) => {
          if (item.section) {
            if (collapsed) return null;
            return <div key={i} className="as-section-label">{item.section}</div>;
          }
          if (item.divider) return <div key={i} className="as-divider" />;

          const count = counts[item.key];
          return (
            <button
              key={item.key}
              className={`as-nav-item${activeNav === item.key ? " active" : ""}`}
              onClick={() => setActiveNav(item.key)}
              title={collapsed ? item.label : undefined}
            >
              <span className="as-nav-icon">{item.icon}</span>
              {!collapsed && <span className="as-nav-label">{item.label}</span>}
              {count > 0 && (
                <span
                  className="as-nav-badge"
                  style={
                    item.key === "contact"
                      ? { background: "rgba(251,191,36,0.18)", color: "#fbbf24" }
                      : {}
                  }
                >
                  {collapsed ? "" : count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="as-footer">
        {!collapsed && (
          <div className="as-user-info">
            <div className="as-user-avatar">
              {userInfo?.prenom?.[0]}{userInfo?.nom?.[0]}
            </div>
            <div className="as-user-text">
              <div className="as-user-name">{userInfo?.prenom} {userInfo?.nom}</div>
              <div className="as-user-role">Administrateur</div>
            </div>
          </div>
        )}
        {collapsed ? (
          <button className="as-logout-btn as-logout-btn--icon" onClick={handleLogout} title="Déconnexion">
            <span>⏻</span>
          </button>
        ) : (
          <button className="as-logout-btn" onClick={handleLogout}>
            <span>⏻</span> Déconnexion
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;