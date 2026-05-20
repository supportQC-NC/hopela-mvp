// src/screens/user/UserDashboard.jsx

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../logo.png";

import { logout, updateProfile, clearUpdateSuccess } from "../../slices/authSlice";
import {
  fetchSavedLocations,
  addSavedLocation,
  updateSavedLocation,
  deleteSavedLocation,
  setDefaultSavedLocation,
  updateRayon,
  setActiveSource,
  syncRayonFromProfile,
  fetchPrestatairesPositions,
  fetchPrestatairesPublic,
  setGpsPosition,
} from "../../slices/locationSlice";
import { fetchMesFavoris, removeFavori } from "../../slices/favoriSlice";

import PublicMap from "../../components/map/PublicMap";
import "./userDashboard.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LABEL_ICONS = {
  Domicile: "🏠",
  Bureau: "🏢",
  Travail: "💼",
  École: "🎓",
  Gym: "💪",
  default: "📍",
};

const METIER_ICONS = {
  Électricien: "⚡",
  Plombier: "🔧",
  Menuisier: "🪚",
  Peintre: "🎨",
  Jardinier: "🌿",
  Climatisation: "❄️",
  "Femme de ménage": "🧹",
  Maçon: "🧱",
  Photographe: "📸",
  Carreleur: "🔲",
  "Garde d'enfants": "👶",
  Informaticien: "💻",
  Coursier: "🛵",
};

const getIcon = (label) => LABEL_ICONS[label] || LABEL_ICONS.default;
const getMetierIcon = (metier) => METIER_ICONS[metier] || "📍";

const RAYON_MIN = 1;
const RAYON_MAX = 100;

const LocationForm = ({ initial, onSave, onClose, loading, error }) => {
  const [label, setLabel] = useState(initial?.label || "");
  const [longitude, setLongitude] = useState(
    initial?.longitude?.toString() || "",
  );
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() || "");
  const [adresse, setAdresse] = useState(initial?.adresse || "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault || false);
  const [gpsStatus, setGpsStatus] = useState("");

  const fillWithGps = () => {
    setGpsStatus("Localisation en cours…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLongitude(pos.coords.longitude.toFixed(6));
        setLatitude(pos.coords.latitude.toFixed(6));
        setGpsStatus("✓ Position GPS capturée");
        setTimeout(() => setGpsStatus(""), 2000);
      },
      () => setGpsStatus("❌ GPS non disponible"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleSubmit = () => {
    if (!label.trim() || !longitude || !latitude) return;

    onSave({
      label: label.trim(),
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
      adresse: adresse.trim() || null,
      isDefault,
      ...(initial?._id ? { locationId: initial._id } : {}),
    });
  };

  return (
    <div
      className="ud-form-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="ud-form-sheet">
        <div className="ud-form-handle" />

        <div className="ud-form-title">
          {initial?._id ? "Modifier l'adresse" : "Nouvelle adresse"}
        </div>

        {error && <div className="ud-error">{error}</div>}

        <div className="ud-field">
          <label className="ud-label">Nom de l'adresse *</label>
          <input
            className="ud-input"
            placeholder="Ex : Domicile, Bureau, Chez Maman…"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={50}
          />
        </div>

        <button className="ud-gps-btn" onClick={fillWithGps} type="button">
          📍 {gpsStatus || "Utiliser ma position GPS actuelle"}
        </button>

        <div className="ud-row">
          <div className="ud-field">
            <label className="ud-label">Longitude *</label>
            <input
              className="ud-input"
              type="number"
              step="any"
              placeholder="166.4580"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>

          <div className="ud-field">
            <label className="ud-label">Latitude *</label>
            <input
              className="ud-input"
              type="number"
              step="any"
              placeholder="-22.2760"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
        </div>

        <div className="ud-field">
          <label className="ud-label">Adresse lisible</label>
          <input
            className="ud-input"
            placeholder="Ex : 12 rue des Fleurs, Nouméa"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />
        </div>

        <label className="ud-checkbox-row">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <span className="ud-checkbox-label">
            Définir comme adresse par défaut
          </span>
        </label>

        <div className="ud-form-actions">
          <button className="ud-btn-cancel" onClick={onClose}>
            Annuler
          </button>

          <button
            className="ud-btn-save"
            onClick={handleSubmit}
            disabled={loading || !label.trim() || !longitude || !latitude}
          >
            {loading ? "Enregistrement…" : "💾 Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector((s) => s.auth);

  const {
    savedLocations,
    savedLocationsLoading,
    savedLocationsError,
    rayonActif,
    activeSource,
    gpsPosition,
    prestataires,
  } = useSelector((s) => s.location);

  const [tab, setTab] = useState("carte");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [rayonLocal, setRayonLocal] = useState(rayonActif);
  const [rayonSaving, setRayonSaving] = useState(false);
  const [filtreMetier, setFiltreMetier] = useState("Tous");
  const [filtreFavoris, setFiltreFavoris] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [geoBlocked, setGeoBlocked] = useState(false);
  const [geoBannerVisible, setGeoBannerVisible] = useState(true);

  // ── États formulaire profil ──────────────────────────────────────────────
  const [editPrenom, setEditPrenom]         = useState("");
  const [editNom, setEditNom]               = useState("");
  const [editEmail, setEditEmail]           = useState("");
  const [editPassword, setEditPassword]     = useState("");
  const [editPasswordConfirm, setEditPasswordConfirm] = useState("");
  const [profileFormError, setProfileFormError]       = useState("");

  // Initialiser le formulaire quand on charge le profil
  useEffect(() => {
    if (userInfo) {
      setEditPrenom(userInfo.prenom || "");
      setEditNom(userInfo.nom || "");
      setEditEmail(userInfo.email || "");
    }
  }, [userInfo?._id]);

  const { mesFavoris, loading: favoriLoading } = useSelector((s) => s.favori);

  useEffect(() => {
    dispatch(fetchMesFavoris());
  }, [dispatch]);

  // Clear updateSuccess après 3 secondes
  useEffect(() => {
    if (!updateSuccess) return;
    const t = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
    return () => clearTimeout(t);
  }, [updateSuccess, dispatch]);

  useEffect(() => {
    dispatch(fetchSavedLocations());

    if (userInfo?.rayonRecherche) {
      dispatch(syncRayonFromProfile(userInfo.rayonRecherche));
      setRayonLocal(userInfo.rayonRecherche);
    }
  }, [dispatch, userInfo?.rayonRecherche]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoBlocked(true);
      dispatch(fetchPrestatairesPublic());
      return;
    }

    const requestGps = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;

          setGeoBlocked(false);
          dispatch(setGpsPosition({ longitude, latitude }));
          dispatch(
            fetchPrestatairesPositions({
              lng: longitude,
              lat: latitude,
              rayon: rayonActif,
            }),
          );
        },
        () => {
          setGeoBlocked(true);
          dispatch(fetchPrestatairesPublic());
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "denied") {
          setGeoBlocked(true);
          dispatch(fetchPrestatairesPublic());
        } else {
          requestGps();
        }

        result.onchange = () => {
          if (result.state === "granted") {
            setGeoBlocked(false);
            requestGps();
          }

          if (result.state === "denied") {
            setGeoBlocked(true);
          }
        };
      });
    } else {
      requestGps();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/users/logout`, {
      method: "POST",
      credentials: "include",
    });

    dispatch(logout());
    navigate("/");
  };

  const handleRayonChange = (value) => {
    setRayonLocal(Number(value));
  };

  const handleSaveRayon = async () => {
    setRayonSaving(true);
    await dispatch(updateRayon(rayonLocal));
    setRayonSaving(false);

    if (gpsPosition) {
      dispatch(
        fetchPrestatairesPositions({
          lng: gpsPosition.longitude,
          lat: gpsPosition.latitude,
          rayon: rayonLocal,
        }),
      );
    }
  };

  const rayonPct = ((rayonLocal - RAYON_MIN) / (RAYON_MAX - RAYON_MIN)) * 100;

  const handleSave = async (data) => {
    if (data.locationId) {
      await dispatch(updateSavedLocation(data));
    } else {
      await dispatch(addSavedLocation(data));
    }

    if (!savedLocationsError) {
      setShowForm(false);
      setEditTarget(null);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer cette adresse ?")) {
      dispatch(deleteSavedLocation(id));
    }
  };

  const handleSetDefault = (id) => {
    dispatch(setDefaultSavedLocation(id));
  };

  const handleSelectOnMap = (loc) => {
    dispatch(setActiveSource(`saved:${loc._id}`));
    dispatch(
      fetchPrestatairesPositions({
        lng: loc.longitude,
        lat: loc.latitude,
        rayon: rayonActif,
      }),
    );
    setTab("carte");
  };

  const handleUseGps = () => {
    dispatch(setActiveSource("gps"));

    if (gpsPosition) {
      dispatch(
        fetchPrestatairesPositions({
          lng: gpsPosition.longitude,
          lat: gpsPosition.latitude,
          rayon: rayonActif,
        }),
      );
    }

    setTab("carte");
  };

  const getActivePosition = () => {
    if (activeSource === "gps") return gpsPosition;

    const id = activeSource.replace("saved:", "");
    const loc = savedLocations.find((l) => l._id === id);

    return loc
      ? { longitude: loc.longitude, latitude: loc.latitude }
      : gpsPosition;
  };

  const getDistance = (p) => {
    const activePos = getActivePosition();

    if (!activePos || !p.location?.coordinates) return "—";

    const [lng2, lat2] = p.location.coordinates;
    const R = 6371;
    const dLat = ((lat2 - activePos.latitude) * Math.PI) / 180;
    const dLng = ((lng2 - activePos.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((activePos.latitude * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  };

  const activeLabel =
    activeSource === "gps"
      ? "📍 Ma position GPS"
      : savedLocations.find((l) => `saved:${l._id}` === activeSource)?.label ||
        "Adresse";

  // ── IDs favoris pour le filtre carte ────────────────────────────────────
  const favorisIds = new Set(mesFavoris.map(({ prestataire: p }) => p?._id).filter(Boolean));

  const filteredPrestataires = prestataires.filter((p) => {
    const passeMetier   = filtreMetier === "Tous" || p.metiers?.[0]?.nom === filtreMetier;
    const passeFavoris  = !filtreFavoris || favorisIds.has(p._id);
    return passeMetier && passeFavoris;
  });

  // ── Prestataires favoris pour le filtre carte (sans filtre rayon) ───────
  const prestatairesAvecFavoris = filtreFavoris
    ? mesFavoris.map(({ prestataire: p }) => p).filter(Boolean)
    : prestataires;

  const prestatairesPourCarte = prestatairesAvecFavoris.filter(
    (p) => filtreMetier === "Tous" || p.metiers?.[0]?.nom === filtreMetier,
  );

  // ── Handler sauvegarde profil ────────────────────────────────────────────
  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setProfileFormError("");

    if (!editPrenom.trim() || !editNom.trim() || !editEmail.trim()) {
      setProfileFormError("Prénom, nom et email sont obligatoires.");
      return;
    }
    if (editPassword && editPassword !== editPasswordConfirm) {
      setProfileFormError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (editPassword && editPassword.length < 6) {
      setProfileFormError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    const payload = {
      prenom: editPrenom.trim(),
      nom:    editNom.trim(),
      email:  editEmail.trim(),
    };
    if (editPassword) payload.password = editPassword;

    await dispatch(updateProfile(payload));
    setEditPassword("");
    setEditPasswordConfirm("");
  };

  return (
    <div className="ud">
      <header className="ud-header">
        <button
          className="ud-brand"
          type="button"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="Hopela" className="ud-logo-img" />
          <span className="ud-logo-name">Hopela</span>
        </button>

        <div className="ud-header-right">
          <div className="ud-user-pill">
            <span className="ud-avatar">
              {userInfo?.prenom?.[0]}
              {userInfo?.nom?.[0]}
            </span>

            <span className="ud-user-name">
              {userInfo?.prenom} {userInfo?.nom}
            </span>
          </div>

          <button className="ud-logout" onClick={handleLogout}>
            <span className="ud-logout-full">Déconnexion</span>
            <span className="ud-logout-short">⎋</span>
          </button>
        </div>
      </header>

      {geoBlocked && geoBannerVisible && (
        <div className="ud-geo-banner">
          <span className="ud-geo-banner-icon">📍</span>

          <div className="ud-geo-banner-text">
            <strong>Géolocalisation bloquée.</strong>
            <span>
              Autorisez l'accès à votre position pour voir les prestataires près
              de vous.
            </span>
          </div>

          <button
            className="ud-geo-banner-btn"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>

          <button
            className="ud-geo-banner-close"
            onClick={() => setGeoBannerVisible(false)}
          >
            ✕
          </button>
        </div>
      )}

      <main className="ud-content">
        {tab === "carte" && (
          <section className="ud-map-tab">
            <div className="ud-map-wrap">
              <PublicMap
                centerPosition={filtreFavoris ? null : getActivePosition()}
                rayon={rayonLocal}
                activeLabel={activeLabel}
                onRayonChange={handleRayonChange}
                onSaveRayon={handleSaveRayon}
                rayonSaving={rayonSaving}
                savedLocations={savedLocations}
                activeSource={activeSource}
                prestataires={prestatairesPourCarte}
                filtreMetier={filtreMetier}
                onFiltreChange={setFiltreMetier}
                onSelectSource={(src) => {
                  dispatch(setActiveSource(src));

                  const id = src.replace("saved:", "");
                  const loc = savedLocations.find((l) => l._id === id);

                  if (loc) {
                    dispatch(
                      fetchPrestatairesPositions({
                        lng: loc.longitude,
                        lat: loc.latitude,
                        rayon: rayonActif,
                      }),
                    );
                  } else if (src === "gps" && gpsPosition) {
                    dispatch(
                      fetchPrestatairesPositions({
                        lng: gpsPosition.longitude,
                        lat: gpsPosition.latitude,
                        rayon: rayonActif,
                      }),
                    );
                  }
                }}
              />
            </div>

            <div className={`ud-presta-panel${panelOpen ? "" : " ud-presta-panel--collapsed"}`}>

              {/* ── Header du panneau avec toggle ── */}
              <div className="ud-presta-title">
                <button
                  className="ud-panel-toggle"
                  onClick={() => setPanelOpen((x) => !x)}
                  title={panelOpen ? "Réduire" : "Agrandir"}
                >
                  <span className={`ud-panel-toggle-arrow${panelOpen ? "" : " ud-panel-toggle-arrow--closed"}`}>‹</span>
                </button>

                {panelOpen && (
                  <>
                    <span className="ud-presta-title-label">
                      Prestataires
                      <strong className="ud-presta-count">{filteredPrestataires.length}</strong>
                    </span>

                    <div className="ud-presta-chips">
                      {filtreMetier !== "Tous" && (
                        <button
                          className="ud-filter-chip"
                          onClick={() => setFiltreMetier("Tous")}
                        >
                          {filtreMetier} ✕
                        </button>
                      )}

                      <button
                        className={`ud-filter-chip ud-filter-chip--fav${filtreFavoris ? " active" : ""}`}
                        onClick={() => setFiltreFavoris((x) => !x)}
                        title={filtreFavoris ? "Afficher tous" : "Favoris uniquement"}
                      >
                        {filtreFavoris ? "❤️ ✕" : "❤️"}
                      </button>

                      {!filtreFavoris && rayonLocal && (
                        <span className="ud-rayon-chip">{rayonLocal} km</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* ── Liste des prestataires (masquée si replié) ── */}
              {panelOpen && (
                <>
                  {filteredPrestataires.length === 0 ? (
                    <div className="ud-empty-presta">
                      Aucun prestataire dans ce rayon.
                      <span>Augmentez le rayon ou désactivez les filtres.</span>
                    </div>
                  ) : (
                    <div className="ud-presta-list">
                      {filteredPrestataires.map((p, index) => {
                        const metierNom = p.metiers?.[0]?.nom || "Prestataire";
                        const isFavori  = favorisIds.has(p._id);

                        return (
                          <article className="ud-presta-card" key={p._id}>

                            {/* ── Icône épingle unique ── */}
                            <div className="ud-presta-pin">
                              <span>📍</span>
                              {isFavori && <span className="ud-presta-pin-fav">♥</span>}
                            </div>

                            {/* ── Infos condensées ── */}
                            <div className="ud-presta-info">
                              <h3 className="ud-presta-name">
                                {p.prenom} {p.nom}
                              </h3>
                              <div className="ud-presta-sub">
                                <span className="ud-presta-metier">{metierNom}</span>
                                {!filtreFavoris && (
                                  <span className="ud-presta-dist">
                                    {index === 0 ? "Le + proche" : getDistance(p)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* ── Actions ── */}
                            <div className="ud-presta-actions">
                              {p.telephoneContact ? (
                                <a
                                  href={`tel:${p.telephoneContact}`}
                                  className="ud-call-btn"
                                  title="Appeler"
                                >
                                  📞
                                </a>
                              ) : p.emailContact ? (
                                <a
                                  href={`mailto:${p.emailContact}`}
                                  className="ud-call-btn ud-call-btn--ghost"
                                  title="Email"
                                >
                                  ✉️
                                </a>
                              ) : null}
                              <Link
                                to={`/prestataire/${p._id}`}
                                className="ud-call-btn ud-call-btn--profile"
                                target="_blank"
                                rel="noreferrer"
                                title="Voir le profil"
                              >
                                👤
                              </Link>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        )}

        {tab === "favoris" && (
          <section className="ud-fav-section">

            {/* ── En-tête ── */}
            <div className="ud-fav-header">
              <div className="ud-fav-header-left">
                <div className="ud-fav-title">
                  Mes <em>favoris</em>
                </div>
                {!favoriLoading && mesFavoris.length > 0 && (
                  <div className="ud-fav-count-pill">
                    <span className="ud-fav-count-heart">♥</span>
                    {mesFavoris.length} prestataire{mesFavoris.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
              {!favoriLoading && mesFavoris.filter(({ prestataire: p }) => p?.isTracked).length > 0 && (
                <div className="ud-fav-online-summary">
                  <span className="ud-fav-online-dot" />
                  {mesFavoris.filter(({ prestataire: p }) => p?.isTracked).length} en ligne
                </div>
              )}
            </div>

            {/* ── États ── */}
            {favoriLoading ? (
              <div className="ud-fav-loading">
                <div className="ud-fav-spinner" />
                <span>Chargement de vos favoris…</span>
              </div>
            ) : mesFavoris.length === 0 ? (
              <div className="ud-fav-empty">
                <div className="ud-fav-empty-icon">
                  <span>♡</span>
                </div>
                <div className="ud-fav-empty-title">Aucun favori pour l'instant</div>
                <p className="ud-fav-empty-text">
                  Explorez la carte et ajoutez vos prestataires de confiance à vos favoris.
                </p>
                <button
                  className="ud-fav-empty-cta"
                  onClick={() => setTab("carte")}
                >
                  🗺️ Explorer la carte
                </button>
              </div>
            ) : (
              <div className="ud-fav-grid">
                {mesFavoris.map(({ favoriId, prestataire: p }, idx) => {
                  if (!p) return null;
                  const metierNom = p.metiers?.[0]?.nom || "Prestataire";
                  const catNom    = p.metiers?.[0]?.categorie?.nom || null;
                  const icon      = getMetierIcon(metierNom);
                  const initiales = `${p.prenom?.[0] || ""}${p.nom?.[0] || ""}`.toUpperCase();

                  // Couleur avatar déterministe selon l'index
                  const AVATAR_COLORS = [
                    ["#00a6b2", "#007b87"],
                    ["#1a2d4a", "#102a43"],
                    ["#145c45", "#0d3d2e"],
                    ["#8b5cf6", "#6d28d9"],
                    ["#f59e0b", "#d97706"],
                    ["#ec4899", "#db2777"],
                  ];
                  const [colorA, colorB] = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                  return (
                    <article
                      key={favoriId}
                      className="ud-fav-card"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      {/* Badge en ligne */}
                      {p.isTracked && (
                        <div className="ud-fav-card-online-badge">
                          <span className="ud-fav-online-dot" />
                          En ligne
                        </div>
                      )}

                      {/* Bouton supprimer */}
                      <button
                        className="ud-fav-card-remove"
                        onClick={() => dispatch(removeFavori(p._id))}
                        title="Retirer des favoris"
                      >
                        ✕
                      </button>

                      {/* Avatar */}
                      <div
                        className="ud-fav-avatar"
                        style={{ background: `linear-gradient(135deg, ${colorA}, ${colorB})` }}
                      >
                        {p.avatar
                          ? <img src={`${API_URL}${p.avatar}`} alt={p.prenom} />
                          : <span className="ud-fav-avatar-initials">{initiales || icon}</span>
                        }
                      </div>

                      {/* Infos */}
                      <div className="ud-fav-card-body">
                        <h3 className="ud-fav-card-name">{p.prenom} {p.nom}</h3>

                        <div className="ud-fav-card-metier">
                          <span className="ud-fav-metier-icon">{icon}</span>
                          <span>{metierNom}</span>
                        </div>

                        {catNom && (
                          <div className="ud-fav-card-cat">{catNom}</div>
                        )}

                        {p.ridet && (
                          <div className="ud-fav-card-ridet">RIDET {p.ridet}</div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ud-fav-card-actions">
                        <Link
                          to={`/prestataire/${p._id}`}
                          className="ud-fav-btn ud-fav-btn--profil"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <span>👤</span>
                          <span>Profil</span>
                        </Link>

                        {p.telephoneContact && (
                          <a
                            href={`tel:${p.telephoneContact}`}
                            className="ud-fav-btn ud-fav-btn--tel"
                          >
                            <span>📞</span>
                            <span>Appeler</span>
                          </a>
                        )}

                        {p.emailContact && !p.telephoneContact && (
                          <a
                            href={`mailto:${p.emailContact}`}
                            className="ud-fav-btn ud-fav-btn--mail"
                          >
                            <span>✉️</span>
                            <span>Email</span>
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {tab === "adresses" && (
          <section className="ud-page-section">
            <div className="ud-section">
              <div className="ud-section-title">
                Mes <em>adresses</em>
              </div>

              <div className="ud-section-sub">
                {savedLocations.length} / 10 adresse
                {savedLocations.length !== 1 ? "s" : ""} enregistrée
                {savedLocations.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="ud-rayon-card">
              <div className="ud-rayon-row">
                <span className="ud-rayon-label">Rayon de recherche</span>
                <span className="ud-rayon-value">{rayonLocal} km</span>
              </div>

              <input
                className="ud-rayon-slider"
                type="range"
                min={RAYON_MIN}
                max={RAYON_MAX}
                value={rayonLocal}
                onChange={(e) => handleRayonChange(e.target.value)}
                style={{ "--pct": `${rayonPct}%` }}
              />

              <div className="ud-rayon-actions">
                <button
                  className="ud-rayon-save"
                  onClick={handleSaveRayon}
                  disabled={rayonSaving || rayonLocal === rayonActif}
                >
                  {rayonSaving ? "Enregistrement…" : "Sauvegarder le rayon"}
                </button>
              </div>

              <div className="ud-rayon-hint">
                Modifiable aussi directement sur la carte
              </div>
            </div>

            <div className="ud-loc-list">
              <div
                className="ud-loc-card ud-loc-card--gps"
                onClick={handleUseGps}
              >
                <div className="ud-loc-icon">📍</div>

                <div className="ud-loc-info">
                  <div className="ud-loc-name-row">
                    <span className="ud-loc-name">Ma position GPS</span>

                    {activeSource === "gps" && (
                      <span className="ud-loc-default-badge">Active</span>
                    )}
                  </div>

                  <div className="ud-loc-addr">
                    {gpsPosition
                      ? `${gpsPosition.latitude.toFixed(4)}, ${gpsPosition.longitude.toFixed(4)}`
                      : "Appuyer pour activer le GPS"}
                  </div>
                </div>

                <div className="ud-loc-actions">
                  <button
                    className="ud-loc-btn"
                    title="Utiliser sur la carte"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseGps();
                    }}
                  >
                    🗺️
                  </button>
                </div>
              </div>

              {savedLocations.length === 0 ? (
                <div className="ud-empty">
                  <div className="ud-empty-icon">📍</div>
                  Aucune adresse enregistrée.
                  <span>Ajoutez votre domicile pour commencer.</span>
                </div>
              ) : (
                savedLocations.map((loc) => (
                  <div
                    key={loc._id}
                    className={`ud-loc-card${loc.isDefault ? " is-default" : ""}`}
                  >
                    <div className="ud-loc-icon">{getIcon(loc.label)}</div>

                    <div className="ud-loc-info">
                      <div className="ud-loc-name-row">
                        <span className="ud-loc-name">{loc.label}</span>

                        {loc.isDefault && (
                          <span className="ud-loc-default-badge">Défaut</span>
                        )}

                        {activeSource === `saved:${loc._id}` && (
                          <span className="ud-loc-default-badge is-active">
                            Active
                          </span>
                        )}
                      </div>

                      {loc.adresse && (
                        <div className="ud-loc-addr">{loc.adresse}</div>
                      )}

                      <div className="ud-loc-coords">
                        {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                      </div>
                    </div>

                    <div className="ud-loc-actions">
                      <button
                        className="ud-loc-btn"
                        onClick={() => handleSelectOnMap(loc)}
                      >
                        🗺️
                      </button>

                      {!loc.isDefault && (
                        <button
                          className="ud-loc-btn"
                          onClick={() => handleSetDefault(loc._id)}
                        >
                          ⭐
                        </button>
                      )}

                      <button
                        className="ud-loc-btn"
                        onClick={() => {
                          setEditTarget(loc);
                          setShowForm(true);
                        }}
                      >
                        ✏️
                      </button>

                      <button
                        className="ud-loc-btn danger"
                        onClick={() => handleDelete(loc._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {savedLocations.length < 10 && (
              <button
                className="ud-add-btn"
                onClick={() => {
                  setEditTarget(null);
                  setShowForm(true);
                }}
              >
                ＋ Ajouter une adresse
              </button>
            )}
          </section>
        )}

        {tab === "profil" && (
          <section className="ud-profile-wrap">
            <div className="ud-section-title">
              Mon <em>profil</em>
            </div>

            {/* ── Formulaire infos personnelles ── */}
            <form className="ud-profile-card" onSubmit={handleSaveProfil}>
              <div className="ud-profile-card-title">Informations du compte</div>
              <div className="ud-profile-card-sub">Modifiez vos informations personnelles</div>

              {updateSuccess && (
                <div className="ud-profile-alert ud-profile-alert--success">
                  ✅ Profil mis à jour avec succès !
                </div>
              )}
              {(updateError || profileFormError) && (
                <div className="ud-profile-alert ud-profile-alert--error">
                  ⚠️ {profileFormError || updateError}
                </div>
              )}

              <div className="ud-profile-fields">
                <div className="ud-profile-field-row">
                  <div className="ud-profile-field">
                    <label className="ud-profile-label">Prénom</label>
                    <input
                      className="ud-profile-input"
                      type="text"
                      value={editPrenom}
                      onChange={(e) => setEditPrenom(e.target.value)}
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                  <div className="ud-profile-field">
                    <label className="ud-profile-label">Nom</label>
                    <input
                      className="ud-profile-input"
                      type="text"
                      value={editNom}
                      onChange={(e) => setEditNom(e.target.value)}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                </div>

                <div className="ud-profile-field">
                  <label className="ud-profile-label">Adresse e-mail</label>
                  <input
                    className="ud-profile-input"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div className="ud-profile-separator">
                  <span>Changer le mot de passe</span>
                  <small>Laissez vide pour conserver l'actuel</small>
                </div>

                <div className="ud-profile-field-row">
                  <div className="ud-profile-field">
                    <label className="ud-profile-label">Nouveau mot de passe</label>
                    <input
                      className="ud-profile-input"
                      type="password"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="ud-profile-field">
                    <label className="ud-profile-label">Confirmer</label>
                    <input
                      className="ud-profile-input"
                      type="password"
                      value={editPasswordConfirm}
                      onChange={(e) => setEditPasswordConfirm(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <div className="ud-profile-actions">
                <div className="ud-info-row ud-info-row--role">
                  <span className="ud-info-label">Rôle</span>
                  <span className="ud-badge-role">{userInfo?.role}</span>
                </div>
                <button
                  type="submit"
                  className="ud-profile-save-btn"
                  disabled={updateLoading}
                >
                  {updateLoading ? "Enregistrement…" : "💾 Sauvegarder"}
                </button>
              </div>
            </form>

            {/* ── Préférences de recherche ── */}
            <div className="ud-profile-card">
              <div className="ud-profile-card-title">
                Préférences de recherche
              </div>
              <div className="ud-profile-card-sub">
                Rayon de recherche des prestataires
              </div>

              <div className="ud-rayon-row">
                <span className="ud-rayon-label">Rayon actuel</span>
                <span className="ud-rayon-value">{rayonLocal} km</span>
              </div>

              <input
                className="ud-rayon-slider"
                type="range"
                min={RAYON_MIN}
                max={RAYON_MAX}
                value={rayonLocal}
                onChange={(e) => handleRayonChange(e.target.value)}
                style={{ "--pct": `${rayonPct}%` }}
              />

              <div className="ud-rayon-actions">
                <button
                  className="ud-rayon-save"
                  onClick={handleSaveRayon}
                  disabled={rayonSaving || rayonLocal === rayonActif}
                >
                  {rayonSaving ? "Enregistrement…" : "Sauvegarder"}
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      <nav className="ud-bottom-nav">
        {[
          { key: "carte",    icon: "🗺️", label: "Carte" },
          { key: "favoris",  icon: "❤️", label: "Favoris" },
          { key: "adresses", icon: "📍", label: "Adresses" },
          { key: "profil",   icon: "👤", label: "Profil" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            className={`ud-nav-btn${tab === key ? " active" : ""}`}
            onClick={() => setTab(key)}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {showForm && (
        <LocationForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditTarget(null);
          }}
          loading={savedLocationsLoading}
          error={savedLocationsError}
        />
      )}
    </div>
  );
};

export default UserDashboard;