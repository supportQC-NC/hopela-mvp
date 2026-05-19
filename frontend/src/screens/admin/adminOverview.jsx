// // src/screens/admin/adminOverview.jsx
// import "./AdminOverview.scss";

// const AdminOverview = ({ users, metiers, onNav }) => {
//   const total = users.length;
//   const actifs = users.filter((u) => u.isActive).length;
//   const prestataires = users.filter((u) => u.role === "prestataire").length;
//   const reguliers = users.filter((u) => u.role === "user").length;

//   // Compte de prestataires par métier (via ObjectId)
//   const metierCounts = {};
//   users.forEach((u) => {
//     if (u.role === "prestataire" && u.metiers?.length) {
//       u.metiers.forEach((m) => {
//         const id = m._id || m;
//         metierCounts[id] = (metierCounts[id] || 0) + 1;
//       });
//     }
//   });

//   const STATS = [
//     { icon: "👥", val: total, label: "Utilisateurs total" },
//     { icon: "✅", val: actifs, label: "Comptes actifs" },
//     { icon: "🔧", val: prestataires, label: "Prestataires" },
//     { icon: "👤", val: reguliers, label: "Particuliers" },
//   ];

//   // Top 10 métiers actifs avec leur catégorie
//   const metiersActifs = metiers.filter((m) => m.isActive).slice(0, 10);

//   return (
//     <div>
//       {/* Stats */}
//       <div className="ao-stats">
//         {STATS.map(({ icon, val, label }) => (
//           <div key={label} className="ao-stat-card">
//             <div className="ao-stat-icon">{icon}</div>
//             <div>
//               <div className="ao-stat-val">{val}</div>
//               <div className="ao-stat-label">{label}</div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Two-col grid */}
//       <div className="ao-grid">
//         {/* Derniers utilisateurs */}
//         <div>
//           <div className="ao-section-header">
//             <span className="ao-section-title">Derniers inscrits</span>
//             <button className="ao-section-link" onClick={() => onNav("users")}>
//               Voir tous →
//             </button>
//           </div>
//           <div className="ao-table-wrap">
//             <table className="ao-table">
//               <thead>
//                 <tr>
//                   <th>Nom</th>
//                   <th>Rôle</th>
//                   <th>Statut</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {users.slice(0, 8).map((u) => (
//                   <tr key={u._id}>
//                     <td style={{ fontWeight: 600, color: "#f5f0e8" }}>
//                       {u.prenom} {u.nom}
//                       <div
//                         style={{
//                           fontSize: 11,
//                           color: "rgba(245,240,232,0.3)",
//                           fontWeight: 400,
//                         }}
//                       >
//                         {u.email}
//                       </div>
//                     </td>
//                     <td>
//                       <span className={`ao-role ${u.role}`}>{u.role}</span>
//                     </td>
//                     <td>
//                       <span
//                         className={`ao-dot ${u.isActive ? "active" : "inactive"}`}
//                       />
//                       <span
//                         style={{
//                           marginLeft: 7,
//                           fontSize: 11,
//                           color: "rgba(245,240,232,0.35)",
//                         }}
//                       >
//                         {u.isActive ? "Actif" : "Inactif"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Métiers avec catégorie */}
//         <div>
//           <div className="ao-section-header">
//             <span className="ao-section-title">Métiers ({metiers.length})</span>
//             <button
//               className="ao-section-link"
//               onClick={() => onNav("catalogues")}
//             >
//               Gérer →
//             </button>
//           </div>
//           <div className="ao-table-wrap">
//             <div className="ao-metiers-list">
//               {metiersActifs.map((m) => {
//                 const count = metierCounts[m._id] || 0;
//                 const catNom = m.categorie?.nom || null;
//                 return (
//                   <div key={m._id} className="ao-metier-row">
//                     <div className="ao-metier-name">
//                       <span>{m.icone || "🔨"}</span>
//                       <div>
//                         <div>{m.nom}</div>
//                         {catNom && (
//                           <div className="ao-metier-cat">{catNom}</div>
//                         )}
//                       </div>
//                       {!m.isActive && (
//                         <span className="ao-metier-inactive">inactif</span>
//                       )}
//                     </div>
//                     <span className="ao-metier-count">
//                       {count} prestataire{count > 1 ? "s" : ""}
//                     </span>
//                   </div>
//                 );
//               })}
//               {metiers.length === 0 && (
//                 <div
//                   style={{
//                     padding: "20px 16px",
//                     fontSize: 12,
//                     color: "rgba(245,240,232,0.2)",
//                     fontStyle: "italic",
//                   }}
//                 >
//                   Aucun métier configuré.
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOverview;

// src/screens/admin/adminOverview.jsx
import { Wrench } from "lucide-react";
import IconeRenderer from "../../components/shared/IconeRenderer";
import "./AdminOverview.scss";

const AdminOverview = ({ users, metiers, onNav }) => {
  const total        = users.length;
  const actifs       = users.filter((u) => u.isActive).length;
  const prestataires = users.filter((u) => u.role === "prestataire").length;
  const reguliers    = users.filter((u) => u.role === "user").length;

  // Compte de prestataires par métier (via ObjectId)
  const metierCounts = {};
  users.forEach((u) => {
    if (u.role === "prestataire" && u.metiers?.length) {
      u.metiers.forEach((m) => {
        const id = m._id || m;
        metierCounts[id] = (metierCounts[id] || 0) + 1;
      });
    }
  });

  const STATS = [
    { icon: "👥", val: total,        label: "Utilisateurs total" },
    { icon: "✅", val: actifs,       label: "Comptes actifs"     },
    { icon: "🔧", val: prestataires, label: "Prestataires"       },
    { icon: "👤", val: reguliers,    label: "Particuliers"       },
  ];

  // Top 10 métiers actifs
  const metiersActifs = metiers.filter((m) => m.isActive).slice(0, 10);

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
                    <td>
                      <span className={`ao-role ${u.role}`}>{u.role}</span>
                    </td>
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

        {/* Métiers avec catégorie */}
        <div>
          <div className="ao-section-header">
            <span className="ao-section-title">Métiers ({metiers.length})</span>
            <button className="ao-section-link" onClick={() => onNav("catalogues")}>
              Gérer →
            </button>
          </div>
          <div className="ao-table-wrap">
            <div className="ao-metiers-list">
              {metiersActifs.map((m) => {
                const count  = metierCounts[m._id] || 0;
                const catNom = m.categorie?.nom || null;
                return (
                  <div key={m._id} className="ao-metier-row">
                    <div className="ao-metier-name">
                      {/* ✅ IconeRenderer résout le nom Lucide en vrai SVG */}
                      <span className="ao-metier-icon-wrap">
                        <IconeRenderer
                          icone={m.icone}
                          size={16}
                          fallback={Wrench}
                        />
                      </span>
                      <div>
                        <div>{m.nom}</div>
                        {catNom && (
                          <div className="ao-metier-cat">{catNom}</div>
                        )}
                      </div>
                      {!m.isActive && (
                        <span className="ao-metier-inactive">inactif</span>
                      )}
                    </div>
                    <span className="ao-metier-count">
                      {count} prestataire{count > 1 ? "s" : ""}
                    </span>
                  </div>
                );
              })}

              {metiers.length === 0 && (
                <div style={{ padding: "20px 16px", fontSize: 12, color: "rgba(245,240,232,0.2)", fontStyle: "italic" }}>
                  Aucun métier configuré.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
