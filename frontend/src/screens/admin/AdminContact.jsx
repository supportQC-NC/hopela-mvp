// src/screens/admin/AdminContact.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";
import "./AdminContact.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const STATUTS = [
  { key: "tous",    label: "Tous"     },
  { key: "nouveau", label: "Nouveaux", color: "#d97706" },
  { key: "lu",      label: "Lus",      color: "#2563eb" },
  { key: "traite",  label: "Traités",  color: "#16a34a" },
  { key: "archive", label: "Archivés", color: "rgba(16,42,67,0.30)" },
];

const STATUT_LABELS = { nouveau: "Nouveau", lu: "Lu", traite: "Traité", archive: "Archivé" };
const STATUT_COLORS = { nouveau: "#d97706", lu: "#2563eb", traite: "#16a34a", archive: "rgba(16,42,67,0.30)" };

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const AdminContact = () => {
  const [contacts,   setContacts]   = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [filter,     setFilter]     = useState("tous");
  const [reponse,    setReponse]    = useState("");
  const [loading,    setLoading]    = useState(false);
  const [replyOk,    setReplyOk]    = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      const res  = await fetch(
        `${API_URL}/api/contact${filter !== "tous" ? `?statut=${filter}` : ""}`,
        { credentials: "include" }
      );
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
    if (c.statut === "nouveau") await handleStatut(c._id, "lu");
  };

  const handleStatut = async (id, statut) => {
    try {
      const res  = await fetch(`${API_URL}/api/contact/${id}/statut`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ statut }),
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reponse }),
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
      await fetch(`${API_URL}/api/contact/${selected._id}`, {
        method: "DELETE", credentials: "include",
      });
      setContacts((prev) => prev.filter((c) => c._id !== selected._id));
      setSelected(null);
      setDelConfirm(false);
    } catch (e) { console.error(e); }
  };

  const displayed = filter === "tous" ? contacts : contacts.filter((c) => c.statut === filter);

  return (
    <div className="ac-root">

      {/* ── Toolbar ── */}
      <div className="ac-toolbar">
        {STATUTS.map((s) => {
          const cnt = s.key === "tous"
            ? contacts.length
            : contacts.filter((c) => c.statut === s.key).length;
          return (
            <button
              key={s.key}
              className={`ac-filter-btn${filter === s.key ? " active" : ""}`}
              onClick={() => setFilter(s.key)}
            >
              {s.label}
              {cnt > 0 && <span className="ac-filter-count-pill">{cnt}</span>}
            </button>
          );
        })}
        <span className="ac-count">
          {displayed.length} message{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Layout ── */}
      <div className="ac-layout">

        {/* Liste */}
        <div className="ac-list">
          {displayed.length === 0 ? (
            <div className="ac-empty-list">
              Aucun message{filter !== "tous" ? " dans cette catégorie" : ""}
            </div>
          ) : displayed.map((c) => (
            <div
              key={c._id}
              className={`ac-item${selected?._id === c._id ? " selected" : ""}`}
              onClick={() => handleSelect(c)}
            >
              <div className="ac-item-header">
                <div className="ac-item-nom">{c.prenom || c.nom}</div>
                <div className="ac-item-date">{fmt(c.createdAt)}</div>
              </div>
              <div className="ac-item-sujet">{c.sujet}</div>
              <div className="ac-item-preview">{c.message}</div>
              <span
                className="ac-statut-badge"
                style={{
                  background : `${STATUT_COLORS[c.statut]}18`,
                  color      : STATUT_COLORS[c.statut],
                  border     : `1px solid ${STATUT_COLORS[c.statut]}40`,
                }}
              >
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
                <span
                  className="ac-statut-badge"
                  style={{
                    background : `${STATUT_COLORS[selected.statut]}18`,
                    color      : STATUT_COLORS[selected.statut],
                    border     : `1px solid ${STATUT_COLORS[selected.statut]}40`,
                  }}
                >
                  {STATUT_LABELS[selected.statut]}
                </span>
              </div>

              {/* Changer statut */}
              <div>
                <div className="ac-statut-label">Changer le statut</div>
                <div className="ac-statut-actions">
                  {["lu", "traite", "archive"].map((s) => (
                    <button
                      key={s}
                      className={`ac-statut-btn${selected.statut === s ? " active" : ""}`}
                      onClick={() => handleStatut(selected._id, s)}
                    >
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
                      {selected.reponduPar &&
                        ` par ${selected.reponduPar.prenom} ${selected.reponduPar.nom}`}
                    </div>
                  )}
                </div>
              )}

              {/* Formulaire réponse */}
              {!selected.reponse && (
                <div>
                  <div className="ac-reply-title">📝 Répondre par email</div>
                  {replyOk ? (
                    <div className="ac-success-inline">
                      ✅ Réponse envoyée avec succès à {selected.email}
                    </div>
                  ) : (
                    <>
                      <textarea
                        className="ac-reply-textarea"
                        placeholder={`Votre réponse à ${selected.nom}…`}
                        value={reponse}
                        onChange={(e) => setReponse(e.target.value)}
                      />
                      <div className="ac-reply-actions">
                        <button
                          className="ac-reply-btn"
                          onClick={handleReply}
                          disabled={loading || !reponse.trim()}
                        >
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
                <button
                  className="ac-delete-btn"
                  onClick={handleDelete}
                  style={{ alignSelf: "flex-start" }}
                >
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
