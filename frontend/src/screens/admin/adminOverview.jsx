// src/screens/admin/AdminOverview.jsx
import "./AdminOverview.css";

const METIER_ICONS = {
  "Électricien":"⚡","Plombier":"🔧","Menuisier":"🪚","Peintre":"🎨",
  "Jardinier":"🌿","Climatisation":"❄️","Femme de ménage":"🧹","Maçon":"🧱",
  "Photographe":"📸","Carreleur":"🔲","Garde d'enfants":"👶","Informaticien":"💻",
  "Coursier":"🛵","Déménageur":"🚛","Cuisinier":"👨‍🍳","Chauffeur":"🚗",
};

const AdminOverview = ({ users, metiers, onNav }) => {
  const total        = users.length;
  const actifs       = users.filter((u) => u.isActive).length;
  const prestataires = users.filter((u) => u.role === "prestataire").length;
  const reguliers    = users.filter((u) => u.role === "user").length;

  // Compte de prestataires par métier
  const metierCounts = {};
  users.forEach((u) => {
    if (u.role === "prestataire" && u.metiers?.length) {
      u.metiers.forEach((m) => {
        const nom = m.nom || m;
        metierCounts[nom] = (metierCounts[nom] || 0) + 1;
      });
    }
  });

  const STATS = [
    { icon: "👥", val: total,        label: "Utilisateurs total" },
    { icon: "✅", val: actifs,        label: "Comptes actifs" },
    { icon: "🔧", val: prestataires,  label: "Prestataires" },
    { icon: "👤", val: reguliers,     label: "Particuliers" },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="ao-stats">
        {STATS.map(({ icon, val, label }) => (
          <div key={label} className="ao-stat-card">
            <div className="ao-stat-icon">{icon}</div>
            <div>
              <div className="ao-stat-val">{val}</div>
              <div className="ao-stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-col grid */}
      <div className="ao-grid">

        {/* Derniers utilisateurs */}
        <div>
          <div className="ao-section-header">
            <span className="ao-section-title">Derniers inscrits</span>
            <button className="ao-section-link" onClick={() => onNav("users")}>
              Voir tous →
            </button>
          </div>
          <div className="ao-table-wrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 8).map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600, color: "#f5f0e8" }}>
                      {u.prenom} {u.nom}
                      <div style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", fontWeight: 400 }}>
                        {u.email}
                      </div>
                    </td>
                    <td><span className={`ao-role ${u.role}`}>{u.role}</span></td>
                    <td>
                      <span className={`ao-dot ${u.isActive ? "active" : "inactive"}`} />
                      <span style={{ marginLeft: 7, fontSize: 11, color: "rgba(245,240,232,0.35)" }}>
                        {u.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Métiers */}
        <div>
          <div className="ao-section-header">
            <span className="ao-section-title">Métiers ({metiers.length})</span>
            <button className="ao-section-link" onClick={() => onNav("metiers")}>
              Gérer →
            </button>
          </div>
          <div className="ao-table-wrap">
            <div className="ao-metiers-list">
              {metiers.slice(0, 10).map((m) => (
                <div key={m._id} className="ao-metier-row">
                  <div className="ao-metier-name">
                    <span>{METIER_ICONS[m.nom] || "🔨"}</span>
                    {m.nom}
                    {!m.isActive && (
                      <span className="ao-metier-inactive">inactif</span>
                    )}
                  </div>
                  <span className="ao-metier-count">
                    {metierCounts[m.nom] || 0} prestataire{metierCounts[m.nom] > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminOverview;