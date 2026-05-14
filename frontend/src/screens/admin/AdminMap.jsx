// src/screens/admin/AdminMap.jsx
import { useEffect, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const API_URL      = process.env.REACT_APP_API_URL || "http://localhost:5000";

const METIER_COLORS = {
  "Électricien":"#f59e0b","Plombier":"#3b82f6","Menuisier":"#92400e","Peintre":"#ec4899",
  "Jardinier":"#22c55e","Climatisation":"#06b6d4","Femme de ménage":"#a78bfa","Maçon":"#f97316",
  "Photographe":"#e11d48","Carreleur":"#84cc16","Garde d'enfants":"#f43f5e",
  "Informaticien":"#6366f1","Coursier":"#14b8a6",
};
const METIER_ICONS = {
  "Électricien":"⚡","Plombier":"🔧","Menuisier":"🪚","Peintre":"🎨","Jardinier":"🌿",
  "Climatisation":"❄️","Femme de ménage":"🧹","Maçon":"🧱","Photographe":"📸",
  "Carreleur":"🔲","Garde d'enfants":"👶","Informaticien":"💻","Coursier":"🛵",
};
const getColor = (nom) => METIER_COLORS[nom] || "#c9a84c";
const getIcon  = (nom) => METIER_ICONS[nom]  || "📍";

const AdminMap = () => {
  const [prestataires, setPrestataires] = useState([]);
  const [selected,     setSelected]     = useState(null);
  const [styleId,      setStyleId]      = useState("nuit");
  const [viewState,    setViewState]    = useState({
    longitude: 166.458, latitude: -22.272, zoom: 10.5, pitch: 45, bearing: -10,
  });

  const CSS = `
    .am-root { height: 100%; display: flex; flex-direction: column; }
    .am-bar { display: flex; align-items: center; gap: 10px; padding: 10px 16px;
      background: rgba(10,8,4,0.96); border-bottom: 1px solid rgba(201,168,76,0.1); flex-shrink: 0; }
    .am-live { display: inline-flex; align-items: center; gap: 6px; font-size: 12px;
      color: rgba(245,240,232,0.5); font-family: 'DM Sans',sans-serif; }
    .am-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
      animation: am-pulse 1.8s ease-in-out infinite; }
    @keyframes am-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
    .am-style-btn { font-family: 'DM Sans',sans-serif; font-size: 11px; padding: 4px 10px;
      border-radius: 6px; cursor: pointer; transition: all 0.18s; border: 1px solid rgba(201,168,76,0.15);
      background: rgba(255,255,255,0.04); color: rgba(245,240,232,0.5); }
    .am-style-btn.active { background: rgba(201,168,76,0.2); color: #c9a84c; border-color: rgba(201,168,76,0.5); }
    .am-refresh { margin-left: auto; font-family: 'DM Sans',sans-serif; font-size: 11px;
      padding: 5px 12px; border-radius: 6px; border: 1px solid rgba(201,168,76,0.3);
      background: rgba(201,168,76,0.08); color: #c9a84c; cursor: pointer; transition: all 0.2s; }
    .am-refresh:hover { background: rgba(201,168,76,0.15); }
    .am-map { flex: 1; position: relative; }
    .am-marker { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; cursor: pointer; position: relative; border: 2px solid rgba(255,255,255,0.2);
      transition: transform 0.2s; }
    .am-marker:hover { transform: scale(1.2); }
    .am-pulse { position: absolute; inset: -6px; border-radius: 50%; border: 2px solid;
      animation: am-ring 2.2s ease-out infinite; pointer-events: none; }
    @keyframes am-ring { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(2.2);opacity:0} }
    .am-popup { display: flex; gap: 10px; align-items: flex-start; padding: 4px; min-width: 190px; }
    .am-popup-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex;
      align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .am-popup-name { font-weight: 700; font-size: 13px; color: #1a160f; margin-bottom: 2px; }
    .am-popup-meta { font-size: 11px; margin-bottom: 3px; font-weight: 600; }
    .am-popup-info { font-size: 11px; color: #6b5d4a; margin-top: 2px; }
  `;

  const MAP_STYLES = [
    { id: "nuit",      label: "🌙 Nuit",      url: "mapbox://styles/mapbox/dark-v11" },
    { id: "satellite", label: "🛰️ Satellite",  url: "mapbox://styles/mapbox/satellite-streets-v12" },
    { id: "plan",      label: "🗺️ Plan",       url: "mapbox://styles/mapbox/streets-v12" },
    { id: "relief",    label: "⛰️ Relief",     url: "mapbox://styles/mapbox/outdoors-v12" },
  ];

  const fetchPrestataires = () => {
    fetch(`${API_URL}/api/users/prestataires/positions/public`)
      .then((r) => r.ok ? r.json() : [])
      .then(setPrestataires)
      .catch(console.error);
  };

  useEffect(() => {
    if (!document.getElementById("am-css")) {
      const s = document.createElement("style"); s.id = "am-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
    fetchPrestataires();
    // Rafraîchissement auto toutes les 30s
    const interval = setInterval(fetchPrestataires, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentStyle = MAP_STYLES.find((s) => s.id === styleId);

  return (
    <div className="am-root">
      {/* Barre top */}
      <div className="am-bar">
        <div className="am-live">
          <span className="am-dot" />
          <strong style={{ color: "#c9a84c" }}>{prestataires.length}</strong>&nbsp;prestataire{prestataires.length !== 1 ? "s" : ""} en ligne
        </div>
        {MAP_STYLES.map((ms) => (
          <button key={ms.id} className={"am-style-btn" + (styleId === ms.id ? " active" : "")}
            onClick={() => setStyleId(ms.id)}>
            {ms.label}
          </button>
        ))}
        <button className="am-refresh" onClick={fetchPrestataires}>
          🔄 Actualiser
        </button>
      </div>

      {/* Carte */}
      <div className="am-map">
        <Map
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          style={{ width: "100%", height: "100%" }}
          mapStyle={currentStyle.url}
          mapboxAccessToken={MAPBOX_TOKEN}
          onClick={() => setSelected(null)}
          antialias
        >
          <NavigationControl position="bottom-right" visualizePitch />

          {prestataires.map((p) => {
            const [lng, lat] = p.location?.coordinates || [];
            if (!lng || !lat) return null;
            const metierNom = p.metiers?.[0]?.nom || "Prestataire";
            const color     = getColor(metierNom);
            const icon      = getIcon(metierNom);
            const isActive  = selected?._id === p._id;
            return (
              <Marker key={p._id} longitude={lng} latitude={lat} anchor="center"
                onClick={(e) => { e.originalEvent.stopPropagation(); setSelected(isActive ? null : p); }}>
                <div className="am-marker"
                  style={{ background: color, boxShadow: `0 2px 14px ${color}66`,
                    transform: isActive ? "scale(1.25)" : "scale(1)" }}>
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  <div className="am-pulse" style={{ borderColor: color + "55" }} />
                </div>
              </Marker>
            );
          })}

          {selected && (() => {
            const metierNom = selected.metiers?.[0]?.nom || "Prestataire";
            const color     = getColor(metierNom);
            return (
              <Popup longitude={selected.location.coordinates[0]}
                latitude={selected.location.coordinates[1]}
                anchor="bottom" offset={24} closeOnClick={false}
                onClose={() => setSelected(null)}>
                <div className="am-popup">
                  <div className="am-popup-avatar" style={{ background: color }}>
                    {getIcon(metierNom)}
                  </div>
                  <div>
                    <div className="am-popup-name">{selected.prenom} {selected.nom}</div>
                    <div className="am-popup-meta" style={{ color }}>{metierNom}</div>
                    {selected.telephoneContact && (
                      <div className="am-popup-info">📞 {selected.telephoneContact}</div>
                    )}
                    {selected.ridet && (
                      <div className="am-popup-info">🏢 RIDET : {selected.ridet}</div>
                    )}
                    {selected.emailContact && (
                      <div className="am-popup-info">✉️ {selected.emailContact}</div>
                    )}
                  </div>
                </div>
              </Popup>
            );
          })()}
        </Map>
      </div>
    </div>
  );
};

export default AdminMap;