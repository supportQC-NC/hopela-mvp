// src/screens/admin/AdminFavoris.jsx
import { useEffect, useState, useCallback } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const s = {
  root: { padding: 32, maxWidth: 1100 },
  title: { fontSize: 24, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.03em", marginBottom: 4 },
  sub: { fontSize: 13, color: "rgba(20,20,40,0.5)", marginBottom: 32 },
  kpis: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 32 },
  kpi: (highlight) => ({
    background: highlight ? "rgba(0,166,178,0.08)" : "rgba(20,20,40,0.05)",
    border: highlight ? "1px solid rgba(0,166,178,0.3)" : "1px solid rgba(20,20,40,0.12)",
    borderRadius: 14, padding: "20px 24px",
  }),
  kpiValue: (highlight) => ({
    fontSize: 32, fontWeight: 900,
    color: highlight ? "#007a84" : "#1a1a2e",
    letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 6
  }),
  kpiLabel: { fontSize: 12, color: "rgba(20,20,40,0.5)", lineHeight: 1.4 },
  loading: { textAlign: "center", padding: "60px 20px", color: "rgba(20,20,40,0.4)" },
  list: {
    background: "rgba(20,20,40,0.03)",
    border: "1px solid rgba(20,20,40,0.1)",
    borderRadius: 14, overflow: "hidden"
  },
  listHead: {
    display: "grid", gridTemplateColumns: "48px 1fr 180px 100px",
    gap: 16, padding: "10px 20px",
    background: "rgba(20,20,40,0.06)",
    fontSize: 11, fontWeight: 700, letterSpacing: 1,
    textTransform: "uppercase",
    color: "rgba(20,20,40,0.45)"
  },
  row: (zero) => ({
    display: "grid", gridTemplateColumns: "48px 1fr 180px 100px",
    gap: 16, alignItems: "center", padding: "14px 20px",
    borderTop: "1px solid rgba(20,20,40,0.07)",
    opacity: zero ? 0.4 : 1
  }),
  rank: { fontSize: 14, fontWeight: 700, color: "rgba(20,20,40,0.35)", textAlign: "center" },
  prestaCol: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  prestaName: {
    fontSize: 14, fontWeight: 600, color: "#1a1a2e",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
  },
  prestaEmail: { fontSize: 12, color: "rgba(20,20,40,0.45)" },
  metier: { fontSize: 13, color: "rgba(20,20,40,0.55)" },
  badge: (active) => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "4px 12px", borderRadius: 9999, fontSize: 13, fontWeight: 700,
    background: active ? "rgba(220,38,38,0.08)" : "rgba(20,20,40,0.06)",
    border: active ? "1px solid rgba(220,38,38,0.25)" : "1px solid rgba(20,20,40,0.12)",
    color: active ? "#c02020" : "rgba(20,20,40,0.45)",
  }),
};

const AdminFavoris = () => {
  const [stats, setStats]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const usersRes = await fetch(`${API_URL}/api/users`, { credentials: "include" });
      const users = usersRes.ok ? await usersRes.json() : [];
      const prestataires = users.filter((u) => u.role === "prestataire" && u.isActive);

      const counts = await Promise.all(
        prestataires.map(async (p) => {
          try {
            const r = await fetch(`${API_URL}/api/favoris/count/${p._id}`);
            const d = r.ok ? await r.json() : { count: 0 };
            return { prestataire: p, count: d.count };
          } catch { return { prestataire: p, count: 0 }; }
        })
      );

      counts.sort((a, b) => b.count - a.count);
      setStats(counts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const total = stats.reduce((acc, s) => acc + s.count, 0);
  const top   = stats[0];

  return (
    <div style={s.root}>
      <h2 style={s.title}>Statistiques Favoris</h2>
      <p style={s.sub}>{total} mise{total !== 1 ? "s" : ""} en favori au total</p>

      <div style={s.kpis}>
        <div style={s.kpi(false)}>
          <div style={s.kpiValue(false)}>{total}</div>
          <div style={s.kpiLabel}>Total favoris</div>
        </div>
        <div style={s.kpi(false)}>
          <div style={s.kpiValue(false)}>{stats.filter((s) => s.count > 0).length}</div>
          <div style={s.kpiLabel}>Prestataires mis en favori</div>
        </div>
        <div style={s.kpi(true)}>
          <div style={s.kpiValue(true)}>{top?.count ?? 0}</div>
          <div style={s.kpiLabel}>Record — {top ? `${top.prestataire.prenom} ${top.prestataire.nom}` : "—"}</div>
        </div>
      </div>

      {loading ? <div style={s.loading}>Chargement...</div> : (
        <div style={s.list}>
          <div style={s.listHead}>
            <span>#</span><span>Prestataire</span><span>Métier</span><span>Favoris</span>
          </div>
          {stats.map(({ prestataire: p, count }, i) => (
            <div key={p._id} style={s.row(count === 0)}>
              <div style={s.rank}>
                {i === 0 && count > 0 ? "🥇" : i === 1 && count > 0 ? "🥈" : i === 2 && count > 0 ? "🥉" : `#${i+1}`}
              </div>
              <div style={s.prestaCol}>
                <span style={s.prestaName}>{p.prenom} {p.nom}</span>
                <span style={s.prestaEmail}>{p.email}</span>
              </div>
              <div style={s.metier}>{p.metiers?.[0]?.nom || "—"}</div>
              <div>
                <span style={s.badge(count > 0)}>❤️ {count}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFavoris;
