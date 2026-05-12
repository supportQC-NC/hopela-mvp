// src/screens/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../slices/authSlice";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CSS = `
  .ad-root {
    min-height: 100vh; background: #0a0804;
    font-family: 'DM Sans', sans-serif; color: #f5f0e8;
    display: flex;
  }

  /* ── Sidebar ── */
  .ad-sidebar {
    width: 220px; flex-shrink: 0;
    background: #0e0b06;
    border-right: 1px solid rgba(201,168,76,0.1);
    display: flex; flex-direction: column;
    padding: 24px 0; position: sticky; top: 0; height: 100vh;
  }
  .ad-sidebar-logo {
    display: flex; align-items: center; gap: 10px; padding: 0 20px; margin-bottom: 36px;
  }
  .ad-sidebar-logo-mark {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #c9a84c, #8a6c28);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 16px; color: #0a0804;
  }
  .ad-sidebar-logo-name {
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 20px;
  }
  .ad-nav-label {
    font-size: 9px; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: rgba(245,240,232,0.25);
    padding: 0 20px; margin-bottom: 8px;
  }
  .ad-nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 20px; cursor: pointer; border: none; background: none; width: 100%;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    color: rgba(245,240,232,0.45); transition: all 0.18s; text-align: left;
    border-left: 2px solid transparent;
  }
  .ad-nav-item:hover { color: #f5f0e8; background: rgba(201,168,76,0.05); }
  .ad-nav-item.active {
    color: #c9a84c; background: rgba(201,168,76,0.08);
    border-left-color: #c9a84c;
  }
  .ad-nav-icon { font-size: 16px; flex-shrink: 0; }
  .ad-sidebar-footer { margin-top: auto; padding: 20px; }
  .ad-logout-btn {
    width: 100%; background: none; border: 1px solid rgba(201,168,76,0.15);
    border-radius: 8px; padding: 9px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: rgba(245,240,232,0.4); transition: all 0.2s;
  }
  .ad-logout-btn:hover { border-color: rgba(239,68,68,0.4); color: #fca5a5; }

  /* ── Main ── */
  .ad-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .ad-topbar {
    height: 64px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; border-bottom: 1px solid rgba(201,168,76,0.1);
    background: rgba(14,11,6,0.8); backdrop-filter: blur(12px);
    position: sticky; top: 0; z-index: 50;
  }
  .ad-topbar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 700; color: #f5f0e8;
  }
  .ad-topbar-badge {
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
    border-radius: 6px; padding: 4px 10px;
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: #fca5a5;
  }
  .ad-content { padding: 32px; overflow-y: auto; }

  /* ── Stats cards ── */
  .ad-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 32px; }
  .ad-stat-card {
    background: #120e07; border: 1px solid rgba(201,168,76,0.12);
    border-radius: 14px; padding: 20px 22px;
    display: flex; align-items: center; gap: 14px;
    transition: all 0.2s;
  }
  .ad-stat-card:hover { border-color: rgba(201,168,76,0.3); }
  .ad-stat-icon {
    width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
    background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.15);
    display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  .ad-stat-val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px; font-weight: 700; color: #c9a84c; line-height: 1;
  }
  .ad-stat-label { font-size: 11px; color: rgba(245,240,232,0.35); margin-top: 3px; letter-spacing: 0.5px; }

  /* ── Table users ── */
  .ad-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px; font-weight: 700; color: #f5f0e8;
    margin-bottom: 16px;
  }
  .ad-table-wrap {
    background: #120e07; border: 1px solid rgba(201,168,76,0.12);
    border-radius: 16px; overflow: hidden;
  }
  .ad-table { width: 100%; border-collapse: collapse; }
  .ad-table th {
    padding: 14px 20px; text-align: left;
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: rgba(245,240,232,0.3);
    border-bottom: 1px solid rgba(201,168,76,0.1);
    background: rgba(255,255,255,0.02);
  }
  .ad-table td {
    padding: 14px 20px; font-size: 13px; color: rgba(245,240,232,0.75);
    border-bottom: 1px solid rgba(255,255,255,0.03);
    vertical-align: middle;
  }
  .ad-table tr:last-child td { border-bottom: none; }
  .ad-table tr:hover td { background: rgba(201,168,76,0.03); }
  .ad-role-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 6px;
    font-size: 10px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
  }
  .ad-role-badge.admin { background: rgba(239,68,68,0.1); color: #fca5a5; border: 1px solid rgba(239,68,68,0.2); }
  .ad-role-badge.user { background: rgba(99,102,241,0.1); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); }
  .ad-role-badge.prestataire { background: rgba(201,168,76,0.1); color: #c9a84c; border: 1px solid rgba(201,168,76,0.2); }
  .ad-status-dot {
    width: 7px; height: 7px; border-radius: 50%; display: inline-block;
  }
  .ad-status-dot.active { background: #4ade80; box-shadow: 0 0 6px #4ade80; }
  .ad-status-dot.inactive { background: #ef4444; }
  .ad-loading {
    text-align: center; padding: 48px;
    color: rgba(245,240,232,0.3); font-size: 14px;
  }
`;

const NAV_ITEMS = [
  { icon: "📊", label: "Vue d'ensemble", key: "overview" },
  { icon: "👥", label: "Utilisateurs",    key: "users" },
  { icon: "🗺️", label: "Carte live",      key: "map" },
];

const AdminDashboard = () => {
  const { userInfo } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!document.getElementById("ad-css")) {
      const s = document.createElement("style"); s.id = "ad-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/users/logout`, { method: "POST", credentials: "include" });
    dispatch(logout());
    navigate("/");
  };

  const regulars     = users.filter((u) => u.role === "user").length;
  const prestataires = users.filter((u) => u.role === "prestataire").length;
  const actifs       = users.filter((u) => u.isActive).length;

  return (
    <div className="ad-root">
      {/* ── Sidebar ── */}
      <aside className="ad-sidebar">
        <div className="ad-sidebar-logo">
          <div className="ad-sidebar-logo-mark">H</div>
          <span className="ad-sidebar-logo-name">Hopela</span>
        </div>

        <div className="ad-nav-label">Navigation</div>
        {NAV_ITEMS.map(({ icon, label, key }) => (
          <button
            key={key}
            className={`ad-nav-item${activeNav === key ? " active" : ""}`}
            onClick={() => setActiveNav(key)}
          >
            <span className="ad-nav-icon">{icon}</span>
            {label}
          </button>
        ))}

        <div className="ad-sidebar-footer">
          <div style={{ fontSize:12, color:"rgba(245,240,232,0.3)", marginBottom:10, textAlign:"center" }}>
            {userInfo?.prenom} {userInfo?.nom}
          </div>
          <button className="ad-logout-btn" onClick={handleLogout}>⏻ Déconnexion</button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="ad-main">
        <div className="ad-topbar">
          <span className="ad-topbar-title">
            {activeNav === "overview" && "Vue d'ensemble"}
            {activeNav === "users"    && "Utilisateurs"}
            {activeNav === "map"      && "Carte live"}
          </span>
          <span className="ad-topbar-badge">Admin</span>
        </div>

        <div className="ad-content">

          {/* ── Overview ── */}
          {activeNav === "overview" && (
            <>
              <div className="ad-stats">
                {[
                  { icon:"👥", val:users.length,  label:"Utilisateurs total" },
                  { icon:"✅", val:actifs,         label:"Comptes actifs" },
                  { icon:"🔧", val:prestataires,  label:"Prestataires" },
                  { icon:"👤", val:regulars,       label:"Particuliers" },
                ].map(({ icon, val, label }) => (
                  <div key={label} className="ad-stat-card">
                    <div className="ad-stat-icon">{icon}</div>
                    <div>
                      <div className="ad-stat-val">{val}</div>
                      <div className="ad-stat-label">{label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="ad-section-title">Derniers utilisateurs</h2>
              <UsersTable users={users.slice(0, 8)} loading={loading} />
            </>
          )}

          {/* ── Users ── */}
          {activeNav === "users" && (
            <>
              <h2 className="ad-section-title">Tous les utilisateurs ({users.length})</h2>
              <UsersTable users={users} loading={loading} />
            </>
          )}

          {/* ── Map ── */}
          {activeNav === "map" && (
            <div style={{ height:520, borderRadius:16, overflow:"hidden", border:"1px solid rgba(201,168,76,0.15)" }}>
              <iframe
                title="carte"
                src="/"
                style={{ width:"100%", height:"100%", border:"none", opacity:0 }}
              />
              <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"rgba(245,240,232,0.3)",fontSize:14 }}>
                🗺️ Carte disponible — importer PublicMap ici
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UsersTable = ({ users, loading }) => (
  <div className="ad-table-wrap">
    {loading ? (
      <div className="ad-loading">Chargement...</div>
    ) : (
      <table className="ad-table">
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Métier</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td style={{ fontWeight:600, color:"#f5f0e8" }}>
                {u.prenom} {u.nom}
              </td>
              <td>{u.email}</td>
              <td>
                <span className={`ad-role-badge ${u.role}`}>{u.role}</span>
              </td>
              <td style={{ color:"rgba(245,240,232,0.4)" }}>
                {u.metier || "—"}
              </td>
              <td>
                <span className={`ad-status-dot ${u.isActive ? "active" : "inactive"}`} />
                <span style={{ marginLeft:8, fontSize:12, color:"rgba(245,240,232,0.4)" }}>
                  {u.isActive ? "Actif" : "Inactif"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default AdminDashboard;