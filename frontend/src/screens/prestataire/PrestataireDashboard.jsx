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

import { fetchCategories } from "../../slices/categorieSlice";
import { fetchMetiers } from "../../slices/metierSlice";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector(
    (s) => s.auth,
  );
  const { categories, loading: catLoading } = useSelector((s) => s.categorie);
  const { metiers, loading: metLoading } = useSelector((s) => s.metier);

  const { isSharing, startTracking, stopTracking } = useGeolocate();

  // ── UI state ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState("disponibilite");
  const [geoError, setGeoError] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // ── Form state ────────────────────────────────────
  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [selectedMetierId, setSelectedMetierId] = useState("");
  const [siteWeb, setSiteWeb] = useState("");
  const [reseaux, setReseaux] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    linkedin: "",
    youtube: "",
  });

  // ── Chargement initial données ────────────────────
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMetiers());
  }, [dispatch]);

  // ── Pré-remplissage depuis userInfo ───────────────
  useEffect(() => {
    if (!userInfo) return;
    if (userInfo.categorieId) setSelectedCategorieId(userInfo.categorieId);
    if (userInfo.metierId) setSelectedMetierId(userInfo.metierId);
    if (userInfo.siteWeb) setSiteWeb(userInfo.siteWeb);
    if (userInfo.reseauxSociaux) {
      setReseaux((prev) => ({ ...prev, ...userInfo.reseauxSociaux }));
    }
  }, [userInfo]);

  // ── Clear success banner ──────────────────────────
  useEffect(() => {
    if (updateSuccess) {
      const t = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [updateSuccess, dispatch]);

  // ── Métiers filtrés par catégorie ─────────────────
  const metiersFiltres = selectedCategorieId
    ? metiers.filter(
        (m) =>
          m.isActive &&
          (m.categorieId === selectedCategorieId ||
            m.categorie?._id === selectedCategorieId),
      )
    : [];

  // Métier sélectionné (pour l'aperçu)
  const metierSelectionne = metiers.find((m) => m._id === selectedMetierId);

  // ── Handlers ──────────────────────────────────────
  const handleCategorieChange = (e) => {
    setSelectedCategorieId(e.target.value);
    setSelectedMetierId("");
  };

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
    dispatch(
      updateProfile({
        categorieId: selectedCategorieId,
        metierId: selectedMetierId,
        siteWeb,
        reseauxSociaux: reseaux,
      }),
    );
  };

  const renderStars = (note) =>
    note ? "★".repeat(Math.floor(note)) + (note % 1 >= 0.5 ? "½" : "") : "—";

  // ── Render ────────────────────────────────────────
  return (
    <div className="pd-root">
      {/* ── Geo error overlay ── */}
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

      {/* ── Header ── */}
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

      {/* ── Main ── */}
      <main className="pd-body">
        <h1 className="pd-welcome">
          Bonjour, <em>{userInfo?.prenom}</em> 👷
        </h1>

        <p className="pd-welcome-sub">
          {activeTab === "disponibilite"
            ? "Gérez votre disponibilité en temps réel"
            : "Complétez votre profil pour attirer plus de clients"}
        </p>

        {/* ════════════ TAB DISPONIBILITÉ ════════════ */}
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
                    {userInfo?.metierNom || "Non renseigné"}
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

        {/* ════════════ TAB PROFIL ════════════ */}
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

            {/* ── Section métier ── */}
            <section className="pd-form-section">
              <div className="pd-form-section-title">Votre métier</div>
              <div className="pd-form-section-sub">
                Sélectionnez votre catégorie puis votre métier
              </div>

              {/* Catégorie */}
              <div className="pd-field">
                <label className="pd-label">Catégorie</label>
                <div className="pd-input-wrap">
                  <span className="pd-input-icon">📂</span>
                  {catLoading ? (
                    <div className="pd-select-skeleton" />
                  ) : (
                    <select
                      className="pd-select"
                      value={selectedCategorieId}
                      onChange={handleCategorieChange}
                    >
                      <option value="">— Choisir une catégorie —</option>
                      {categories
                        .filter((c) => c.isActive)
                        .map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.nom}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Métier — affiché seulement si une catégorie est choisie */}
              {selectedCategorieId && (
                <div className="pd-field">
                  <label className="pd-label">Métier</label>
                  <div className="pd-input-wrap">
                    <span className="pd-input-icon">🔧</span>
                    {metLoading ? (
                      <div className="pd-select-skeleton" />
                    ) : metiersFiltres.length === 0 ? (
                      <span className="pd-no-metier">
                        Aucun métier disponible pour cette catégorie
                      </span>
                    ) : (
                      <select
                        className="pd-select"
                        value={selectedMetierId}
                        onChange={(e) => setSelectedMetierId(e.target.value)}
                      >
                        <option value="">— Choisir un métier —</option>
                        {metiersFiltres.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.nom}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Aperçu du métier sélectionné */}
                  {metierSelectionne && (
                    <div className="pd-metier-preview">
                      {metierSelectionne.icone && (
                        <span className="pd-metier-preview-icon">
                          {metierSelectionne.icone}
                        </span>
                      )}
                      <span className="pd-metier-preview-nom">
                        {metierSelectionne.nom}
                      </span>
                      {metierSelectionne.description && (
                        <p className="pd-metier-preview-desc">
                          {metierSelectionne.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ── Section infos pro ── */}
            <section className="pd-form-section">
              <div className="pd-form-section-title">
                Informations professionnelles
              </div>
              <div className="pd-form-section-sub">
                Ces informations apparaissent sur votre profil public
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

            {/* ── Section réseaux sociaux ── */}
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

      {/* ── Bottom nav mobile ── */}
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
