/* eslint-disable react-hooks/exhaustive-deps */
// src/screens/admin/AdminContact.jsx
import { useState, useEffect, useCallback } from "react";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const STATUTS = [
  { key: "tous",    label: "Tous",     color: "rgba(245,240,232,0.4)" },
  { key: "nouveau", label: "Nouveaux", color: "#fbbf24" },
  { key: "lu",      label: "Lus",      color: "#60a5fa" },
  { key: "traite",  label: "Traités",  color: "#4ade80" },
  { key: "archive", label: "Archivés", color: "rgba(245,240,232,0.25)" },
];

const STATUT_LABELS = { nouveau: "Nouveau", lu: "Lu", traite: "Traité", archive: "Archivé" };
const STATUT_COLORS = { nouveau: "#fbbf24", lu: "#60a5fa", traite: "#4ade80", archive: "rgba(245,240,232,0.25)" };

const CSS = `
  .ac-root { font-family:'DM Sans',sans-serif; }
  .ac-toolbar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
  .ac-filter-btn { padding:6px 14px; border-radius:20px; border:1px solid rgba(201,168,76,0.15); background:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:11px; color:rgba(245,240,232,0.5); transition:all 0.2s; }
  .ac-filter-btn.active { background:rgba(201,168,76,0.12); border-color:rgba(201,168,76,0.4); color:#c9a84c; }
  .ac-count { font-size:11px; color:rgba(245,240,232,0.3); margin-left:auto; }
  .ac-layout { display:grid; grid-template-columns:320px 1fr; gap:20px; height:calc(100vh - 160px); }
  @media(max-width:900px){ .ac-layout{grid-template-columns:1fr; height:auto;} }

  /* Liste */
  .ac-list { overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:4px; }
  .ac-item { background:#120e07; border:1px solid rgba(201,168,76,0.1); border-radius:12px; padding:14px 16px; cursor:pointer; transition:all 0.2s; }
  .ac-item:hover { border-color:rgba(201,168,76,0.3); }
  .ac-item.selected { border-color:rgba(201,168,76,0.5); background:rgba(201,168,76,0.06); }
  .ac-item-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:6px; }
  .ac-item-nom { font-size:13px; font-weight:600; color:#f5f0e8; }
  .ac-item-date { font-size:10px; color:rgba(245,240,232,0.3); white-space:nowrap; }
  .ac-item-sujet { font-size:12px; color:#c9a84c; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ac-item-preview { font-size:11px; color:rgba(245,240,232,0.35); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ac-statut-badge { display:inline-block; font-size:9px; font-weight:600; letter-spacing:1px; text-transform:uppercase; padding:2px 8px; border-radius:10px; margin-top:6px; }

  /* Détail */
  .ac-detail { background:#120e07; border:1px solid rgba(201,168,76,0.12); border-radius:16px; padding:28px; overflow-y:auto; display:flex; flex-direction:column; gap:20px; }
  .ac-detail-empty { display:flex; align-items:center; justify-content:center; height:100%; color:rgba(245,240,232,0.2); font-size:14px; flex-direction:column; gap:12px; }
  .ac-detail-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .ac-detail-nom { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:700; color:#f5f0e8; }
  .ac-detail-email { font-size:12px; color:#c9a84c; margin-top:3px; }
  .ac-detail-meta { font-size:11px; color:rgba(245,240,232,0.3); margin-top:4px; }
  .ac-statut-actions { display:flex; gap:6px; flex-wrap:wrap; }
  .ac-statut-btn { padding:5px 12px; border-radius:20px; border:1px solid rgba(201,168,76,0.2); background:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:10px; color:rgba(245,240,232,0.5); transition:all 0.2s; }
  .ac-statut-btn:hover { border-color:rgba(201,168,76,0.5); color:#f5f0e8; }
  .ac-statut-btn.active { background:rgba(201,168,76,0.12); border-color:rgba(201,168,76,0.4); color:#c9a84c; }
  .ac-sujet-block { background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.15); border-radius:10px; padding:14px 16px; }
  .ac-sujet-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(245,240,232,0.35); margin-bottom:6px; }
  .ac-sujet-text { font-size:15px; font-weight:600; color:#f5f0e8; }
  .ac-message-block { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:18px; }
  .ac-message-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(245,240,232,0.35); margin-bottom:10px; }
  .ac-message-text { font-size:13px; color:rgba(245,240,232,0.7); line-height:1.8; white-space:pre-wrap; }
  .ac-reponse-block { background:rgba(74,222,128,0.06); border:1px solid rgba(74,222,128,0.2); border-radius:10px; padding:18px; }
  .ac-reponse-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#86efac; margin-bottom:10px; }
  .ac-reponse-text { font-size:13px; color:rgba(245,240,232,0.7); line-height:1.8; white-space:pre-wrap; }
  .ac-reponse-meta { font-size:11px; color:rgba(74,222,128,0.5); margin-top:8px; }

  /* Formulaire réponse */
  .ac-reply-title { font-size:14px; font-weight:600; color:#f5f0e8; margin-bottom:10px; }
  .ac-reply-textarea { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(201,168,76,0.15); border-radius:8px; padding:12px 14px; font-family:'DM Sans',sans-serif; font-size:13px; color:#f5f0e8; outline:none; transition:all 0.2s; resize:vertical; min-height:120px; box-sizing:border-box; -webkit-appearance:none; }
  .ac-reply-textarea::placeholder { color:rgba(245,240,232,0.2); }
  .ac-reply-textarea:focus { border-color:rgba(201,168,76,0.5); box-shadow:0 0 0 3px rgba(201,168,76,0.08); }
  .ac-reply-actions { display:flex; gap:8px; margin-top:10px; }
  .ac-reply-btn { flex:1; padding:10px; border-radius:8px; border:none; background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0804; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
  .ac-reply-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .ac-delete-btn { padding:10px 16px; border-radius:8px; border:1px solid rgba(239,68,68,0.3); background:none; color:#fca5a5; font-family:'DM Sans',sans-serif; font-size:11px; cursor:pointer; transition:all 0.2s; }
  .ac-delete-btn:hover { background:rgba(239,68,68,0.1); }
  .ac-success-inline { font-size:12px; color:#86efac; padding:8px 12px; background:rgba(74,222,128,0.08); border:1px solid rgba(74,222,128,0.2); border-radius:8px; }
  .ac-empty-list { text-align:center; padding:40px 20px; color:rgba(245,240,232,0.25); font-size:13px; }
`;

const fmt = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const AdminContact = () => {
  const [contacts,  setContacts]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState("tous");
  const [reponse,   setReponse]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [replyOk,   setReplyOk]   = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);

  useEffect(() => {
    if (!document.getElementById("ac-css")) {
      const s = document.createElement("style"); s.id = "ac-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/api/contact${filter !== "tous" ? `?statut=${filter}` : ""}`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setContacts(data);
    } catch (e) { console.error(e); }
  }, [filter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleSelect = async (c) => {
    setSelected(c);
    setReponse("");
    setReplyOk(false);
    setDelConfirm(false);
    // Marquer comme lu si nouveau
    if (c.statut === "nouveau") {
      await handleStatut(c._id, "lu");
    }
  };

  const handleStatut = async (id, statut) => {
    try {
      const res  = await fetch(`${API_URL}/api/contact/${id}/statut`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ statut }),
      });
      const data = await res.json();
      if (res.ok) {
        setContacts((prev) => prev.map((c) => c._id === id ? { ...c, statut: data.statut } : c));
        if (selected?._id === id) setSelected((s) => ({ ...s, statut: data.statut }));
      }
    } catch (e) { console.error(e); }
  };

  const handleReply = async () => {
    if (!reponse.trim() || !selected) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/contact/${selected._id}/reply`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ reponse }),
      });
      const data = await res.json();
      if (res.ok) {
        setReplyOk(true);
        setSelected((s) => ({ ...s, ...data.contact, statut: "traite" }));
        setContacts((prev) => prev.map((c) => c._id === selected._id ? { ...c, statut: "traite" } : c));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!delConfirm) { setDelConfirm(true); return; }
    try {
      await fetch(`${API_URL}/api/contact/${selected._id}`, { method: "DELETE", credentials: "include" });
      setContacts((prev) => prev.filter((c) => c._id !== selected._id));
      setSelected(null);
      setDelConfirm(false);
    } catch (e) { console.error(e); }
  };

  const displayed = filter === "tous" ? contacts : contacts.filter((c) => c.statut === filter);

  return (
    <div className="ac-root">
      {/* Toolbar */}
      <div className="ac-toolbar">
        {STATUTS.map((s) => {
          const cnt = s.key === "tous" ? contacts.length : contacts.filter((c) => c.statut === s.key).length;
          return (
            <button
              key={s.key}
              className={"ac-filter-btn" + (filter === s.key ? " active" : "")}
              onClick={() => setFilter(s.key)}
              style={filter === s.key ? {} : {}}
            >
              {s.label}
              {cnt > 0 && <span style={{ marginLeft: 5, background: s.key === "nouveau" ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 10, fontSize: 10 }}>{cnt}</span>}
            </button>
          );
        })}
        <span className="ac-count">{displayed.length} message{displayed.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Layout liste + détail */}
      <div className="ac-layout">
        {/* Liste */}
        <div className="ac-list">
          {displayed.length === 0 ? (
            <div className="ac-empty-list">Aucun message{filter !== "tous" ? ` dans cette catégorie` : ""}</div>
          ) : displayed.map((c) => (
            <div
              key={c._id}
              className={"ac-item" + (selected?._id === c._id ? " selected" : "")}
              onClick={() => handleSelect(c)}
            >
              <div className="ac-item-header">
                <div className="ac-item-nom">{c.prenom || c.nom}</div>
                <div className="ac-item-date">{fmt(c.createdAt)}</div>
              </div>
              <div className="ac-item-sujet">{c.sujet}</div>
              <div className="ac-item-preview">{c.message}</div>
              <span className="ac-statut-badge" style={{ background: STATUT_COLORS[c.statut] + "18", color: STATUT_COLORS[c.statut], border: `1px solid ${STATUT_COLORS[c.statut]}40` }}>
                {STATUT_LABELS[c.statut]}
              </span>
            </div>
          ))}
        </div>

        {/* Détail */}
        <div className="ac-detail">
          {!selected ? (
            <div className="ac-detail-empty">
              <span style={{ fontSize: 32 }}>📬</span>
              <span>Sélectionnez un message pour le consulter</span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="ac-detail-header">
                <div>
                  <div className="ac-detail-nom">{selected.nom}</div>
                  <div className="ac-detail-email">{selected.email}</div>
                  <div className="ac-detail-meta">Reçu le {fmt(selected.createdAt)}</div>
                </div>
                <div>
                  <span className="ac-statut-badge" style={{ background: STATUT_COLORS[selected.statut] + "18", color: STATUT_COLORS[selected.statut], border: `1px solid ${STATUT_COLORS[selected.statut]}40` }}>
                    {STATUT_LABELS[selected.statut]}
                  </span>
                </div>
              </div>

              {/* Changer statut */}
              <div>
                <div style={{ fontSize: 11, color: "rgba(245,240,232,0.3)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Changer le statut</div>
                <div className="ac-statut-actions">
                  {["lu", "traite", "archive"].map((s) => (
                    <button key={s} className={"ac-statut-btn" + (selected.statut === s ? " active" : "")} onClick={() => handleStatut(selected._id, s)}>
                      {STATUT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sujet */}
              <div className="ac-sujet-block">
                <div className="ac-sujet-label">Sujet</div>
                <div className="ac-sujet-text">{selected.sujet}</div>
              </div>

              {/* Message */}
              <div className="ac-message-block">
                <div className="ac-message-label">Message</div>
                <div className="ac-message-text">{selected.message}</div>
              </div>

              {/* Réponse existante */}
              {selected.reponse && (
                <div className="ac-reponse-block">
                  <div className="ac-reponse-label">✅ Réponse envoyée</div>
                  <div className="ac-reponse-text">{selected.reponse}</div>
                  {selected.reponduLe && (
                    <div className="ac-reponse-meta">
                      Répondu le {fmt(selected.reponduLe)}
                      {selected.reponduPar && ` par ${selected.reponduPar.prenom} ${selected.reponduPar.nom}`}
                    </div>
                  )}
                </div>
              )}

              {/* Formulaire réponse */}
              {!selected.reponse && (
                <div>
                  <div className="ac-reply-title">📝 Répondre par email</div>
                  {replyOk ? (
                    <div className="ac-success-inline">✅ Réponse envoyée avec succès à {selected.email}</div>
                  ) : (
                    <>
                      <textarea
                        className="ac-reply-textarea"
                        placeholder={"Votre réponse à " + selected.nom + "…"}
                        value={reponse}
                        onChange={(e) => setReponse(e.target.value)}
                      />
                      <div className="ac-reply-actions">
                        <button className="ac-reply-btn" onClick={handleReply} disabled={loading || !reponse.trim()}>
                          {loading ? "Envoi…" : "Envoyer la réponse →"}
                        </button>
                        <button className="ac-delete-btn" onClick={handleDelete}>
                          {delConfirm ? "Confirmer ?" : "🗑️"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Supprimer si déjà répondu */}
              {selected.reponse && (
                <button className="ac-delete-btn" onClick={handleDelete} style={{ alignSelf: "flex-start" }}>
                  {delConfirm ? "Confirmer la suppression ?" : "🗑️ Supprimer ce message"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContact;