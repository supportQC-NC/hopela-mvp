// src/screens/admin/AdminPromotions.jsx
import { useEffect, useState, useCallback } from "react";
import "./AdminPromotions.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const BADGE_LABELS = {
  Tag: "🏷️ Promotion", Star: "⭐ Offre spéciale", Zap: "⚡ Flash",
  Gift: "🎁 Cadeau", Percent: "💯 Réduction", Flame: "🔥 Populaire",
  Clock: "⏰ Limité", BadgeCheck: "✅ Certifié",
};

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all"); // all | active | expired

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch toutes les promotions via l'endpoint admin
      const res = await fetch(`${API_URL}/api/promotions/admin/all`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setPromotions(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("AdminPromotions:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    await fetch(`${API_URL}/api/promotions/${id}`, { method: "DELETE", credentials: "include" });
    setPromotions((prev) => prev.filter((p) => p._id !== id));
  };

  const now = new Date();
  const filtered = promotions.filter((p) => {
    if (filter === "active")  return p.isActive && (!p.dateFin || new Date(p.dateFin) >= now);
    if (filter === "expired") return !p.isActive || (p.dateFin && new Date(p.dateFin) < now);
    return true;
  });

  return (
    <div className="ap-root">
      <div className="ap-header">
        <div>
          <h2 className="ap-title">Promotions</h2>
          <p className="ap-sub">{promotions.length} promotion{promotions.length !== 1 ? "s" : ""} au total</p>
        </div>
        <div className="ap-filters">
          {["all", "active", "expired"].map((f) => (
            <button key={f} className={`ap-filter-btn${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "Toutes" : f === "active" ? "Actives" : "Expirées"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="ap-loading">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="ap-empty">Aucune promotion trouvée.</div>
      ) : (
        <div className="ap-list">
          {filtered.map((promo) => {
            const isExpired = promo.dateFin && new Date(promo.dateFin) < now;
            const prestataire = promo.prestataire;
            return (
              <article key={promo._id} className={`ap-card${isExpired ? " expired" : ""}`}>
                <div className="ap-card-head">
                  <div className="ap-presta-info">
                    <span className="ap-presta-name">
                      {prestataire?.prenom} {prestataire?.nom}
                    </span>
                    <span className="ap-presta-metier">
                      {prestataire?.metiers?.[0]?.nom || "—"}
                    </span>
                  </div>
                  <div className="ap-card-meta">
                    <span className="ap-badge">{BADGE_LABELS[promo.badge] || promo.badge}</span>
                    {isExpired && <span className="ap-expired-tag">Expirée</span>}
                  </div>
                </div>

                <h4 className="ap-promo-titre">{promo.titre}</h4>
                {promo.description && <p className="ap-promo-desc">{promo.description}</p>}

                {(promo.dateDebut || promo.dateFin) && (
                  <p className="ap-dates">
                    ⏰{" "}
                    {promo.dateDebut && `Du ${new Date(promo.dateDebut).toLocaleDateString("fr-FR")}`}
                    {promo.dateFin && ` au ${new Date(promo.dateFin).toLocaleDateString("fr-FR")}`}
                  </p>
                )}

                {promo.images?.length > 0 && (
                  <div className="ap-images">
                    {promo.images.map((img, i) => (
                      <img key={i} src={`${API_URL}${img}`} alt={`Vue ${i + 1}`} className="ap-img" />
                    ))}
                  </div>
                )}

                <div className="ap-card-actions">
                  <button className="ap-btn-danger" onClick={() => handleDelete(promo._id)}>
                    🗑️ Supprimer
                  </button>
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