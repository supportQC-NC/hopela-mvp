// src/screens/prestataire/CartePrestaireScreen.jsx
/* eslint-disable react-hooks/exhaustive-deps */
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
import "./CartePrestaireScreen.scss";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const API_URL      = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

const URGENCE_COLORS = {
  haute:  "#ef4444",
  normale: "#f59e0b",
  basse:  "#22c55e",
};

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

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
};

// ── Effets Mapbox ────────────────────────────────────────────────────────────
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
      gl.setFog({ color: "rgba(180,210,240,0.6)", "high-color": "#acd3f0", "horizon-blend": 0.12, "space-color": "#1a2a4a", "star-intensity": 0.1, range: [1, 5] });
    } else if (styleId === "nuit") {
      gl.setFog({ color: "rgba(15,10,5,0.8)", "high-color": "#0a0804", "horizon-blend": 0.08, "space-color": "#030201", "star-intensity": 0.3, range: [1, 4] });
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
// CartePrestaireScreen
// ─────────────────────────────────────────────────────────────────────────────
const CartePrestaireScreen = () => {
  const navigate   = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  // ── Mode toggle : "prestas" | "besoins" ──────────────────────────────────
  const [mode, setMode]               = useState("prestas");

  // ── Données ──────────────────────────────────────────────────────────────
  const [prestataires, setPrestataires] = useState([]);
  const [demandes, setDemandes]         = useState([]);
  const [categories, setCategories]     = useState([]);

  // ── Carte ─────────────────────────────────────────────────────────────────
  const [selected, setSelected]               = useState(null);
  const [styleId, setStyleId]                 = useState("satellite");
  const [filtreCategorie, setFiltreCategorie] = useState("Toutes");
  const [searchNom, setSearchNom]             = useState("");
  const [rayon, setRayon]                     = useState(2);
  const [showRayonPanel, setShowRayonPanel]   = useState(false);
  const [myPos, setMyPos]                     = useState(null);
  const [loadingPrestas, setLoadingPrestas]   = useState(false);
  const [loadingBesoins, setLoadingBesoins]   = useState(false);
  const [viewState, setViewState]             = useState({
    longitude: 166.458,
    latitude: -22.272,
    zoom: 12,
    pitch: 60,
    bearing: -15,
  });

  const mapRef       = useRef(null);
  const currentStyle = MAP_STYLES.find((s) => s.id === styleId);

  // ── Géolocalisation ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
        setMyPos(p);
        setViewState((v) => ({ ...v, longitude: p.longitude, latitude: p.latitude, zoom: 13 }));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // ── Fetch prestataires publics ────────────────────────────────────────────
  useEffect(() => {
    setLoadingPrestas(true);
    fetch(`${API_URL}/api/users/prestataires/positions/public`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPrestataires(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingPrestas(false));
  }, []);

  // ── Fetch demandes prestataire (mode Besoins) ─────────────────────────────
  useEffect(() => {
    if (!userInfo) return;
    setLoadingBesoins(true);
    fetch(`${API_URL}/api/demandes/prestataire/carte`, {
      credentials: "include",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setDemandes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingBesoins(false));
  }, [userInfo]);

  // ── Fetch catégories ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Filtres — mode Prestas ─────────────────────────────────────────────────
  const filtresPrestas = prestataires.filter((p) => {
    const metier  = p.metiers?.[0];
    const catNom  = typeof metier?.categorie === "object" ? metier?.categorie?.nom : null;
    const passeCat = filtreCategorie === "Toutes" || catNom === filtreCategorie;
    const passeNom = searchNom.trim() === "" ||
      `${p.prenom} ${p.nom}`.toLowerCase().includes(searchNom.toLowerCase());

    if (myPos && rayon) {
      const [lng2, lat2] = p.location?.coordinates || [];
      if (!lng2 || !lat2) return false;
      const R    = 6371;
      const dLat = ((lat2 - myPos.latitude) * Math.PI) / 180;
      const dLng = ((lng2 - myPos.longitude) * Math.PI) / 180;
      const a    = Math.sin(dLat / 2) ** 2
        + Math.cos((myPos.latitude * Math.PI) / 180)
        * Math.cos((lat2 * Math.PI) / 180)
        * Math.sin(dLng / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (dist > rayon) return false;
    }

    return passeCat && passeNom;
  });

  // ── Filtres — mode Besoins ────────────────────────────────────────────────
  const filtresBesoins = demandes.filter((d) => {
    const [lng, lat] = d.location?.coordinates || [];
    if (!lng || !lat) return false;

    const catNom   = typeof d.categorie === "object" ? d.categorie?.nom : null;
    const passeCat = filtreCategorie === "Toutes" || catNom === filtreCategorie;

    if (myPos && rayon) {
      const R    = 6371;
      const dLat = ((lat - myPos.latitude) * Math.PI) / 180;
      const dLng = ((lng - myPos.longitude) * Math.PI) / 180;
      const a    = Math.sin(dLat / 2) ** 2
        + Math.cos((myPos.latitude * Math.PI) / 180)
        * Math.cos((lat * Math.PI) / 180)
        * Math.sin(dLng / 2) ** 2;
      const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (dist > rayon) return false;
    }

    return passeCat;
  });

  const circleData = myPos ? makeCircle(myPos.longitude, myPos.latitude, rayon) : null;
  const isLoading  = mode === "prestas" ? loadingPrestas : loadingBesoins;
  const count      = mode === "prestas" ? filtresPrestas.length : filtresBesoins.length;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStyleChange = (id) => {
    const st = MAP_STYLES.find((s) => s.id === id);
    setStyleId(id);
    setSelected(null);
    setViewState((v) => ({ ...v, pitch: st.pitch, bearing: st.bearing }));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelected(null);
    setFiltreCategorie("Toutes");
    setSearchNom("");
  };

  const recenter = () => {
    const pos = myPos || { longitude: 166.458, latitude: -22.272 };
    setViewState((v) => ({
      ...v,
      longitude: pos.longitude,
      latitude:  pos.latitude,
      zoom: 13,
      pitch:   currentStyle.pitch,
      bearing: currentStyle.bearing,
    }));
  };

  return (
    <div
      className="cps-root"
      onClick={() => { setShowRayonPanel(false); }}
    >
      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <div className="cps-topbar">
        <Link to="/prestataire/dashboard" className="cps-back-link">
          ← Dashboard
        </Link>

        {/* Toggle mode */}
        <div className="cps-mode-toggle">
          <button
            className={`cps-mode-btn${mode === "prestas" ? " active" : ""}`}
            onClick={() => handleModeChange("prestas")}
          >
            🗺️ Prestataires
          </button>
          <button
            className={`cps-mode-btn${mode === "besoins" ? " active besoins" : ""}`}
            onClick={() => handleModeChange("besoins")}
          >
            📋 Besoins
          </button>
        </div>

        <div className="cps-topbar-right">
          {mode === "besoins" && (
            <span className="cps-besoins-badge">
              {filtresBesoins.length} demande{filtresBesoins.length !== 1 ? "s" : ""}
            </span>
          )}
          <span className="cps-user-chip">
            {userInfo?.prenom?.[0]}{userInfo?.nom?.[0]}
          </span>
        </div>
      </div>

      {/* ── Filterbar ───────────────────────────────────────────────────── */}
      <div className="cps-filterbar" onClick={(e) => e.stopPropagation()}>

        {/* Compteur live */}
        <div className={`cps-live-chip${mode === "besoins" ? " besoins" : ""}`}>
          <span className="cps-live-dot" />
          <span>
            {isLoading ? "…" : `${count} ${mode === "prestas" ? "en ligne" : "besoins"}`}
          </span>
        </div>

        {/* Recherche (seulement en mode prestas) */}
        {mode === "prestas" && (
          <div className="cps-search-wrap">
            <span className="cps-search-icon">🔍</span>
            <input
              className="cps-search-input"
              type="text"
              placeholder="Rechercher un prestataire…"
              value={searchNom}
              onChange={(e) => { setSearchNom(e.target.value); setSelected(null); }}
            />
            {searchNom && (
              <button className="cps-search-clear" onClick={() => setSearchNom("")}>✕</button>
            )}
          </div>
        )}

        {/* Filtre catégorie */}
        <div className="cps-select-wrap">
          <span className="cps-select-icon">📂</span>
          <select
            className="cps-select"
            value={filtreCategorie}
            onChange={(e) => { setFiltreCategorie(e.target.value); setSelected(null); }}
          >
            <option value="Toutes">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.nom}>{cat.nom}</option>
            ))}
          </select>
          <span className="cps-select-arrow">▼</span>
        </div>

        {/* Rayon */}
        <div className="cps-rayon-wrap">
          <button
            className={`cps-rayon-btn${showRayonPanel ? " active" : ""}`}
            onClick={(e) => { e.stopPropagation(); setShowRayonPanel((x) => !x); }}
          >
            📏 {rayon} km
          </button>

          {showRayonPanel && (
            <div className="cps-rayon-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cps-rayon-header">
                <span>Rayon d'affichage</span>
                <strong className="cps-rayon-value">{rayon} km</strong>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={rayon}
                className="cps-rayon-slider"
                onChange={(e) => { setRayon(Number(e.target.value)); setSelected(null); }}
              />
              <div className="cps-rayon-hints"><span>1 km</span><span>100 km</span></div>
              {!myPos && (
                <p className="cps-rayon-warn">⚠️ Activez votre géolocalisation pour filtrer par rayon.</p>
              )}
            </div>
          )}
        </div>

        {/* Styles */}
        <div className="cps-style-btns">
          {MAP_STYLES.map((ms) => (
            <button
              key={ms.id}
              title={ms.label}
              className={`cps-style-btn${styleId === ms.id ? " active" : ""}`}
              onClick={() => handleStyleChange(ms.id)}
            >
              {ms.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Carte ───────────────────────────────────────────────────────── */}
      <div className="cps-map-container">
        <Map
          ref={mapRef}
          id="cartePrestataire"
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
              <Source id="cps-rayon-fill" type="geojson" data={circleData}>
                <Layer
                  id="cps-rayon-fill-layer"
                  type="fill"
                  paint={{ "fill-color": mode === "besoins" ? "#f59e0b" : "#00a6b2", "fill-opacity": 0.06 }}
                />
              </Source>
              <Source id="cps-rayon-border" type="geojson" data={circleData}>
                <Layer
                  id="cps-rayon-border-layer"
                  type="line"
                  paint={{
                    "line-color": mode === "besoins" ? "#f59e0b" : "#00a6b2",
                    "line-width": 1.5,
                    "line-opacity": 0.5,
                    "line-dasharray": [4, 3],
                  }}
                />
              </Source>
            </>
          )}

          {/* Marqueur ma position */}
          {myPos && (
            <Marker longitude={myPos.longitude} latitude={myPos.latitude} anchor="center">
              <div className="cps-my-marker">
                <div className="cps-my-dot" />
                <div className="cps-my-pulse" />
              </div>
            </Marker>
          )}

          {/* ── MODE PRESTATAIRES ── */}
          {mode === "prestas" && filtresPrestas.map((p) => {
            const [lng, lat] = p.location?.coordinates || [];
            if (!lng || !lat) return null;
            const metierNom = p.metiers?.[0]?.nom || "Prestataire";
            const color     = getColor(metierNom);
            const icon      = getIcon(metierNom);
            const isActive  = selected?._id === p._id && selected?.type !== "demande";
            return (
              <Marker
                key={p._id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelected(isActive ? null : { ...p, type: "presta" });
                }}
              >
                <div
                  className={`cps-marker${isActive ? " cps-marker--active" : ""}`}
                  title={`${p.prenom} ${p.nom} — ${metierNom}`}
                >
                  <div className="cps-marker-head" style={{ background: color, boxShadow: `0 2px 8px ${color}66` }}>
                    <span className="cps-marker-icon">{icon}</span>
                    {isActive && <div className="cps-marker-ring" style={{ borderColor: color }} />}
                  </div>
                  <div className="cps-marker-tip" style={{ borderTopColor: color }} />
                </div>
              </Marker>
            );
          })}

          {/* ── MODE BESOINS ── */}
          {mode === "besoins" && filtresBesoins.map((d) => {
            const [lng, lat] = d.location?.coordinates || [];
            if (!lng || !lat) return null;
            const metierNom = typeof d.metier === "object" ? d.metier?.nom : "Besoin";
            const urgence   = d.urgence || "normale";
            const color     = URGENCE_COLORS[urgence] || URGENCE_COLORS.normale;
            const isActive  = selected?._id === d._id && selected?.type === "demande";
            return (
              <Marker
                key={d._id}
                longitude={lng}
                latitude={lat}
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelected(isActive ? null : { ...d, type: "demande" });
                }}
              >
                <div
                  className={`cps-besoin-marker${isActive ? " active" : ""}`}
                  style={{ background: color, boxShadow: `0 2px 8px ${color}66` }}
                  title={`Besoin : ${metierNom}`}
                >
                  <span>📋</span>
                  {isActive && <div className="cps-besoin-ring" style={{ borderColor: color }} />}
                </div>
              </Marker>
            );
          })}

          {/* Popup Prestataire */}
          {selected?.type === "presta" && (() => {
            const metierNom = selected.metiers?.[0]?.nom || "Prestataire";
            const catNom    = selected.metiers?.[0]?.categorie?.nom || null;
            const color     = getColor(metierNom);
            const [lng, lat] = selected.location?.coordinates || [];
            if (!lng || !lat) return null;
            return (
              <Popup longitude={lng} latitude={lat} anchor="bottom" offset={28} closeOnClick={false} onClose={() => setSelected(null)} style={{ padding: 0 }} className="cps-popup">
                <div className="cps-popup-card">
                  <div className="cps-popup-avatar" style={{ background: color }}>
                    {selected.avatar
                      ? <img src={`${API_URL}${selected.avatar}`} alt={selected.prenom} />
                      : <span>{getIcon(metierNom)}</span>
                    }
                  </div>
                  <div className="cps-popup-info">
                    <div className="cps-popup-name">{selected.prenom} {selected.nom}</div>
                    <div className="cps-popup-metier" style={{ color }}>{metierNom}</div>
                    {catNom && <div className="cps-popup-cat">{catNom}</div>}
                    {selected.ridet && <div className="cps-popup-ridet">RIDET {selected.ridet}</div>}
                  </div>
                  <div className="cps-popup-actions">
                    {selected.telephoneContact && (
                      <a href={`tel:${selected.telephoneContact}`} className="cps-popup-btn cps-popup-btn--tel">📞 Appeler</a>
                    )}
                    {selected.emailContact && (
                      <a href={`mailto:${selected.emailContact}`} className="cps-popup-btn cps-popup-btn--mail">✉️ Email</a>
                    )}
                    <button className="cps-popup-btn cps-popup-btn--profil" onClick={() => navigate(`/prestataire/${selected._id}`)}>
                      👤 Voir le profil
                    </button>
                  </div>
                </div>
              </Popup>
            );
          })()}

          {/* Popup Besoin (demande) */}
          {selected?.type === "demande" && (() => {
            const [lng, lat] = selected.location?.coordinates || [];
            if (!lng || !lat) return null;
            const metierNom = typeof selected.metier === "object" ? selected.metier?.nom : "—";
            const catNom    = typeof selected.categorie === "object" ? selected.categorie?.nom : "—";
            const urgence   = selected.urgence || "normale";
            const color     = URGENCE_COLORS[urgence] || URGENCE_COLORS.normale;
            return (
              <Popup longitude={lng} latitude={lat} anchor="top" offset={16} closeOnClick={false} onClose={() => setSelected(null)} style={{ padding: 0 }} className="cps-popup">
                <div className="cps-besoin-card">
                  <div className="cps-besoin-card-header">
                    <span className="cps-besoin-urgence-dot" style={{ background: color }} />
                    <span className="cps-besoin-urgence-label" style={{ color }}>
                      {urgence.charAt(0).toUpperCase() + urgence.slice(1)}
                    </span>
                    <span className="cps-besoin-expire">Expire le {fmtDate(selected.expireAt)}</span>
                  </div>
                  <div className="cps-besoin-metier">🔧 {metierNom}</div>
                  {catNom && <div className="cps-besoin-cat">📂 {catNom}</div>}
                  {selected.description && (
                    <p className="cps-besoin-desc">{selected.description}</p>
                  )}
                  <div className="cps-besoin-footer">
                    <span className="cps-besoin-badge">Demande active</span>
                  </div>
                </div>
              </Popup>
            );
          })()}
        </Map>

        <button className="cps-recenter-btn" onClick={recenter} title="Recentrer">🎯</button>

        {/* Légende mode Besoins */}
        {mode === "besoins" && (
          <div className="cps-legende">
            <div className="cps-legende-title">Urgence</div>
            {Object.entries(URGENCE_COLORS).map(([key, color]) => (
              <div key={key} className="cps-legende-item">
                <span className="cps-legende-dot" style={{ background: color }} />
                <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartePrestaireScreen;