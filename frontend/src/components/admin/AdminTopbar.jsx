// src/components/admin/AdminTopbar.jsx
import "./AdminTopbar.css";

const TITLES = {
  overview: { title: "Vue d'ensemble",  sub: "Tableau de bord administrateur" },
  map:      { title: "Carte live",       sub: "Prestataires en temps réel" },
  users:    { title: "Utilisateurs",     sub: "Gestion des comptes" },
  metiers:  { title: "Métiers",          sub: "Référentiel des métiers" },
};

const AdminTopbar = ({ activeNav, onRefresh }) => {
  const { title, sub } = TITLES[activeNav] || TITLES.overview;

  return (
    <div className="at-topbar">
      <div className="at-left">
        <div>
          <div className="at-title">{title}</div>
          <div className="at-subtitle">{sub}</div>
        </div>
      </div>
      <div className="at-right">
        {onRefresh && (
          <button className="at-refresh-btn" onClick={onRefresh}>
            🔄 Actualiser
          </button>
        )}
        <span className="at-admin-badge">Admin</span>
      </div>
    </div>
  );
};

export default AdminTopbar;