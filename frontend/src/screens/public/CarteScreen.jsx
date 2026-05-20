// src/screens/public/CarteScreen.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  Source,
  Layer,
  useMap,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import getSocket from "../../services/socketManager";
import "./CarteScreen.scss";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MAP_STYLES = [
  {
    id: "satellite",
    label: "🛰️ Satellite",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    pitch: 60,
    bearing: -15,
    terrain: true,
  },
  {
    id: "plan",
    label: "🗺️ Plan",
    url: "mapbox://styles/mapbox/streets-v12",
    pitch: 0,
    bearing: 0,
    terrain: false,
  },
  {
    id: "nuit",
    label: "🌙 Nuit",
    url: "mapbox://styles/mapbox/dark-v11",
    pitch: 45,
    bearing: -10,
    terrain: false,
  },
  {
    id: "relief",
    label: "⛰️ Relief",
    url: "mapbox://styles/mapbox/outdoors-v12",
    pitch: 60,
    bearing: -10,
    terrain: true,
  },
];

const METIER_COLORS = {
  Électricien: "#f59e0b",
  Plombier: "#3b82f6",
  Menuisier: "#10b981",
  Peintre: "#8b5cf6",
  Jardinier: "#22c55e",
  Climatisation: "#06b6d4",
  "Femme de ménage": "#ec4899",
  Maçon: "#64748b",
  Photographe: "#f97316",
  Carreleur: "#6366f1",
  "Garde d'enfants": "#14b8a6",
  Informaticien: "#00a6b2",
  Coursier: "#84cc16",
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
const getColor = (nom) => METIER_COLORS[nom] || "#00a6b2";
const getIcon  = (nom) => METIER_ICONS[nom]  || "📍";

const makeCircle = (lng, lat, radiusKm, steps = 64) => {
  const R = 6371;
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * (2 * Math.PI);
    const dLat  = (radiusKm / R) * (180 / Math.PI);
    const dLng  = dLat / Math.cos((lat * Math.PI) / 180);
    coords.push([lng + dLng * Math.sin(angle), lat + dLat * Math.cos(angle)]);
  }
  return { type: "Feature", geometry: { type: "Polygon", coordinates: [coords] } };
};

// ── Effets Mapbox (terrain, brouillard) ──────────────────────────────────────
const MapEffects = ({ styleId }) => {
  const { current: map } = useMap();
  const applyEffects = useCallback(() => {
    if (!map) return;
    const gl = map.getMap();
    const style = MAP_STYLES.find((s) => s.id === styleId);
    if (style?.terrain) {
      if (!gl.getSource("mapbox-dem")) {
        gl.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
      }
      gl.setTerrain({ source: "mapbox-dem", exaggeration: 1.4 });
    } else {
      gl.setTerrain(null);
    }
    if (styleId === "satellite" || styleId === "relief") {
      gl.setFog({
        color: "rgba(180,210,240,0.6)",
        "high-color": "#acd3f0",
        "horizon-blend": 0.12,
        "space-color": "#1a2a4a",
        "star-intensity": 0.1,
        range: [1, 5],
      });
    } else if (styleId === "nuit") {
      gl.setFog({
        color: "rgba(15,10,5,0.8)",
        "high-color": "#0a0804",
        "horizon-blend": 0.08,
        "space-color": "#030201",
        "star-intensity": 0.3,
        range: [1, 4],
      });
    } else {
      gl.setFog(null);
    }
  }, [map, styleId]);

  useEffect(() => {
    if (!map) return;
    const gl = map.getMap();
    if (gl.isStyleLoaded()) applyEffects();
    else gl.once("style.load", applyEffects);
    return () => { try { gl.off("style.load", applyEffects); } catch (_) {} };
  }, [map, styleId, applyEffects]);

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// CarteScreen — Carte plein écran publique
// ─────────────────────────────────────────────────────────────────────────────
const CarteScreen = () => {
  const navigate   = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // Si prestataire → rediriger vers sa carte dédiée
  useEffect(() => {
    if (userInfo?.role === "prestataire") {
      navigate("/prestataire/carte", { replace: true });
    }
  }, [userInfo, navigate]);

  // ── State ────────────────────────────────────────────────────────────────
  const [prestataires, setPrestataires]       = useState([]);
  const [categories, setCategories]           = useState([]);
  const [selected, setSelected]               = useState(null);
  const [styleId, setStyleId]                 = useState("satellite");
  const [filtreCategorie, setFiltreCategorie] = useState("Toutes");
  const [searchNom, setSearchNom]             = useState("");
  const [rayon, setRayon]                     = useState(2);
  const [showRayonPanel, setShowRayonPanel]   = useState(false);
  const [showFilters, setShowFilters]         = useState(false);
  const [userPos, setUserPos]                 = useState(null);
  const [viewState, setViewState]             = useState({
    longitude: 166.458,
    latitude: -22.272,
    zoom: 11.5,
    pitch: 60,
    bearing: -15,
  });

  const mapRef      = useRef(null);
  const currentStyle = MAP_STYLES.find((s) => s.id === styleId);

  // ── Géolocalisation utilisateur ──────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pos2 = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
        setUserPos(pos2);
        setViewState((v) => ({ ...v, longitude: pos2.longitude, latitude: pos2.latitude, zoom: 13 }));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // ── Fetch prestataires publics ───────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/users/prestataires/positions/public`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPrestataires(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Fetch catégories ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Socket temps réel ────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    const onUpdate = ({ userId, longitude, latitude }) => {
      setPrestataires((prev) =>
        prev.map((p) =>
          p._id !== userId
            ? p
            : { ...p, location: { ...p.location, coordinates: [longitude, latitude] } }
        )
      );
    };
    const onStop = ({ userId }) => {
      setPrestataires((prev) => prev.filter((p) => p._id !== userId));
    };
    socket.on("location_updated", onUpdate);
    socket.on("tracking_stopped", onStop);
    return () => {
      socket.off("location_updated", onUpdate);
      socket.off("tracking_stopped", onStop);
    };
  }, []);

  // ── Filtrage ─────────────────────────────────────────────────────────────
  const filtres = prestataires.filter((p) => {
    const metier  = p.metiers?.[0];
    const catNom  = typeof metier?.categorie === "object" ? metier?.categorie?.nom : null;
    const passeCat = filtreCategorie === "Toutes" || catNom === filtreCategorie;
    const passeNom = searchNom.trim() === "" ||
      `${p.prenom} ${p.nom}`.toLowerCase().includes(searchNom.toLowerCase());

    // Filtre rayon si position connue
    if (userPos && rayon) {
      const [lng2, lat2] = p.location?.coordinates || [];
      if (!lng2 || !lat2) return false;
      const R    = 6371;
      const dLat = ((lat2 - userPos.latitude) * Math.PI) / 180;
      const dLng = ((lng2 - userPos.longitude) * Math.PI) / 180;
      const a    = Math.sin(dLat / 2) ** 2
        + Math.cos((userPos.latitude * Math.PI) / 180)
        * Math.cos((lat2 * Math.PI) / 180)
        * Math.sin(dLng / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (dist > rayon) return false;
    }

    return passeCat && passeNom;
  });

  const circleData = userPos
    ? makeCircle(userPos.longitude, userPos.latitude, rayon)
    : null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStyleChange = (id) => {
    const st = MAP_STYLES.find((s) => s.id === id);
    setStyleId(id);
    setSelected(null);
    setViewState((v) => ({ ...v, pitch: st.pitch, bearing: st.bearing }));
  };

  const recenter = () => {
    const pos = userPos || { longitude: 166.458, latitude: -22.272 };
    setViewState((v) => ({
      ...v,
      longitude: pos.longitude,
      latitude:  pos.latitude,
      zoom: 13,
      pitch:   currentStyle.pitch,
      bearing: currentStyle.bearing,
    }));
  };

  const getDashPath = () => {
    if (!userInfo) return "/login";
    if (userInfo.role === "admin")       return "/admin/dashboard";
    if (userInfo.role === "prestataire") return "/prestataire/dashboard";
    return "/dashboard";
  };

  return (
    <div
      className="cs-root"
      onClick={() => { setShowRayonPanel(false); setShowFilters(false); }}
    >
      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <div className="cs-topbar">
        {/* Logo / retour */}
        <Link to="/" className="cs-logo">
          <span className="cs-logo-icon">◈</span>
          <span className="cs-logo-name">Hopela</span>
        </Link>

        {/* Titre */}
        <div className="cs-topbar-title">
          <span className="cs-live-dot" />
          <span>{filtres.length} prestataire{filtres.length !== 1 ? "s" : ""} en ligne</span>
        </div>

        {/* Actions */}
        <div className="cs-topbar-actions">
          {userInfo ? (
            <button className="cs-btn-cta" onClick={() => navigate(getDashPath())}>
              Mon espace
            </button>
          ) : (
            <button className="cs-btn-cta" onClick={() => navigate("/login")}>
              Connexion
            </button>
          )}
        </div>
      </div>

      {/* ── Barre de filtres ──────────────────────────────────────────────── */}
      <div
        className="cs-filterbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Recherche nom */}
        <div className="cs-search-wrap">
          <span className="cs-search-icon">🔍</span>
          <input
            className="cs-search-input"
            type="text"
            placeholder="Rechercher un prestataire…"
            value={searchNom}
            onChange={(e) => { setSearchNom(e.target.value); setSelected(null); }}
          />
          {searchNom && (
            <button className="cs-search-clear" onClick={() => setSearchNom("")}>✕</button>
          )}
        </div>

        {/* Filtre catégorie */}
        <div className="cs-select-wrap">
          <span className="cs-select-icon">📂</span>
          <select
            className="cs-select"
            value={filtreCategorie}
            onChange={(e) => { setFiltreCategorie(e.target.value); setSelected(null); }}
          >
            <option value="Toutes">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.nom}>{cat.nom}</option>
            ))}
          </select>
          <span className="cs-select-arrow">▼</span>
        </div>

        {/* Rayon */}
        <div className="cs-rayon-wrap">
          <button
            className={`cs-rayon-btn${showRayonPanel ? " active" : ""}`}
            onClick={(e) => { e.stopPropagation(); setShowRayonPanel((x) => !x); setShowFilters(false); }}
          >
            📏 {rayon} km
          </button>
          {showRayonPanel && (
            <div className="cs-rayon-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cs-rayon-panel-header">
                <span>Rayon de recherche</span>
                <strong className="cs-rayon-value">{rayon} km</strong>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={rayon}
                className="cs-rayon-slider"
                onChange={(e) => setRayon(Number(e.target.value))}
              />
              <div className="cs-rayon-hints">
                <span>1 km</span>
                <span>100 km</span>
              </div>
              {!userPos && (
                <p className="cs-rayon-warn">⚠️ Activez votre géolocalisation pour filtrer par rayon.</p>
              )}
            </div>
          )}
        </div>

        {/* Styles carte */}
        <div className="cs-style-btns">
          {MAP_STYLES.map((ms) => (
            <button
              key={ms.id}
              title={ms.label}
              className={`cs-style-btn${styleId === ms.id ? " active" : ""}`}
              onClick={() => handleStyleChange(ms.id)}
            >
              {ms.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Carte ─────────────────────────────────────────────────────────── */}
      <div className="cs-map-container">
        <Map
          ref={mapRef}
          id="cartePublic"
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          style={{ width: "100%", height: "100%" }}
          mapStyle={currentStyle.url}
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={() => setSelected(null)}
          antialias
          maxPitch={85}
        >
          <MapEffects styleId={styleId} />
          <NavigationControl position="bottom-right" visualizePitch />

          {/* Cercle rayon */}
          {circleData && (
            <>
              <Source id="cs-rayon-fill" type="geojson" data={circleData}>
                <Layer
                  id="cs-rayon-fill-layer"
                  type="fill"
                  paint={{ "fill-color": "#00a6b2", "fill-opacity": 0.06 }}
                />
              </Source>
              <Source id="cs-rayon-border" type="geojson" data={circleData}>
                <Layer
                  id="cs-rayon-border-layer"
                  type="line"
                  paint={{
                    "line-color": "#00a6b2",
                    "line-width": 1.5,
                    "line-opacity": 0.5,
                    "line-dasharray": [4, 3],
                  }}
                />
              </Source>
            </>
          )}

          {/* Marqueur position utilisateur */}
          {userPos && (
            <Marker longitude={userPos.longitude} latitude={userPos.latitude} anchor="center">
              <div className="cs-user-marker">
                <div className="cs-user-dot" />
                <div className="cs-user-pulse" />
              </div>
            </Marker>
          )}

          {/* Marqueurs prestataires */}
          {filtres.map((p) => {
            const [lng, lat] = p.location?.coordinates || [];
            if (!lng || !lat) return null;
            const metierNom = p.metiers?.[0]?.nom || "Prestataire";
            const color     = getColor(metierNom);
            const icon      = getIcon(metierNom);
            const isActive  = selected?._id === p._id;
            return (
              <Marker
                key={p._id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(isActive ? null : p); }}
              >
                <div
                  className={`cs-marker${isActive ? " cs-marker--active" : ""}`}
                  style={{ "--color": color }}
                  title={`${p.prenom} ${p.nom} — ${metierNom}`}
                >
                  <div className="cs-marker-head" style={{ background: color, boxShadow: `0 2px 8px ${color}66` }}>
                    <span className="cs-marker-icon">{icon}</span>
                    {isActive && <div className="cs-marker-ring" style={{ borderColor: color }} />}
                  </div>
                  <div className="cs-marker-tip" style={{ borderTopColor: color }} />
                </div>
              </Marker>
            );
          })}

          {/* Popup */}
          {selected && (() => {
            const metierNom = selected.metiers?.[0]?.nom || "Prestataire";
            const catNom    = selected.metiers?.[0]?.categorie?.nom || null;
            const color     = getColor(metierNom);
            const [lng, lat] = selected.location?.coordinates || [];
            if (!lng || !lat) return null;
            return (
              <Popup
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                offset={28}
                closeOnClick={false}
                onClose={() => setSelected(null)}
                style={{ padding: 0 }}
                className="cs-popup"
              >
                <div className="cs-popup-card">
                  <div className="cs-popup-avatar" style={{ background: color }}>
                    {selected.avatar
                      ? <img src={`${API_URL}${selected.avatar}`} alt={selected.prenom} />
                      : <span>{getIcon(metierNom)}</span>
                    }
                  </div>
                  <div className="cs-popup-info">
                    <div className="cs-popup-name">{selected.prenom} {selected.nom}</div>
                    <div className="cs-popup-metier" style={{ color }}>{metierNom}</div>
                    {catNom && <div className="cs-popup-cat">{catNom}</div>}
                    {selected.ridet && (
                      <div className="cs-popup-ridet">RIDET {selected.ridet}</div>
                    )}
                  </div>
                  <div className="cs-popup-actions">
                    {selected.telephoneContact && (
                      <a href={`tel:${selected.telephoneContact}`} className="cs-popup-btn cs-popup-btn--tel">
                        📞 Appeler
                      </a>
                    )}
                    {selected.emailContact && (
                      <a href={`mailto:${selected.emailContact}`} className="cs-popup-btn cs-popup-btn--mail">
                        ✉️ Email
                      </a>
                    )}
                    <button
                      className="cs-popup-btn cs-popup-btn--profil"
                      onClick={() => navigate(`/prestataire/${selected._id}`)}
                    >
                      👤 Voir le profil
                    </button>
                  </div>
                </div>
              </Popup>
            );
          })()}
        </Map>

        {/* Bouton recentrer */}
        <button className="cs-recenter-btn" onClick={recenter} title="Recentrer">
          🎯
        </button>

        {/* Bouton retour */}
        <button className="cs-back-btn" onClick={() => navigate(-1)} title="Retour">
          ← Retour
        </button>
      </div>
    </div>
  );
};

export default CarteScreen;