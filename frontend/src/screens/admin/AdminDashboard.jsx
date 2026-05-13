// src/screens/admin/AdminDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import AdminSidebar  from "../../components/admin/AdminSidebar";
import AdminTopbar   from "../../components/admin/AdminTopbar";
import AdminOverview from "./adminOverview";
import AdminUsers    from "./AdminUsers";
import AdminMetiers  from "./AdminMetiers";
import AdminMap      from "./AdminMap";
import "./AdminDashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState("overview");
  const [users,     setUsers]     = useState([]);
  const [metiers,   setMetiers]   = useState([]);
  const [loading,   setLoading]   = useState(false);

  // ── Fetch centralisé ─────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, metiersRes] = await Promise.all([
        fetch(`${API_URL}/api/users`,          { credentials: "include" }),
        fetch(`${API_URL}/api/metiers/admin/all`, { credentials: "include" }),
      ]);
      const [usersData, metiersData] = await Promise.all([
        usersRes.json(),
        metiersRes.json(),
      ]);
      if (usersRes.ok)   setUsers(usersData);
      if (metiersRes.ok) setMetiers(metiersData);
    } catch (e) { console.error("AdminDashboard fetch:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Compteurs pour les badges sidebar
  const counts = {
    users:   users.length,
    metiers: metiers.length,
  };

  return (
    <div className="ad-root">

      <AdminSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        counts={counts}
      />

      <div className="ad-main">
        <AdminTopbar
          activeNav={activeNav}
          onRefresh={activeNav !== "map" ? fetchAll : undefined}
        />

        <div className="ad-content">
          {loading && activeNav !== "map" ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: 200, color: "rgba(245,240,232,0.25)", fontSize: 14,
            }}>
              Chargement…
            </div>
          ) : (
            <>
              {activeNav === "overview" && (
                <AdminOverview
                  users={users}
                  metiers={metiers}
                  onNav={setActiveNav}
                />
              )}
              {activeNav === "users" && (
                <AdminUsers
                  users={users}
                  metiers={metiers}
                  onRefresh={fetchAll}
                />
              )}
              {activeNav === "metiers" && (
                <AdminMetiers
                  metiers={metiers}
                  users={users}
                  onRefresh={fetchAll}
                />
              )}
              {activeNav === "map" && <AdminMap />}
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;