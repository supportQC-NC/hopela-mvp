// src/screens/prestataire/PrestataireDashboard.jsx

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import logo from "../../logo.png";

import {
  logoutUser,
  updateProfile,
  clearUpdateSuccess,
} from "../../slices/authSlice";

import useGeolocate from "../../hooks/UseGeoLocate";
import "./PrestataireDashboard.scss";

const RESEAUX = [
  {
    key: "facebook",
    icon: "📘",
    label: "Facebook",
    placeholder: "https://facebook.com/votrepage",
  },
  {
    key: "instagram",
    icon: "📸",
    label: "Instagram",
    placeholder: "https://instagram.com/votreprofil",
  },
  {
    key: "twitter",
    icon: "🐦",
    label: "Twitter / X",
    placeholder: "https://twitter.com/votreprofil",
  },
  {
    key: "tiktok",
    icon: "🎵",
    label: "TikTok",
    placeholder: "https://tiktok.com/@votreprofil",
  },
  {
    key: "linkedin",
    icon: "💼",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/votreprofil",
  },
  {
    key: "youtube",
    icon: "▶️",
    label: "YouTube",
    placeholder: "https://youtube.com/@votrechaine",
  },
];

const TABS = [
  { key: "disponibilite", icon: "📍", label: "Disponibilité" },
  { key: "profil", icon: "✏️", label: "Mon profil" },
];

const DesktopTabs = ({ activeTab, setActiveTab }) => (
  <div className="pd-desktop-tabs">
    {TABS.map(({ key, icon, label }) => (
      <button
        key={key}
        className={`pd-desktop-tab${activeTab === key ? " active" : ""}`}
        onClick={() => setActiveTab(key)}
      >
        <span>{icon}</span>
        {label}
      </button>
    ))}
  </div>
);

const PrestataireDashboard = () => {
  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector(
    (s) => s.auth,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSharing, startTracking, stopTracking } = useGeolocate();

  const [activeTab, setActiveTab] = useState("disponibilite");
  const [geoError, setGeoError] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [metier, setMetier] = useState(userInfo?.metier || "");
  const [siteWeb, setSiteWeb] = useState(userInfo?.siteWeb || "");
  const [reseaux, setReseaux] = useState({
    facebook: userInfo?.reseauxSociaux?.facebook || "",
    instagram: userInfo?.reseauxSociaux?.instagram || "",
    twitter: userInfo?.reseauxSociaux?.twitter || "",
    tiktok: userInfo?.reseauxSociaux?.tiktok || "",
    linkedin: userInfo?.reseauxSociaux?.linkedin || "",
    youtube: userInfo?.reseauxSociaux?.youtube || "",
  });

  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch]);

  const handleToggleTracking = async () => {
    setTrackingLoading(true);

    if (isSharing) {
      await stopTracking();
      setGeoError(null);
    } else {
      const result = await startTracking();
      if (!result.ok) setGeoError(result.reason);
    }

    setTrackingLoading(false);
  };

  const handleLogout = async () => {
    if (isSharing) stopTracking();
    await dispatch(logoutUser());
    navigate("/");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ metier, siteWeb, reseauxSociaux: reseaux }));
  };

  const renderStars = (note) =>
    note ? "★".repeat(Math.floor(note)) + (note % 1 >= 0.5 ? "½" : "") : "—";

  return (
    <div className="pd-root">
      {geoError && (
        <div className="pd-geo-overlay" onClick={() => setGeoError(null)}>
          <div className="pd-geo-popup" onClick={(e) => e.stopPropagation()}>
            <div className="pd-geo-icon">📍</div>

            <div className="pd-geo-title">
              {geoError === "unsupported"
                ? "GPS non supporté"
                : "Géolocalisation désactivée"}
            </div>

            <div className="pd-geo-text">
              {geoError === "unsupported"
                ? "Votre navigateur ne supporte pas la géolocalisation."
                : "Autorisez l'accès à votre localisation pour apparaître sur la carte."}
            </div>

            {geoError === "denied" && (
              <div className="pd-geo-steps">
                <div className="pd-geo-step">
                  <span className="pd-geo-step-num">1.</span>
                  <span>Cliquez sur le cadenas dans la barre d'adresse</span>
                </div>
                <div className="pd-geo-step">
                  <span className="pd-geo-step-num">2.</span>
                  <span>Sélectionnez les autorisations du site</span>
                </div>
                <div className="pd-geo-step">
                  <span className="pd-geo-step-num">3.</span>
                  <span>Passez la localisation sur autoriser</span>
                </div>
                <div className="pd-geo-step">
                  <span className="pd-geo-step-num">4.</span>
                  <span>Rechargez la page et réessayez</span>
                </div>
              </div>
            )}

            <button
              className="pd-geo-btn-primary"
              onClick={() => {
                setGeoError(null);
                window.location.reload();
              }}
            >
              Recharger la page
            </button>

            <button
              className="pd-geo-btn-secondary"
              onClick={() => setGeoError(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <header className="pd-header">
        <button
          className="pd-brand"
          type="button"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Hopela" className="pd-logo-img" />
          <span className="pd-logo-name">Hopela</span>
          <span className="pd-badge-role">Pro</span>
        </button>

        <button className="pd-logout-btn" onClick={handleLogout}>
          <span className="pd-logout-full">Déconnexion</span>
          <span className="pd-logout-short">⎋</span>
        </button>
      </header>

      <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pd-body">
        <h1 className="pd-welcome">
          Bonjour, <em>{userInfo?.prenom}</em> 👷
        </h1>

        <p className="pd-welcome-sub">
          {activeTab === "disponibilite"
            ? "Gérez votre disponibilité en temps réel"
            : "Complétez votre profil pour attirer plus de clients"}
        </p>

        {activeTab === "disponibilite" && (
          <>
            <section className="pd-status-card">
              <div
                className={`pd-status-indicator ${
                  isSharing ? "online" : "offline"
                }`}
              >
                {isSharing ? "📍" : "💤"}
              </div>

              <div className="pd-status-label">
                {isSharing
                  ? "Vous êtes visible sur la carte"
                  : "Vous êtes hors ligne"}
              </div>

              <p className="pd-status-sub">
                {isSharing
                  ? "Votre position est partagée en temps réel. Les clients peuvent vous voir."
                  : "Activez le partage pour apparaître sur la carte et recevoir des demandes."}
              </p>

              <button
                className={`pd-toggle-btn ${isSharing ? "stop" : "start"}`}
                onClick={handleToggleTracking}
                disabled={trackingLoading}
              >
                {trackingLoading
                  ? isSharing
                    ? "⏳ Arrêt en cours..."
                    : "⏳ Démarrage..."
                  : isSharing
                    ? "⏹ Arrêter le partage"
                    : "▶ Démarrer le partage"}
              </button>
            </section>

            <section className="pd-info-grid">
              <article className="pd-info-card">
                <div className="pd-info-icon">👤</div>
                <div className="pd-info-content">
                  <div className="pd-info-label">Identité</div>
                  <div className="pd-info-value">
                    {userInfo?.prenom} {userInfo?.nom}
                  </div>
                </div>
              </article>

              <article className="pd-info-card">
                <div className="pd-info-icon">🔧</div>
                <div className="pd-info-content">
                  <div className="pd-info-label">Métier</div>
                  <div className="pd-info-value primary">
                    {userInfo?.metier || "Non renseigné"}
                  </div>
                </div>
              </article>

              <article className="pd-info-card">
                <div className="pd-info-icon">⭐</div>
                <div className="pd-info-content">
                  <div className="pd-info-label">Note</div>
                  <div className="pd-info-value primary">
                    {renderStars(userInfo?.note)}
                    {userInfo?.note ? ` (${userInfo.note}/5)` : " —"}
                  </div>
                </div>
              </article>

              <article className="pd-info-card">
                <div className="pd-info-icon">💬</div>
                <div className="pd-info-content">
                  <div className="pd-info-label">Avis</div>
                  <div className="pd-info-value">
                    {userInfo?.nbAvis || 0} avis
                  </div>
                </div>
              </article>
            </section>
          </>
        )}

        {activeTab === "profil" && (
          <form onSubmit={handleSaveProfile}>
            {updateSuccess && (
              <div className="pd-alert success">
                ✅ Profil mis à jour avec succès !
              </div>
            )}

            {updateError && (
              <div className="pd-alert error">⚠️ {updateError}</div>
            )}

            <section className="pd-form-section">
              <div className="pd-form-section-title">
                Informations professionnelles
              </div>
              <div className="pd-form-section-sub">
                Ces informations apparaissent sur votre profil public
              </div>

              <div className="pd-field">
                <label className="pd-label">Métier / Spécialité</label>
                <div className="pd-input-wrap">
                  <span className="pd-input-icon">🔧</span>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="Ex: Électricien, Plombier, Jardinier..."
                    value={metier}
                    onChange={(e) => setMetier(e.target.value)}
                  />
                </div>
              </div>

              <div className="pd-field">
                <label className="pd-label">Site web</label>
                <div className="pd-input-wrap">
                  <span className="pd-input-icon">🌐</span>
                  <input
                    type="url"
                    className="pd-input"
                    placeholder="https://votre-site.com"
                    value={siteWeb}
                    onChange={(e) => setSiteWeb(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="pd-form-section">
              <div className="pd-form-section-title">Réseaux sociaux</div>
              <div className="pd-form-section-sub">
                Ajoutez vos liens pour que les clients vous retrouvent
              </div>

              <div className="pd-social-list">
                {RESEAUX.map(({ key, icon, label, placeholder }) => (
                  <div key={key} className="pd-field">
                    <label className="pd-label">
                      {icon} {label}
                    </label>
                    <div className="pd-input-wrap">
                      <span className="pd-input-icon">{icon}</span>
                      <input
                        type="url"
                        className="pd-input"
                        placeholder={placeholder}
                        value={reseaux[key]}
                        onChange={(e) =>
                          setReseaux((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              className="pd-save-btn"
              disabled={updateLoading}
            >
              {updateLoading && <span className="pd-spinner" />}
              {updateLoading ? "Enregistrement..." : "💾 Sauvegarder le profil"}
            </button>
          </form>
        )}
      </main>

      <nav className="pd-bottom-nav">
        {TABS.map(({ key, icon, label }) => (
          <button
            key={key}
            className={`pd-nav-btn${activeTab === key ? " active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="pd-nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PrestataireDashboard;
