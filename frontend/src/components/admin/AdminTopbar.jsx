// src/components/admin/AdminTopbar.jsx
import "./AdminTopbar.scss";

const TITLES = {
  overview:   { title: "Vue d'ensemble",  sub: "Tableau de bord administrateur" },
  map:        { title: "Carte live",      sub: "Prestataires en temps réel" },
  users:      { title: "Utilisateurs",    sub: "Gestion des comptes" },
  catalogues: { title: "Catalogues",      sub: "Catégories & Métiers" },
  contact:    { title: "Messages",        sub: "Boîte de réception" },
  promotions: { title: "Promotions",      sub: "Toutes les offres des prestataires" },
  favoris:    { title: "Favoris",         sub: "Prestataires les plus appréciés" },
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