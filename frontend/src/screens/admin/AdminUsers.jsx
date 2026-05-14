// // src/screens/admin/AdminUsers.jsx
// import { useState } from "react";
// import AdminModal from "../../components/admin/AdminModal";
// import "./AdminUsers.css";

// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// const FILTERS = ["Tous", "user", "prestataire", "admin"];

// const AdminUsers = ({ users, metiers, onRefresh }) => {
//   const [search,     setSearch]     = useState("");
//   const [roleFilter, setRoleFilter] = useState("Tous");
//   const [modal,      setModal]      = useState(null); // null | "create" | "edit" | "delete"
//   const [selected,   setSelected]   = useState(null);
//   const [form,       setForm]       = useState({});
//   const [error,      setError]      = useState("");
//   const [loading,    setLoading]    = useState(false);

//   // ── Filtrage ──────────────────────────────────────
//   const filtered = users.filter((u) => {
//     const matchRole   = roleFilter === "Tous" || u.role === roleFilter;
//     const matchSearch = !search || [u.nom, u.prenom, u.email].join(" ")
//       .toLowerCase().includes(search.toLowerCase());
//     return matchRole && matchSearch;
//   });

//   // ── Helpers ───────────────────────────────────────
//   const openCreate = () => {
//     setForm({ nom: "", prenom: "", email: "", password: "", role: "user" });
//     setError(""); setModal("create");
//   };
//   const openEdit = (u) => {
//     setSelected(u);
//     setForm({ nom: u.nom, prenom: u.prenom, email: u.email, role: u.role, password: "" });
//     setError(""); setModal("edit");
//   };
//   const openDelete = (u) => { setSelected(u); setModal("delete"); };
//   const closeModal = () => { setModal(null); setSelected(null); setError(""); };

//   const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

//   // ── API calls ─────────────────────────────────────
//   const handleCreate = async () => {
//     if (!form.nom || !form.prenom || !form.email || !form.password) {
//       return setError("Tous les champs obligatoires doivent être remplis.");
//     }
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/users`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();
//       if (!res.ok) return setError(data.message || "Erreur");
//       closeModal(); onRefresh();
//     } catch { setError("Erreur réseau"); }
//     finally { setLoading(false); }
//   };

//   const handleEdit = async () => {
//     setLoading(true);
//     try {
//       const body = { nom: form.nom, prenom: form.prenom, email: form.email, role: form.role };
//       if (form.password) body.password = form.password;
//       const res = await fetch(`${API_URL}/api/users/${selected._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify(body),
//       });
//       const data = await res.json();
//       if (!res.ok) return setError(data.message || "Erreur");
//       closeModal(); onRefresh();
//     } catch { setError("Erreur réseau"); }
//     finally { setLoading(false); }
//   };

//   const handleDelete = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_URL}/api/users/${selected._id}`, {
//         method: "DELETE", credentials: "include",
//       });
//       if (!res.ok) { const d = await res.json(); return setError(d.message || "Erreur"); }
//       closeModal(); onRefresh();
//     } catch { setError("Erreur réseau"); }
//     finally { setLoading(false); }
//   };

//   const handleToggle = async (u) => {
//     try {
//       await fetch(`${API_URL}/api/users/${u._id}/toggle-active`, {
//         method: "PATCH", credentials: "include",
//       });
//       onRefresh();
//     } catch { console.error("Toggle error"); }
//   };

//   // ── Render ────────────────────────────────────────
//   return (
//     <div>
//       {/* Toolbar */}
//       <div className="au-toolbar">
//         <div className="au-search-wrap">
//           <span className="au-search-icon">🔍</span>
//           <input
//             className="au-search"
//             placeholder="Rechercher par nom, email…"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>
//         <div className="au-filters">
//           {FILTERS.map((f) => (
//             <button
//               key={f}
//               className={`au-filter-btn${roleFilter === f ? " active" : ""}`}
//               onClick={() => setRoleFilter(f)}
//             >
//               {f === "Tous" ? "Tous" : f}
//             </button>
//           ))}
//         </div>
//         <button className="au-add-btn" onClick={openCreate}>+ Créer un compte</button>
//       </div>

//       {/* Table */}
//       <div className="au-table-wrap">
//         {filtered.length === 0 ? (
//           <div className="au-empty">Aucun utilisateur trouvé</div>
//         ) : (
//           <table className="au-table">
//             <thead>
//               <tr>
//                 <th>Utilisateur</th>
//                 <th>Rôle</th>
//                 <th>Métiers</th>
//                 <th>Contact</th>
//                 <th>Statut</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((u) => (
//                 <tr key={u._id}>
//                   <td>
//                     <div style={{ fontWeight: 600, color: "#f5f0e8" }}>{u.prenom} {u.nom}</div>
//                     <div style={{ fontSize: 11, color: "rgba(245,240,232,0.3)" }}>{u.email}</div>
//                   </td>
//                   <td><span className={`au-role ${u.role}`}>{u.role}</span></td>
//                   <td>
//                     {u.metiers?.length
//                       ? u.metiers.map((m) => (
//                         <span key={m._id || m} className="au-metier-chip">
//                           {m.nom || m}
//                         </span>
//                       ))
//                       : <span style={{ color: "rgba(245,240,232,0.2)", fontSize: 12 }}>—</span>
//                     }
//                   </td>
//                   <td style={{ fontSize: 12 }}>
//                     {u.telephoneContact && <div>📞 {u.telephoneContact}</div>}
//                     {u.emailContact && <div>✉️ {u.emailContact}</div>}
//                     {!u.telephoneContact && !u.emailContact && (
//                       <span style={{ color: "rgba(245,240,232,0.2)" }}>—</span>
//                     )}
//                   </td>
//                   <td>
//                     <button
//                       className={`au-status-toggle ${u.isActive ? "active" : "inactive"}`}
//                       onClick={() => handleToggle(u)}
//                       title="Cliquer pour basculer"
//                     >
//                       <span className="au-status-dot" />
//                       {u.isActive ? "Actif" : "Inactif"}
//                     </button>
//                   </td>
//                   <td>
//                     <div className="au-actions">
//                       <button className="au-action-btn" onClick={() => openEdit(u)} title="Modifier">✏️</button>
//                       <button className="au-action-btn danger" onClick={() => openDelete(u)} title="Supprimer">🗑️</button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* ── Modal Créer / Modifier ── */}
//       {(modal === "create" || modal === "edit") && (
//         <AdminModal
//           title={modal === "create" ? "Créer un compte" : `Modifier — ${selected?.prenom} ${selected?.nom}`}
//           onClose={closeModal}
//           footer={
//             <>
//               <button className="am-btn am-btn-ghost" onClick={closeModal}>Annuler</button>
//               <button
//                 className="am-btn am-btn-primary"
//                 onClick={modal === "create" ? handleCreate : handleEdit}
//                 disabled={loading}
//               >
//                 {loading ? "…" : modal === "create" ? "Créer" : "Enregistrer"}
//               </button>
//             </>
//           }
//         >
//           {error && <div className="am-error">{error}</div>}
//           <div className="am-field">
//             <label className="am-label">Prénom *</label>
//             <input className="am-input" name="prenom" value={form.prenom} onChange={onChange} />
//           </div>
//           <div className="am-field">
//             <label className="am-label">Nom *</label>
//             <input className="am-input" name="nom" value={form.nom} onChange={onChange} />
//           </div>
//           <div className="am-field">
//             <label className="am-label">Email *</label>
//             <input className="am-input" name="email" type="email" value={form.email} onChange={onChange} />
//           </div>
//           <div className="am-field">
//             <label className="am-label">
//               {modal === "create" ? "Mot de passe *" : "Nouveau mot de passe (laisser vide = inchangé)"}
//             </label>
//             <input className="am-input" name="password" type="password" value={form.password} onChange={onChange} />
//           </div>
//           <div className="am-field">
//             <label className="am-label">Rôle *</label>
//             <select className="am-select" name="role" value={form.role} onChange={onChange}>
//               <option value="user">Utilisateur</option>
//               <option value="prestataire">Prestataire</option>
//               <option value="admin">Administrateur</option>
//             </select>
//           </div>
//         </AdminModal>
//       )}

//       {/* ── Modal Supprimer ── */}
//       {modal === "delete" && (
//         <AdminModal
//           title="Supprimer l'utilisateur"
//           onClose={closeModal}
//           footer={
//             <>
//               <button className="am-btn am-btn-ghost" onClick={closeModal}>Annuler</button>
//               <button className="am-btn am-btn-danger" onClick={handleDelete} disabled={loading}>
//                 {loading ? "…" : "Supprimer"}
//               </button>
//             </>
//           }
//         >
//           {error && <div className="am-error">{error}</div>}
//           <p style={{ color: "rgba(245,240,232,0.6)", fontSize: 14, lineHeight: 1.7 }}>
//             Confirmer la suppression de{" "}
//             <strong style={{ color: "#f5f0e8" }}>{selected?.prenom} {selected?.nom}</strong> ?
//             <br />
//             <span style={{ color: "rgba(239,68,68,0.8)", fontSize: 12 }}>
//               Cette action est irréversible.
//             </span>
//           </p>
//         </AdminModal>
//       )}
//     </div>
//   );
// };

// export default AdminUsers;

// src/screens/admin/AdminUsers.jsx
import { useState } from "react";
import AdminModal from "../../components/admin/AdminModal";
import "./AdminUsers.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const FILTERS = ["Tous", "user", "prestataire", "admin"];

const AdminUsers = ({ users, metiers, onRefresh }) => {
  const [search,      setSearch]      = useState("");
  const [roleFilter,  setRoleFilter]  = useState("Tous");
  const [validFilter, setValidFilter] = useState("Tous"); // "Tous" | "en_attente" | "valides"
  const [modal,       setModal]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [form,        setForm]        = useState({});
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);

  const filtered = users.filter((u) => {
    const matchRole   = roleFilter === "Tous" || u.role === roleFilter;
    const matchSearch = !search || [u.nom, u.prenom, u.email].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchValid  = validFilter === "Tous"
      || (validFilter === "en_attente" && u.role === "prestataire" && !u.isValidated)
      || (validFilter === "valides"    && (u.role !== "prestataire" || u.isValidated));
    return matchRole && matchSearch && matchValid;
  });

  const pendingCount = users.filter((u) => u.role === "prestataire" && !u.isValidated).length;

  const openCreate = () => { setForm({ nom: "", prenom: "", email: "", password: "", role: "user", telephoneContact: "", ridet: "" }); setError(""); setModal("create"); };
  const openEdit   = (u) => { setSelected(u); setForm({ nom: u.nom, prenom: u.prenom, email: u.email, role: u.role, password: "", telephoneContact: u.telephoneContact || "", ridet: u.ridet || "" }); setError(""); setModal("edit"); };
  const openDelete = (u) => { setSelected(u); setModal("delete"); };
  const closeModal = () => { setModal(null); setSelected(null); setError(""); };
  const onChange   = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreate = async () => {
    if (!form.nom || !form.prenom || !form.email || !form.password) return setError("Champs obligatoires manquants.");
    if (form.role === "prestataire" && !form.telephoneContact) return setError("Téléphone obligatoire pour un prestataire.");
    if (form.role === "prestataire" && !form.ridet)            return setError("RIDET obligatoire pour un prestataire.");
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/users`, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal(); onRefresh();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const handleEdit = async () => {
    setLoading(true);
    try {
      const body = { nom: form.nom, prenom: form.prenom, email: form.email, role: form.role };
      if (form.password)        body.password        = form.password;
      if (form.telephoneContact !== undefined) body.telephoneContact = form.telephoneContact;
      if (form.ridet            !== undefined) body.ridet            = form.ridet;
      const res  = await fetch(`${API_URL}/api/users/${selected._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Erreur");
      closeModal(); onRefresh();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${selected._id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) { const d = await res.json(); return setError(d.message || "Erreur"); }
      closeModal(); onRefresh();
    } catch { setError("Erreur réseau"); }
    finally { setLoading(false); }
  };

  const handleToggle = async (u) => {
    try { await fetch(`${API_URL}/api/users/${u._id}/toggle-active`, { method: "PATCH", credentials: "include" }); onRefresh(); }
    catch { console.error("Toggle error"); }
  };

  const handleValidate = async (u) => {
    if (!window.confirm(`Valider le compte de ${u.prenom} ${u.nom} ? Un email de confirmation lui sera envoyé.`)) return;
    try {
      const res  = await fetch(`${API_URL}/api/users/${u._id}/validate`, { method: "PATCH", credentials: "include" });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Erreur"); return; }
      onRefresh();
    } catch { alert("Erreur réseau"); }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="au-toolbar">
        <div className="au-search-wrap">
          <span className="au-search-icon">🔍</span>
          <input className="au-search" placeholder="Rechercher par nom, email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="au-filters">
          {FILTERS.map((f) => (
            <button key={f} className={"au-filter-btn" + (roleFilter === f ? " active" : "")} onClick={() => setRoleFilter(f)}>{f}</button>
          ))}
        </div>
        {/* Filtre validation */}
        <div className="au-filters">
          {["Tous", "en_attente", "valides"].map((f) => (
            <button
              key={f}
              className={"au-filter-btn" + (validFilter === f ? " active" : "") + (f === "en_attente" && pendingCount > 0 ? " pending" : "")}
              onClick={() => setValidFilter(f)}
              style={f === "en_attente" && pendingCount > 0 ? { borderColor: "rgba(239,68,68,0.5)", color: "#fca5a5" } : {}}
            >
              {f === "Tous" ? "Tous statuts" : f === "en_attente" ? `En attente${pendingCount > 0 ? ` (${pendingCount})` : ""}` : "Validés"}
            </button>
          ))}
        </div>
        <button className="au-add-btn" onClick={openCreate}>+ Créer un compte</button>
      </div>

      {/* Table */}
      <div className="au-table-wrap">
        {filtered.length === 0 ? (
          <div className="au-empty">Aucun utilisateur trouvé</div>
        ) : (
          <table className="au-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Métiers / RIDET</th>
                <th>Contact</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#f5f0e8" }}>{u.prenom} {u.nom}</div>
                    <div style={{ fontSize: 11, color: "rgba(245,240,232,0.3)" }}>{u.email}</div>
                  </td>
                  <td><span className={"au-role " + u.role}>{u.role}</span></td>
                  <td>
                    {u.metiers?.length
                      ? u.metiers.map((m) => <span key={m._id || m} className="au-metier-chip">{m.nom || m}</span>)
                      : <span style={{ color: "rgba(245,240,232,0.2)", fontSize: 12 }}>—</span>}
                    {u.ridet && <div style={{ fontSize: 10, color: "rgba(245,240,232,0.3)", marginTop: 3 }}>RIDET: {u.ridet}</div>}
                  </td>
                  <td style={{ fontSize: 12 }}>
                    {u.telephoneContact && <div>📞 {u.telephoneContact}</div>}
                    {u.emailContact     && <div>✉️ {u.emailContact}</div>}
                    {!u.telephoneContact && !u.emailContact && <span style={{ color: "rgba(245,240,232,0.2)" }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <button className={"au-status-toggle " + (u.isActive ? "active" : "inactive")} onClick={() => handleToggle(u)} title="Cliquer pour basculer">
                        <span className="au-status-dot" />
                        {u.isActive ? "Actif" : "Inactif"}
                      </button>
                      {u.role === "prestataire" && (
                        <span style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600,
                          background: u.isValidated ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.1)",
                          color: u.isValidated ? "#86efac" : "#fca5a5",
                          border: `1px solid ${u.isValidated ? "rgba(74,222,128,0.25)" : "rgba(239,68,68,0.25)"}`,
                          textAlign: "center",
                        }}>
                          {u.isValidated ? "✓ Validé" : "⏳ En attente"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="au-actions">
                      {/* Bouton valider — uniquement prestataires non validés */}
                      {u.role === "prestataire" && !u.isValidated && (
                        <button
                          className="au-action-btn"
                          onClick={() => handleValidate(u)}
                          title="Valider ce prestataire"
                          style={{ background: "rgba(74,222,128,0.1)", borderColor: "rgba(74,222,128,0.3)", color: "#86efac" }}
                        >
                          ✅
                        </button>
                      )}
                      <button className="au-action-btn" onClick={() => openEdit(u)} title="Modifier">✏️</button>
                      <button className="au-action-btn danger" onClick={() => openDelete(u)} title="Supprimer">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Créer / Modifier */}
      {(modal === "create" || modal === "edit") && (
        <AdminModal
          title={modal === "create" ? "Créer un compte" : `Modifier — ${selected?.prenom} ${selected?.nom}`}
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>Annuler</button>
              <button className="am-btn am-btn-primary" onClick={modal === "create" ? handleCreate : handleEdit} disabled={loading}>
                {loading ? "…" : modal === "create" ? "Créer" : "Enregistrer"}
              </button>
            </>
          }
        >
          {error && <div className="am-error">{error}</div>}
          <div className="am-field"><label className="am-label">Prénom *</label><input className="am-input" name="prenom" value={form.prenom} onChange={onChange} /></div>
          <div className="am-field"><label className="am-label">Nom *</label><input className="am-input" name="nom" value={form.nom} onChange={onChange} /></div>
          <div className="am-field"><label className="am-label">Email *</label><input className="am-input" name="email" type="email" value={form.email} onChange={onChange} /></div>
          <div className="am-field">
            <label className="am-label">{modal === "create" ? "Mot de passe *" : "Nouveau mot de passe (vide = inchangé)"}</label>
            <input className="am-input" name="password" type="password" value={form.password} onChange={onChange} />
          </div>
          <div className="am-field">
            <label className="am-label">Rôle *</label>
            <select className="am-select" name="role" value={form.role} onChange={onChange}>
              <option value="user">Utilisateur</option>
              <option value="prestataire">Prestataire</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          {form.role === "prestataire" && (
            <>
              <div className="am-field"><label className="am-label">Téléphone *</label><input className="am-input" name="telephoneContact" placeholder="+687 XX XX XX" value={form.telephoneContact} onChange={onChange} /></div>
              <div className="am-field"><label className="am-label">RIDET *</label><input className="am-input" name="ridet" placeholder="1234567-001" value={form.ridet} onChange={onChange} /></div>
            </>
          )}
        </AdminModal>
      )}

      {/* Modal Supprimer */}
      {modal === "delete" && (
        <AdminModal
          title="Supprimer l'utilisateur"
          onClose={closeModal}
          footer={
            <>
              <button className="am-btn am-btn-ghost" onClick={closeModal}>Annuler</button>
              <button className="am-btn am-btn-danger" onClick={handleDelete} disabled={loading}>{loading ? "…" : "Supprimer"}</button>
            </>
          }
        >
          {error && <div className="am-error">{error}</div>}
          <p style={{ color: "rgba(245,240,232,0.6)", fontSize: 14, lineHeight: 1.7 }}>
            Confirmer la suppression de <strong style={{ color: "#f5f0e8" }}>{selected?.prenom} {selected?.nom}</strong> ?
            <br /><span style={{ color: "rgba(239,68,68,0.8)", fontSize: 12 }}>Cette action est irréversible.</span>
          </p>
        </AdminModal>
      )}
    </div>
  );
};

export default AdminUsers;