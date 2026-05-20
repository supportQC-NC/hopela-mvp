// src/screens/admin/AdminFavoris.jsx
import { useEffect, useState, useCallback } from "react";
import "./AdminFavoris.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminFavoris = () => {
  const [stats, setStats]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Récupère tous les prestataires et leur compteur de favoris
      const usersRes = await fetch(`${API_URL}/api/users`, { credentials: "include" });
      const users = usersRes.ok ? await usersRes.json() : [];
      const prestataires = users.filter((u) => u.role === "prestataire" && u.isActive);

      // Fetch les compteurs en parallèle
      const counts = await Promise.all(
        prestataires.map(async (p) => {
          try {
            const r = await fetch(`${API_URL}/api/favoris/count/${p._id}`);
            const d = r.ok ? await r.json() : { count: 0 };
            return { prestataire: p, count: d.count };
          } catch {
            return { prestataire: p, count: 0 };
          }
        })
      );

      // Tri décroissant par nombre de favoris
      counts.sort((a, b) => b.count - a.count);
      setStats(counts);
    } catch (e) {
      console.error("AdminFavoris:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const total = stats.reduce((acc, s) => acc + s.count, 0);
  const top = stats[0];

  return (
    <div className="af-root">
      <div className="af-header">
        <h2 className="af-title">Statistiques Favoris</h2>
        <p className="af-sub">{total} mise{total !== 1 ? "s" : ""} en favori au total</p>
      </div>

      {/* KPIs */}
      <div className="af-kpis">
        <div className="af-kpi">
          <div className="af-kpi-value">{total}</div>
          <div className="af-kpi-label">Total favoris</div>
        </div>
        <div className="af-kpi">
          <div className="af-kpi-value">{stats.filter((s) => s.count > 0).length}</div>
          <div className="af-kpi-label">Prestataires mis en favori</div>
        </div>
        <div className="af-kpi af-kpi--highlight">
          <div className="af-kpi-value">{top?.count ?? 0}</div>
          <div className="af-kpi-label">
            Record — {top ? `${top.prestataire.prenom} ${top.prestataire.nom}` : "—"}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="af-loading">Chargement...</div>
      ) : (
        <div className="af-list">
          <div className="af-list-head">
            <span>Prestataire</span>
            <span>Métier</span>
            <span>Favoris</span>
          </div>
          {stats.map(({ prestataire: p, count }, i) => (
            <div key={p._id} className={`af-row${count === 0 ? " af-row--zero" : ""}`}>
              <div className="af-row-rank">
                {i === 0 && count > 0 ? "🥇" : i === 1 && count > 0 ? "🥈" : i === 2 && count > 0 ? "🥉" : `#${i + 1}`}
              </div>
              <div className="af-row-presta">
                <span className="af-row-name">{p.prenom} {p.nom}</span>
                <span className="af-row-email">{p.email}</span>
              </div>
              <div className="af-row-metier">
                {p.metiers?.[0]?.nom || "—"}
              </div>
              <div className="af-row-count">
                <span className={`af-count-badge${count > 0 ? " active" : ""}`}>
                  ❤️ {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFavoris;