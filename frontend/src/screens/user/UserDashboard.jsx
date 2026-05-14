// src/screens/user/UserDashboard.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
import PublicMap from "../../components/map/PublicMap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ─── CSS injecté ──────────────────────────────────────────────────────────────
const CSS = `
  /* ── Base ── */
  .ud { min-height:100vh; background:#0a0804; font-family:'DM Sans',sans-serif; color:#f5f0e8; display:flex; flex-direction:column; }

  /* ── Header ── */
  .ud-header {
    height:56px; display:flex; align-items:center; justify-content:space-between;
    padding:0 16px; background:rgba(10,8,4,0.97); backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(201,168,76,0.12); position:sticky; top:0; z-index:200; flex-shrink:0;
  }
  .ud-logo { display:flex; align-items:center; gap:8px; }
  .ud-logo-mark {
    width:30px; height:30px; border-radius:50%;
    background:linear-gradient(135deg,#c9a84c,#8a6c28);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-weight:700; font-size:15px; color:#0a0804;
  }
  .ud-logo-name { font-family:'Cormorant Garamond',serif; font-weight:700; font-size:18px; color:#f5f0e8; }
  .ud-header-right { display:flex; align-items:center; gap:8px; }
  .ud-avatar {
    width:30px; height:30px; border-radius:50%;
    background:linear-gradient(135deg,#c9a84c,#8a6c28);
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:700; color:#0a0804; font-family:'Cormorant Garamond',serif;
  }
  .ud-logout {
    background:none; border:1px solid rgba(201,168,76,0.2); border-radius:6px;
    padding:5px 10px; cursor:pointer; font-size:11px; color:rgba(245,240,232,0.5);
    font-family:'DM Sans',sans-serif; transition:all 0.2s;
  }
  .ud-logout:hover { border-color:rgba(239,68,68,0.4); color:#fca5a5; }

  /* ── Bottom nav (mobile) ── */
  .ud-bottom-nav {
    position:fixed; bottom:0; left:0; right:0; z-index:200;
    display:flex; background:rgba(10,8,4,0.97); backdrop-filter:blur(20px);
    border-top:1px solid rgba(201,168,76,0.12); height:60px;
  }
  .ud-nav-btn {
    flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center;
    gap:3px; border:none; background:none; cursor:pointer;
    font-family:'DM Sans',sans-serif; font-size:10px; color:rgba(245,240,232,0.35);
    transition:all 0.2s; padding:0;
  }
  .ud-nav-btn.active { color:#c9a84c; }
  .ud-nav-btn span:first-child { font-size:20px; }

  /* ── Content ── */
  .ud-content { flex:1; overflow:auto; padding-bottom:60px; }

  /* ── Tab carte ── */
  .ud-map-tab { height:calc(100vh - 56px - 60px); display:flex; flex-direction:column; }
  .ud-map-wrap { flex:1; min-height:0; }

  /* ── Tab adresses ── */
  .ud-section { padding:16px 16px 0; }
  .ud-section-title {
    font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700;
    color:#f5f0e8; margin-bottom:4px;
  }
  .ud-section-title em { color:#c9a84c; font-style:italic; }
  .ud-section-sub { font-size:13px; color:rgba(245,240,232,0.4); margin-bottom:16px; }

  /* Rayon card */
  .ud-rayon-card {
    background:#120e07; border:1px solid rgba(201,168,76,0.15); border-radius:14px;
    padding:16px; margin:0 16px 16px;
  }
  .ud-rayon-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .ud-rayon-label { font-size:12px; color:rgba(245,240,232,0.45); letter-spacing:1px; text-transform:uppercase; }
  .ud-rayon-value { font-size:20px; font-weight:700; color:#c9a84c; }
  .ud-rayon-slider {
    width:100%; height:4px; -webkit-appearance:none; appearance:none;
    background:linear-gradient(to right, #c9a84c calc(var(--pct,50%)), rgba(201,168,76,0.15) calc(var(--pct,50%)));
    border-radius:2px; outline:none; cursor:pointer;
  }
  .ud-rayon-slider::-webkit-slider-thumb {
    -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
    background:#c9a84c; border:2px solid #0a0804; cursor:pointer;
    box-shadow:0 2px 8px rgba(201,168,76,0.4);
  }
  .ud-rayon-actions { display:flex; gap:8px; margin-top:10px; }
  .ud-rayon-save {
    flex:1; padding:8px; border-radius:8px; border:none; cursor:pointer;
    background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0804;
    font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; letter-spacing:1px;
    transition:all 0.2s;
  }
  .ud-rayon-save:disabled { opacity:0.5; cursor:not-allowed; }
  .ud-rayon-hint { font-size:11px; color:rgba(245,240,232,0.25); margin-top:6px; text-align:center; }

  /* Liste adresses */
  .ud-loc-list { padding:0 16px; display:flex; flex-direction:column; gap:10px; margin-bottom:12px; }
  .ud-loc-card {
    background:#120e07; border:1px solid rgba(201,168,76,0.12); border-radius:12px;
    padding:14px; display:flex; align-items:flex-start; gap:12px;
    transition:border-color 0.2s;
  }
  .ud-loc-card.is-default { border-color:rgba(201,168,76,0.4); }
  .ud-loc-icon {
    width:36px; height:36px; border-radius:8px; flex-shrink:0;
    background:rgba(201,168,76,0.08); border:1px solid rgba(201,168,76,0.15);
    display:flex; align-items:center; justify-content:center; font-size:16px;
  }
  .ud-loc-info { flex:1; min-width:0; }
  .ud-loc-name-row { display:flex; align-items:center; gap:6px; margin-bottom:2px; }
  .ud-loc-name { font-size:14px; font-weight:600; color:#f5f0e8; }
  .ud-loc-default-badge {
    font-size:9px; font-weight:700; letter-spacing:1px; text-transform:uppercase;
    color:#c9a84c; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.25);
    border-radius:4px; padding:1px 6px;
  }
  .ud-loc-addr { font-size:11px; color:rgba(245,240,232,0.35); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ud-loc-coords { font-size:10px; color:rgba(245,240,232,0.2); font-family:monospace; margin-top:2px; }
  .ud-loc-actions { display:flex; gap:6px; flex-shrink:0; }
  .ud-loc-btn {
    width:30px; height:30px; border-radius:6px; border:1px solid rgba(201,168,76,0.15);
    background:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    font-size:13px; transition:all 0.2s; color:rgba(245,240,232,0.4);
  }
  .ud-loc-btn:hover { background:rgba(201,168,76,0.08); border-color:rgba(201,168,76,0.3); color:#f5f0e8; }
  .ud-loc-btn.danger:hover { border-color:rgba(239,68,68,0.4); color:#fca5a5; background:rgba(239,68,68,0.06); }

  /* Ajouter adresse */
  .ud-add-btn {
    margin:0 16px 16px; display:flex; align-items:center; justify-content:center; gap:8px;
    padding:14px; border-radius:12px; border:1px dashed rgba(201,168,76,0.25);
    background:rgba(201,168,76,0.03); cursor:pointer; font-family:'DM Sans',sans-serif;
    font-size:13px; font-weight:500; color:rgba(201,168,76,0.6); transition:all 0.2s; width:calc(100% - 32px);
  }
  .ud-add-btn:hover { border-color:rgba(201,168,76,0.5); color:#c9a84c; background:rgba(201,168,76,0.06); }

  /* Formulaire adresse */
  .ud-form-overlay {
    position:fixed; inset:0; z-index:300; background:rgba(0,0,0,0.7);
    display:flex; align-items:flex-end; justify-content:center;
  }
  .ud-form-sheet {
    width:100%; max-width:560px; background:#120e07;
    border-radius:20px 20px 0 0; padding:24px 20px 40px;
    border:1px solid rgba(201,168,76,0.15); border-bottom:none;
    animation:slideUp 0.25s ease;
  }
  @keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }
  .ud-form-handle {
    width:36px; height:4px; background:rgba(245,240,232,0.15); border-radius:2px;
    margin:0 auto 20px;
  }
  .ud-form-title { font-size:16px; font-weight:600; color:#f5f0e8; margin-bottom:16px; }
  .ud-field { margin-bottom:14px; }
  .ud-label { display:block; font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:rgba(245,240,232,0.35); margin-bottom:6px; }
  .ud-input {
    width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(201,168,76,0.15);
    border-radius:8px; padding:10px 12px; font-family:'DM Sans',sans-serif; font-size:14px;
    color:#f5f0e8; outline:none; transition:all 0.2s; box-sizing:border-box;
  }
  .ud-input::placeholder { color:rgba(245,240,232,0.2); }
  .ud-input:focus { border-color:rgba(201,168,76,0.5); box-shadow:0 0 0 3px rgba(201,168,76,0.08); }
  .ud-row { display:flex; gap:10px; }
  .ud-row .ud-field { flex:1; }
  .ud-checkbox-row { display:flex; align-items:center; gap:8px; margin-bottom:14px; cursor:pointer; }
  .ud-checkbox-row input { accent-color:#c9a84c; width:16px; height:16px; cursor:pointer; }
  .ud-checkbox-label { font-size:13px; color:rgba(245,240,232,0.6); }
  .ud-gps-btn {
    width:100%; padding:10px; border-radius:8px; border:1px solid rgba(201,168,76,0.2);
    background:rgba(201,168,76,0.06); color:#c9a84c; font-family:'DM Sans',sans-serif;
    font-size:13px; cursor:pointer; margin-bottom:14px; transition:all 0.2s;
  }
  .ud-gps-btn:hover { background:rgba(201,168,76,0.1); }
  .ud-form-actions { display:flex; gap:10px; }
  .ud-btn-cancel {
    flex:1; padding:12px; border-radius:8px; border:1px solid rgba(245,240,232,0.1);
    background:none; color:rgba(245,240,232,0.5); font-family:'DM Sans',sans-serif;
    font-size:13px; cursor:pointer; transition:all 0.2s;
  }
  .ud-btn-save {
    flex:2; padding:12px; border-radius:8px; border:none;
    background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0804;
    font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; cursor:pointer;
    transition:all 0.2s;
  }
  .ud-btn-save:disabled { opacity:0.5; cursor:not-allowed; }
  .ud-error { font-size:12px; color:#fca5a5; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); border-radius:8px; padding:10px 12px; margin-bottom:12px; }
  .ud-empty { text-align:center; padding:32px 16px; color:rgba(245,240,232,0.3); font-size:13px; }

  /* ── Banner géoloc désactivée ── */
  .ud-geo-banner {
    background: rgba(251,191,36,0.08); border-bottom: 1px solid rgba(251,191,36,0.2);
    padding: 10px 16px; display: flex; align-items: center; gap: 10px; flex-shrink: 0;
  }
  .ud-geo-banner-icon { font-size: 18px; flex-shrink: 0; }
  .ud-geo-banner-text { flex: 1; font-size: 12px; color: rgba(251,191,36,0.85); line-height: 1.5; }
  .ud-geo-banner-text strong { color: #fbbf24; }
  .ud-geo-banner-btn {
    flex-shrink: 0; padding: 6px 14px; border-radius: 6px; border: 1px solid rgba(251,191,36,0.4);
    background: rgba(251,191,36,0.1); color: #fbbf24; font-family: 'DM Sans',sans-serif;
    font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 0.2s;
  }
  .ud-geo-banner-btn:hover { background: rgba(251,191,36,0.2); }
  .ud-geo-banner-close {
    background: none; border: none; color: rgba(251,191,36,0.4); cursor: pointer; font-size: 16px; padding: 0 4px;
  }
  .ud-profile-wrap { padding:16px; }
  .ud-profile-card {
    background:#120e07; border:1px solid rgba(201,168,76,0.12); border-radius:14px; padding:20px; margin-bottom:12px;
  }
  .ud-profile-card-title { font-size:14px; font-weight:600; color:#c9a84c; margin-bottom:4px; }
  .ud-profile-card-sub { font-size:12px; color:rgba(245,240,232,0.35); margin-bottom:16px; }
  .ud-info-row { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
  .ud-info-label { font-size:11px; color:rgba(245,240,232,0.35); width:80px; flex-shrink:0; }
  .ud-info-value { font-size:13px; color:#f5f0e8; }
  .ud-badge-role {
    font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
    color:#c9a84c; background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.25);
    border-radius:4px; padding:2px 8px;
  }

  /* ── Tableau prestataires ── */
  .ud-presta-section { padding:12px 16px 0; flex-shrink:0; }
  .ud-presta-title { font-size:12px; font-weight:600; color:rgba(245,240,232,0.5); letter-spacing:1px; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:6px; }
  .ud-presta-count { background:rgba(201,168,76,0.1); border:1px solid rgba(201,168,76,0.2); border-radius:10px; padding:1px 7px; font-size:10px; color:#c9a84c; }
  .ud-presta-table-wrap { padding:0 16px 80px; overflow-x:auto; }
  .ud-presta-table { width:100%; border-collapse:collapse; min-width:420px; }
  .ud-presta-table th { font-size:9px; letter-spacing:1.5px; text-transform:uppercase; color:rgba(245,240,232,0.3); font-weight:600; padding:6px 8px; text-align:left; border-bottom:1px solid rgba(201,168,76,0.08); }
  .ud-presta-table td { padding:10px 8px; border-bottom:1px solid rgba(255,255,255,0.04); font-size:12px; color:#f5f0e8; vertical-align:middle; }
  .ud-presta-table tr:last-child td { border-bottom:none; }
  .ud-presta-table tr:hover td { background:rgba(201,168,76,0.04); }
  .ud-presta-avatar { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
  .ud-presta-name { font-weight:600; font-size:13px; }
  .ud-presta-metier { font-size:10px; color:rgba(245,240,232,0.4); margin-top:1px; }
  .ud-presta-dist { font-size:11px; color:#c9a84c; font-weight:600; white-space:nowrap; }
  .ud-call-btn { display:inline-flex; align-items:center; gap:4px; padding:5px 10px; border-radius:6px; border:none; cursor:pointer; background:linear-gradient(135deg,#c9a84c,#e8c97a); color:#0a0804; font-family:'DM Sans',sans-serif; font-size:10px; font-weight:700; letter-spacing:1px; text-decoration:none; transition:all 0.2s; white-space:nowrap; }
  .ud-call-btn:hover { transform:translateY(-1px); }
  .ud-empty-presta { text-align:center; padding:24px; color:rgba(245,240,232,0.3); font-size:12px; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const LABEL_ICONS = { "Domicile": "🏠", "Bureau": "🏢", "Travail": "💼", "École": "🎓", "Gym": "💪", "default": "📍" };
const getIcon = (label) => LABEL_ICONS[label] || LABEL_ICONS.default;

const RAYON_MIN = 1;
const RAYON_MAX = 100;

// ─── Formulaire ajout/édition adresse (bottom sheet) ─────────────────────────
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
      (pos) => {
        setLongitude(pos.coords.longitude.toFixed(6));
        setLatitude(pos.coords.latitude.toFixed(6));
        setGpsStatus("✓ Position GPS capturée");
        setTimeout(() => setGpsStatus(""), 2000);
      },
      () => setGpsStatus("❌ GPS non disponible"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = () => {
    if (!label.trim() || !longitude || !latitude) return;
    onSave({
      label:     label.trim(),
      longitude: parseFloat(longitude),
      latitude:  parseFloat(latitude),
      adresse:   adresse.trim() || null,
      isDefault,
      ...(initial?._id ? { locationId: initial._id } : {}),
    });
  };

  return (
    <div className="ud-form-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ud-form-sheet">
        <div className="ud-form-handle" />
        <div className="ud-form-title">{initial?._id ? "Modifier l'adresse" : "Nouvelle adresse"}</div>

        {error && <div className="ud-error">{error}</div>}

        <div className="ud-field">
          <label className="ud-label">Nom de l'adresse *</label>
          <input className="ud-input" placeholder="Ex : Domicile, Bureau, Chez Maman…" value={label} onChange={(e) => setLabel(e.target.value)} maxLength={50} />
        </div>

        <button className="ud-gps-btn" onClick={fillWithGps} type="button">
          📍 {gpsStatus || "Utiliser ma position GPS actuelle"}
        </button>

        <div className="ud-row">
          <div className="ud-field">
            <label className="ud-label">Longitude *</label>
            <input className="ud-input" type="number" step="any" placeholder="166.4580" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
          </div>
          <div className="ud-field">
            <label className="ud-label">Latitude *</label>
            <input className="ud-input" type="number" step="any" placeholder="-22.2760" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
          </div>
        </div>

        <div className="ud-field">
          <label className="ud-label">Adresse lisible (optionnel)</label>
          <input className="ud-input" placeholder="Ex : 12 rue des Fleurs, Nouméa" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </div>

        <label className="ud-checkbox-row">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
          <span className="ud-checkbox-label">Définir comme adresse par défaut</span>
        </label>

        <div className="ud-form-actions">
          <button className="ud-btn-cancel" onClick={onClose}>Annuler</button>
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

// ─── Composant principal ──────────────────────────────────────────────────────
const UserDashboard = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { userInfo } = useSelector((s) => s.auth);
  const {
    savedLocations,
    savedLocationsLoading,
    savedLocationsError,
    rayonActif,
    rayonModified,
    activeSource,
    gpsPosition,
    prestataires,
  } = useSelector((s) => s.location);

  const [tab,        setTab]        = useState("carte");
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [rayonLocal, setRayonLocal] = useState(rayonActif);
  const [rayonSaving, setRayonSaving] = useState(false);
  const [filtreMetier, setFiltreMetier] = useState("Tous");
  const [geoBlocked, setGeoBlocked] = useState(false);   // géoloc refusée/indispo
  const [geoBannerVisible, setGeoBannerVisible] = useState(true);

  // Injecter CSS
  useEffect(() => {
    if (!document.getElementById("ud-css")) {
      const s = document.createElement("style");
      s.id = "ud-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  // Charger adresses + sync rayon au montage
  useEffect(() => {
    dispatch(fetchSavedLocations());
    if (userInfo?.rayonRecherche) {
      dispatch(syncRayonFromProfile(userInfo.rayonRecherche));
      setRayonLocal(userInfo.rayonRecherche);
    }
  }, [dispatch, userInfo?.rayonRecherche]);

  // Demander le GPS au montage — déclenche la popup système si jamais demandé
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
          dispatch(fetchPrestatairesPositions({
            lng: longitude, lat: latitude, rayon: rayonActif,
          }));
        },
        (err) => {
          // code 1 = PERMISSION_DENIED (refusé par l'user ou le système)
          // code 2 = POSITION_UNAVAILABLE
          // code 3 = TIMEOUT
          setGeoBlocked(true);
          dispatch(fetchPrestatairesPositions({}));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    // Vérifier l'état de la permission avant d'appeler
    // "prompt" → popup système déclenchée automatiquement par getCurrentPosition
    // "granted" → position obtenue directement
    // "denied"  → refusé, on ne peut plus demander
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "denied") {
          // Déjà refusé → pas de popup possible, afficher le banner
          setGeoBlocked(true);
          dispatch(fetchPrestatairesPositions({}));
        } else {
          // "granted" ou "prompt" → appeler getCurrentPosition
          // Si "prompt" : le navigateur affiche "hopela.pro souhaite accéder à votre position"
          requestGps();
        }
        // Écouter si l'user change la permission dans les paramètres
        result.onchange = () => {
          if (result.state === "granted") {
            setGeoBlocked(false);
            requestGps();
          } else if (result.state === "denied") {
            setGeoBlocked(true);
          }
        };
      });
    } else {
      // API Permissions non supportée → appel direct (déclenche la popup)
      requestGps();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/users/logout`, { method: "POST", credentials: "include" });
    dispatch(logout());
    navigate("/");
  };

  // ── Rayon ──
  const handleRayonChange = (v) => {
    const n = Number(v);
    setRayonLocal(n);
  };

  const handleSaveRayon = async () => {
    setRayonSaving(true);
    await dispatch(updateRayon(rayonLocal));
    setRayonSaving(false);
    // Recharger les pros avec le nouveau rayon
    const pos = gpsPosition;
    if (pos) {
      dispatch(fetchPrestatairesPositions({ lng: pos.longitude, lat: pos.latitude, rayon: rayonLocal }));
    }
  };

  const rayonPct = ((rayonLocal - RAYON_MIN) / (RAYON_MAX - RAYON_MIN)) * 100;

  // ── CRUD adresses ──
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
    dispatch(fetchPrestatairesPositions({
      lng: loc.longitude, lat: loc.latitude, rayon: rayonActif,
    }));
    setTab("carte");
  };

  const handleUseGps = () => {
    dispatch(setActiveSource("gps"));
    if (gpsPosition) {
      dispatch(fetchPrestatairesPositions({
        lng: gpsPosition.longitude, lat: gpsPosition.latitude, rayon: rayonActif,
      }));
    }
    setTab("carte");
  };

  // ── Position active pour la carte ──
  const getActivePosition = () => {
    if (activeSource === "gps") return gpsPosition;
    const id = activeSource.replace("saved:", "");
    const loc = savedLocations.find((l) => l._id === id);
    return loc ? { longitude: loc.longitude, latitude: loc.latitude } : gpsPosition;
  };

  const activeLabel = activeSource === "gps"
    ? "📍 Ma position GPS"
    : savedLocations.find((l) => `saved:${l._id}` === activeSource)?.label || "Adresse";

  return (
    <div className="ud">
      {/* CSS */}
      {/* ── Header ── */}
      <header className="ud-header">
        <div className="ud-logo">
          <div className="ud-logo-mark">H</div>
          <span className="ud-logo-name">Hopela</span>
        </div>
        <div className="ud-header-right">
          <div className="ud-avatar">{userInfo?.prenom?.[0]}{userInfo?.nom?.[0]}</div>
          <button className="ud-logout" onClick={handleLogout}>Déco.</button>
        </div>
      </header>

      {/* ── Banner géoloc désactivée ── */}
      {geoBlocked && geoBannerVisible && (
        <div className="ud-geo-banner">
          <span className="ud-geo-banner-icon">📍</span>
          <div className="ud-geo-banner-text">
            <strong>Géolocalisation bloquée.</strong> Pour voir les prestataires près de vous, autorisez l'accès à votre position.
            <br />
            <span style={{ fontSize: 11, opacity: 0.7 }}>
              Cliquez sur le cadenas 🔒 dans la barre d'adresse → <strong>Localisation</strong> → <strong>Autoriser</strong>, puis rechargez la page.
            </span>
          </div>
          <button className="ud-geo-banner-btn" onClick={() => window.location.reload()}>
            🔄 Réessayer
          </button>
          <button className="ud-geo-banner-close" onClick={() => setGeoBannerVisible(false)}>✕</button>
        </div>
      )}

      {/* ── Contenu ── */}
      <div className="ud-content">

        {/* ═══ ONGLET CARTE ═══ */}
        {tab === "carte" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px - 60px)", overflow: "hidden" }}>
            {/* Carte — hauteur fixe */}
            <div style={{ height: "55%", minHeight: 220, flexShrink: 0 }}>
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
                    dispatch(fetchPrestatairesPositions({ lng: loc.longitude, lat: loc.latitude, rayon: rayonActif }));
                  } else if (src === "gps" && gpsPosition) {
                    dispatch(fetchPrestatairesPositions({ lng: gpsPosition.longitude, lat: gpsPosition.latitude, rayon: rayonActif }));
                  }
                }}
              />
            </div>

            {/* Tableau prestataires — scrollable */}
            <div style={{ flex: 1, overflowY: "auto", background: "#0a0804", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
              <div className="ud-presta-section">
                <div className="ud-presta-title">
                  Prestataires disponibles
                  <span className="ud-presta-count">
                    {filtreMetier === "Tous"
                      ? prestataires.length
                      : prestataires.filter(p => p.metiers?.[0]?.nom === filtreMetier).length}
                  </span>
                  {filtreMetier !== "Tous" && (
                    <span style={{ fontSize: 10, color: "#c9a84c", marginLeft: 4 }}>
                      · {filtreMetier}
                      <button onClick={() => setFiltreMetier("Tous")} style={{ background: "none", border: "none", color: "rgba(245,240,232,0.3)", cursor: "pointer", marginLeft: 4, fontSize: 11 }}>✕</button>
                    </span>
                  )}
                  {rayonLocal && <span style={{ fontSize: 10, color: "rgba(245,240,232,0.25)", marginLeft: 4 }}>dans {rayonLocal} km</span>}
                </div>
              </div>

              {prestataires.length === 0 ? (
                <div className="ud-empty-presta">
                  Aucun prestataire disponible dans ce rayon.<br />
                  <span style={{ fontSize: 10, color: "rgba(245,240,232,0.2)" }}>Essayez d'augmenter le rayon de recherche.</span>
                </div>
              ) : (
                <div className="ud-presta-table-wrap">
                  <table className="ud-presta-table">
                    <thead>
                      <tr>
                        <th>Prestataire</th>
                        <th>Métier</th>
                        <th>Distance</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prestataires
                        .filter(p => filtreMetier === "Tous" || p.metiers?.[0]?.nom === filtreMetier)
                        .map((p, idx) => {
                        const metierNom = p.metiers?.[0]?.nom || "—";
                        const activePos = getActivePosition();
                        // Calcul distance approx (Haversine simplifié)
                        let distStr = "—";
                        if (activePos && p.location?.coordinates) {
                          const [lng2, lat2] = p.location.coordinates;
                          const R = 6371;
                          const dLat = (lat2 - activePos.latitude)  * Math.PI / 180;
                          const dLng = (lng2 - activePos.longitude) * Math.PI / 180;
                          const a = Math.sin(dLat/2)**2 + Math.cos(activePos.latitude*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
                          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                          distStr = dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`;
                        }

                        const METIER_COLORS = {
                          "Électricien":"#f59e0b","Plombier":"#3b82f6","Menuisier":"#92400e",
                          "Peintre":"#ec4899","Jardinier":"#22c55e","Climatisation":"#06b6d4",
                          "Femme de ménage":"#a78bfa","Maçon":"#f97316","Photographe":"#e11d48",
                          "Carreleur":"#84cc16","Garde d'enfants":"#f43f5e","Informaticien":"#6366f1","Coursier":"#14b8a6",
                        };
                        const METIER_ICONS = {
                          "Électricien":"⚡","Plombier":"🔧","Menuisier":"🪚","Peintre":"🎨",
                          "Jardinier":"🌿","Climatisation":"❄️","Femme de ménage":"🧹","Maçon":"🧱",
                          "Photographe":"📸","Carreleur":"🔲","Garde d'enfants":"👶","Informaticien":"💻","Coursier":"🛵",
                        };
                        const color = METIER_COLORS[metierNom] || "#c9a84c";
                        const icon  = METIER_ICONS[metierNom]  || "📍";

                        return (
                          <tr key={p._id}>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div className="ud-presta-avatar" style={{ background: color + "22", border: `1px solid ${color}44` }}>
                                  {icon}
                                </div>
                                <div>
                                  <div className="ud-presta-name">{p.prenom} {p.nom}</div>
                                  {p.ridet && <div style={{ fontSize: 9, color: "rgba(245,240,232,0.2)" }}>RIDET {p.ridet}</div>}
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ background: color + "18", border: `1px solid ${color}44`, borderRadius: 6, padding: "2px 6px", fontSize: 10, color, fontWeight: 600 }}>
                                {icon} {metierNom}
                              </span>
                            </td>
                            <td><span className="ud-presta-dist">📍 {idx === 0 ? "Le + proche" : distStr}</span></td>
                            <td>
                              {p.telephoneContact ? (
                                <a href={"tel:" + p.telephoneContact} className="ud-call-btn">
                                  📞 Appeler
                                </a>
                              ) : p.emailContact ? (
                                <a href={"mailto:" + p.emailContact} className="ud-call-btn" style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}>
                                  ✉️ Email
                                </a>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ONGLET ADRESSES ═══ */}
        {tab === "adresses" && (
          <>
            <div className="ud-section">
              <div className="ud-section-title">Mes <em>adresses</em></div>
              <div className="ud-section-sub">
                {savedLocations.length} / 10 adresse{savedLocations.length !== 1 ? "s" : ""} enregistrée{savedLocations.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Rayon de recherche */}
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
                  {rayonSaving ? "Enregistrement…" : "💾 Sauvegarder le rayon"}
                </button>
              </div>
              <div className="ud-rayon-hint">Modifiable aussi directement sur la carte</div>
            </div>

            {/* Position GPS */}
            <div style={{ padding: "0 16px", marginBottom: 10 }}>
              <div className="ud-loc-card" style={{ cursor: "pointer" }} onClick={handleUseGps}>
                <div className="ud-loc-icon">📍</div>
                <div className="ud-loc-info">
                  <div className="ud-loc-name-row">
                    <span className="ud-loc-name">Ma position GPS</span>
                    {activeSource === "gps" && <span className="ud-loc-default-badge">Active</span>}
                  </div>
                  <div className="ud-loc-addr">
                    {gpsPosition
                      ? `${gpsPosition.latitude.toFixed(4)}, ${gpsPosition.longitude.toFixed(4)}`
                      : "Appuyer pour activer le GPS"}
                  </div>
                </div>
                <div className="ud-loc-actions">
                  <button className="ud-loc-btn" title="Utiliser sur la carte" onClick={(e) => { e.stopPropagation(); handleUseGps(); }}>🗺️</button>
                </div>
              </div>
            </div>

            {/* Liste adresses enregistrées */}
            {savedLocations.length === 0 ? (
              <div className="ud-empty">
                <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
                Aucune adresse enregistrée.<br />Ajoutez votre domicile pour commencer.
              </div>
            ) : (
              <div className="ud-loc-list">
                {savedLocations.map((loc) => (
                  <div key={loc._id} className={`ud-loc-card${loc.isDefault ? " is-default" : ""}`}>
                    <div className="ud-loc-icon">{getIcon(loc.label)}</div>
                    <div className="ud-loc-info">
                      <div className="ud-loc-name-row">
                        <span className="ud-loc-name">{loc.label}</span>
                        {loc.isDefault && <span className="ud-loc-default-badge">Défaut</span>}
                        {activeSource === `saved:${loc._id}` && <span className="ud-loc-default-badge" style={{ color: "#4ade80", borderColor: "rgba(74,222,128,0.3)", background: "rgba(74,222,128,0.08)" }}>Active</span>}
                      </div>
                      {loc.adresse && <div className="ud-loc-addr">{loc.adresse}</div>}
                      <div className="ud-loc-coords">{loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</div>
                    </div>
                    <div className="ud-loc-actions">
                      <button className="ud-loc-btn" title="Voir sur la carte" onClick={() => handleSelectOnMap(loc)}>🗺️</button>
                      {!loc.isDefault && (
                        <button className="ud-loc-btn" title="Définir par défaut" onClick={() => handleSetDefault(loc._id)}>⭐</button>
                      )}
                      <button className="ud-loc-btn" title="Modifier" onClick={() => { setEditTarget(loc); setShowForm(true); }}>✏️</button>
                      <button className="ud-loc-btn danger" title="Supprimer" onClick={() => handleDelete(loc._id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {savedLocations.length < 10 && (
              <button className="ud-add-btn" onClick={() => { setEditTarget(null); setShowForm(true); }}>
                ＋ Ajouter une adresse
              </button>
            )}
          </>
        )}

        {/* ═══ ONGLET PROFIL ═══ */}
        {tab === "profil" && (
          <div className="ud-profile-wrap">
            <div className="ud-section-title" style={{ marginBottom: 16 }}>Mon <em>profil</em></div>

            <div className="ud-profile-card">
              <div className="ud-profile-card-title">Informations du compte</div>
              <div className="ud-profile-card-sub">Vos informations personnelles</div>
              <div className="ud-info-row"><span className="ud-info-label">Prénom</span><span className="ud-info-value">{userInfo?.prenom}</span></div>
              <div className="ud-info-row"><span className="ud-info-label">Nom</span><span className="ud-info-value">{userInfo?.nom}</span></div>
              <div className="ud-info-row"><span className="ud-info-label">Email</span><span className="ud-info-value" style={{ fontSize: 12 }}>{userInfo?.email}</span></div>
              <div className="ud-info-row"><span className="ud-info-label">Rôle</span><span className="ud-badge-role">{userInfo?.role}</span></div>
            </div>

            <div className="ud-profile-card">
              <div className="ud-profile-card-title">Préférences de recherche</div>
              <div className="ud-profile-card-sub">Rayon de recherche des prestataires</div>
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
              <div className="ud-rayon-actions" style={{ marginTop: 12 }}>
                <button
                  className="ud-rayon-save"
                  onClick={handleSaveRayon}
                  disabled={rayonSaving || rayonLocal === rayonActif}
                >
                  {rayonSaving ? "Enregistrement…" : "💾 Sauvegarder"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <nav className="ud-bottom-nav">
        {[
          { key: "carte",    icon: "🗺️",  label: "Carte" },
          { key: "adresses", icon: "📍",  label: "Adresses" },
          { key: "profil",   icon: "👤",  label: "Profil" },
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

      {/* ── Formulaire Bottom Sheet ── */}
      {showForm && (
        <LocationForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditTarget(null); }}
          loading={savedLocationsLoading}
          error={savedLocationsError}
        />
      )}
    </div>
  );
};

export default UserDashboard;
