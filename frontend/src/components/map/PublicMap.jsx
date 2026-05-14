/* eslint-disable react-hooks/exhaustive-deps */
// src/components/map/PublicMap.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer, useMap } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import getSocket from "../../services/socketManager";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const API_URL      = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MAP_STYLES = [
  { id: "nuit",      label: "🌙 Nuit",      url: "mapbox://styles/mapbox/dark-v11",             pitch: 45, terrain: false },
  { id: "satellite", label: "🛰️ Satellite", url: "mapbox://styles/mapbox/satellite-streets-v12", pitch: 60, terrain: true  },
  { id: "plan",      label: "🗺️ Plan",      url: "mapbox://styles/mapbox/streets-v12",           pitch: 0,  terrain: false },
  { id: "relief",    label: "⛰️ Relief",    url: "mapbox://styles/mapbox/outdoors-v12",          pitch: 60, terrain: true  },
];

const METIER_COLORS = {
  "Électricien":"#f59e0b","Plombier":"#3b82f6","Menuisier":"#92400e","Peintre":"#ec4899",
  "Jardinier":"#22c55e","Climatisation":"#06b6d4","Femme de ménage":"#a78bfa","Maçon":"#f97316",
  "Photographe":"#e11d48","Carreleur":"#84cc16","Garde d'enfants":"#f43f5e","Informaticien":"#6366f1","Coursier":"#14b8a6",
};
const METIER_ICONS = {
  "Électricien":"⚡","Plombier":"🔧","Menuisier":"🪚","Peintre":"🎨","Jardinier":"🌿",
  "Climatisation":"❄️","Femme de ménage":"🧹","Maçon":"🧱","Photographe":"📸",
  "Carreleur":"🔲","Garde d'enfants":"👶","Informaticien":"💻","Coursier":"🛵",
};
const getColor = (nom) => METIER_COLORS[nom] || "#c9a84c";
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

const MapEffects = ({ styleId }) => {
  const { current: map } = useMap();
  const applyEffects = useCallback(() => {
    if (!map) return;
    const gl = map.getMap();
    const style = MAP_STYLES.find((s) => s.id === styleId);
    if (style?.terrain) {
      if (!gl.getSource("mapbox-dem")) {
        gl.addSource("mapbox-dem", { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1", tileSize: 512, maxzoom: 14 });
      }
      gl.setTerrain({ source: "mapbox-dem", exaggeration: 1.4 });
    } else { gl.setTerrain(null); }
    if (styleId !== "satellite" && !gl.getLayer("3d-buildings")) {
      try {
        gl.addLayer({ id: "3d-buildings", source: "composite", "source-layer": "building", filter: ["==", "extrude", "true"], type: "fill-extrusion", minzoom: 14,
          paint: { "fill-extrusion-color": styleId === "nuit" ? "#1a1408" : "#d4c5a0", "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, ["get", "height"]], "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 14, 0, 15, ["get", "min_height"]], "fill-extrusion-opacity": styleId === "nuit" ? 0.85 : 0.6 },
        });
      } catch (_) {}
    }
    if (styleId === "nuit") {
      gl.setFog({ color: "rgba(15,10,5,0.8)", "high-color": "#0a0804", "horizon-blend": 0.08, "space-color": "#030201", "star-intensity": 0.3, range: [1, 4] });
    } else if (styleId === "satellite" || styleId === "relief") {
      gl.setFog({ color: "rgba(180,210,240,0.6)", "high-color": "#acd3f0", "horizon-blend": 0.12, "space-color": "#1a2a4a", "star-intensity": 0.1, range: [1, 5] });
    } else { gl.setFog(null); }
  }, [map, styleId]);

  useEffect(() => {
    if (!map) return;
    const gl = map.getMap();
    if (gl.isStyleLoaded()) { applyEffects(); }
    else { gl.once("style.load", applyEffects); }
    return () => { try { gl.off("style.load", applyEffects); } catch (_) {} };
  }, [map, styleId, applyEffects]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Props (toutes optionnelles — sans props = mode landing public)
//   centerPosition   { longitude, latitude } — centre la carte + marqueur bleu
//   rayon            number km — affiche le cercle de rayon
//   activeLabel      string — label du sélecteur de source
//   onRayonChange    fn(v) — slider rayon
//   onSaveRayon      fn() — sauvegarder rayon
//   rayonSaving      bool
//   savedLocations   array — marqueurs adresses enregistrées
//   activeSource     "gps" | "saved:{id}"
//   onSelectSource   fn(src)
//   prestataires     array — si fourni, utilise ce tableau au lieu du fetch public
// ─────────────────────────────────────────────────────────────────────────────
const PublicMap = ({
  centerPosition  = null,
  rayon           = null,
  activeLabel     = null,
  onRayonChange   = null,
  onSaveRayon     = null,
  rayonSaving     = false,
  savedLocations  = [],
  activeSource    = "gps",
  onSelectSource  = null,
  prestataires:   prestatairesProps = null,
  filtreMetier:   filtreMetierProp  = null,   // filtre contrôlé par le parent
  onFiltreChange  = null,                      // callback quand l'user clique une chip
}) => {
  const isUserMode = prestatairesProps !== null || onSelectSource !== null;

  const [prestatairesLocal, setPrestatairesLocal] = useState([]);
  // filtreMetier : contrôlé si prop fournie, sinon local
  const [filtreMetierLocal, setFiltreMetierLocal] = useState("Tous");
  const filtreMetier    = filtreMetierProp !== null ? filtreMetierProp : filtreMetierLocal;
  const setFiltreMetier = (v) => {
    if (onFiltreChange) onFiltreChange(v);
    else setFiltreMetierLocal(v);
  };
  const [selected,      setSelected]      = useState(null);
  const [styleId,       setStyleId]       = useState("nuit");
  const [showRayonCtrl, setShowRayonCtrl] = useState(false);
  const [showSrcPicker, setShowSrcPicker] = useState(false);
  const [rayonLocal,    setRayonLocal]    = useState(rayon != null ? rayon : 10);
  const [viewState,     setViewState]     = useState({ longitude: 166.458, latitude: -22.272, zoom: 11.5, pitch: 45, bearing: -10 });

  const mapRef       = useRef(null);
  const currentStyle = MAP_STYLES.find((s) => s.id === styleId);

  // Source des prestataires : props (mode user) ou fetch public (landing)
  const prestataires = isUserMode ? (prestatairesProps || []) : prestatairesLocal;

  // Sync rayon prop
  useEffect(() => { if (rayon != null) setRayonLocal(rayon); }, [rayon]);

  // Centrer carte sur la position active
  useEffect(() => {
    if (!centerPosition) return;
    setViewState((v) => ({ ...v, longitude: centerPosition.longitude, latitude: centerPosition.latitude, zoom: Math.max(v.zoom, 11) }));
  }, [centerPosition && centerPosition.longitude, centerPosition && centerPosition.latitude]);

  // Fetch public (landing uniquement)
  useEffect(() => {
    if (isUserMode) return;
    fetch(`${API_URL}/api/users/prestataires/positions/public`)
      .then((r) => r.ok ? r.json() : [])
      .then(setPrestatairesLocal)
      .catch((e) => console.error("PublicMap:", e.message));
  }, []);

  // Socket — via singleton uniquement
  useEffect(() => {
    if (isUserMode) return; // mode user : géré par useSocket dans le parent
    const socket = getSocket();
    const onLocationUpdated = ({ userId, longitude, latitude }) => {
      setPrestatairesLocal((prev) => prev.map((p) =>
        p._id !== userId ? p : { ...p, location: { ...p.location, coordinates: [longitude, latitude] } }
      ));
    };
    const onTrackingStopped = ({ userId }) => {
      setPrestatairesLocal((prev) => prev.filter((p) => p._id !== userId));
    };
    socket.on("location_updated", onLocationUpdated);
    socket.on("tracking_stopped", onTrackingStopped);
    return () => {
      socket.off("location_updated", onLocationUpdated);
      socket.off("tracking_stopped", onTrackingStopped);
    };
  }, []);

  const handleStyleChange = (newId) => {
    const st = MAP_STYLES.find((m) => m.id === newId);
    setStyleId(newId); setSelected(null);
    setViewState((v) => ({ ...v, pitch: st.pitch, bearing: newId === "satellite" ? -15 : -10 }));
  };

  const recenter = () => {
    const pos = centerPosition || { longitude: 166.458, latitude: -22.272 };
    setViewState((v) => ({ ...v, longitude: pos.longitude, latitude: pos.latitude, zoom: 12, pitch: currentStyle.pitch }));
  };

  const metiersDispos = ["Tous", ...new Set(prestataires.map((p) => p.metiers?.[0]?.nom).filter(Boolean))];
  const filtres = filtreMetier === "Tous" ? prestataires : prestataires.filter((p) => p.metiers?.[0]?.nom === filtreMetier);

  const circleData = centerPosition && rayonLocal
    ? makeCircle(centerPosition.longitude, centerPosition.latitude, rayonLocal)
    : null;
  const rayonPct = Math.round(((rayonLocal - 1) / 99) * 100);

  return (
    <div style={s.wrapper} onClick={() => { setShowSrcPicker(false); setShowRayonCtrl(false); }}>

      {/* ══ Barre filtres ══ */}
      <div style={s.filterBar}>

        {/* Sélecteur source (mode user) */}
        {isUserMode && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button style={s.sourceBtn} onClick={(e) => { e.stopPropagation(); setShowSrcPicker((x) => !x); setShowRayonCtrl(false); }}>
              {activeLabel || "Position"} ▾
            </button>
            {showSrcPicker && (
              <div style={s.dropdown}>
                <div style={s.dropdownTitle}>Source de recherche</div>
                <button style={{ ...s.dropdownItem, ...(activeSource === "gps" ? s.dropdownItemActive : {}) }}
                  onClick={() => { onSelectSource && onSelectSource("gps"); setShowSrcPicker(false); }}>
                  📍 Ma position GPS
                </button>
                {savedLocations.map((loc) => (
                  <button key={loc._id}
                    style={{ ...s.dropdownItem, ...(activeSource === "saved:" + loc._id ? s.dropdownItemActive : {}) }}
                    onClick={() => { onSelectSource && onSelectSource("saved:" + loc._id); setShowSrcPicker(false); }}>
                    {loc.isDefault ? "★ " : "📍 "}{loc.label}
                    {loc.adresse && <span style={{ display: "block", fontSize: 10, opacity: 0.5 }}>{loc.adresse}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Live dot + compteur */}
        <div style={s.filterLeft}>
          <span style={s.liveChip}>
            <span style={s.liveDot} />
            {prestataires.length} en ligne
          </span>
        </div>

        {/* Filtres métiers */}
        <div style={s.filterChips}>
          {metiersDispos.map((m) => {
            const active = filtreMetier === m;
            const color  = getColor(m);
            return (
              <button key={m} onClick={() => { setFiltreMetier(m); setSelected(null); }}
                style={{ ...s.chip, background: active ? color : "rgba(255,255,255,0.04)", color: active ? "#0a0804" : "rgba(245,240,232,0.55)", border: "1px solid " + (active ? color : "rgba(201,168,76,0.14)"), fontWeight: active ? 700 : 400 }}>
                {m !== "Tous" && <span style={{ marginRight: 3 }}>{getIcon(m)}</span>}
                {m}
              </button>
            );
          })}
        </div>

        {/* Bouton rayon (mode user) */}
        {isUserMode && (
          <button style={{ ...s.styleBtn, background: showRayonCtrl ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.25)", flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); setShowRayonCtrl((x) => !x); setShowSrcPicker(false); }}>
            {rayonLocal} km
          </button>
        )}

        {/* Styles carte */}
        <div style={s.styleSelector}>
          {MAP_STYLES.map((ms) => (
            <button key={ms.id} onClick={() => handleStyleChange(ms.id)}
              style={{ ...s.styleBtn, background: styleId === ms.id ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.04)", color: styleId === ms.id ? "#c9a84c" : "rgba(245,240,232,0.45)", border: "1px solid " + (styleId === ms.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.1)") }}>
              {ms.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panneau rayon (mode user) */}
      {isUserMode && showRayonCtrl && (
        <div style={s.rayonPanel} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "rgba(245,240,232,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Rayon de recherche</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c" }}>{rayonLocal} km</span>
          </div>
          <input type="range" min={1} max={100} value={rayonLocal}
            onChange={(e) => { const v = Number(e.target.value); setRayonLocal(v); onRayonChange && onRayonChange(v); }}
            style={{ width: "100%", height: 4, borderRadius: 2, outline: "none", cursor: "pointer", WebkitAppearance: "none", appearance: "none", background: "linear-gradient(to right, #c9a84c " + rayonPct + "%, rgba(201,168,76,0.15) " + rayonPct + "%)" }}
          />
          <button style={s.rayonSaveBtn} disabled={rayonSaving} onClick={() => { onSaveRayon && onSaveRayon(); setShowRayonCtrl(false); }}>
            {rayonSaving ? "Enregistrement..." : "Sauvegarder ce rayon"}
          </button>
        </div>
      )}

      {/* Carte */}
      <div style={s.mapContainer}>
        <Map
          ref={mapRef}
          id="publicMap"
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
              <Source id="rayon-fill" type="geojson" data={circleData}>
                <Layer id="rayon-fill-layer" type="fill" paint={{ "fill-color": "#c9a84c", "fill-opacity": 0.06 }} />
              </Source>
              <Source id="rayon-border" type="geojson" data={circleData}>
                <Layer id="rayon-border-layer" type="line" paint={{ "line-color": "#c9a84c", "line-width": 1.5, "line-opacity": 0.5, "line-dasharray": [4, 3] }} />
              </Source>
            </>
          )}

          {/* Marqueur position active (bleu) */}
          {centerPosition && (
            <Marker longitude={centerPosition.longitude} latitude={centerPosition.latitude} anchor="center">
              <div style={{ position: "relative", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#3b82f6", border: "2px solid #fff", zIndex: 1 }} />
                <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid rgba(59,130,246,0.4)", animation: "pulse-ring 2.2s ease-out infinite" }} />
              </div>
            </Marker>
          )}

          {/* Marqueurs adresses enregistrées */}
          {isUserMode && savedLocations.map((loc) => (
            <Marker key={loc._id} longitude={loc.longitude} latitude={loc.latitude} anchor="center">
              <div style={{ fontSize: 20, cursor: "pointer", opacity: activeSource === "saved:" + loc._id ? 1 : 0.45, transform: activeSource === "saved:" + loc._id ? "scale(1.15)" : "scale(1)", transition: "all 0.2s", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
                onClick={(e) => { e.stopPropagation(); onSelectSource && onSelectSource("saved:" + loc._id); }}>
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
            const isActive  = selected?._id === p._id;
            return (
              <Marker key={p._id} longitude={lng} latitude={lat} anchor="center"
                onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(isActive ? null : p); }}>
                <div style={{ ...s.marker, background: color, boxShadow: isActive ? "0 0 0 3px " + color + "88, 0 4px 20px " + color + "99" : "0 2px 14px " + color + "66", transform: isActive ? "scale(1.25)" : "scale(1)" }}
                  title={p.prenom + " " + p.nom + " — " + metierNom}>
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  <div style={{ ...s.pulse, borderColor: color + "55" }} />
                </div>
              </Marker>
            );
          })}

          {/* Popup */}
          {selected && (() => {
            const metierNom = selected.metiers?.[0]?.nom || "Prestataire";
            const color     = getColor(metierNom);
            return (
              <Popup longitude={selected.location.coordinates[0]} latitude={selected.location.coordinates[1]} anchor="bottom" offset={24} closeOnClick={false} onClose={() => setSelected(null)}>
                <div style={s.popup}>
                  <div style={{ ...s.popupAvatar, background: color }}>{getIcon(metierNom)}</div>
                  <div>
                    <div style={s.popupName}>{selected.prenom} {selected.nom}</div>
                    <div style={{ ...s.popupMetier, color }}>{metierNom}</div>
                    {selected.ridet && <div style={{ fontSize: 10, color: "#9a8a78", marginBottom: 4 }}>RIDET {selected.ridet}</div>}
                    {selected.telephoneContact && <a href={"tel:" + selected.telephoneContact} style={s.popupContact}>📞 {selected.telephoneContact}</a>}
                    {selected.emailContact     && <a href={"mailto:" + selected.emailContact}  style={s.popupContact}>✉️ {selected.emailContact}</a>}
                  </div>
                </div>
              </Popup>
            );
          })()}
        </Map>

        <button onClick={recenter} style={s.recenterBtn}>🎯 Recentrer</button>
      </div>
    </div>
  );
};

const s = {
  wrapper:     { display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "#0a0804" },
  filterBar:   { display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(10,8,4,0.96)", borderBottom: "1px solid rgba(201,168,76,0.1)", flexWrap: "wrap", flexShrink: 0 },
  filterLeft:  { flexShrink: 0 },
  liveChip:    { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(245,240,232,0.45)", whiteSpace: "nowrap" },
  liveDot:     { width: 6, height: 6, borderRadius: "50%", background: "#4caf6e", display: "inline-block", animation: "pulse-dot 1.8s ease-in-out infinite" },
  filterChips: { display: "flex", gap: 4, flexWrap: "wrap", flex: 1 },
  chip:        { fontFamily: "'DM Sans',sans-serif", fontSize: 11, padding: "3px 9px", borderRadius: 100, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap", lineHeight: 1.5 },
  styleSelector: { display: "flex", gap: 3, flexShrink: 0 },
  styleBtn:    { fontFamily: "'DM Sans',sans-serif", fontSize: 11, padding: "3px 9px", borderRadius: 6, cursor: "pointer", transition: "all 0.18s", whiteSpace: "nowrap", lineHeight: 1.5 },
  sourceBtn:   { fontFamily: "'DM Sans',sans-serif", fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", cursor: "pointer", whiteSpace: "nowrap" },
  dropdown:    { position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 500, background: "#120e07", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 10, padding: "6px", minWidth: 200, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" },
  dropdownTitle:      { fontSize: 10, color: "rgba(245,240,232,0.3)", letterSpacing: 1, textTransform: "uppercase", padding: "4px 8px 6px" },
  dropdownItem:       { display: "block", width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, border: "none", background: "none", fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "rgba(245,240,232,0.7)", cursor: "pointer", transition: "all 0.15s" },
  dropdownItemActive: { background: "rgba(201,168,76,0.1)", color: "#c9a84c" },
  rayonPanel:    { padding: "12px 16px", background: "rgba(10,8,4,0.98)", borderBottom: "1px solid rgba(201,168,76,0.1)", flexShrink: 0 },
  rayonSaveBtn:  { marginTop: 10, width: "100%", padding: "8px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#c9a84c,#e8c97a)", color: "#0a0804", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  mapContainer:  { flex: 1, minHeight: 0, position: "relative", width: "100%" },
  marker:  { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", transition: "transform 0.2s, box-shadow 0.2s", userSelect: "none", border: "2px solid rgba(255,255,255,0.2)" },
  pulse:   { position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid", animation: "pulse-ring 2.2s ease-out infinite", pointerEvents: "none" },
  popup:        { display: "flex", alignItems: "flex-start", gap: 10, padding: "4px 2px", minWidth: 200 },
  popupAvatar:  { width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  popupName:    { fontWeight: 700, fontSize: 14, color: "#1a160f", marginBottom: 2 },
  popupMetier:  { fontSize: 12, fontWeight: 600, marginBottom: 5 },
  popupContact: { display: "block", fontSize: 12, color: "#6b5d4a", marginTop: 3, textDecoration: "none" },
  recenterBtn:  { position: "absolute", top: 10, right: 10, zIndex: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600, color: "#c9a84c", background: "rgba(10,8,4,0.88)", border: "1px solid rgba(201,168,76,0.35)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", backdropFilter: "blur(8px)" },
};

if (typeof document !== "undefined" && !document.getElementById("map-keyframes")) {
  const el = document.createElement("style"); el.id = "map-keyframes";
  el.textContent = "@keyframes pulse-ring{0%{transform:scale(1);opacity:0.7}100%{transform:scale(2.2);opacity:0}}@keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:0.5}}";
  document.head.appendChild(el);
}

export default PublicMap;