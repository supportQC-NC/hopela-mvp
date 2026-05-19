// src/screens/admin/AdminDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import AdminOverview from "./adminOverview";
import AdminUsers from "./AdminUsers";
import AdminCatalogues from "./AdminCatalogues";
import AdminMap from "./AdminMap";
import AdminContact from "./AdminContact";
import "./AdminDashboard.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminDashboard = () => {
  const [activeNav, setActiveNav] = useState("overview");
  const [users, setUsers] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [messagesNouveaux, setMessagesNouveaux] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, metiersRes, contactRes] = await Promise.all([
        fetch(`${API_URL}/api/users`, { credentials: "include" }),
        fetch(`${API_URL}/api/metiers/admin/all`, { credentials: "include" }),
        fetch(`${API_URL}/api/contact?statut=nouveau`, {
          credentials: "include",
        }),
      ]);
      const [usersData, metiersData, contactData] = await Promise.all([
        usersRes.json(),
        metiersRes.json(),
        contactRes.json(),
      ]);
      if (usersRes.ok) setUsers(usersData);
      if (metiersRes.ok) setMetiers(metiersData);
      if (contactRes.ok)
        setMessagesNouveaux(
          Array.isArray(contactData) ? contactData.length : 0,
        );
    } catch (e) {
      console.error("AdminDashboard fetch:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Badges sidebar
  const prestaEnAttente = users.filter(
    (u) => u.role === "prestataire" && !u.isValidated,
  ).length;
  const counts = {
    users: prestaEnAttente,
    contact: messagesNouveaux,
  };

  // La page catalogues gère ses propres fetches — pas besoin de passer onRefresh
  const showRefresh =
    activeNav !== "map" &&
    activeNav !== "contact" &&
    activeNav !== "catalogues";

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
          onRefresh={showRefresh ? fetchAll : undefined}
        />

        <div className="ad-content">
          {loading && activeNav === "overview" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 200,
                color: "rgba(245,240,232,0.25)",
                fontSize: 14,
              }}
            >
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
              {activeNav === "catalogues" && <AdminCatalogues users={users} />}
              {activeNav === "map" && <AdminMap />}
              {activeNav === "contact" && <AdminContact />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
