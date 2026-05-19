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
import { fetchMetiers }    from "../../slices/metierSlice";

import {
  fetchDemandesPrestataire,
} from "../../slices/demandeSlice";

import useGeolocate from "../../hooks/UseGeoLocate";
import "./PrestataireDashboard.scss";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const RESEAUX = [
  { key: "facebook",  icon: "📘", label: "Facebook",  placeholder: "https://facebook.com/votrepage"      },
  { key: "instagram", icon: "📸", label: "Instagram", placeholder: "https://instagram.com/votreprofil"   },
  { key: "twitter",   icon: "🐦", label: "Twitter / X", placeholder: "https://twitter.com/votreprofil"  },
  { key: "tiktok",    icon: "🎵", label: "TikTok",    placeholder: "https://tiktok.com/@votreprofil"     },
  { key: "linkedin",  icon: "💼", label: "LinkedIn",  placeholder: "https://linkedin.com/in/votreprofil" },
  { key: "youtube",   icon: "▶️", label: "YouTube",   placeholder: "https://youtube.com/@votrechaine"   },
];

const TABS = [
  { key: "disponibilite", icon: "📍", label: "Disponibilité" },
  { key: "demandes",      icon: "📣", label: "Besoins"       },
  { key: "profil",        icon: "✏️", label: "Mon profil"   },
];

const STATUT_CONFIG = {
  active:   { label: "Active",   color: "green" },
  expiree:  { label: "Expirée",  color: "grey"  },
  annulee:  { label: "Annulée",  color: "red"   },
  cloturee: { label: "Clôturée", color: "blue"  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const getMetierCategorieId = (metier) => {
  if (!metier) return "";
  return getId(metier.categorieId) || getId(metier.categorie);
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
};

const getTimeLeft = (expireAt) => {
  if (!expireAt) return null;
  const diff = new Date(expireAt) - new Date();
  if (diff <= 0) return "Expirée";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `Expire dans ${h}h${m > 0 ? ` ${m}min` : ""}`;
  return `Expire dans ${m}min`;
};

const formatDistance = (metres) => {
  if (metres == null) return null;
  if (metres < 1000) return `${Math.round(metres)} m`;
  return `${(metres / 1000).toFixed(1)} km`;
};

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANT — DemandeCard (prestataire)
// ─────────────────────────────────────────────────────────────────────────────

const DemandeCard = ({ demande }) => {
  const cfg      = STATUT_CONFIG[demande.statut] || STATUT_CONFIG.active;
  const timeLeft = getTimeLeft(demande.expireAt);
  const distance = formatDistance(demande.distanceMetres);

  return (
    <article className={`pd-demande-card pd-demande-card--${cfg.color}`}>

      {/* Header */}
      <div className="pd-demande-header">
        <div className="pd-demande-meta-row">
          <span className={`pd-demande-statut pd-demande-statut--${cfg.color}`}>
            {cfg.label}
          </span>
          {distance && (
            <span className="pd-demande-distance">📍 {distance}</span>
          )}
          {timeLeft && (
            <span className="pd-demande-expire">{timeLeft}</span>
          )}
        </div>

        <div className="pd-demande-tags">
          {demande.categorie?.nom && (
            <span className="pd-demande-tag">{demande.categorie.nom}</span>
          )}
          {demande.metier?.nom && (
            <span className="pd-demande-tag pd-demande-tag--metier">
              {demande.metier.nom}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="pd-demande-desc">"{demande.description}"</p>

      {/* Localisation */}
      {demande.location?.coordinates && (
        <div className="pd-demande-loc">
          📌{" "}
          {demande.location.adresse
            ? demande.location.adresse
            : `${demande.location.coordinates[1]?.toFixed(4)}, ${demande.location.coordinates[0]?.toFixed(4)}`}
        </div>
      )}

      {/* Date */}
      <div className="pd-demande-date">
        Publiée le {formatDate(demande.createdAt)}
      </div>

      {/* CTA — contact direct */}
      <div className="pd-demande-cta">
        <a
          href={`tel:${demande.telephoneContact}`}
          className="pd-demande-call-btn"
        >
          📞 Appeler le client
        </a>
      </div>
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANT — DesktopTabs
// ─────────────────────────────────────────────────────────────────────────────

const DesktopTabs = ({ activeTab, setActiveTab, nbDemandes }) => (
  <div className="pd-desktop-tabs">
    {TABS.map(({ key, icon, label }) => (
      <button
        key={key}
        type="button"
        className={`pd-desktop-tab${activeTab === key ? " active" : ""}`}
        onClick={() => setActiveTab(key)}
      >
        <span>{icon}</span>
        {label}
        {key === "demandes" && nbDemandes > 0 && (
          <span className="pd-tab-badge">{nbDemandes}</span>
        )}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

const PrestataireDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Selectors ──────────────────────────────────────
  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector(
    (s) => s.auth,
  );
  const { categories, loading: catLoading } = useSelector((s) => s.categorie);
  const { metiers,    loading: metLoading } = useSelector((s) => s.metier);

  const {
    demandesListe,
    loading:       demandeLoading,
    error:         demandeError,
  } = useSelector((s) => s.demande);

  const { isSharing, startTracking, stopTracking } = useGeolocate();

  // ── State local ────────────────────────────────────
  const [activeTab,           setActiveTab]           = useState("disponibilite");
  const [geoError,            setGeoError]            = useState(null);
  const [trackingLoading,     setTrackingLoading]     = useState(false);
  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [selectedMetierId,    setSelectedMetierId]    = useState("");
  const [siteWeb,             setSiteWeb]             = useState("");
  const [reseaux,             setReseaux]             = useState({
    facebook: "", instagram: "", twitter: "",
    tiktok: "",  linkedin:  "", youtube: "",
  });

  // ── Effects ────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMetiers());
    dispatch(fetchDemandesPrestataire());
  }, [dispatch]);

  useEffect(() => {
    if (!userInfo) return;
    const firstMetier = userInfo.metiers?.[0];
    setSelectedMetierId(getId(firstMetier));
    setSiteWeb(userInfo.siteWeb || "");
    if (userInfo.reseauxSociaux) {
      setReseaux((prev) => ({ ...prev, ...userInfo.reseauxSociaux }));
    }
  }, [userInfo]);

  useEffect(() => {
    if (!selectedMetierId || metiers.length === 0) return;
    const metierComplet = metiers.find((m) => m._id === selectedMetierId);
    const categorieId   = getMetierCategorieId(metierComplet);
    if (categorieId) setSelectedCategorieId(categorieId);
  }, [selectedMetierId, metiers]);

  useEffect(() => {
    if (!updateSuccess) return;
    const t = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
    return () => clearTimeout(t);
  }, [updateSuccess, dispatch]);

  // Rafraîchit les demandes quand on arrive sur l'onglet
  useEffect(() => {
    if (activeTab === "demandes") {
      dispatch(fetchDemandesPrestataire());
    }
  }, [activeTab, dispatch]);

  // ── Données dérivées ───────────────────────────────
  const metiersFiltres = selectedCategorieId
    ? metiers.filter((m) => {
        const catId = getMetierCategorieId(m);
        return m.isActive && catId === selectedCategorieId;
      })
    : [];

  const metierSelectionne = metiers.find((m) => m._id === selectedMetierId);

  // Tri par distance si disponible, sinon par date
  const demandesTriees = [...demandesListe].sort((a, b) => {
    if (a.distanceMetres != null && b.distanceMetres != null) {
      return a.distanceMetres - b.distanceMetres;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

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
    dispatch(updateProfile({
      metiers:        selectedMetierId ? [selectedMetierId] : [],
      siteWeb,
      reseauxSociaux: reseaux,
    }));
  };

  // ─────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────

  return (
    <div className="pd-root">

      {/* ── Popup geo erreur ── */}
      {geoError && (
        <div className="pd-geo-overlay" onClick={() => setGeoError(null)}>
          <div className="pd-geo-popup" onClick={(e) => e.stopPropagation()}>
            <div className="pd-geo-icon">📍</div>
            <div className="pd-geo-title">
              {geoError === "unsupported" ? "GPS non supporté" : "Géolocalisation désactivée"}
            </div>
            <div className="pd-geo-text">
              {geoError === "unsupported"
                ? "Votre navigateur ne supporte pas la géolocalisation."
                : "Autorisez l'accès à votre localisation pour apparaître sur la carte."}
            </div>
            {geoError === "denied" && (
              <div className="pd-geo-steps">
                <div className="pd-geo-step"><span className="pd-geo-step-num">1.</span><span>Cliquez sur le cadenas dans la barre d'adresse</span></div>
                <div className="pd-geo-step"><span className="pd-geo-step-num">2.</span><span>Sélectionnez les autorisations du site</span></div>
                <div className="pd-geo-step"><span className="pd-geo-step-num">3.</span><span>Passez la localisation sur autoriser</span></div>
                <div className="pd-geo-step"><span className="pd-geo-step-num">4.</span><span>Rechargez la page et réessayez</span></div>
              </div>
            )}
            <button type="button" className="pd-geo-btn-primary" onClick={() => { setGeoError(null); window.location.reload(); }}>
              Recharger la page
            </button>
            <button type="button" className="pd-geo-btn-secondary" onClick={() => setGeoError(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="pd-header">
        <button className="pd-brand" type="button" onClick={() => navigate("/")}>
          <img src={logo} alt="Hopela" className="pd-logo-img" />
          <span className="pd-logo-name">Hopela</span>
          <span className="pd-badge-role">Pro</span>
        </button>

        <button type="button" className="pd-logout-btn" onClick={handleLogout}>
          <span className="pd-logout-full">Déconnexion</span>
          <span className="pd-logout-short">⎋</span>
        </button>
      </header>

      {/* ── Onglets desktop ── */}
      <DesktopTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nbDemandes={demandesTriees.length}
      />

      {/* ── Corps ── */}
      <main className="pd-body">
        <h1 className="pd-welcome">
          Bonjour, <em>{userInfo?.prenom}</em> 👷
        </h1>
        <p className="pd-welcome-sub">
          {activeTab === "disponibilite" && "Activez ou désactivez votre visibilité sur la carte."}
          {activeTab === "demandes"      && "Demandes de clients pour votre métier, triées par distance."}
          {activeTab === "profil"        && "Complétez votre profil professionnel."}
        </p>

        {/* ══════════════ ONGLET DISPONIBILITÉ ══════════════ */}
        {activeTab === "disponibilite" && (
          <section className="pd-status-card">
            <div className={`pd-status-indicator ${isSharing ? "online" : "offline"}`}>
              {isSharing ? "📍" : "💤"}
            </div>
            <div className="pd-status-label">
              {isSharing ? "Vous êtes visible sur la carte" : "Vous êtes hors ligne"}
            </div>
            <p className="pd-status-sub">
              {isSharing
                ? "Votre position est actuellement partagée avec les clients autour de vous."
                : "Démarrez le partage pour apparaître sur la carte et recevoir des demandes."}
            </p>
            <button
              type="button"
              className={`pd-toggle-btn ${isSharing ? "stop" : "start"}`}
              onClick={handleToggleTracking}
              disabled={trackingLoading}
            >
              {trackingLoading
                ? isSharing ? "⏳ Arrêt en cours..." : "⏳ Démarrage..."
                : isSharing ? "⏹ Arrêter le partage" : "▶ Démarrer le partage"}
            </button>
          </section>
        )}

        {/* ══════════════ ONGLET DEMANDES ══════════════ */}
        {activeTab === "demandes" && (
          <div className="pd-demandes-wrap">

            {/* Entête compteur */}
            <div className="pd-demandes-head">
              <span className="pd-demandes-count">
                {demandesTriees.length} demande{demandesTriees.length !== 1 ? "s" : ""} active{demandesTriees.length !== 1 ? "s" : ""}
              </span>
              <button
                className="pd-demandes-refresh"
                onClick={() => dispatch(fetchDemandesPrestataire())}
                disabled={demandeLoading}
                title="Rafraîchir"
              >
                {demandeLoading ? "⏳" : "🔄"}
              </button>
            </div>

            {/* Erreur */}
            {demandeError && (
              <div className="pd-alert error">⚠️ {demandeError}</div>
            )}

            {/* Chargement */}
            {demandeLoading && demandesTriees.length === 0 && (
              <div className="pd-demandes-empty">
                <div className="pd-demandes-empty-icon">⏳</div>
                Chargement…
              </div>
            )}

            {/* Vide */}
            {!demandeLoading && demandesTriees.length === 0 && !demandeError && (
              <div className="pd-demandes-empty">
                <div className="pd-demandes-empty-icon">📭</div>
                Aucune demande active pour votre métier.
                <span>Revenez plus tard ou activez votre visibilité sur la carte.</span>
              </div>
            )}

            {/* Liste des cards */}
            {demandesTriees.length > 0 && (
              <div className="pd-demandes-list">
                {demandesTriees.map((d) => (
                  <DemandeCard key={d._id} demande={d} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ ONGLET PROFIL ══════════════ */}
        {activeTab === "profil" && (
          <form onSubmit={handleSaveProfile}>
            {updateSuccess && (
              <div className="pd-alert success">✅ Profil mis à jour avec succès !</div>
            )}
            {updateError && (
              <div className="pd-alert error">⚠️ {updateError}</div>
            )}

            {/* Métier */}
            <section className="pd-form-section">
              <div className="pd-form-section-title">Votre métier</div>
              <div className="pd-form-section-sub">
                La catégorie sert uniquement à filtrer les métiers. Seul le métier est enregistré dans votre profil.
              </div>

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
                      required
                    >
                      <option value="" disabled hidden>Choisir une catégorie</option>
                      {categories.filter((c) => c.isActive).map((c) => (
                        <option key={c._id} value={c._id}>{c.nom}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {selectedCategorieId && (
                <div className="pd-field">
                  <label className="pd-label">Métier</label>
                  <div className="pd-input-wrap">
                    <span className="pd-input-icon">🔧</span>
                    {metLoading ? (
                      <div className="pd-select-skeleton" />
                    ) : metiersFiltres.length === 0 ? (
                      <span className="pd-no-metier">Aucun métier disponible pour cette catégorie.</span>
                    ) : (
                      <select
                        className="pd-select"
                        value={selectedMetierId}
                        onChange={(e) => setSelectedMetierId(e.target.value)}
                        required
                      >
                        <option value="" disabled hidden>Choisir un métier</option>
                        {metiersFiltres.map((m) => (
                          <option key={m._id} value={m._id}>{m.nom}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {metierSelectionne && (
                    <div className="pd-metier-preview">
                      <span className="pd-metier-preview-nom">{metierSelectionne.nom}</span>
                      {metierSelectionne.description && (
                        <p className="pd-metier-preview-desc">{metierSelectionne.description}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Infos pro */}
            <section className="pd-form-section">
              <div className="pd-form-section-title">Informations professionnelles</div>
              <div className="pd-form-section-sub">Ces informations apparaissent sur votre profil public.</div>

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

            {/* Réseaux sociaux */}
            <section className="pd-form-section">
              <div className="pd-form-section-title">Réseaux sociaux</div>
              <div className="pd-form-section-sub">Ajoutez vos liens pour que les clients vous retrouvent.</div>

              <div className="pd-social-list">
                {RESEAUX.map(({ key, icon, label, placeholder }) => (
                  <div key={key} className="pd-field">
                    <label className="pd-label">{icon} {label}</label>
                    <div className="pd-input-wrap">
                      <span className="pd-input-icon">{icon}</span>
                      <input
                        type="url"
                        className="pd-input"
                        placeholder={placeholder}
                        value={reseaux[key]}
                        onChange={(e) =>
                          setReseaux((prev) => ({ ...prev, [key]: e.target.value }))
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
              disabled={updateLoading || !selectedMetierId}
            >
              {updateLoading && <span className="pd-spinner" />}
              {updateLoading ? "Enregistrement..." : "💾 Sauvegarder le profil"}
            </button>
          </form>
        )}
      </main>

      {/* ── Bottom nav mobile — 3 onglets ── */}
      <nav className="pd-bottom-nav">
        {TABS.map(({ key, icon, label }) => (
          <button
            key={key}
            type="button"
            className={`pd-nav-btn${activeTab === key ? " active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="pd-nav-icon-wrap">
              {icon}
              {key === "demandes" && demandesTriees.length > 0 && (
                <span className="pd-nav-badge">{demandesTriees.length}</span>
              )}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PrestataireDashboard;