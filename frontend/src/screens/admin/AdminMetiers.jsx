// src/screens/admin/AdminMetiers.jsx
import { useState } from "react";
import AdminModal from "../../components/admin/AdminModal";
import "./AdminMetiers.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const METIER_ICONS = {
  "Électricien":"⚡","Plombier":"🔧","Menuisier":"🪚","Peintre":"🎨",
  "Jardinier":"🌿","Climatisation":"❄️","Femme de ménage":"🧹","Maçon":"🧱",
  "Photographe":"📸","Carreleur":"🔲","Garde d'enfants":"👶","Informaticien":"💻",
  "Coursier":"🛵","Déménageur":"🚛","Cuisinier":"👨‍🍳","Chauffeur":"🚗",
};

const AdminMetiers = ({ metiers, users, onRefresh }) => {
  const [modal,   setModal]   = useState(null); // "create" | "edit" | "delete"
  const [selected,setSelected]= useState(null);
  const [form,    setForm]    = useState({});
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  // Compte prestataires par métier
  const metierCounts = {};
  users.forEach((u) => {
    if (u.role === "prestataire") {
      u.metiers?.forEach((m) => {
        const id = m._id || m;
        metierCounts[id] = (metierCounts[id] || 0) + 1;
      });
    }
  });

  const openCreate = () => {
    setForm({ nom: "", description: "", icone: "" });
    setError(""); setModal("create");
  };
  const openEdit = (m) => {
    setSelected(m);
    setForm({ nom: m.nom, description: m.description || "", icone: m.icone || "" });
    setError(""); setModal("edit");
  };
  const openDelete = (m) => { setSelected(m); setError(""); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); setError(""); };

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async () => {
    if (!form.nom.trim()) return setError("Le nom est requis.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/metiers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal(); onRefresh();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const handleEdit = async () => {
    if (!form.nom.trim()) return setError("Le nom est requis.");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/metiers/${selected._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal(); onRefresh();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const handleToggle = async (m) => {
    try {
      await fetch(`${API_URL}/api/metiers/${m._id}/toggle`, {
        method: "PATCH", credentials: "include",
      });
      onRefresh();
    } catch { console.error("Toggle error"); }
  };

  const handleDelete = async () => {
    const count = metierCounts[selected._id] || 0;
    if (count > 0) {
      return setError(`Impossible : ${count} prestataire(s) utilisent encore ce métier.`);
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/metiers/${selected._id}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal(); onRefresh();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="am2-toolbar">
        <span className="am2-info">{metiers.length} métier{metiers.length > 1 ? "s" : ""} au total</span>
        <button className="am2-add-btn" onClick={openCreate}>+ Nouveau métier</button>
      </div>

      <div className="am2-grid">
        {metiers.map((m) => {
          const count    = metierCounts[m._id] || 0;
          const icon     = METIER_ICONS[m.nom] || m.icone || "🔨";
          const isUsed   = count > 0;

          return (
            <div key={m._id} className={`am2-card${!m.isActive ? " inactive" : ""}`}>
              <div className="am2-card-header">
                <div className="am2-icon">{icon}</div>
                <div>
                  <div className="am2-nom">{m.nom}</div>
                  {m.icone && (
                    <div style={{ fontSize: 10, color: "rgba(245,240,232,0.2)" }}>
                      icône: {m.icone}
                    </div>
                  )}
                </div>
              </div>

              <p className="am2-desc">
                {m.description || <em style={{ opacity: 0.4 }}>Aucune description</em>}
              </p>

              <div className="am2-card-footer">
                <div>
                  <span className={`am2-status-badge ${m.isActive ? "active" : "inactive"}`}>
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: m.isActive ? "#4ade80" : "#ef4444",
                      display: "inline-block"
                    }} />
                    {m.isActive ? "Actif" : "Inactif"}
                  </span>
                  <div className="am2-count" style={{ marginTop: 4 }}>
                    {count} prestataire{count > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="am2-actions">
                  <button
                    className="am2-btn toggle"
                    onClick={() => handleToggle(m)}
                    title={m.isActive ? "Désactiver" : "Activer"}
                  >
                    {m.isActive ? "⏸" : "▶"}
                  </button>
                  <button
                    className="am2-btn"
                    onClick={() => openEdit(m)}
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    className={`am2-btn${isUsed ? "" : " danger"}`}
                    onClick={() => openDelete(m)}
                    title={isUsed ? "Utilisé — suppression bloquée" : "Supprimer"}
                    style={isUsed ? { opacity: 0.3, cursor: "not-allowed" } : {}}
                    disabled={isUsed}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal Créer / Modifier ── */}
      {(modal === "create" || modal === "edit") && (
        <AdminModal
          title={modal === "create" ? "Nouveau métier" : `Modifier — ${selected?.nom}`}
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>Annuler</button>
              <button
                className="am-btn am-btn-primary"
                onClick={modal === "create" ? handleCreate : handleEdit}
                disabled={loading}
              >
                {loading ? "…" : modal === "create" ? "Créer" : "Enregistrer"}
              </button>
            </>
          }
        >
          {error && <div className="am-error">{error}</div>}
          <div className="am-field">
            <label className="am-label">Nom du métier *</label>
            <input className="am-input" name="nom" value={form.nom} onChange={onChange} placeholder="Ex: Électricien" />
          </div>
          <div className="am-field">
            <label className="am-label">Description</label>
            <textarea className="am-textarea" name="description" value={form.description} onChange={onChange} placeholder="Description courte du métier…" />
          </div>
          <div className="am-field">
            <label className="am-label">Icône (nom Lucide ou emoji)</label>
            <input className="am-input" name="icone" value={form.icone} onChange={onChange} placeholder="Ex: zap, wrench, ⚡" />
          </div>
        </AdminModal>
      )}

      {/* ── Modal Supprimer ── */}
      {modal === "delete" && (
        <AdminModal
          title="Supprimer le métier"
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>Annuler</button>
              <button
                className="am-btn am-btn-danger"
                onClick={handleDelete}
                disabled={loading || (metierCounts[selected?._id] || 0) > 0}
              >
                {loading ? "…" : "Supprimer"}
              </button>
            </>
          }
        >
          {error && <div className="am-error">{error}</div>}
          <p style={{ color: "rgba(245,240,232,0.6)", fontSize: 14, lineHeight: 1.7 }}>
            Supprimer le métier <strong style={{ color: "#f5f0e8" }}>{selected?.nom}</strong> ?
            {(metierCounts[selected?._id] || 0) > 0 && (
              <span style={{ display: "block", marginTop: 10, color: "rgba(239,68,68,0.8)", fontSize: 12 }}>
                ⛔ Suppression impossible : {metierCounts[selected?._id]} prestataire(s) utilisent ce métier.
              </span>
            )}
          </p>
        </AdminModal>
      )}
    </div>
  );
};

export default AdminMetiers;