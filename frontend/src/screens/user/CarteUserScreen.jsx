// src/screens/user/CarteUserScreen.jsx
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  Source,
  Layer,
  useMap,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  fetchPrestatairesPositions,
  fetchSavedLocations,
  setActiveSource,
  setGpsPosition,
  syncRayonFromProfile,
  updateRayon,
} from "../../slices/locationSlice";
import "./CarteUserScreen.scss";

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
// CarteUserScreen
// ─────────────────────────────────────────────────────────────────────────────
const CarteUserScreen = () => {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { userInfo }    = useSelector((state) => state.auth);
  const {
    prestataires,
    gpsPosition,
    savedLocations,
    activeSource,
    rayonActif,
    loading,
  } = useSelector((state) => state.location);

  // ── State local ──────────────────────────────────────────────────────────
  const [categories, setCategories]           = useState([]);
  const [demandes, setDemandes]               = useState([]);
  const [selected, setSelected]               = useState(null);
  const [styleId, setStyleId]                 = useState("satellite");
  const [filtreCategorie, setFiltreCategorie] = useState("Toutes");
  const [searchNom, setSearchNom]             = useState("");
  const [rayonLocal, setRayonLocal]           = useState(rayonActif || userInfo?.rayonRecherche || 2);
  const [rayonSaving, setRayonSaving]         = useState(false);
  const [showRayonPanel, setShowRayonPanel]   = useState(false);
  const [showSrcPicker, setShowSrcPicker]     = useState(false);
  const [viewState, setViewState]             = useState({
    longitude: 166.458,
    latitude: -22.272,
    zoom: 12,
    pitch: 60,
    bearing: -15,
  });

  const mapRef      = useRef(null);
  const currentStyle = MAP_STYLES.find((s) => s.id === styleId);

  // ── Sync rayon depuis profil ──────────────────────────────────────────────
  useEffect(() => {
    const r = userInfo?.rayonRecherche || 2;
    dispatch(syncRayonFromProfile(r));
    setRayonLocal(r);
  }, []);

  // ── Charger les adresses enregistrées ────────────────────────────────────
  useEffect(() => {
    dispatch(fetchSavedLocations());
  }, []);

  // ── Charger les catégories ────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Charger les demandes (besoins visibles par tous) ──────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/demandes/prestataire/carte`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setDemandes(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // ── Géolocalisation GPS ───────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      // Pas de géoloc dispo → fetch public sans filtre rayon
      dispatch(fetchPrestatairesPositions({}));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { longitude: pos.coords.longitude, latitude: pos.coords.latitude };
        dispatch(setGpsPosition(p));
        setViewState((v) => ({ ...v, longitude: p.longitude, latitude: p.latitude, zoom: 13 }));
        if (activeSource === "gps") {
          dispatch(fetchPrestatairesPositions({ lng: p.longitude, lat: p.latitude, rayon: rayonLocal }));
        }
      },
      () => {
        // Géoloc refusée → fetch public sans filtre rayon
        dispatch(fetchPrestatairesPositions({}));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  // ── Centrer carte sur la source active ────────────────────────────────────
  useEffect(() => {
    const pos = getActivePosition();
    if (!pos) return;
    setViewState((v) => ({ ...v, longitude: pos.longitude, latitude: pos.latitude, zoom: Math.max(v.zoom, 12) }));
  }, [activeSource, gpsPosition]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getActivePosition = () => {
    if (activeSource === "gps") return gpsPosition;
    const id  = activeSource.replace("saved:", "");
    const loc = savedLocations.find((l) => l._id === id);
    return loc ? { longitude: loc.longitude, latitude: loc.latitude } : gpsPosition;
  };

  const activePos   = getActivePosition();
  const activeLabel = activeSource === "gps"
    ? "📍 Ma position GPS"
    : savedLocations.find((l) => `saved:${l._id}` === activeSource)?.label || "Adresse";

  // ── Filtrage ──────────────────────────────────────────────────────────────
  const filtres = prestataires.filter((p) => {
    const metier  = p.metiers?.[0];
    const catNom  = typeof metier?.categorie === "object" ? metier?.categorie?.nom : null;
    const passeCat = filtreCategorie === "Toutes" || catNom === filtreCategorie;
    const passeNom = searchNom.trim() === "" ||
      `${p.prenom} ${p.nom}`.toLowerCase().includes(searchNom.toLowerCase());
    return passeCat && passeNom;
  });

  const circleData = activePos ? makeCircle(activePos.longitude, activePos.latitude, rayonLocal) : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStyleChange = (id) => {
    const st = MAP_STYLES.find((s) => s.id === id);
    setStyleId(id);
    setSelected(null);
    setViewState((v) => ({ ...v, pitch: st.pitch, bearing: st.bearing }));
  };

  const handleSelectSource = (src) => {
    dispatch(setActiveSource(src));
    const id  = src.replace("saved:", "");
    const loc = savedLocations.find((l) => l._id === id);
    const pos = loc ? { longitude: loc.longitude, latitude: loc.latitude } : gpsPosition;
    if (pos) {
      dispatch(fetchPrestatairesPositions({ lng: pos.longitude, lat: pos.latitude, rayon: rayonLocal }));
    }
    setShowSrcPicker(false);
  };

  const handleSaveRayon = async () => {
    setRayonSaving(true);
    await dispatch(updateRayon(rayonLocal));
    if (activePos) {
      dispatch(fetchPrestatairesPositions({ lng: activePos.longitude, lat: activePos.latitude, rayon: rayonLocal }));
    }
    setRayonSaving(false);
    setShowRayonPanel(false);
  };

  const recenter = () => {
    const pos = activePos || { longitude: 166.458, latitude: -22.272 };
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
      className="cus-root"
      onClick={() => { setShowRayonPanel(false); setShowSrcPicker(false); }}
    >
      {/* ── Topbar ──────────────────────────────────────────────────────── */}
      <div className="cus-topbar">
        <Link to="/dashboard" className="cus-back-link">
          ← Dashboard
        </Link>

        <div className="cus-topbar-center">
          <span className="cus-live-dot" />
          <span>
            {loading ? "Chargement…" : `${filtres.length} prestataire${filtres.length !== 1 ? "s" : ""} disponible${filtres.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        <div className="cus-topbar-right">
          <span className="cus-user-chip">
            {userInfo?.prenom?.[0]}{userInfo?.nom?.[0]}
          </span>
        </div>
      </div>

      {/* ── Filterbar ───────────────────────────────────────────────────── */}
      <div className="cus-filterbar" onClick={(e) => e.stopPropagation()}>

        {/* Source position */}
        <div className="cus-src-wrap">
          <button
            className={`cus-src-btn${activeSource !== "gps" ? " inactive" : ""}`}
            onClick={(e) => { e.stopPropagation(); setShowSrcPicker((x) => !x); setShowRayonPanel(false); }}
          >
            📍 {activeLabel} <span className="cus-caret">▼</span>
          </button>

          {showSrcPicker && (
            <div className="cus-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="cus-dropdown-title">Source de recherche</div>
              <button
                className={`cus-dropdown-item${activeSource === "gps" ? " active" : ""}`}
                onClick={() => handleSelectSource("gps")}
              >
                📍 Ma position GPS
              </button>
              {savedLocations.map((loc) => (
                <button
                  key={loc._id}
                  className={`cus-dropdown-item${activeSource === `saved:${loc._id}` ? " active" : ""}`}
                  onClick={() => handleSelectSource(`saved:${loc._id}`)}
                >
                  {loc.isDefault ? "★ " : "📍 "}{loc.label}
                  {loc.adresse && <span className="cus-dropdown-sub">{loc.adresse}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recherche nom */}
        <div className="cus-search-wrap">
          <span className="cus-search-icon">🔍</span>
          <input
            className="cus-search-input"
            type="text"
            placeholder="Rechercher…"
            value={searchNom}
            onChange={(e) => { setSearchNom(e.target.value); setSelected(null); }}
          />
          {searchNom && (
            <button className="cus-search-clear" onClick={() => setSearchNom("")}>✕</button>
          )}
        </div>

        {/* Filtre catégorie */}
        <div className="cus-select-wrap">
          <span className="cus-select-icon">📂</span>
          <select
            className="cus-select"
            value={filtreCategorie}
            onChange={(e) => { setFiltreCategorie(e.target.value); setSelected(null); }}
          >
            <option value="Toutes">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.nom}>{cat.nom}</option>
            ))}
          </select>
          <span className="cus-select-arrow">▼</span>
        </div>

        {/* Rayon */}
        <div className="cus-rayon-wrap">
          <button
            className={`cus-rayon-btn${showRayonPanel ? " active" : ""}`}
            onClick={(e) => { e.stopPropagation(); setShowRayonPanel((x) => !x); setShowSrcPicker(false); }}
          >
            📏 {rayonLocal} km
          </button>

          {showRayonPanel && (
            <div className="cus-rayon-panel" onClick={(e) => e.stopPropagation()}>
              <div className="cus-rayon-header">
                <span>Rayon</span>
                <strong className="cus-rayon-value">{rayonLocal} km</strong>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={rayonLocal}
                className="cus-rayon-slider"
                onChange={(e) => setRayonLocal(Number(e.target.value))}
              />
              <div className="cus-rayon-hints"><span>1 km</span><span>100 km</span></div>
              <button
                className="cus-rayon-save"
                disabled={rayonSaving}
                onClick={handleSaveRayon}
              >
                {rayonSaving ? "Enregistrement…" : "Sauvegarder"}
              </button>
            </div>
          )}
        </div>

        {/* Styles */}
        <div className="cus-style-btns">
          {MAP_STYLES.map((ms) => (
            <button
              key={ms.id}
              title={ms.label}
              className={`cus-style-btn${styleId === ms.id ? " active" : ""}`}
              onClick={() => handleStyleChange(ms.id)}
            >
              {ms.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Carte ───────────────────────────────────────────────────────── */}
      <div className="cus-map-container">
        <Map
          ref={mapRef}
          id="carteUser"
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
              <Source id="cus-rayon-fill" type="geojson" data={circleData}>
                <Layer
                  id="cus-rayon-fill-layer"
                  type="fill"
                  paint={{ "fill-color": "#00a6b2", "fill-opacity": 0.07 }}
                />
              </Source>
              <Source id="cus-rayon-border" type="geojson" data={circleData}>
                <Layer
                  id="cus-rayon-border-layer"
                  type="line"
                  paint={{ "line-color": "#00a6b2", "line-width": 1.5, "line-opacity": 0.5, "line-dasharray": [4, 3] }}
                />
              </Source>
            </>
          )}

          {/* Marqueur position active */}
          {activePos && (
            <Marker longitude={activePos.longitude} latitude={activePos.latitude} anchor="center">
              <div className="cus-user-marker">
                <div className="cus-user-dot" />
                <div className="cus-user-pulse" />
              </div>
            </Marker>
          )}

          {/* Marqueurs adresses enregistrées */}
          {savedLocations.map((loc) => (
            <Marker key={loc._id} longitude={loc.longitude} latitude={loc.latitude} anchor="center">
              <div
                className={`cus-saved-marker${activeSource === `saved:${loc._id}` ? " active" : ""}`}
                onClick={(e) => { e.stopPropagation(); handleSelectSource(`saved:${loc._id}`); }}
                title={loc.label}
              >
                📍
              </div>
            </Marker>
          ))}

          {/* Marqueurs prestataires */}
          {filtres.map((p) => {
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
                onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(isActive ? null : { ...p, type: "presta" }); }}
              >
                <div
                  className={`cus-marker${isActive ? " cus-marker--active" : ""}`}
                  style={{ "--color": color }}
                  title={`${p.prenom} ${p.nom} — ${metierNom}`}
                >
                  <div className="cus-marker-head" style={{ background: color, boxShadow: `0 2px 8px ${color}66` }}>
                    <span className="cus-marker-icon">{icon}</span>
                    {isActive && <div className="cus-marker-ring" style={{ borderColor: color }} />}
                  </div>
                  <div className="cus-marker-tip" style={{ borderTopColor: color }} />
                </div>
              </Marker>
            );
          })}

          {/* ── Marqueurs Besoins / Demandes ── */}
          {demandes.map((d) => {
            const [lng, lat] = d.location?.coordinates || [];
            if (!lng || !lat) return null;
            const metierNom = typeof d.metier === "object" ? d.metier?.nom : "Besoin";
            const isActive  = selected?._id === d._id && selected?.type === "demande";
            const urgColor  = d.urgence === "haute" ? "#ef4444" : d.urgence === "basse" ? "#22c55e" : "#f59e0b";
            return (
              <Marker
                key={d._id}
                longitude={lng}
                latitude={lat}
                anchor="center"
                onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(isActive ? null : { ...d, type: "demande" }); }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: urgColor,
                    border: "2px solid rgba(255,255,255,0.85)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    cursor: "pointer",
                    boxShadow: isActive ? `0 0 0 3px ${urgColor}55, 0 4px 12px ${urgColor}66` : `0 2px 8px ${urgColor}66`,
                    transform: isActive ? "scale(1.2)" : "scale(1)",
                    transition: "transform 0.2s",
                  }}
                  title={`Besoin : ${metierNom}`}
                >
                  📋
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
              <Popup
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                offset={28}
                closeOnClick={false}
                onClose={() => setSelected(null)}
                style={{ padding: 0 }}
                className="cus-popup"
              >
                <div className="cus-popup-card">
                  <div className="cus-popup-avatar" style={{ background: color }}>
                    {selected.avatar
                      ? <img src={`${API_URL}${selected.avatar}`} alt={selected.prenom} />
                      : <span>{getIcon(metierNom)}</span>
                    }
                  </div>
                  <div className="cus-popup-info">
                    <div className="cus-popup-name">{selected.prenom} {selected.nom}</div>
                    <div className="cus-popup-metier" style={{ color }}>{metierNom}</div>
                    {catNom && <div className="cus-popup-cat">{catNom}</div>}
                    {selected.ridet && <div className="cus-popup-ridet">RIDET {selected.ridet}</div>}
                  </div>
                  <div className="cus-popup-actions">
                    {selected.telephoneContact && (
                      <a href={`tel:${selected.telephoneContact}`} className="cus-popup-btn cus-popup-btn--tel">
                        📞 Appeler
                      </a>
                    )}
                    {selected.emailContact && (
                      <a href={`mailto:${selected.emailContact}`} className="cus-popup-btn cus-popup-btn--mail">
                        ✉️ Email
                      </a>
                    )}
                    <button
                      className="cus-popup-btn cus-popup-btn--profil"
                      onClick={() => navigate(`/prestataire/${selected._id}`)}
                    >
                      👤 Voir le profil
                    </button>
                  </div>
                </div>
              </Popup>
            );
          })()}

          {/* Popup Besoin */}
          {selected?.type === "demande" && (() => {
            const [lng, lat] = selected.location?.coordinates || [];
            if (!lng || !lat) return null;
            const metierNom = typeof selected.metier === "object" ? selected.metier?.nom : "—";
            const catNom    = typeof selected.categorie === "object" ? selected.categorie?.nom : null;
            const urgColor  = selected.urgence === "haute" ? "#ef4444" : selected.urgence === "basse" ? "#22c55e" : "#f59e0b";
            const urgLabel  = selected.urgence ? selected.urgence.charAt(0).toUpperCase() + selected.urgence.slice(1) : "Normale";
            const expireStr = selected.expireAt ? new Date(selected.expireAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "—";
            return (
              <Popup
                longitude={lng}
                latitude={lat}
                anchor="top"
                offset={16}
                closeOnClick={false}
                onClose={() => setSelected(null)}
                style={{ padding: 0 }}
                className="cus-popup"
              >
                <div className="cus-popup-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: urgColor, flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: urgColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>{urgLabel}</span>
                    <span style={{ fontSize: 10, color: "#5b7083", marginLeft: "auto" }}>Expire le {expireStr}</span>
                  </div>
                  <div className="cus-popup-name">📋 {metierNom}</div>
                  {catNom && <div className="cus-popup-cat">{catNom}</div>}
                  {selected.description && (
                    <p style={{ fontSize: 12, color: "#102a43", lineHeight: 1.5, margin: "8px 0 0", padding: "8px", background: "rgba(16,42,67,0.03)", borderRadius: 6, borderLeft: `3px solid ${urgColor}` }}>
                      {selected.description}
                    </p>
                  )}
                </div>
              </Popup>
            );
          })()}
        </Map>

        <button className="cus-recenter-btn" onClick={recenter} title="Recentrer">🎯</button>
      </div>
    </div>
  );
};

export default CarteUserScreen;