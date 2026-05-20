// src/screens/prestataire/PrestataireDashboard.jsx

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../logo.png";

import {
  logoutUser,
  updateProfile,
  clearUpdateSuccess,
} from "../../slices/authSlice";

import { fetchCategories } from "../../slices/categorieSlice";
import { fetchMetiers } from "../../slices/metierSlice";
import {
  fetchMesPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  addImagePromotion,
  deleteImagePromotion,
  clearPromotionError,
} from "../../slices/promotionSlice";
import { fetchFavoriCount } from "../../slices/favoriSlice";

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

const PrestataireDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector(
    (s) => s.auth,
  );

  const { categories, loading: catLoading } = useSelector((s) => s.categorie);
  const { metiers, loading: metLoading } = useSelector((s) => s.metier);
  const { mesPromotions, actionError: promoError, actionSuccess: promoSuccess } = useSelector((s) => s.promotion);
  const favoriCount = useSelector((s) => s.favori.favoriCounts[userInfo?._id] ?? 0);

  const { isSharing, startTracking, stopTracking } = useGeolocate();

  const [activeTab, setActiveTab] = useState("disponibilite");
  const [geoError, setGeoError] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [selectedMetierId, setSelectedMetierId] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  // Promotions state
  const [promoForm, setPromoForm]       = useState(null); // null | "new" | promoId
  const [promoData, setPromoData]       = useState({ titre: "", description: "", badge: "Tag", dateDebut: "", dateFin: "" });
  const [promoSaving, setPromoSaving]   = useState(false);
  const [promoImgLoading, setPromoImgLoading] = useState({});

  const [reseaux, setReseaux] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    linkedin: "",
    youtube: "",
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMetiers());
    dispatch(fetchMesPromotions());
    if (userInfo?._id) dispatch(fetchFavoriCount(userInfo._id));
  }, [dispatch]);

  useEffect(() => {
    if (!userInfo) return;

    const firstMetier = userInfo.metiers?.[0];
    const metierId = getId(firstMetier);

    setSelectedMetierId(metierId);
    setSiteWeb(userInfo.siteWeb || "");

    if (userInfo.reseauxSociaux) {
      setReseaux((prev) => ({
        ...prev,
        ...userInfo.reseauxSociaux,
      }));
    }
  }, [userInfo]);

  useEffect(() => {
    if (!selectedMetierId || metiers.length === 0) return;

    const metierComplet = metiers.find((m) => m._id === selectedMetierId);
    const categorieId = getMetierCategorieId(metierComplet);

    if (categorieId) {
      setSelectedCategorieId(categorieId);
    }
  }, [selectedMetierId, metiers]);

  useEffect(() => {
    if (!updateSuccess) return;

    const timer = setTimeout(() => {
      dispatch(clearUpdateSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [updateSuccess, dispatch]);

  const metiersFiltres = selectedCategorieId
    ? metiers.filter((m) => {
        const categorieId = getMetierCategorieId(m);

        return m.isActive && categorieId === selectedCategorieId;
      })
    : [];

  const metierSelectionne = metiers.find((m) => m._id === selectedMetierId);

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

      if (!result.ok) {
        setGeoError(result.reason);
      }
    }

    setTrackingLoading(false);
  };

  const handleLogout = async () => {
    if (isSharing) {
      stopTracking();
    }

    await dispatch(logoutUser());
    navigate("/");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();

    dispatch(
      updateProfile({
        metiers: selectedMetierId ? [selectedMetierId] : [],
        siteWeb,
        reseauxSociaux: reseaux,
      }),
    );
  };

  // ── Promotion handlers ──────────────────────────────────────────────────────
  const openNewPromo = () => {
    setPromoData({ titre: "", description: "", badge: "Tag", dateDebut: "", dateFin: "" });
    setPromoForm("new");
  };

  const openEditPromo = (promo) => {
    setPromoData({
      titre:       promo.titre       || "",
      description: promo.description || "",
      badge:       promo.badge       || "Tag",
      dateDebut:   promo.dateDebut ? promo.dateDebut.slice(0, 10) : "",
      dateFin:     promo.dateFin   ? promo.dateFin.slice(0, 10)   : "",
    });
    setPromoForm(promo._id);
  };

  const handleSavePromo = async () => {
    if (!promoData.titre.trim()) return;
    setPromoSaving(true);
    const payload = {
      titre:       promoData.titre,
      description: promoData.description || null,
      badge:       promoData.badge,
      dateDebut:   promoData.dateDebut || null,
      dateFin:     promoData.dateFin   || null,
    };
    if (promoForm === "new") {
      await dispatch(createPromotion(payload));
    } else {
      await dispatch(updatePromotion({ id: promoForm, ...payload }));
    }
    setPromoSaving(false);
    setPromoForm(null);
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    dispatch(deletePromotion(id));
  };

  const handleAddImage = async (promoId, file) => {
    const fd = new FormData();
    fd.append("image", file);
    setPromoImgLoading((p) => ({ ...p, [promoId]: true }));
    await dispatch(addImagePromotion({ id: promoId, formData: fd }));
    setPromoImgLoading((p) => ({ ...p, [promoId]: false }));
  };

  const handleDeleteImage = (promoId, idx) => {
    dispatch(deleteImagePromotion({ id: promoId, imageIndex: idx }));
  };

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
              type="button"
              className="pd-geo-btn-primary"
              onClick={() => {
                setGeoError(null);
                window.location.reload();
              }}
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

        <div className="pd-header-right">
          {favoriCount > 0 && (
            <div className="pd-favori-count" title="Personnes qui vous ont ajouté en favori">
              ❤️ <strong>{favoriCount}</strong>
            </div>
          )}
          <Link
            to={`/prestataire/${userInfo?._id}`}
            className="pd-profile-btn"
            target="_blank"
            rel="noreferrer"
          >
            👤 Mon profil public
          </Link>
          <button type="button" className="pd-logout-btn" onClick={handleLogout}>
            <span className="pd-logout-full">Déconnexion</span>
            <span className="pd-logout-short">⎋</span>
          </button>
        </div>
      </header>

      <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pd-body">
        <h1 className="pd-welcome">
          Bonjour, <em>{userInfo?.prenom}</em> 👷
        </h1>

        <p className="pd-welcome-sub">
          {activeTab === "disponibilite"
            ? "Activez ou désactivez votre visibilité sur la carte."
            : "Complétez votre profil professionnel."}
        </p>

        {activeTab === "disponibilite" && (
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
                ? isSharing
                  ? "⏳ Arrêt en cours..."
                  : "⏳ Démarrage..."
                : isSharing
                  ? "⏹ Arrêter le partage"
                  : "▶ Démarrer le partage"}
            </button>
          </section>
        )}

        {activeTab === "promotions" && (
          <section className="pd-promo-section">
            <div className="pd-section-head">
              <div>
                <div className="pd-section-title">Mes promotions & offres</div>
                <div className="pd-section-sub">{mesPromotions.length} / 5 promotion{mesPromotions.length !== 1 ? "s" : ""}</div>
              </div>
              {mesPromotions.length < 5 && (
                <button type="button" className="pd-btn-primary" onClick={openNewPromo}>
                  + Nouvelle offre
                </button>
              )}
            </div>

            {promoError && <div className="pd-alert error">⚠️ {promoError}</div>}

            {/* Formulaire création/édition */}
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
                      placeholder="Ex : -20% sur toutes les prestations ce week-end"
                      value={promoData.titre}
                      maxLength={80}
                      onChange={(e) => setPromoData((p) => ({ ...p, titre: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pd-field">
                  <label className="pd-label">Description</label>
                  <div className="pd-input-wrap">
                    <textarea
                      className="pd-input pd-textarea"
                      placeholder="Détaillez votre offre..."
                      value={promoData.description}
                      maxLength={500}
                      rows={3}
                      onChange={(e) => setPromoData((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="pd-field">
                  <label className="pd-label">Badge</label>
                  <div className="pd-badge-grid">
                    {BADGE_OPTIONS.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        className={`pd-badge-opt${promoData.badge === b.value ? " active" : ""}`}
                        onClick={() => setPromoData((p) => ({ ...p, badge: b.value }))}
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
                        onChange={(e) => setPromoData((p) => ({ ...p, dateDebut: e.target.value }))}
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
                        onChange={(e) => setPromoData((p) => ({ ...p, dateFin: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="pd-promo-form-actions">
                  <button
                    type="button"
                    className="pd-btn-ghost"
                    onClick={() => setPromoForm(null)}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="pd-btn-primary"
                    onClick={handleSavePromo}
                    disabled={promoSaving || !promoData.titre.trim()}
                  >
                    {promoSaving ? "Enregistrement..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            )}

            {/* Liste des promotions */}
            {mesPromotions.length === 0 && !promoForm ? (
              <div className="pd-promo-empty">
                <div className="pd-promo-empty-icon">🏷️</div>
                <p>Aucune promotion pour l'instant.</p>
                <p>Créez votre première offre pour attirer des clients !</p>
              </div>
            ) : (
              <div className="pd-promo-list">
                {mesPromotions.map((promo) => {
                  const badge = BADGE_OPTIONS.find((b) => b.value === promo.badge);
                  const isExpired = promo.dateFin && new Date(promo.dateFin) < new Date();
                  return (
                    <article key={promo._id} className={`pd-promo-card${isExpired ? " expired" : ""}`}>
                      <div className="pd-promo-card-head">
                        <span className="pd-promo-badge-label">
                          {badge?.icon} {badge?.label || promo.badge}
                        </span>
                        {isExpired && <span className="pd-promo-expired-tag">Expirée</span>}
                        <div className="pd-promo-card-actions">
                          <button
                            type="button"
                            className="pd-btn-icon"
                            onClick={() => openEditPromo(promo)}
                            title="Modifier"
                          >✏️</button>
                          <button
                            type="button"
                            className="pd-btn-icon pd-btn-icon--danger"
                            onClick={() => handleDeletePromo(promo._id)}
                            title="Supprimer"
                          >🗑️</button>
                        </div>
                      </div>

                      <h4 className="pd-promo-titre">{promo.titre}</h4>
                      {promo.description && <p className="pd-promo-desc">{promo.description}</p>}

                      {(promo.dateDebut || promo.dateFin) && (
                        <p className="pd-promo-dates-display">
                          ⏰{" "}
                          {promo.dateDebut && `Du ${new Date(promo.dateDebut).toLocaleDateString("fr-FR")}`}
                          {promo.dateFin && ` au ${new Date(promo.dateFin).toLocaleDateString("fr-FR")}`}
                        </p>
                      )}

                      {/* Galerie images */}
                      <div className="pd-promo-gallery">
                        {promo.images?.map((img, idx) => (
                          <div key={idx} className="pd-promo-img-wrap">
                            <img src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${img}`} alt={`Vue ${idx + 1}`} />
                            <button
                              type="button"
                              className="pd-promo-img-del"
                              onClick={() => handleDeleteImage(promo._id, idx)}
                            >✕</button>
                          </div>
                        ))}
                        {(!promo.images || promo.images.length < 3) && (
                          <label className="pd-promo-img-add" title="Ajouter une photo">
                            {promoImgLoading[promo._id] ? "⏳" : "+ Photo"}
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: "none" }}
                              onChange={(e) => {
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
              <div className="pd-form-section-title">Votre métier</div>

              <div className="pd-form-section-sub">
                La catégorie sert uniquement à filtrer les métiers. Seul le
                métier est enregistré dans votre profil.
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
                      <option value="" disabled hidden>
                        Choisir une catégorie
                      </option>

                      {categories
                        .filter((cat) => cat.isActive)
                        .map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.nom}
                          </option>
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
                        onChange={(e) => setSelectedMetierId(e.target.value)}
                        required
                      >
                        <option value="" disabled hidden>
                          Choisir un métier
                        </option>

                        {metiersFiltres.map((metier) => (
                          <option key={metier._id} value={metier._id}>
                            {metier.nom}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

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

            <section className="pd-form-section">
              <div className="pd-form-section-title">
                Informations professionnelles
              </div>

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
                    onChange={(e) => setSiteWeb(e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="pd-form-section">
              <div className="pd-form-section-title">Réseaux sociaux</div>

              <div className="pd-form-section-sub">
                Ajoutez vos liens pour que les clients vous retrouvent.
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
              disabled={updateLoading || !selectedMetierId}
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