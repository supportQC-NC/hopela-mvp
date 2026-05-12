// src/components/map/PublicMap.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { io } from "socket.io-client";
import "mapbox-gl/dist/mapbox-gl.css";

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const API_URL   = process.env.REACT_APP_API_URL || "http://localhost:5000";
const NOUMEA    = [166.4572, -22.2758];

const MAP_STYLES = [
  { id: "navigation-night-v1",  label: "Nuit",      icon: "🌙" },
  { id: "satellite-streets-v12",label: "Satellite",  icon: "🛰️" },
  { id: "streets-v12",          label: "Plan",       icon: "🗺️" },
  { id: "outdoors-v12",         label: "Relief",     icon: "⛰️" },
];

const METIER_COLORS = {
  "Électricien":     "#f59e0b",
  "Plombier":        "#3b82f6",
  "Menuisier":       "#8b5cf6",
  "Peintre":         "#ec4899",
  "Jardinier":       "#10b981",
  "Climatisation":   "#06b6d4",
  "Femme de ménage": "#f97316",
  "Maçon":           "#6b7280",
  "Photographe":     "#a78bfa",
  "Carreleur":       "#d4a664",
  "Garde d'enfants": "#f43f5e",
  "Informaticien":   "#14b8a6",
  "Coursier":        "#84cc16",
};

const METIER_EMOJI = {
  "Électricien":     "⚡",
  "Plombier":        "🔧",
  "Menuisier":       "🪚",
  "Peintre":         "🎨",
  "Jardinier":       "🌿",
  "Climatisation":   "❄️",
  "Femme de ménage": "🧹",
  "Maçon":           "🧱",
  "Photographe":     "📸",
  "Carreleur":       "🪣",
  "Garde d'enfants": "👶",
  "Informaticien":   "💻",
  "Coursier":        "🛵",
};

const getColor = (metier) => METIER_COLORS[metier] || "#d4a664";
const getEmoji = (metier) => METIER_EMOJI[metier] || "👤";

const renderStars = (note) => {
  if (!note) return "";
  return "★".repeat(Math.floor(note)) + (note % 1 >= 0.5 ? "½" : "") + "☆".repeat(5 - Math.ceil(note));
};

// ── Créer une image de marqueur sur canvas ──────────────────────────────────
const createMarkerImage = (color, emoji) => {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Cercle de fond
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Bordure blanche
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Emoji centré
  ctx.font = "24px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, size / 2, size / 2 + 1);

  return { data: ctx.getImageData(0, 0, size, size).data, width: size, height: size };
};



// ───────────────────────────────────────────────────────────────────────────
const PublicMap = () => {
  const mapContainer  = useRef(null);
  const map           = useRef(null);
  const socketRef     = useRef(null);
  const prestaRef     = useRef([]);     // source de vérité locale

  const [mapLoaded,   setMapLoaded]   = useState(false);
  const [tokenError,  setTokenError]  = useState(false);
  const [connected,   setConnected]   = useState(false);
  const [count,       setCount]       = useState(0);
  const [styleIdx,    setStyleIdx]    = useState(0);
  const [filtre,      setFiltre]      = useState("Tous");
  const [metiers,     setMetiers]     = useState([]);


  // ── Construire le GeoJSON depuis prestaRef ──────────────────────────────
  const buildGeoJSON = useCallback((filtreMetier = "Tous") => ({
    type: "FeatureCollection",
    features: prestaRef.current
      .filter((p) => filtreMetier === "Tous" || p.metier === filtreMetier)
      .map((p) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: p.location.coordinates },
        properties: {
          id:      p._id,
          prenom:  p.prenom,
          nom:     p.nom,
          metier:  p.metier || "Prestataire",
          note:    p.note,
          nbAvis:  p.nbAvis,
          color:   getColor(p.metier),
          emoji:   getEmoji(p.metier),
        },
      })),
  }), []);

  // ── Mettre à jour la source GeoJSON ────────────────────────────────────
  const refreshSource = useCallback((filtreMetier) => {
    const src = map.current?.getSource("prestataires");
    if (src) src.setData(buildGeoJSON(filtreMetier));
  }, [buildGeoJSON]);

  // ── Ajouter les layers après chargement du style ────────────────────────
  const addLayers = useCallback(() => {
    if (!map.current) return;
    const m = map.current;

    // Enregistrer une image par métier
    Object.entries(METIER_COLORS).forEach(([metier, color]) => {
      const imgId = `marker-${metier}`;
      if (!m.hasImage(imgId)) {
        const { data, width, height } = createMarkerImage(color, getEmoji(metier));
        m.addImage(imgId, { width, height, data: new Uint8ClampedArray(data) });
      }
    });

    // Image par défaut
    if (!m.hasImage("marker-default")) {
      const { data, width, height } = createMarkerImage("#d4a664", "👤");
      m.addImage("marker-default", { width, height, data: new Uint8ClampedArray(data) });
    }

    // Source GeoJSON
    if (!m.getSource("prestataires")) {
      m.addSource("prestataires", { type: "geojson", data: buildGeoJSON("Tous") });
    }

    // Layer symbole (marqueurs stables au zoom)
    if (!m.getLayer("prestataires-markers")) {
      m.addLayer({
        id: "prestataires-markers",
        type: "symbol",
        source: "prestataires",
        layout: {
          "icon-image":       ["concat", "marker-", ["get", "metier"]],
          "icon-size":        0.55,
          "icon-allow-overlap": true,
          "icon-anchor":      "center",
          "text-field":       ["get", "metier"],
          "text-font":        ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size":        11,
          "text-offset":      [0, 1.8],
          "text-anchor":      "top",
          "text-allow-overlap": false,
          "text-optional":    true,
        },
        paint: {
          "text-color":       "#ffffff",
          "text-halo-color":  "rgba(0,0,0,0.7)",
          "text-halo-width":  1.5,
          "icon-opacity":     1,
        },
      });
    }

    // Layer cercle de halo (glow)
    if (!m.getLayer("prestataires-halo")) {
      m.addLayer({
        id: "prestataires-halo",
        type: "circle",
        source: "prestataires",
        paint: {
          "circle-radius":       20,
          "circle-color":        ["get", "color"],
          "circle-opacity":      0.15,
          "circle-blur":         1,
          "circle-stroke-width": 0,
        },
      }, "prestataires-markers");
    }

    // Popup au clic
    m.on("click", "prestataires-markers", (e) => {
      const props = e.features[0].properties;
      const coords = e.features[0].geometry.coordinates.slice();
      const stars  = props.note ? renderStars(props.note) : null;
      const color  = props.color;

      new mapboxgl.Popup({ offset: 20, className: "hopela-popup", maxWidth: "260px" })
        .setLngLat(coords)
        .setHTML(`
          <div>
            <div style="background:${color}22;border-bottom:1px solid ${color}44;padding:14px 16px 12px;display:flex;align-items:center;gap:12px;">
              <div style="width:42px;height:42px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${props.emoji}</div>
              <div>
                <div style="font-size:15px;font-weight:700;color:#f5f0eb;">${props.prenom} ${props.nom}</div>
                <div style="font-size:11px;color:${color};font-weight:600;margin-top:2px;">${props.metier}</div>
              </div>
            </div>
            <div style="padding:12px 16px;">
              ${stars ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><span style="color:#f59e0b;font-size:14px;">${stars}</span><span style="font-size:13px;font-weight:700;color:#f5f0eb;">${Number(props.note).toFixed(1)}</span><span style="font-size:11px;color:#7a6a54;">(${props.nbAvis} avis)</span></div>` : ""}
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;box-shadow:0 0 6px #4ade80;"></span>
                <span style="font-size:11px;color:#a89070;">Disponible maintenant</span>
              </div>
            </div>
          </div>
        `)
        .addTo(m);
    });

    m.on("mouseenter", "prestataires-markers", () => { m.getCanvas().style.cursor = "pointer"; });
    m.on("mouseleave", "prestataires-markers", () => { m.getCanvas().style.cursor = ""; });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildGeoJSON]);

  // ── Init carte ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    const token = process.env.REACT_APP_MAPBOX_TOKEN;
    if (!token) { setTokenError(true); return; }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${MAP_STYLES[0].id}`,
      center: NOUMEA,
      zoom: 11.5,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
    map.current.addControl(new mapboxgl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.current.on("load", () => {
      setMapLoaded(true);
      addLayers();
    });

    return () => { map.current?.remove(); map.current = null; };
  }, [addLayers]);

  // ── Injection CSS popup ──────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById("hopela-popup-css")) return;
    const s = document.createElement("style");
    s.id = "hopela-popup-css";
    s.textContent = `
      .hopela-popup .mapboxgl-popup-content {
        background: #1c1409;
        border: 1px solid rgba(212,166,100,0.3);
        border-radius: 16px;
        box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        padding: 0; overflow: hidden; min-width: 220px;
      }
      .hopela-popup .mapboxgl-popup-tip { border-top-color: #1c1409; }
      .hopela-popup .mapboxgl-popup-close-button {
        color: #a89070; font-size: 18px; padding: 8px 12px;
        background: transparent;
      }
      .hopela-popup .mapboxgl-popup-close-button:hover { color: #f5f0eb; }
    `;
    document.head.appendChild(s);
  }, []);

  // ── Fetch + Socket ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;

    fetch(`${API_URL}/api/users/prestataires/positions`)
      .then((r) => r.json())
      .then((data) => {
        prestaRef.current = data;
        setCount(data.length);
        const uniqueMetiers = ["Tous", ...new Set(data.map((p) => p.metier).filter(Boolean))];
        setMetiers(uniqueMetiers);
        refreshSource("Tous");
      })
      .catch(console.error);

    socketRef.current = io(SOCKET_URL, { withCredentials: true, transports: ["websocket", "polling"] });
    socketRef.current.on("connect",    () => setConnected(true));
    socketRef.current.on("disconnect", () => setConnected(false));

    socketRef.current.on("location_updated", ({ userId, longitude, latitude }) => {
      const idx = prestaRef.current.findIndex((p) => p._id === userId);
      if (idx !== -1) {
        prestaRef.current[idx].location.coordinates = [longitude, latitude];
        refreshSource(filtre);
      }
    });

    socketRef.current.on("tracking_stopped", ({ userId }) => {
      prestaRef.current = prestaRef.current.filter((p) => p._id !== userId);
      setCount((c) => Math.max(0, c - 1));
      refreshSource(filtre);
    });

    return () => { socketRef.current?.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded]);

  // ── Changer le style de carte ────────────────────────────────────────────
  const changeStyle = (idx) => {
    setStyleIdx(idx);
    map.current?.setStyle(`mapbox://styles/mapbox/${MAP_STYLES[idx].id}`);
    map.current?.once("style.load", () => addLayers());
  };

  // ── Changer le filtre ────────────────────────────────────────────────────
  const handleFilter = (m) => {
    setFiltre(m);
    refreshSource(m);
    const filtered = prestaRef.current.filter((p) => m === "Tous" || p.metier === m);
    setCount(filtered.length);
  };

  if (tokenError) return (
    <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#0e0b06",flexDirection:"column",gap:12 }}>
      <span style={{ fontSize:32 }}>🗺️</span>
      <p style={{ fontSize:13,color:"#a89070",fontFamily:"sans-serif" }}>Token Mapbox manquant — vérifier <code>REACT_APP_MAPBOX_TOKEN</code></p>
    </div>
  );

  const panelBg  = "rgba(20,14,6,0.92)";
  const panelBdr = "1px solid rgba(212,166,100,0.22)";

  return (
    <div style={{ position:"relative", width:"100%", height:"100%" }}>
      <div ref={mapContainer} style={{ width:"100%", height:"100%" }} />

      {/* ── Badge prestataires ── */}
      <div style={{ position:"absolute",top:14,left:14,background:panelBg,backdropFilter:"blur(14px)",border:panelBdr,borderRadius:12,padding:"9px 16px",display:"flex",alignItems:"center",gap:10,zIndex:10 }}>
        <span style={{ width:8,height:8,borderRadius:"50%",flexShrink:0,background:connected?"#4ade80":"#ef4444",boxShadow:connected?"0 0 8px #4ade80":"none",display:"inline-block" }} />
        <span style={{ fontFamily:"sans-serif",fontSize:13,fontWeight:600,color:"#f5f0eb" }}>
          {count} prestataire{count > 1 ? "s" : ""} en ligne
        </span>
      </div>

      {/* ── Filtres métier ── */}
      {metiers.length > 1 && (
        <div style={{ position:"absolute",top:14,left:"50%",transform:"translateX(-50%)",zIndex:10,background:panelBg,backdropFilter:"blur(14px)",border:panelBdr,borderRadius:12,padding:"6px 8px",display:"flex",gap:5,flexWrap:"wrap",maxWidth:"60%",justifyContent:"center" }}>
          {metiers.map((m) => {
            const active = filtre === m;
            const color  = m === "Tous" ? "#d4a664" : getColor(m);
            return (
              <button key={m} onClick={() => handleFilter(m)} style={{
                fontFamily:"sans-serif", fontSize:11, fontWeight:600,
                padding:"5px 11px", borderRadius:8, cursor:"pointer",
                border: active ? `1px solid ${color}` : "1px solid transparent",
                background: active ? `${color}22` : "transparent",
                color: active ? color : "#7a6a54",
                transition:"all 0.18s",
                whiteSpace:"nowrap",
              }}>
                {m !== "Tous" && <span style={{ marginRight:4 }}>{getEmoji(m)}</span>}
                {m}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Sélecteur de style ── */}
      <div style={{ position:"absolute",top:14,right:14,zIndex:10,display:"flex",flexDirection:"column",gap:5 }}>
        {MAP_STYLES.map((s, i) => (
          <button key={s.id} onClick={() => changeStyle(i)} style={{
            background: styleIdx === i ? "#d4a664" : panelBg,
            backdropFilter:"blur(14px)",
            border: styleIdx === i ? "1px solid #d4a664" : panelBdr,
            borderRadius:10, padding:"7px 12px", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6,
            fontFamily:"sans-serif", fontSize:11, fontWeight:600,
            color: styleIdx === i ? "#1c1409" : "#a89070",
            transition:"all 0.18s", whiteSpace:"nowrap",
          }}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Bouton recentrer ── */}
      <button onClick={() => map.current?.flyTo({ center:NOUMEA, zoom:11.5, duration:1000 })}
        style={{ position:"absolute",bottom:48,right:14,background:panelBg,backdropFilter:"blur(14px)",border:panelBdr,borderRadius:10,padding:"9px 14px",cursor:"pointer",zIndex:10,fontFamily:"sans-serif",fontSize:12,fontWeight:600,color:"#d4a664",display:"flex",alignItems:"center",gap:6 }}
        onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(212,166,100,0.6)"}
        onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(212,166,100,0.22)"}
      >
        🎯 Recentrer
      </button>
    </div>
  );
};

export default PublicMap;