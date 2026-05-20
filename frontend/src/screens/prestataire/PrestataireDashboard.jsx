// src/screens/prestataire/PrestataireDashboard.jsx

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../logo.png";

import { logoutUser, updateProfile, clearUpdateSuccess } from "../../slices/authSlice";
import { fetchCategories } from "../../slices/categorieSlice";
import { fetchMetiers } from "../../slices/metierSlice";
import useGeolocate from "../../hooks/UseGeoLocate";
import "./PrestataireDashboard.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const RESEAUX = [
  { key: "facebook",  icon: "📘", label: "Facebook",   placeholder: "https://facebook.com/votrepage" },
  { key: "instagram", icon: "📸", label: "Instagram",  placeholder: "https://instagram.com/votreprofil" },
  { key: "twitter",   icon: "🐦", label: "Twitter / X",placeholder: "https://twitter.com/votreprofil" },
  { key: "tiktok",    icon: "🎵", label: "TikTok",     placeholder: "https://tiktok.com/@votreprofil" },
  { key: "linkedin",  icon: "💼", label: "LinkedIn",   placeholder: "https://linkedin.com/in/votreprofil" },
  { key: "youtube",   icon: "▶️", label: "YouTube",    placeholder: "https://youtube.com/@votrechaine" },
];

const TABS = [
  { key: "disponibilite", icon: "📍", label: "Disponibilité" },
  { key: "promotions",    icon: "🏷️", label: "Promotions" },
  { key: "profil",        icon: "✏️", label: "Mon profil" },
];

const BADGE_OPTIONS = [
  { value: "Tag",        icon: "🏷️", label: "Promotion" },
  { value: "Star",       icon: "⭐", label: "Offre spéciale" },
  { value: "Zap",        icon: "⚡", label: "Flash" },
  { value: "Gift",       icon: "🎁", label: "Cadeau" },
  { value: "Percent",    icon: "💯", label: "Réduction" },
  { value: "Flame",      icon: "🔥", label: "Populaire" },
  { value: "Clock",      icon: "⏰", label: "Limité" },
  { value: "BadgeCheck", icon: "✅", label: "Certifié" },
];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const getMetierCategorieId = (metier) => {
  if (!metier) return "";
  return getId(metier.categorieId) || getId(metier.categorie);
};

// ── Composant Toggle GPS ───────────────────────────────────────────────────────
const GpsToggle = ({ isTracked, loading, onToggle }) => (
  <div className="pd-gps-toggle-wrap">

    {/* Switch central GRAND */}
    <label
      className={[
        "pd-switch",
        isTracked ? "pd-switch--on"      : "",
        loading   ? "pd-switch--loading" : "",
      ].filter(Boolean).join(" ")}
      title={isTracked ? "Désactiver le partage GPS" : "Activer le partage GPS"}
    >
      <input
        type="checkbox"
        checked={isTracked}
        disabled={loading}
        onChange={onToggle}
      />
      <span className="pd-switch-track" />
      <span className="pd-switch-thumb">
        {loading ? null : (
          <span className="pd-switch-icon">
            {isTracked ? "📡" : "📍"}
          </span>
        )}
      </span>
    </label>

    {/* Texte état EN DESSOUS */}
    <div className={`pd-gps-toggle-label${isTracked ? " pd-gps-toggle-label--on" : ""}`}>
      <strong>{isTracked ? "Partage actif" : "Partage inactif"}</strong>
      <span>
        {isTracked
          ? "Vous êtes visible sur la carte"
          : "Vous êtes hors ligne"}
      </span>
    </div>

    {/* Pill de statut */}
    <span className={`pd-gps-status-text${isTracked ? " pd-gps-status-text--on" : ""}`}>
      <span className={`pd-gps-pulse${isTracked ? " pd-gps-pulse--on" : ""}`} />
      {loading
        ? "Mise à jour en cours…"
        : isTracked
          ? "Signal GPS diffusé en direct"
          : "Aucun signal émis"}
    </span>

  </div>
);


// ── Composant Tabs desktop ─────────────────────────────────────────────────────
const DesktopTabs = ({ activeTab, setActiveTab }) => (
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
      </button>
    ))}
  </div>
);

// ── Dashboard principal ────────────────────────────────────────────────────────
const PrestataireDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector((s) => s.auth);
  const { categories, loading: catLoading } = useSelector((s) => s.categorie);
  const { metiers,    loading: metLoading } = useSelector((s) => s.metier);
  const { isSharing, startTracking, stopTracking } = useGeolocate();

  const [activeTab,          setActiveTab]          = useState("disponibilite");
  const [geoError,           setGeoError]           = useState(null);
  const [trackingLoading,    setTrackingLoading]    = useState(false);
  const [selectedCategorieId,setSelectedCategorieId]= useState("");
  const [selectedMetierId,   setSelectedMetierId]   = useState("");
  const [siteWeb,            setSiteWeb]            = useState("");
  const [reseaux,            setReseaux]            = useState({
    facebook:"", instagram:"", twitter:"", tiktok:"", linkedin:"", youtube:""
  });

  // Promotions
  const [promotions,      setPromotions]      = useState([]);
  const [promoLoading,    setPromoLoading]    = useState(false);
  const [promoForm,       setPromoForm]       = useState(null);
  const [promoData,       setPromoData]       = useState({
    titre:"", description:"", badge:"Tag", dateDebut:"", dateFin:""
  });
  const [promoSaving,     setPromoSaving]     = useState(false);
  const [promoError,      setPromoError]      = useState(null);
  const [promoImgLoading, setPromoImgLoading] = useState({});
  const [favoriCount,     setFavoriCount]     = useState(0);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMetiers());
  }, [dispatch]);

  useEffect(() => {
    if (!userInfo) return;

    // Pré-remplir métier
    const metierActuel = userInfo.metiers?.[0];
    if (metierActuel) {
      const metierId = getId(metierActuel);
      setSelectedMetierId(metierId);
    }

    // Pré-remplir site web
    setSiteWeb(userInfo.siteWeb || "");

    // Pré-remplir réseaux
    if (userInfo.reseauxSociaux) {
      setReseaux(prev => ({ ...prev, ...userInfo.reseauxSociaux }));
    }

    // Favoris
    setFavoriCount(userInfo.favorisCount || 0);
  }, [userInfo]);

  // Pré-sélectionner la catégorie quand les métiers sont chargés
  useEffect(() => {
    if (!selectedMetierId || !metiers.length) return;
    const metier = metiers.find(m => m._id === selectedMetierId);
    if (metier) {
      const cid = getMetierCategorieId(metier);
      if (cid) setSelectedCategorieId(cid);
    }
  }, [metiers, selectedMetierId]);

  // Charger les promotions
  useEffect(() => {
    if (!userInfo?._id) return;
    const fetchPromos = async () => {
      setPromoLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/promotions/prestataire/${userInfo._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setPromotions(data);
      } catch (e) {
        console.error(e);
      } finally {
        setPromoLoading(false);
      }
    };
    fetchPromos();
  }, [userInfo?._id]);

  useEffect(() => {
    if (!updateSuccess) return;
    const t = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
    return () => clearTimeout(t);
  }, [updateSuccess, dispatch]);

  // ── Computed ──────────────────────────────────────────────────────────────
  const metiersFiltres = selectedCategorieId
    ? metiers.filter(m => {
        const cid = getMetierCategorieId(m);
        return m.isActive && cid === selectedCategorieId;
      })
    : [];
  const metierSelectionne = metiers.find(m => m._id === selectedMetierId);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
      const r = await startTracking();
      if (!r.ok) setGeoError(r.reason);
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
      metiers: selectedMetierId ? [selectedMetierId] : [],
      siteWeb,
      reseauxSociaux: reseaux,
    }));
  };

  // ── Promo handlers ────────────────────────────────────────────────────────
  const openNewPromo = () => {
    setPromoData({ titre:"", description:"", badge:"Tag", dateDebut:"", dateFin:"" });
    setPromoError(null);
    setPromoForm("new");
  };

  const openEditPromo = (promo) => {
    setPromoData({
      titre:       promo.titre || "",
      description: promo.description || "",
      badge:       promo.badge || "Tag",
      dateDebut:   promo.dateDebut ? promo.dateDebut.slice(0,10) : "",
      dateFin:     promo.dateFin   ? promo.dateFin.slice(0,10)   : "",
    });
    setPromoError(null);
    setPromoForm(promo._id);
  };

  const handleSavePromo = async () => {
    if (!promoData.titre.trim()) { setPromoError("Le titre est obligatoire."); return; }
    setPromoSaving(true);
    setPromoError(null);
    try {
      const isNew = promoForm === "new";
      const url   = isNew
        ? `${API_URL}/api/promotions`
        : `${API_URL}/api/promotions/${promoForm}`;
      const res = await fetch(url, {
        method:      isNew ? "POST" : "PUT",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify(promoData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");
      if (isNew) {
        setPromotions(prev => [data, ...prev]);
      } else {
        setPromotions(prev => prev.map(p => p._id === promoForm ? data : p));
      }
      setPromoForm(null);
    } catch (e) {
      setPromoError(e.message);
    } finally {
      setPromoSaving(false);
    }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    try {
      await fetch(`${API_URL}/api/promotions/${id}`, {
        method: "DELETE", credentials: "include",
      });
      setPromotions(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddImage = async (promoId, file) => {
    setPromoImgLoading(prev => ({ ...prev, [promoId]: true }));
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res  = await fetch(`${API_URL}/api/promotions/${promoId}/images`, {
        method: "POST", credentials: "include", body: fd,
      });
      const data = await res.json();
      if (res.ok) setPromotions(prev => prev.map(p => p._id === promoId ? data : p));
    } catch (e) {
      console.error(e);
    } finally {
      setPromoImgLoading(prev => ({ ...prev, [promoId]: false }));
    }
  };

  const handleDeleteImage = async (promoId, idx) => {
    try {
      const res  = await fetch(`${API_URL}/api/promotions/${promoId}/images/${idx}`, {
        method: "DELETE", credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setPromotions(prev => prev.map(p => p._id === promoId ? data : p));
    } catch (e) {
      console.error(e);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="pd-root">

      {/* ── Overlay erreur géo ── */}
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
                {[
                  "Cliquez sur le cadenas dans la barre d'adresse",
                  "Sélectionnez les autorisations du site",
                  "Passez la localisation sur autoriser",
                  "Rechargez la page et réessayez",
                ].map((s, i) => (
                  <div key={i} className="pd-geo-step">
                    <span className="pd-geo-step-num">{i + 1}.</span>
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              className="pd-geo-btn-primary"
              onClick={() => { setGeoError(null); window.location.reload(); }}
            >
              Recharger la page
            </button>
            <button
              type="button"
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
        <button className="pd-brand" type="button" onClick={() => navigate("/")}>
          <img src={logo} alt="Hopela" className="pd-logo-img" />
          <span className="pd-logo-name">Hopela</span>
          <span className="pd-badge-role">Pro</span>
        </button>

        <div className="pd-header-right">
          {favoriCount > 0 && (
            <div className="pd-favori-count">
              ❤️ <strong>{favoriCount}</strong>
            </div>
          )}
          <Link
            to={`/prestataire/${userInfo?._id}`}
            target="_blank"
            rel="noreferrer"
            className="pd-profile-btn"
          >
            👤 <span>Mon profil public</span>
          </Link>
          <button type="button" className="pd-logout-btn" onClick={handleLogout}>
            <span className="pd-logout-full">Déconnexion</span>
            <span className="pd-logout-short">⎋</span>
          </button>
        </div>
      </header>

      <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Body ── */}
      <main className="pd-body">
        <h1 className="pd-welcome">
          Bonjour, <em>{userInfo?.prenom}</em> 👷
        </h1>
        <p className="pd-welcome-sub">
          {activeTab === "disponibilite"
            ? "Activez ou désactivez votre visibilité sur la carte."
            : activeTab === "promotions"
              ? "Gérez vos offres et promotions."
              : "Complétez votre profil professionnel."}
        </p>

        {/* ══ ONGLET DISPONIBILITÉ ══════════════════════════════════════════ */}
        {activeTab === "disponibilite" && (
          <section className="pd-status-card">

            {/* Indicateur animé */}
            <div className={`pd-status-indicator ${isSharing ? "online" : "offline"}`}>
              {isSharing ? "📍" : "💤"}
            </div>

            <div className="pd-status-label">
              {isSharing ? "Vous êtes visible sur la carte" : "Vous êtes hors ligne"}
            </div>

            <p className="pd-status-sub">
              {isSharing
                ? "Votre position est actuellement partagée avec les clients autour de vous."
                : "Activez le partage GPS pour apparaître sur la carte et recevoir des demandes."}
            </p>

            {/* ✅ Toggle GPS — remplace l'ancien bouton */}
            <GpsToggle
              isTracked={isSharing}
              loading={trackingLoading}
              onToggle={handleToggleTracking}
            />

          </section>
        )}

        {/* ══ ONGLET PROMOTIONS ════════════════════════════════════════════ */}
        {activeTab === "promotions" && (
          <section className="pd-promo-section">

            {/* En-tête */}
            <div className="pd-section-head">
              <div>
                <div className="pd-section-title">Mes promotions & offres</div>
                <div className="pd-section-sub">
                  {promotions.length} / 5 promotion{promotions.length !== 1 ? "s" : ""}
                </div>
              </div>
              {promotions.length < 5 && (
                <button type="button" className="pd-btn-primary" onClick={openNewPromo}>
                  + Nouvelle offre
                </button>
              )}
            </div>

            {/* Erreur promo */}
            {promoError && (
              <div className="pd-alert error">⚠️ {promoError}</div>
            )}

            {/* Formulaire création / édition */}
            {promoForm && (
              <div className="pd-promo-form-card">
                <div className="pd-promo-form-title">
                  {promoForm === "new" ? "Nouvelle promotion" : "Modifier la promotion"}
                </div>

                <div className="pd-field">
                  <label className="pd-label">Titre *</label>
                  <div className="pd-input-wrap">
                    <input
                      className="pd-input"
                      type="text"
                      placeholder="Ex : -20% ce week-end"
                      maxLength={80}
                      value={promoData.titre}
                      onChange={e => setPromoData(p => ({ ...p, titre: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pd-field">
                  <label className="pd-label">Description</label>
                  <div className="pd-input-wrap">
                    <textarea
                      className="pd-input pd-textarea"
                      placeholder="Détaillez votre offre..."
                      maxLength={500}
                      rows={3}
                      value={promoData.description}
                      onChange={e => setPromoData(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pd-field">
                  <label className="pd-label">Badge</label>
                  <div className="pd-badge-grid">
                    {BADGE_OPTIONS.map(b => (
                      <button
                        key={b.value}
                        type="button"
                        className={`pd-badge-opt${promoData.badge === b.value ? " active" : ""}`}
                        onClick={() => setPromoData(p => ({ ...p, badge: b.value }))}
                      >
                        {b.icon} {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pd-promo-dates">
                  <div className="pd-field">
                    <label className="pd-label">Date de début</label>
                    <div className="pd-input-wrap">
                      <input
                        className="pd-input"
                        type="date"
                        value={promoData.dateDebut}
                        onChange={e => setPromoData(p => ({ ...p, dateDebut: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="pd-field">
                    <label className="pd-label">Date de fin</label>
                    <div className="pd-input-wrap">
                      <input
                        className="pd-input"
                        type="date"
                        value={promoData.dateFin}
                        onChange={e => setPromoData(p => ({ ...p, dateFin: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="pd-promo-form-actions">
                  <button
                    type="button"
                    className="pd-btn-ghost"
                    onClick={() => setPromoForm(null)}
                    disabled={promoSaving}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="pd-btn-primary"
                    onClick={handleSavePromo}
                    disabled={promoSaving}
                  >
                    {promoSaving ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              </div>
            )}

            {/* Liste promotions */}
            {promoLoading ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:"#5b7083" }}>
                Chargement…
              </div>
            ) : promotions.length === 0 ? (
              <div className="pd-promo-empty">
                <div className="pd-promo-empty-icon">🏷️</div>
                <p><strong>Aucune promotion pour l'instant</strong></p>
                <p>Créez votre première offre pour attirer plus de clients.</p>
              </div>
            ) : (
              <div className="pd-promo-list">
                {promotions.map(promo => {
                  const isExpired = promo.dateFin && new Date(promo.dateFin) < new Date();
                  const badge     = BADGE_OPTIONS.find(b => b.value === promo.badge);
                  return (
                    <article
                      key={promo._id}
                      className={`pd-promo-card${isExpired ? " expired" : ""}`}
                    >
                      <div className="pd-promo-card-head">
                        <span className="pd-promo-badge-label">
                          {badge?.icon} {badge?.label || promo.badge}
                        </span>
                        {isExpired && (
                          <span className="pd-promo-expired-tag">Expirée</span>
                        )}
                        <div className="pd-promo-card-actions">
                          <button
                            type="button"
                            className="pd-btn-icon"
                            onClick={() => openEditPromo(promo)}
                          >✏️</button>
                          <button
                            type="button"
                            className="pd-btn-icon pd-btn-icon--danger"
                            onClick={() => handleDeletePromo(promo._id)}
                          >🗑️</button>
                        </div>
                      </div>

                      <h4 className="pd-promo-titre">{promo.titre}</h4>
                      {promo.description && (
                        <p className="pd-promo-desc">{promo.description}</p>
                      )}
                      {(promo.dateDebut || promo.dateFin) && (
                        <p className="pd-promo-dates-display">
                          ⏰
                          {promo.dateDebut && ` Du ${new Date(promo.dateDebut).toLocaleDateString("fr-FR")}`}
                          {promo.dateFin   && ` au ${new Date(promo.dateFin).toLocaleDateString("fr-FR")}`}
                        </p>
                      )}

                      {/* Galerie images */}
                      <div className="pd-promo-gallery">
                        {promo.images?.map((img, idx) => (
                          <div key={idx} className="pd-promo-img-wrap">
                            <img src={`${API_URL}${img}`} alt={`Vue ${idx + 1}`} />
                            <button
                              type="button"
                              className="pd-promo-img-del"
                              onClick={() => handleDeleteImage(promo._id, idx)}
                            >✕</button>
                          </div>
                        ))}
                        {(!promo.images || promo.images.length < 3) && (
                          <label className="pd-promo-img-add">
                            {promoImgLoading[promo._id] ? "⏳" : "+ Photo"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display:"none" }}
                              onChange={e => {
                                if (e.target.files[0]) handleAddImage(promo._id, e.target.files[0]);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══ ONGLET PROFIL ════════════════════════════════════════════════ */}
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
                La catégorie sert uniquement à filtrer les métiers.
                Seul le métier est enregistré dans votre profil.
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
                      {categories.filter(cat => cat.isActive).map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.nom}</option>
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
                      <span className="pd-no-metier">
                        Aucun métier disponible pour cette catégorie.
                      </span>
                    ) : (
                      <select
                        className="pd-select"
                        value={selectedMetierId}
                        onChange={e => setSelectedMetierId(e.target.value)}
                        required
                      >
                        <option value="" disabled hidden>Choisir un métier</option>
                        {metiersFiltres.map(metier => (
                          <option key={metier._id} value={metier._id}>{metier.nom}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {metierSelectionne && (
                    <div className="pd-metier-preview">
                      {metierSelectionne.icone && (
                        <span className="pd-metier-preview-icon">{metierSelectionne.icone}</span>
                      )}
                      <span className="pd-metier-preview-nom">{metierSelectionne.nom}</span>
                      {metierSelectionne.description && (
                        <p className="pd-metier-preview-desc">{metierSelectionne.description}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Informations pro */}
            <section className="pd-form-section">
              <div className="pd-form-section-title">Informations professionnelles</div>
              <div className="pd-form-section-sub">
                Ces informations apparaissent sur votre profil public.
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
                    onChange={e => setSiteWeb(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Réseaux sociaux */}
            <section className="pd-form-section">
              <div className="pd-form-section-title">Réseaux sociaux</div>
              <div className="pd-form-section-sub">
                Ajoutez vos liens pour que vos clients vous retrouvent facilement.
              </div>

              <div className="pd-social-list">
                {RESEAUX.map(({ key, icon, label, placeholder }) => (
                  <div key={key} className="pd-field">
                    <label className="pd-label">{icon} {label}</label>
                    <div className="pd-input-wrap">
                      <input
                        type="url"
                        className="pd-input"
                        placeholder={placeholder}
                        value={reseaux[key]}
                        onChange={e => setReseaux(prev => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              className="pd-save-btn pd-toggle-btn"
              disabled={updateLoading}
            >
              {updateLoading
                ? <><span className="pd-spinner" /> Enregistrement…</>
                : "💾 Sauvegarder le profil"}
            </button>
          </form>
        )}
      </main>

      {/* ── Bottom nav mobile ── */}
      <nav className="pd-bottom-nav">
        {TABS.map(({ key, icon, label }) => (
          <button
            key={key}
            type="button"
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
