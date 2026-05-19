// src/screens/user/UserDashboard.jsx

import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Map, MapPin, Megaphone, User } from "lucide-react";
import logo from "../../logo.png";

import { logout } from "../../slices/authSlice";
import {
  fetchSavedLocations, addSavedLocation, updateSavedLocation,
  deleteSavedLocation, setDefaultSavedLocation, updateRayon,
  setActiveSource, syncRayonFromProfile, fetchPrestatairesPositions, setGpsPosition,
} from "../../slices/locationSlice";

import { fetchCategories } from "../../slices/categorieSlice";
import { fetchMetiers }    from "../../slices/metierSlice";
import {
  creerDemande, fetchMesDemandes, annulerDemande, cloturerDemande,
  clearDemandeError, clearActionSuccess,
} from "../../slices/demandeSlice";

import PublicMap from "../../components/map/PublicMap";
import "./userDashboard.scss";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const API_URL   = process.env.REACT_APP_API_URL || "http://localhost:5000";
const RAYON_MIN = 1;
const RAYON_MAX = 100;

const LABEL_ICONS = { Domicile: "🏠", Bureau: "🏢", Travail: "💼", École: "🎓", Gym: "💪", default: "📍" };
const METIER_ICONS = {
  Électricien: "⚡", Plombier: "🔧", Menuisier: "🪚", Peintre: "🎨", Jardinier: "🌿",
  Climatisation: "❄️", "Femme de ménage": "🧹", Maçon: "🧱", Photographe: "📸",
  Carreleur: "🔲", "Garde d'enfants": "👶", Informaticien: "💻", Coursier: "🛵",
};

const STATUT_CONFIG = {
  active:   { label: "Active",   color: "green" },
  expiree:  { label: "Expirée",  color: "grey"  },
  annulee:  { label: "Annulée",  color: "red"   },
  cloturee: { label: "Clôturée", color: "blue"  },
};

const TABS = [
  { key: "carte",    LucideIcon: Map,       label: "Carte"    },
  { key: "adresses", LucideIcon: MapPin,    label: "Adresses" },
  { key: "demandes", LucideIcon: Megaphone, label: "Besoins"  },
  { key: "profil",   LucideIcon: User,      label: "Profil"   },
];

const getIcon       = (label)  => LABEL_ICONS[label]  || LABEL_ICONS.default;
const getMetierIcon = (metier) => METIER_ICONS[metier] || "📍";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const getTimeLeft = (expireAt) => {
  if (!expireAt) return { text: null, level: null };
  const diff = new Date(expireAt) - new Date();
  if (diff <= 0) return { text: "Expirée", level: "critical" };
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const text = h > 0 ? `Expire dans ${h}h${m > 0 ? ` ${m}min` : ""}` : `Expire dans ${m}min`;
  const level = h < 2 ? "critical" : h < 6 ? "urgent" : null;
  return { text, level };
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADERS
// ─────────────────────────────────────────────────────────────────────────────

// ✅ FIX 2 — Skeleton adapté à la nouvelle structure de la card prestataire
const SkeletonPrestaCard = () => (
  <div className="ud-presta-card">
    <div className="ud-presta-card-top">
      <div className="ud-skeleton-line ud-skeleton-line--avatar" />
      <div className="ud-skeleton-presta-info">
        <div className="ud-skeleton-line ud-skeleton-line--thick ud-skeleton-line--medium" />
        <div className="ud-skeleton-line ud-skeleton-line--short" />
      </div>
    </div>
    <div className="ud-skeleton-line" style={{ height: 38, borderRadius: 9999 }} />
  </div>
);

const SkeletonPrestaList = () => (
  <div className="ud-skeleton-list">
    {[1, 2, 3].map((i) => <SkeletonPrestaCard key={i} />)}
  </div>
);

const SkeletonDemandeCard = () => (
  <div className="ud-skeleton-card">
    <div style={{ display: "flex", gap: 8 }}>
      <div className="ud-skeleton-line ud-skeleton-line--short" style={{ height: 22, borderRadius: 9999 }} />
      <div className="ud-skeleton-line" style={{ width: 70, height: 22, borderRadius: 9999 }} />
    </div>
    <div className="ud-skeleton-line ud-skeleton-line--full" />
    <div className="ud-skeleton-line ud-skeleton-line--long" />
    <div className="ud-skeleton-line ud-skeleton-line--medium" />
    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
      <div className="ud-skeleton-line" style={{ width: 100, height: 36, borderRadius: 9999 }} />
      <div className="ud-skeleton-line" style={{ width: 80,  height: 36, borderRadius: 9999 }} />
    </div>
  </div>
);

const SkeletonDemandeList = () => (
  <div className="ud-skeleton-list">
    {[1, 2].map((i) => <SkeletonDemandeCard key={i} />)}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANT — LocationForm
// ─────────────────────────────────────────────────────────────────────────────

const LocationForm = ({ initial, onSave, onClose, loading, error }) => {
  const [label,     setLabel]     = useState(initial?.label     || "");
  const [longitude, setLongitude] = useState(initial?.longitude?.toString() || "");
  const [latitude,  setLatitude]  = useState(initial?.latitude?.toString()  || "");
  const [adresse,   setAdresse]   = useState(initial?.adresse   || "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault || false);
  const [gpsStatus, setGpsStatus] = useState("");

  const fillWithGps = () => {
    setGpsStatus("Localisation en cours…");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLongitude(pos.coords.longitude.toFixed(6)); setLatitude(pos.coords.latitude.toFixed(6)); setGpsStatus("✓ Position GPS capturée"); setTimeout(() => setGpsStatus(""), 2000); },
      () => setGpsStatus("❌ GPS non disponible"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const handleSubmit = () => {
    if (!label.trim() || !longitude || !latitude) return;
    onSave({ label: label.trim(), longitude: parseFloat(longitude), latitude: parseFloat(latitude), adresse: adresse.trim() || null, isDefault, ...(initial?._id ? { locationId: initial._id } : {}) });
  };

  return (
    <div className="ud-form-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ud-form-sheet">
        <div className="ud-form-handle" />
        <div className="ud-form-title">{initial?._id ? "Modifier l'adresse" : "Nouvelle adresse"}</div>
        {error && <div className="ud-error">{error}</div>}
        <div className="ud-field">
          <label className="ud-label">Nom de l'adresse *</label>
          <input className="ud-input" placeholder="Ex : Domicile, Bureau…" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={50} />
        </div>
        <button className="ud-gps-btn" onClick={fillWithGps} type="button">📍 {gpsStatus || "Utiliser ma position GPS actuelle"}</button>
        <div className="ud-row">
          <div className="ud-field"><label className="ud-label">Longitude *</label><input className="ud-input" type="number" step="any" placeholder="166.4580" value={longitude} onChange={(e) => setLongitude(e.target.value)} /></div>
          <div className="ud-field"><label className="ud-label">Latitude *</label><input className="ud-input" type="number" step="any" placeholder="-22.2760" value={latitude} onChange={(e) => setLatitude(e.target.value)} /></div>
        </div>
        <div className="ud-field">
          <label className="ud-label">Adresse lisible</label>
          <input className="ud-input" placeholder="Ex : 12 rue des Fleurs, Nouméa" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </div>
        <label className="ud-checkbox-row">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          <span className="ud-checkbox-label">Définir comme adresse par défaut</span>
        </label>
        <div className="ud-form-actions">
          <button className="ud-btn-cancel" onClick={onClose}>Annuler</button>
          <button className="ud-btn-save" onClick={handleSubmit} disabled={loading || !label.trim() || !longitude || !latitude}>{loading ? "Enregistrement…" : "💾 Enregistrer"}</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANT — DemandeForm
// ─────────────────────────────────────────────────────────────────────────────

const DemandeForm = ({ onClose, onSave, loading, error, categories, metiers, savedLocations, gpsPosition, userInfo }) => {
  const [description,       setDescription]       = useState("");
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [selectedMetier,    setSelectedMetier]    = useState("");
  const [telephone,         setTelephone]         = useState(userInfo?.telephoneContact || "");
  const [locationSource,    setLocationSource]    = useState(gpsPosition ? "gps" : savedLocations[0] ? `saved:${savedLocations[0]._id}` : "gps");

  const metiersFiltres = selectedCategorie
    ? metiers.filter((m) => { const catId = typeof m.categorie === "object" ? m.categorie?._id : m.categorie; return catId === selectedCategorie && m.isActive; })
    : metiers.filter((m) => m.isActive);

  useEffect(() => { setSelectedMetier(""); }, [selectedCategorie]);

  const getCoords = () => {
    if (locationSource === "gps" && gpsPosition) return { longitude: gpsPosition.longitude, latitude: gpsPosition.latitude, adresse: null };
    const id = locationSource.replace("saved:", "");
    const loc = savedLocations.find((l) => l._id === id);
    if (loc) return { longitude: loc.longitude, latitude: loc.latitude, adresse: loc.adresse || null };
    return null;
  };

  const coords   = getCoords();
  const charLeft = 160 - description.length;
  const canSave  = description.trim().length > 0 && description.trim().length <= 160 && selectedMetier && telephone.trim() && coords;

  const handleSubmit = () => {
    if (!canSave) return;
    onSave({ description: description.trim(), categorie: selectedCategorie || undefined, metier: selectedMetier, telephoneContact: telephone.trim(), longitude: coords.longitude, latitude: coords.latitude, adresse: coords.adresse });
  };

  return (
    <div className="ud-form-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ud-form-sheet ud-form-sheet--demande">
        <div className="ud-form-handle" />
        <div className="ud-form-title">📣 Publier un besoin</div>
        <div className="ud-form-subtitle">Visible uniquement par les prestataires du métier concerné</div>
        {error && <div className="ud-error">{error}</div>}
        <div className="ud-field">
          <label className="ud-label">Description * ({description.length}/160{charLeft <= 20 && <span className={charLeft <= 5 ? " ud-char-danger" : " ud-char-warn"}> — encore {charLeft}</span>})</label>
          <textarea className="ud-input ud-textarea" placeholder="Décrivez votre besoin en quelques mots…" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={160} rows={3} />
        </div>
        <div className="ud-field">
          <label className="ud-label">Catégorie</label>
          <select className="ud-input ud-select" value={selectedCategorie} onChange={(e) => setSelectedCategorie(e.target.value)}>
            <option value="">— Toutes les catégories —</option>
            {categories.filter((c) => c.isActive).map((c) => <option key={c._id} value={c._id}>{c.nom}</option>)}
          </select>
        </div>
        <div className="ud-field">
          <label className="ud-label">Métier *</label>
          <select className="ud-input ud-select" value={selectedMetier} onChange={(e) => setSelectedMetier(e.target.value)}>
            <option value="">— Sélectionner un métier —</option>
            {metiersFiltres.map((m) => <option key={m._id} value={m._id}>{m.nom}</option>)}
          </select>
          {metiersFiltres.length === 0 && selectedCategorie && <div className="ud-field-hint">Aucun métier actif pour cette catégorie.</div>}
        </div>
        <div className="ud-field">
          <label className="ud-label">Localisation de la demande *</label>
          <select className="ud-input ud-select" value={locationSource} onChange={(e) => setLocationSource(e.target.value)}>
            {gpsPosition && <option value="gps">Ma position GPS actuelle</option>}
            {savedLocations.map((loc) => <option key={loc._id} value={`saved:${loc._id}`}>{loc.label}{loc.adresse ? ` — ${loc.adresse}` : ""}</option>)}
            {!gpsPosition && savedLocations.length === 0 && <option value="" disabled>Aucune position disponible — activez le GPS ou ajoutez une adresse</option>}
          </select>
          {coords && <div className="ud-coords-preview">📌 {coords.adresse ? coords.adresse : `${coords.latitude?.toFixed(4)}, ${coords.longitude?.toFixed(4)}`}</div>}
        </div>
        <div className="ud-field">
          <label className="ud-label">Téléphone de contact *</label>
          <input className="ud-input" type="tel" placeholder="+687 XX XX XX" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          <div className="ud-field-hint">Communiqué aux prestataires intéressés</div>
        </div>
        <div className="ud-form-actions">
          <button className="ud-btn-cancel" onClick={onClose}>Annuler</button>
          <button className="ud-btn-save" onClick={handleSubmit} disabled={loading || !canSave}>{loading ? "Publication…" : "📣 Publier"}</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANT — DemandeCard
// ─────────────────────────────────────────────────────────────────────────────

const DemandeCard = ({ demande, onAnnuler, onCloturer, actionLoading }) => {
  const cfg      = STATUT_CONFIG[demande.statut] || STATUT_CONFIG.active;
  const isActive = demande.statut === "active";
  const { text: timeText, level: timeLevel } = isActive ? getTimeLeft(demande.expireAt) : { text: null, level: null };

  const cardColor   = isActive && timeLevel === "critical" ? "red" : isActive && timeLevel === "urgent" ? "urgent" : cfg.color;
  const statutColor = isActive && (timeLevel === "critical" || timeLevel === "urgent") ? "urgent" : cfg.color;
  const statutLabel = isActive && timeLevel === "critical" ? "Expire bientôt !" : isActive && timeLevel === "urgent" ? "Urgent" : cfg.label;

  return (
    <article className={`ud-demande-card ud-demande-card--${cardColor}`}>
      <div className="ud-demande-card-header">
        <div className="ud-demande-meta-row">
          <span className={`ud-demande-statut ud-demande-statut--${statutColor}`}>{statutLabel}</span>
          {timeText && <span className={`ud-demande-expire${timeLevel ? ` ud-demande-expire--${timeLevel}` : ""}`}>{timeLevel === "critical" ? "⚠️ " : timeLevel === "urgent" ? "🕐 " : ""}{timeText}</span>}
        </div>
        <div className="ud-demande-tags">
          {demande.categorie?.nom && <span className="ud-demande-tag">{demande.categorie.nom}</span>}
          {demande.metier?.nom    && <span className="ud-demande-tag ud-demande-tag--metier">{demande.metier.nom}</span>}
        </div>
      </div>
      <p className="ud-demande-desc">"{demande.description}"</p>
      {demande.location?.coordinates && (
        <div className="ud-demande-loc">📌 {demande.location.adresse ? demande.location.adresse : `${demande.location.coordinates[1]?.toFixed(4)}, ${demande.location.coordinates[0]?.toFixed(4)}`}</div>
      )}
      <div className="ud-demande-dates">
        <span>Publiée le {formatDate(demande.createdAt)}</span>
        {demande.expireAt && <span>Expire le {formatDate(demande.expireAt)}</span>}
      </div>
      {isActive && (
        <div className="ud-demande-actions">
          <button className="ud-demande-btn ud-demande-btn--cloturer" onClick={() => onCloturer(demande._id)} disabled={actionLoading}>✅ Clôturer</button>
          <button className="ud-demande-btn ud-demande-btn--annuler"  onClick={() => onAnnuler(demande._id)}  disabled={actionLoading}>✕ Annuler</button>
        </div>
      )}
    </article>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((s) => s.auth);
  const {
    savedLocations, savedLocationsLoading, savedLocationsError,
    rayonActif, activeSource, gpsPosition, prestataires, prestatairesLoading,
  } = useSelector((s) => s.location);
  const { categories } = useSelector((s) => s.categorie);
  const { metiers }    = useSelector((s) => s.metier);
  const {
    mesDemandes, loading: demandeLoading, actionLoading: demandeActionLoading,
    actionError: demandeActionError, actionSuccess: demandeActionSuccess,
  } = useSelector((s) => s.demande);

  const [tab,              setTab]              = useState("carte");
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showDemandeForm,  setShowDemandeForm]  = useState(false);
  const [editTarget,       setEditTarget]       = useState(null);
  const [rayonLocal,       setRayonLocal]       = useState(rayonActif);
  const [rayonSaving,      setRayonSaving]      = useState(false);
  const [filtreMetier,     setFiltreMetier]     = useState("Tous");
  const [geoBlocked,       setGeoBlocked]       = useState(false);
  const [geoBannerVisible, setGeoBannerVisible] = useState(true);
  const [successBanner,    setSuccessBanner]    = useState("");

  useEffect(() => {
    dispatch(fetchSavedLocations());
    dispatch(fetchMesDemandes());
    dispatch(fetchCategories());
    dispatch(fetchMetiers());
    if (userInfo?.rayonRecherche) { dispatch(syncRayonFromProfile(userInfo.rayonRecherche)); setRayonLocal(userInfo.rayonRecherche); }
  }, [dispatch, userInfo?.rayonRecherche]);

  useEffect(() => {
    if (!navigator.geolocation) { setGeoBlocked(true); dispatch(fetchPrestatairesPositions({})); return; }
    const requestGps = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => { const { longitude, latitude } = pos.coords; setGeoBlocked(false); dispatch(setGpsPosition({ longitude, latitude })); dispatch(fetchPrestatairesPositions({ lng: longitude, lat: latitude, rayon: rayonActif })); },
        () => { setGeoBlocked(true); dispatch(fetchPrestatairesPositions({})); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    };
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "denied") { setGeoBlocked(true); dispatch(fetchPrestatairesPositions({})); } else requestGps();
        result.onchange = () => { if (result.state === "granted") { setGeoBlocked(false); requestGps(); } if (result.state === "denied") { setGeoBlocked(true); } };
      });
    } else { requestGps(); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!demandeActionSuccess) return;
    setShowDemandeForm(false);
    setSuccessBanner("✅ Votre demande a été publiée avec succès !");
    dispatch(clearActionSuccess());
    const t = setTimeout(() => setSuccessBanner(""), 4000);
    return () => clearTimeout(t);
  }, [demandeActionSuccess, dispatch]);

  const handleLogout    = async () => { await fetch(`${API_URL}/api/users/logout`, { method: "POST", credentials: "include" }); dispatch(logout()); navigate("/"); };
  const handleRayonChange = (v) => setRayonLocal(Number(v));
  const handleSaveRayon   = async () => { setRayonSaving(true); await dispatch(updateRayon(rayonLocal)); setRayonSaving(false); if (gpsPosition) dispatch(fetchPrestatairesPositions({ lng: gpsPosition.longitude, lat: gpsPosition.latitude, rayon: rayonLocal })); };
  const rayonPct = ((rayonLocal - RAYON_MIN) / (RAYON_MAX - RAYON_MIN)) * 100;

  const handleSaveLocation = async (data) => {
    if (data.locationId) await dispatch(updateSavedLocation(data)); else await dispatch(addSavedLocation(data));
    if (!savedLocationsError) { setShowLocationForm(false); setEditTarget(null); }
  };

  const handleDeleteLocation = (id) => { if (window.confirm("Supprimer cette adresse ?")) dispatch(deleteSavedLocation(id)); };
  const handleSetDefault     = (id) => dispatch(setDefaultSavedLocation(id));

  const handleSelectOnMap = (loc) => { dispatch(setActiveSource(`saved:${loc._id}`)); dispatch(fetchPrestatairesPositions({ lng: loc.longitude, lat: loc.latitude, rayon: rayonActif })); setTab("carte"); };
  const handleUseGps      = ()    => { dispatch(setActiveSource("gps")); if (gpsPosition) dispatch(fetchPrestatairesPositions({ lng: gpsPosition.longitude, lat: gpsPosition.latitude, rayon: rayonActif })); setTab("carte"); };

  const getActivePosition = useCallback(() => {
    if (activeSource === "gps") return gpsPosition;
    const id  = activeSource.replace("saved:", "");
    const loc = savedLocations.find((l) => l._id === id);
    return loc ? { longitude: loc.longitude, latitude: loc.latitude } : gpsPosition;
  }, [activeSource, gpsPosition, savedLocations]);

  const getDistance = (p) => {
    const ap = getActivePosition();
    if (!ap || !p.location?.coordinates) return "—";
    const [lng2, lat2] = p.location.coordinates;
    const R = 6371;
    const dLat = ((lat2 - ap.latitude)  * Math.PI) / 180;
    const dLng = ((lng2 - ap.longitude) * Math.PI) / 180;
    const a    = Math.sin(dLat/2)**2 + Math.cos((ap.latitude*Math.PI)/180) * Math.cos((lat2*Math.PI)/180) * Math.sin(dLng/2)**2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
  };

  const activeLabel          = activeSource === "gps" ? "📍 Ma position GPS" : savedLocations.find((l) => `saved:${l._id}` === activeSource)?.label || "Adresse";
  const filteredPrestataires = prestataires.filter((p) => filtreMetier === "Tous" || p.metiers?.[0]?.nom === filtreMetier);

  const handleSaveDemande = async (data) => { await dispatch(creerDemande(data)); dispatch(fetchMesDemandes()); };
  const handleAnnuler     = async (id)   => { if (!window.confirm("Annuler cette demande ?")) return; await dispatch(annulerDemande(id)); setSuccessBanner("Demande annulée."); setTimeout(() => setSuccessBanner(""), 3000); };
  const handleCloturer    = async (id)   => { if (!window.confirm("Marquer ce besoin comme satisfait ?")) return; await dispatch(cloturerDemande(id)); setSuccessBanner("Demande clôturée. Tant mieux !"); setTimeout(() => setSuccessBanner(""), 3000); };

  const nbDemandesActives = mesDemandes.filter((d) => d.statut === "active").length;

  return (
    <div className="ud">
      {/* ── Header ── */}
      <header className="ud-header">
        <button className="ud-brand" type="button" onClick={() => navigate("/")}>
          <img src={logo} alt="Hopela" className="ud-logo-img" />
          <span className="ud-logo-name">Hopela</span>
        </button>
        <div className="ud-header-right">
          <div className="ud-user-pill">
            <span className="ud-avatar">{userInfo?.prenom?.[0]}{userInfo?.nom?.[0]}</span>
            <span className="ud-user-name">{userInfo?.prenom} {userInfo?.nom}</span>
          </div>
          <button className="ud-logout" onClick={handleLogout}>
            <span className="ud-logout-full">Déconnexion</span>
            <span className="ud-logout-short">⎋</span>
          </button>
        </div>
      </header>

      {/* ✅ FIX 1 — Bannière sticky sous le header, au-dessus de tout */}
      {geoBlocked && geoBannerVisible && (
        <div className="ud-geo-banner">
          <span className="ud-geo-banner-icon">📍</span>
          <div className="ud-geo-banner-text">
            <strong>Géolocalisation bloquée.</strong>
            <span>Autorisez l'accès à votre position pour voir les prestataires près de vous.</span>
          </div>
          <button className="ud-geo-banner-btn" onClick={() => window.location.reload()}>Réessayer</button>
          <button className="ud-geo-banner-close" onClick={() => setGeoBannerVisible(false)}>✕</button>
        </div>
      )}

      {successBanner && <div className="ud-success-banner">{successBanner}</div>}

      <main className="ud-content">

        {/* ══ CARTE ══ */}
        {tab === "carte" && (
          <section className="ud-map-tab">
            <div className="ud-map-wrap">
              <PublicMap
                centerPosition={getActivePosition()} rayon={rayonLocal} activeLabel={activeLabel}
                onRayonChange={handleRayonChange} onSaveRayon={handleSaveRayon} rayonSaving={rayonSaving}
                savedLocations={savedLocations} activeSource={activeSource}
                prestataires={prestataires} filtreMetier={filtreMetier} onFiltreChange={setFiltreMetier}
                onSelectSource={(src) => {
                  dispatch(setActiveSource(src));
                  const id  = src.replace("saved:", "");
                  const loc = savedLocations.find((l) => l._id === id);
                  if (loc) dispatch(fetchPrestatairesPositions({ lng: loc.longitude, lat: loc.latitude, rayon: rayonActif }));
                  else if (src === "gps" && gpsPosition) dispatch(fetchPrestatairesPositions({ lng: gpsPosition.longitude, lat: gpsPosition.latitude, rayon: rayonActif }));
                }}
              />
              <button className="ud-fab-demande" onClick={() => { dispatch(clearDemandeError()); setShowDemandeForm(true); }} title="Publier un besoin">
                <span className="ud-fab-icon">📣</span>
                <span className="ud-fab-label">Publier un besoin</span>
              </button>
            </div>

            <div className="ud-presta-panel">
              <div className="ud-presta-title">
                <span>Prestataires disponibles</span>
                <strong>{filteredPrestataires.length}</strong>
                {filtreMetier !== "Tous" && <button className="ud-filter-chip" onClick={() => setFiltreMetier("Tous")}>{filtreMetier} ✕</button>}
                {rayonLocal && <span className="ud-rayon-chip">dans {rayonLocal} km</span>}
              </div>

              {prestatairesLoading ? (
                <SkeletonPrestaList />
              ) : filteredPrestataires.length === 0 ? (
                <div className="ud-empty-presta">Aucun prestataire disponible dans ce rayon.<span>Essayez d'augmenter le rayon de recherche.</span></div>
              ) : (
                <div className="ud-presta-list">
                  {filteredPrestataires.map((p, index) => {
                    const metierNom = p.metiers?.[0]?.nom || "—";
                    const icon      = getMetierIcon(metierNom);
                    return (
                      // ✅ FIX 2 — Nouvelle structure : top (avatar+info) + actions (bouton pleine largeur)
                      <article className="ud-presta-card" key={p._id}>
                        <div className="ud-presta-card-top">
                          <div className="ud-presta-avatar">{icon}</div>
                          <div className="ud-presta-info">
                            <h3>{p.prenom} {p.nom}</h3>
                            <div className="ud-presta-meta">
                              <span>{icon} {metierNom}</span>
                              <span>📍 {index === 0 ? "Le + proche" : getDistance(p)}</span>
                            </div>
                            {p.ridet && <p>RIDET {p.ridet}</p>}
                          </div>
                        </div>
                        <div className="ud-presta-actions">
                          {p.telephoneContact ? <a href={`tel:${p.telephoneContact}`} className="ud-call-btn">📞 Appeler</a>
                            : p.emailContact  ? <a href={`mailto:${p.emailContact}`} className="ud-call-btn ud-call-btn--ghost">✉️ Email</a>
                            : <span className="ud-no-contact">Non disponible</span>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══ ADRESSES ══ */}
        {tab === "adresses" && (
          <section className="ud-page-section">
            <div className="ud-section">
              <div className="ud-section-title">Mes <em>adresses</em></div>
              <div className="ud-section-sub">{savedLocations.length} / 10 adresse{savedLocations.length !== 1 ? "s" : ""} enregistrée{savedLocations.length !== 1 ? "s" : ""}</div>
            </div>
            <div className="ud-rayon-card">
              <div className="ud-rayon-row"><span className="ud-rayon-label">Rayon de recherche</span><span className="ud-rayon-value">{rayonLocal} km</span></div>
              <input className="ud-rayon-slider" type="range" min={RAYON_MIN} max={RAYON_MAX} value={rayonLocal} onChange={(e) => handleRayonChange(e.target.value)} style={{ "--pct": `${rayonPct}%` }} />
              <div className="ud-rayon-actions">
                <button className="ud-rayon-save" onClick={handleSaveRayon} disabled={rayonSaving || rayonLocal === rayonActif}>{rayonSaving ? "Enregistrement…" : "Sauvegarder le rayon"}</button>
              </div>
              <div className="ud-rayon-hint">Modifiable aussi directement sur la carte</div>
            </div>
            <div className="ud-loc-list">
              <div className="ud-loc-card ud-loc-card--gps" onClick={handleUseGps}>
                <div className="ud-loc-icon">📍</div>
                <div className="ud-loc-info">
                  <div className="ud-loc-name-row"><span className="ud-loc-name">Ma position GPS</span>{activeSource === "gps" && <span className="ud-loc-default-badge">Active</span>}</div>
                  <div className="ud-loc-addr">{gpsPosition ? `${gpsPosition.latitude.toFixed(4)}, ${gpsPosition.longitude.toFixed(4)}` : "Appuyer pour activer le GPS"}</div>
                </div>
                <div className="ud-loc-actions"><button className="ud-loc-btn" onClick={(e) => { e.stopPropagation(); handleUseGps(); }}>🗺️</button></div>
              </div>
              {savedLocations.length === 0 ? (
                <div className="ud-empty"><div className="ud-empty-icon">📍</div>Aucune adresse enregistrée.<span>Ajoutez votre domicile pour commencer.</span></div>
              ) : (
                savedLocations.map((loc) => (
                  <div key={loc._id} className={`ud-loc-card${loc.isDefault ? " is-default" : ""}`}>
                    <div className="ud-loc-icon">{getIcon(loc.label)}</div>
                    <div className="ud-loc-info">
                      <div className="ud-loc-name-row">
                        <span className="ud-loc-name">{loc.label}</span>
                        {loc.isDefault && <span className="ud-loc-default-badge">Défaut</span>}
                        {activeSource === `saved:${loc._id}` && <span className="ud-loc-default-badge is-active">Active</span>}
                      </div>
                      {loc.adresse && <div className="ud-loc-addr">{loc.adresse}</div>}
                      <div className="ud-loc-coords">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</div>
                    </div>
                    <div className="ud-loc-actions">
                      <button className="ud-loc-btn" onClick={() => handleSelectOnMap(loc)}>🗺️</button>
                      {!loc.isDefault && <button className="ud-loc-btn" onClick={() => handleSetDefault(loc._id)}>⭐</button>}
                      <button className="ud-loc-btn" onClick={() => { setEditTarget(loc); setShowLocationForm(true); }}>✏️</button>
                      <button className="ud-loc-btn danger" onClick={() => handleDeleteLocation(loc._id)}>🗑️</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {savedLocations.length < 10 && (
              <button className="ud-add-btn" onClick={() => { setEditTarget(null); setShowLocationForm(true); }}>＋ Ajouter une adresse</button>
            )}
          </section>
        )}

        {/* ══ BESOINS ══ */}
        {tab === "demandes" && (
          <section className="ud-page-section">
            <div className="ud-section">
              <div className="ud-section-title">Mes <em>besoins</em></div>
              <div className="ud-section-sub">{nbDemandesActives > 0 ? `${nbDemandesActives} demande${nbDemandesActives > 1 ? "s" : ""} active${nbDemandesActives > 1 ? "s" : ""} — max 5 simultanées` : "Aucune demande active pour le moment"}</div>
            </div>
            <div className="ud-demandes-toolbar">
              <button className="ud-demande-new-btn" onClick={() => { dispatch(clearDemandeError()); setShowDemandeForm(true); }} disabled={nbDemandesActives >= 5}>📣 Publier un besoin</button>
              {nbDemandesActives >= 5 && <span className="ud-demande-limit-hint">Limite de 5 demandes actives atteinte</span>}
            </div>
            {demandeActionError && <div className="ud-error ud-section">{demandeActionError}</div>}
            {demandeLoading ? (
              <SkeletonDemandeList />
            ) : mesDemandes.length === 0 ? (
              <div className="ud-empty ud-section"><div className="ud-empty-icon">📭</div>Vous n'avez pas encore publié de demande.<span>Utilisez le bouton ci-dessus pour exprimer un besoin aux prestataires.</span></div>
            ) : (
              <div className="ud-demande-list">
                {mesDemandes.map((d) => <DemandeCard key={d._id} demande={d} onAnnuler={handleAnnuler} onCloturer={handleCloturer} actionLoading={demandeActionLoading} />)}
              </div>
            )}
          </section>
        )}

        {/* ══ PROFIL ══ */}
        {tab === "profil" && (
          <section className="ud-profile-wrap">
            <div className="ud-section-title" style={{ width: "min(100% - 40px, 1320px)", margin: "0 auto 20px" }}>Mon <em>profil</em></div>
            <div className="ud-profile-card">
              <div className="ud-profile-card-title">Informations du compte</div>
              <div className="ud-profile-card-sub">Vos informations personnelles</div>
              <div className="ud-info-row"><span className="ud-info-label">Prénom</span><span className="ud-info-value">{userInfo?.prenom}</span></div>
              <div className="ud-info-row"><span className="ud-info-label">Nom</span><span className="ud-info-value">{userInfo?.nom}</span></div>
              <div className="ud-info-row"><span className="ud-info-label">Email</span><span className="ud-info-value">{userInfo?.email}</span></div>
              <div className="ud-info-row"><span className="ud-info-label">Rôle</span><span className="ud-badge-role">{userInfo?.role}</span></div>
            </div>
            <div className="ud-profile-card">
              <div className="ud-profile-card-title">Préférences de recherche</div>
              <div className="ud-profile-card-sub">Rayon de recherche des prestataires</div>
              <div className="ud-rayon-row"><span className="ud-rayon-label">Rayon actuel</span><span className="ud-rayon-value">{rayonLocal} km</span></div>
              <input className="ud-rayon-slider" type="range" min={RAYON_MIN} max={RAYON_MAX} value={rayonLocal} onChange={(e) => handleRayonChange(e.target.value)} style={{ "--pct": `${rayonPct}%` }} />
              <div className="ud-rayon-actions">
                <button className="ud-rayon-save" onClick={handleSaveRayon} disabled={rayonSaving || rayonLocal === rayonActif}>{rayonSaving ? "Enregistrement…" : "Sauvegarder"}</button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bottom nav */}
      <nav className="ud-bottom-nav">
        {TABS.map(({ key, LucideIcon, label }) => {
          const badge = key === "demandes" ? nbDemandesActives : 0;
          return (
            <button key={key} className={`ud-nav-btn${tab === key ? " active" : ""}`} onClick={() => setTab(key)}>
              <span className="ud-nav-icon-wrap">
                <span className="ud-nav-icon"><LucideIcon size={22} strokeWidth={tab === key ? 2.2 : 1.8} /></span>
                {badge > 0 && <span className="ud-nav-badge">{badge}</span>}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {showLocationForm && <LocationForm initial={editTarget} onSave={handleSaveLocation} onClose={() => { setShowLocationForm(false); setEditTarget(null); }} loading={savedLocationsLoading} error={savedLocationsError} />}
      {showDemandeForm  && <DemandeForm  onClose={() => { setShowDemandeForm(false); dispatch(clearDemandeError()); }} onSave={handleSaveDemande} loading={demandeActionLoading} error={demandeActionError} categories={categories} metiers={metiers} savedLocations={savedLocations} gpsPosition={gpsPosition} userInfo={userInfo} />}
    </div>
  );
};

export default UserDashboard;