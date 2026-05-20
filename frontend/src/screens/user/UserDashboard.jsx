// src/screens/user/UserDashboard.jsx

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../logo.png";

import { logout } from "../../slices/authSlice";
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

  const { userInfo } = useSelector((s) => s.auth);

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
  const [geoBlocked, setGeoBlocked] = useState(false);
  const [geoBannerVisible, setGeoBannerVisible] = useState(true);

  const { mesFavoris, loading: favoriLoading } = useSelector((s) => s.favori);

  useEffect(() => {
    dispatch(fetchMesFavoris());
  }, [dispatch]);

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
      dispatch(fetchPrestatairesPositions({}));
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
          dispatch(fetchPrestatairesPositions({}));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    };

    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "denied") {
          setGeoBlocked(true);
          dispatch(fetchPrestatairesPositions({}));
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

  const filteredPrestataires = prestataires.filter(
    (p) => filtreMetier === "Tous" || p.metiers?.[0]?.nom === filtreMetier,
  );

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
                centerPosition={getActivePosition()}
                rayon={rayonLocal}
                activeLabel={activeLabel}
                onRayonChange={handleRayonChange}
                onSaveRayon={handleSaveRayon}
                rayonSaving={rayonSaving}
                savedLocations={savedLocations}
                activeSource={activeSource}
                prestataires={prestataires}
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

            <div className="ud-presta-panel">
              <div className="ud-presta-title">
                <span>Prestataires disponibles</span>
                <strong>{filteredPrestataires.length}</strong>

                {filtreMetier !== "Tous" && (
                  <button
                    className="ud-filter-chip"
                    onClick={() => setFiltreMetier("Tous")}
                  >
                    {filtreMetier} ✕
                  </button>
                )}

                {rayonLocal && (
                  <span className="ud-rayon-chip">dans {rayonLocal} km</span>
                )}
              </div>

              {filteredPrestataires.length === 0 ? (
                <div className="ud-empty-presta">
                  Aucun prestataire disponible dans ce rayon.
                  <span>Essayez d'augmenter le rayon de recherche.</span>
                </div>
              ) : (
                <div className="ud-presta-list">
                  {filteredPrestataires.map((p, index) => {
                    const metierNom = p.metiers?.[0]?.nom || "—";
                    const icon = getMetierIcon(metierNom);

                    return (
                      <article className="ud-presta-card" key={p._id}>
                        <div className="ud-presta-avatar">{icon}</div>

                        <div className="ud-presta-info">
                          <h3>
                            {p.prenom} {p.nom}
                          </h3>

                          <div className="ud-presta-meta">
                            <span>
                              {icon} {metierNom}
                            </span>
                            <span>
                              📍 {index === 0 ? "Le + proche" : getDistance(p)}
                            </span>
                          </div>

                          {p.ridet && <p>RIDET {p.ridet}</p>}
                        </div>

                        <div className="ud-presta-actions">
                          {p.telephoneContact ? (
                            <a
                              href={`tel:${p.telephoneContact}`}
                              className="ud-call-btn"
                            >
                              Appeler
                            </a>
                          ) : p.emailContact ? (
                            <a
                              href={`mailto:${p.emailContact}`}
                              className="ud-call-btn ud-call-btn--ghost"
                            >
                              Email
                            </a>
                          ) : (
                            <span className="ud-no-contact">—</span>
                          )}
                          <Link
                            to={`/prestataire/${p._id}`}
                            className="ud-call-btn ud-call-btn--profile"
                            target="_blank"
                            rel="noreferrer"
                          >
                            👤 Profil
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {tab === "favoris" && (
          <section className="ud-page-section">
            <div className="ud-section">
              <div className="ud-section-title">
                Mes <em>favoris</em>
              </div>
              <div className="ud-section-sub">
                {mesFavoris.length} prestataire{mesFavoris.length !== 1 ? "s" : ""} enregistré{mesFavoris.length !== 1 ? "s" : ""}
              </div>
            </div>

            {favoriLoading ? (
              <div className="ud-empty-presta">Chargement...</div>
            ) : mesFavoris.length === 0 ? (
              <div className="ud-empty-presta">
                Vous n'avez pas encore de prestataires favoris.
                <span>Explorez la carte et ajoutez vos prestataires préférés !</span>
              </div>
            ) : (
              <div className="ud-favoris-list">
                {mesFavoris.map(({ favoriId, prestataire: p }) => {
                  if (!p) return null;
                  const metierNom = p.metiers?.[0]?.nom || "—";
                  const icon = getMetierIcon(metierNom);
                  return (
                    <article key={favoriId} className="ud-favori-card">
                      <div className="ud-presta-avatar">{icon}</div>
                      <div className="ud-presta-info">
                        <h3>{p.prenom} {p.nom}</h3>
                        <div className="ud-presta-meta">
                          <span>{icon} {metierNom}</span>
                          {p.isTracked && <span className="ud-online-dot">🟢 En ligne</span>}
                        </div>
                      </div>
                      <div className="ud-presta-actions">
                        <Link
                          to={`/prestataire/${p._id}`}
                          className="ud-call-btn"
                          target="_blank"
                          rel="noreferrer"
                        >
                          👤 Profil
                        </Link>
                        {p.telephoneContact && (
                          <a href={`tel:${p.telephoneContact}`} className="ud-call-btn ud-call-btn--ghost">
                            Appeler
                          </a>
                        )}
                        <button
                          className="ud-call-btn ud-call-btn--danger"
                          onClick={() => dispatch(removeFavori(p._id))}
                        >
                          ✕
                        </button>
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

            <div className="ud-profile-card">
              <div className="ud-profile-card-title">
                Informations du compte
              </div>
              <div className="ud-profile-card-sub">
                Vos informations personnelles
              </div>

              <div className="ud-info-row">
                <span className="ud-info-label">Prénom</span>
                <span className="ud-info-value">{userInfo?.prenom}</span>
              </div>

              <div className="ud-info-row">
                <span className="ud-info-label">Nom</span>
                <span className="ud-info-value">{userInfo?.nom}</span>
              </div>

              <div className="ud-info-row">
                <span className="ud-info-label">Email</span>
                <span className="ud-info-value">{userInfo?.email}</span>
              </div>

              <div className="ud-info-row">
                <span className="ud-info-label">Rôle</span>
                <span className="ud-badge-role">{userInfo?.role}</span>
              </div>
            </div>

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