// src/components/map/PublicMap.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import Map, { Marker, Popup, NavigationControl, useMap } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const API_URL      = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Styles de carte disponibles ───────────────────────
const MAP_STYLES = [
  {
    id:    "nuit",
    label: "🌙 Nuit",
    url:   "mapbox://styles/mapbox/dark-v11",
    pitch: 45,
    terrain: false,
  },
  {
    id:    "satellite",
    label: "🛰️ Satellite",
    url:   "mapbox://styles/mapbox/satellite-streets-v12",
    pitch: 60,
    terrain: true,
  },
  {
    id:    "plan",
    label: "🗺️ Plan",
    url:   "mapbox://styles/mapbox/streets-v12",
    pitch: 0,
    terrain: false,
  },
  {
    id:    "relief",
    label: "⛰️ Relief",
    url:   "mapbox://styles/mapbox/outdoors-v12",
    pitch: 60,
    terrain: true,
  },
];

// ── Couleurs par métier ───────────────────────────────
const METIER_COLORS = {
  "Électricien":    "#f59e0b",
  "Plombier":       "#3b82f6",
  "Menuisier":      "#92400e",
  "Peintre":        "#ec4899",
  "Jardinier":      "#22c55e",
  "Climatisation":  "#06b6d4",
  "Femme de ménage":"#a78bfa",
  "Maçon":          "#f97316",
  "Photographe":    "#e11d48",
  "Carreleur":      "#84cc16",
  "Garde d'enfants":"#f43f5e",
  "Informaticien":  "#6366f1",
  "Coursier":       "#14b8a6",
};
const METIER_ICONS = {
  "Électricien":"⚡","Plombier":"🔧","Menuisier":"🪚","Peintre":"🎨",
  "Jardinier":"🌿","Climatisation":"❄️","Femme de ménage":"🧹","Maçon":"🧱",
  "Photographe":"📸","Carreleur":"🔲","Garde d'enfants":"👶","Informaticien":"💻",
  "Coursier":"🛵",
};
const getColor = (nom) => METIER_COLORS[nom] || "#c9a84c";
const getIcon  = (nom) => METIER_ICONS[nom]  || "📍";

// ── Composant interne pour accéder au contexte Map ────
const MapEffects = ({ styleId, onLoad }) => {
  const { current: map } = useMap();

  const applyEffects = useCallback(() => {
    if (!map) return;
    const gl = map.getMap(); // instance mapbox-gl native

    // ── Terrain 3D ──
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

    // ── Bâtiments 3D (styles vectoriels) ──
    if (styleId !== "satellite" && !gl.getLayer("3d-buildings")) {
      try {
        gl.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 14,
          paint: {
            "fill-extrusion-color": styleId === "nuit"
              ? "#1a1408"
              : "#d4c5a0",
            "fill-extrusion-height": [
              "interpolate", ["linear"], ["zoom"],
              14, 0, 15, ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate", ["linear"], ["zoom"],
              14, 0, 15, ["get", "min_height"],
            ],
            "fill-extrusion-opacity": styleId === "nuit" ? 0.85 : 0.6,
          },
        });
      } catch (_) {}
    }

    // ── Fog atmosphérique ──
    if (styleId === "nuit") {
      gl.setFog({
        color:           "rgba(15, 10, 5, 0.8)",
        "high-color":    "#0a0804",
        "horizon-blend": 0.08,
        "space-color":   "#030201",
        "star-intensity": 0.3,
        range:           [1, 4],
      });
    } else if (styleId === "satellite" || styleId === "relief") {
      gl.setFog({
        color:           "rgba(180, 210, 240, 0.6)",
        "high-color":    "#acd3f0",
        "horizon-blend": 0.12,
        "space-color":   "#1a2a4a",
        "star-intensity": 0.1,
        range:           [1, 5],
      });
    } else {
      gl.setFog(null);
    }

    onLoad?.();
  }, [map, styleId, onLoad]);

  useEffect(() => {
    if (!map) return;
    const gl = map.getMap();
    if (gl.isStyleLoaded()) {
      applyEffects();
    } else {
      gl.once("style.load", applyEffects);
    }
    return () => { try { gl.off("style.load", applyEffects); } catch(_) {} };
  }, [map, styleId, applyEffects]);

  return null;
};

// ── Composant principal ───────────────────────────────
const PublicMap = () => {
  const [prestataires, setPrestataires] = useState([]);
  const [filtreMetier, setFiltreMetier] = useState("Tous");
  const [selected,     setSelected]     = useState(null);
  const [styleId,      setStyleId]      = useState("nuit");
  const [viewState,    setViewState]    = useState({
    longitude: 166.458,
    latitude:  -22.272,
    zoom:      11.5,
    pitch:     45,
    bearing:   -10,
  });

  const socketRef = useRef(null);
  const mapRef    = useRef(null);

  const currentStyle = MAP_STYLES.find((s) => s.id === styleId);

  // ── Fetch public ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/prestataires/positions/public`);
        if (!res.ok) return;
        setPrestataires(await res.json());
      } catch (e) { console.error("PublicMap:", e.message); }
    })();
  }, []);

  // ── Socket.io ─────────────────────────────────────
  useEffect(() => {
    import("socket.io-client").then(({ io }) => {
      const socket = io(API_URL, { withCredentials: false });
      socketRef.current = socket;
      socket.on("location_updated", ({ userId, longitude, latitude }) => {
        setPrestataires((prev) => prev.map((p) =>
          p._id !== userId ? p
          : { ...p, location: { ...p.location, coordinates: [longitude, latitude] } }
        ));
      });
      socket.on("tracking_stopped", ({ userId }) => {
        setPrestataires((prev) => prev.filter((p) => p._id !== userId));
      });
    });
    return () => { socketRef.current?.disconnect(); };
  }, []);

  // ── Changement de style ───────────────────────────
  const handleStyleChange = (newStyleId) => {
    const s = MAP_STYLES.find((m) => m.id === newStyleId);
    setStyleId(newStyleId);
    setSelected(null);
    setViewState((v) => ({
      ...v,
      pitch:   s.pitch,
      bearing: newStyleId === "satellite" ? -15 : -10,
    }));
  };

  // ── Recentrer ─────────────────────────────────────
  const recenter = () => {
    setViewState((v) => ({
      ...v,
      longitude: 166.458,
      latitude:  -22.272,
      zoom:      11.5,
      pitch:     currentStyle.pitch,
    }));
  };

  // ── Données filtrées ──────────────────────────────
  const metiersDispos = ["Tous", ...new Set(
    prestataires.map((p) => p.metiers?.[0]?.nom).filter(Boolean)
  )];

  const prestatairesFiltres = filtreMetier === "Tous"
    ? prestataires
    : prestataires.filter((p) => p.metiers?.[0]?.nom === filtreMetier);

  return (
    <div style={s.wrapper}>

      {/* ══ Barre filtres ══ */}
      <div style={s.filterBar}>

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
              <button
                key={m}
                onClick={() => { setFiltreMetier(m); setSelected(null); }}
                style={{
                  ...s.chip,
                  background: active ? color : "rgba(255,255,255,0.04)",
                  color:      active ? "#0a0804" : "rgba(245,240,232,0.55)",
                  border:     `1px solid ${active ? color : "rgba(201,168,76,0.14)"}`,
                  fontWeight: active ? 700 : 400,
                  boxShadow:  active ? `0 2px 10px ${color}55` : "none",
                }}
              >
                {m !== "Tous" && <span style={{ marginRight: 4 }}>{getIcon(m)}</span>}
                {m}
              </button>
            );
          })}
        </div>

        {/* Sélecteur de style */}
        <div style={s.styleSelector}>
          {MAP_STYLES.map((ms) => (
            <button
              key={ms.id}
              onClick={() => handleStyleChange(ms.id)}
              style={{
                ...s.styleBtn,
                background: styleId === ms.id
                  ? "rgba(201,168,76,0.2)"
                  : "rgba(255,255,255,0.04)",
                color: styleId === ms.id
                  ? "#c9a84c"
                  : "rgba(245,240,232,0.45)",
                border: `1px solid ${styleId === ms.id ? "rgba(201,168,76,0.5)" : "rgba(201,168,76,0.1)"}`,
              }}
            >
              {ms.label}
            </button>
          ))}
        </div>

      </div>

      {/* ══ Carte ══ */}
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
          fog={styleId === "nuit" ? {
            color:           "rgba(15,10,5,0.8)",
            "high-color":    "#0a0804",
            "horizon-blend": 0.08,
            "space-color":   "#030201",
            "star-intensity": 0.3,
            range:           [1, 4],
          } : undefined}
        >
          {/* Effets terrain + bâtiments via composant interne */}
          <MapEffects styleId={styleId} />

          {/* Contrôles navigation */}
          <NavigationControl position="bottom-right" visualizePitch />

          {/* Marqueurs */}
          {prestatairesFiltres.map((p) => {
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
                anchor="center"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelected(isActive ? null : p);
                }}
              >
                <div
                  style={{
                    ...s.marker,
                    background: color,
                    boxShadow: isActive
                      ? `0 0 0 3px ${color}88, 0 4px 20px ${color}99`
                      : `0 2px 14px ${color}66`,
                    transform: isActive ? "scale(1.25)" : "scale(1)",
                  }}
                  title={`${p.prenom} ${p.nom} — ${metierNom}`}
                >
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
              <Popup
                longitude={selected.location.coordinates[0]}
                latitude={selected.location.coordinates[1]}
                anchor="bottom"
                offset={24}
                closeOnClick={false}
                onClose={() => setSelected(null)}
              >
                <div style={s.popup}>
                  <div style={{ ...s.popupAvatar, background: color }}>
                    {getIcon(metierNom)}
                  </div>
                  <div>
                    <div style={s.popupName}>{selected.prenom} {selected.nom}</div>
                    <div style={{ ...s.popupMetier, color }}>{metierNom}</div>
                    {selected.telephoneContact && (
                      <a href={`tel:${selected.telephoneContact}`} style={s.popupContact}>
                        📞 {selected.telephoneContact}
                      </a>
                    )}
                    {selected.emailContact && (
                      <a href={`mailto:${selected.emailContact}`} style={s.popupContact}>
                        ✉️ {selected.emailContact}
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            );
          })()}
        </Map>

        {/* Bouton recentrer */}
        <button onClick={recenter} style={s.recenterBtn} title="Recentrer sur Nouméa">
          🎯 Recentrer
        </button>
      </div>
    </div>
  );
};

// ── Styles ────────────────────────────────────────────
const s = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    background: "#0a0804",
  },
  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    background: "rgba(10,8,4,0.96)",
    borderBottom: "1px solid rgba(201,168,76,0.1)",
    flexWrap: "wrap",
    flexShrink: 0,
  },
  filterLeft: { flexShrink: 0 },
  liveChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "rgba(245,240,232,0.45)",
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },
  liveDot: {
    width: 7, height: 7, borderRadius: "50%",
    background: "#4caf6e",
    display: "inline-block",
    animation: "pulse-dot 1.8s ease-in-out infinite",
  },
  filterChips: {
    display: "flex", gap: 5, flexWrap: "wrap", flex: 1,
  },
  chip: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    padding: "4px 11px",
    borderRadius: 100,
    cursor: "pointer",
    transition: "all 0.18s",
    whiteSpace: "nowrap",
    lineHeight: 1.5,
  },
  styleSelector: {
    display: "flex", gap: 4, flexShrink: 0,
  },
  styleBtn: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 11,
    padding: "4px 11px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.18s",
    whiteSpace: "nowrap",
    lineHeight: 1.5,
  },
  mapContainer: {
    flex: 1,
    minHeight: 0,
    position: "relative",
    width: "100%",
  },
  marker: {
    width: 36, height: 36,
    borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "transform 0.2s, box-shadow 0.2s",
    userSelect: "none",
    border: "2px solid rgba(255,255,255,0.2)",
  },
  pulse: {
    position: "absolute", inset: -6,
    borderRadius: "50%",
    border: "2px solid",
    animation: "pulse-ring 2.2s ease-out infinite",
    pointerEvents: "none",
  },
  popup: {
    display: "flex", alignItems: "flex-start",
    gap: 10, padding: "4px 2px", minWidth: 200,
  },
  popupAvatar: {
    width: 38, height: 38, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, flexShrink: 0,
  },
  popupName: {
    fontWeight: 700, fontSize: 14, color: "#1a160f", marginBottom: 2,
  },
  popupMetier: {
    fontSize: 12, fontWeight: 600, marginBottom: 5,
  },
  popupContact: {
    display: "block", fontSize: 12, color: "#6b5d4a",
    marginTop: 3, textDecoration: "none",
    transition: "color 0.15s",
  },
  recenterBtn: {
    position: "absolute",
    bottom: 56,
    right: 10,
    zIndex: 10,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    color: "#c9a84c",
    background: "rgba(10,8,4,0.88)",
    border: "1px solid rgba(201,168,76,0.35)",
    borderRadius: 8,
    padding: "7px 14px",
    cursor: "pointer",
    backdropFilter: "blur(8px)",
    transition: "all 0.2s",
  },
};

// Keyframes
if (typeof document !== "undefined" && !document.getElementById("map-keyframes")) {
  const el = document.createElement("style");
  el.id = "map-keyframes";
  el.textContent = `
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.7; }
      100% { transform: scale(2.2); opacity: 0; }
    }
    @keyframes pulse-dot {
      0%, 100% { transform: scale(1);   opacity: 1; }
      50%       { transform: scale(1.5); opacity: 0.5; }
    }
  `;
  document.head.appendChild(el);
}

export default PublicMap;