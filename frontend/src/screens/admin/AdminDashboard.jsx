// src/screens/admin/AdminDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import AdminSidebar    from "../../components/admin/AdminSidebar";
import AdminTopbar     from "../../components/admin/AdminTopbar";
import AdminOverview   from "./adminOverview";
import AdminUsers      from "./AdminUsers";
import AdminCatalogues from "./AdminCatalogues";
import AdminMap        from "./AdminMap";
import AdminContact    from "./AdminContact";
import AdminPromotions from "./AdminPromotions";
import AdminFavoris    from "./AdminFavoris";
import "./AdminDashboard.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const [activeNav,        setActiveNav]        = useState("overview");
  const [collapsed,        setCollapsed]        = useState(false);
  const [users,            setUsers]            = useState([]);
  const [metiers,          setMetiers]          = useState([]);
  const [messagesNouveaux, setMessagesNouveaux] = useState(0);
  const [loading,          setLoading]          = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, metiersRes, contactRes] = await Promise.all([
        fetch(`${API_URL}/api/users`,                          { credentials: "include" }),
        fetch(`${API_URL}/api/metiers/admin/all`,              { credentials: "include" }),
        fetch(`${API_URL}/api/contact?statut=nouveau`,         { credentials: "include" }),
      ]);
      const [usersData, metiersData, contactData] = await Promise.all([
        usersRes.json(),
        metiersRes.json(),
        contactRes.json(),
      ]);
      if (usersRes.ok)   setUsers(Array.isArray(usersData)     ? usersData    : []);
      if (metiersRes.ok) setMetiers(Array.isArray(metiersData) ? metiersData  : []);
      if (contactRes.ok) setMessagesNouveaux(Array.isArray(contactData) ? contactData.length : 0);
    } catch (error) {
      console.error("AdminDashboard fetch:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const prestaEnAttente = users.filter(
    (u) => u.role === "prestataire" && !u.isValidated
  ).length;

  const counts = { users: prestaEnAttente, contact: messagesNouveaux };

  const showRefresh =
    activeNav !== "map" &&
    activeNav !== "contact" &&
    activeNav !== "catalogues" &&
    activeNav !== "promotions" &&
    activeNav !== "favoris";

  return (
    <div className={`ad-root${collapsed ? " sidebar-collapsed" : ""}`}>
      <AdminSidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        counts={counts}
        collapsed={collapsed}
        onToggle={() => setCollapsed((x) => !x)}
      />

      <main className="ad-main">
        <AdminTopbar
          activeNav={activeNav}
          onRefresh={showRefresh ? fetchAll : undefined}
        />

        <section className="ad-content">
          {loading && activeNav === "overview" ? (
            <div className="ad-loading">Chargement…</div>
          ) : (
            <>
              {activeNav === "overview"   && <AdminOverview   users={users} metiers={metiers} onNav={setActiveNav} />}
              {activeNav === "users"      && <AdminUsers      users={users} metiers={metiers} onRefresh={fetchAll} />}
              {activeNav === "catalogues" && <AdminCatalogues users={users} />}
              {activeNav === "map"        && <AdminMap />}
              {activeNav === "contact"    && <AdminContact />}
              {activeNav === "promotions" && <AdminPromotions />}
              {activeNav === "favoris"    && <AdminFavoris />}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;