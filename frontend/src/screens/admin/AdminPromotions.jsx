// src/screens/admin/AdminPromotions.jsx
import { useEffect, useState, useCallback } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const BADGE_LABELS = {
  Tag: "🏷️ Promotion", Star: "⭐ Offre spéciale", Zap: "⚡ Flash",
  Gift: "🎁 Cadeau", Percent: "💯 Réduction", Flame: "🔥 Populaire",
  Clock: "⏰ Limité", BadgeCheck: "✅ Certifié",
};

const s = {
  root: { padding: 32, maxWidth: 1100 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 800, color: "#1a1a2e", letterSpacing: "-0.03em", marginBottom: 4 },
  sub: { fontSize: 13, color: "rgba(20,20,40,0.5)" },
  filters: { display: "flex", gap: 8 },
  filterBtn: (active) => ({
    padding: "7px 16px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
    cursor: "pointer",
    border: active ? "1px solid rgba(0,166,178,0.4)" : "1px solid rgba(20,20,40,0.15)",
    background: active ? "rgba(0,166,178,0.12)" : "rgba(20,20,40,0.05)",
    color: active ? "#007a84" : "rgba(20,20,40,0.55)",
    transition: "all 0.2s",
  }),
  empty: { textAlign: "center", padding: "60px 20px", color: "rgba(20,20,40,0.4)", fontSize: 15 },
  list: { display: "flex", flexDirection: "column", gap: 16 },
  card: (expired) => ({
    background: "rgba(20,20,40,0.03)",
    border: "1px solid rgba(20,20,40,0.1)",
    borderRadius: 14, padding: "20px 24px",
    opacity: expired ? 0.55 : 1,
  }),
  cardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" },
  prestaInfo: { display: "flex", flexDirection: "column", gap: 2 },
  prestaName: { fontSize: 14, fontWeight: 700, color: "#1a1a2e" },
  prestaMetier: { fontSize: 12, color: "rgba(20,20,40,0.45)" },
  cardMeta: { display: "flex", alignItems: "center", gap: 8 },
  badge: {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "4px 10px", borderRadius: 9999,
    background: "rgba(0,166,178,0.1)", border: "1px solid rgba(0,166,178,0.25)",
    color: "#007a84", fontSize: 11, fontWeight: 700
  },
  expiredTag: {
    display: "inline-flex", padding: "4px 10px", borderRadius: 9999,
    background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)",
    color: "#c02020", fontSize: 11, fontWeight: 700
  },
  promoTitre: { fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 },
  promoDesc: { fontSize: 13, color: "rgba(20,20,40,0.55)", lineHeight: 1.6, marginBottom: 8 },
  dates: { fontSize: 12, color: "rgba(20,20,40,0.45)", marginBottom: 12 },
  images: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 },
  img: { width: 80, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(20,20,40,0.1)" },
  cardActions: { display: "flex", justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid rgba(20,20,40,0.08)" },
  btnDanger: {
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer",
    border: "1px solid rgba(220,38,38,0.25)", background: "rgba(220,38,38,0.08)",
    color: "#c02020"
  },
};

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/promotions/admin/all`, { credentials: "include" });
      if (res.ok) setPromotions(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    const res = await fetch(`${API_URL}/api/promotions/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setPromotions((prev) => prev.filter((p) => p._id !== id));
  };

  const now = new Date();
  const filtered = promotions.filter((p) => {
    if (filter === "active")  return p.isActive && (!p.dateFin || new Date(p.dateFin) >= now);
    if (filter === "expired") return !p.isActive || (p.dateFin && new Date(p.dateFin) < now);
    return true;
  });

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div>
          <h2 style={s.title}>Promotions</h2>
          <p style={s.sub}>{promotions.length} promotion{promotions.length !== 1 ? "s" : ""} au total</p>
        </div>
        <div style={s.filters}>
          {[["all","Toutes"],["active","Actives"],["expired","Expirées"]].map(([k,l]) => (
            <button key={k} style={s.filterBtn(filter===k)} onClick={() => setFilter(k)}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? <div style={s.empty}>Chargement...</div>
       : filtered.length === 0 ? <div style={s.empty}>Aucune promotion.</div>
       : (
        <div style={s.list}>
          {filtered.map((promo) => {
            const expired = promo.dateFin && new Date(promo.dateFin) < now;
            const p = promo.prestataire;
            return (
              <article key={promo._id} style={s.card(expired)}>
                <div style={s.cardHead}>
                  <div style={s.prestaInfo}>
                    <span style={s.prestaName}>{p?.prenom} {p?.nom}</span>
                    <span style={s.prestaMetier}>{p?.metiers?.[0]?.nom || "—"}</span>
                  </div>
                  <div style={s.cardMeta}>
                    <span style={s.badge}>{BADGE_LABELS[promo.badge] || promo.badge}</span>
                    {expired && <span style={s.expiredTag}>Expirée</span>}
                  </div>
                </div>
                <h4 style={s.promoTitre}>{promo.titre}</h4>
                {promo.description && <p style={s.promoDesc}>{promo.description}</p>}
                {(promo.dateDebut || promo.dateFin) && (
                  <p style={s.dates}>
                    ⏰{promo.dateDebut && ` Du ${new Date(promo.dateDebut).toLocaleDateString("fr-FR")}`}
                    {promo.dateFin && ` au ${new Date(promo.dateFin).toLocaleDateString("fr-FR")}`}
                  </p>
                )}
                {promo.images?.length > 0 && (
                  <div style={s.images}>
                    {promo.images.map((img, i) => (
                      <img key={i} src={`${API_URL}${img}`} alt={`Vue ${i+1}`} style={s.img} />
                    ))}
                  </div>
                )}
                <div style={s.cardActions}>
                  <button style={s.btnDanger} onClick={() => handleDelete(promo._id)}>🗑️ Supprimer</button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
