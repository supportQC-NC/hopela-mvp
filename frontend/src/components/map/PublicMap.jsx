// /* eslint-disable react-hooks/exhaustive-deps */
// // src/components/map/PublicMap.jsx
// import { useEffect, useState, useRef, useCallback } from "react";
// import Map, {
//   Marker,
//   Popup,
//   NavigationControl,
//   Source,
//   Layer,
//   useMap,
// } from "react-map-gl/mapbox";
// import "mapbox-gl/dist/mapbox-gl.css";
// import getSocket from "../../services/socketManager";

// // ── Configuration & Assets ─────────────────────────────────────────────────────
// const FONT_LINK =
//   "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

// const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// const MAP_STYLES = [
//   {
//     id: "nuit",
//     label: "🌙 Nuit",
//     url: "mapbox://styles/mapbox/dark-v11",
//     pitch: 45,
//     terrain: false,
//   },
//   {
//     id: "satellite",
//     label: "🛰️ Satellite",
//     url: "mapbox://styles/mapbox/satellite-streets-v12",
//     pitch: 60,
//     terrain: true,
//   },
//   {
//     id: "plan",
//     label: "🗺️ Plan",
//     url: "mapbox://styles/mapbox/streets-v12",
//     pitch: 0,
//     terrain: false,
//   },
//   {
//     id: "relief",
//     label: "⛰️ Relief",
//     url: "mapbox://styles/mapbox/outdoors-v12",
//     pitch: 60,
//     terrain: true,
//   },
// ];

// // Couleurs fonctionnelles pour les marqueurs (gardées pour la lisibilité de la carte)
// const METIER_COLORS = {
//   Électricien: "#f59e0b",
//   Plombier: "#3b82f6",
//   Menuisier: "#92400e",
//   Peintre: "#ec4899",
//   Jardinier: "#22c55e",
//   Climatisation: "#06b6d4",
//   "Femme de ménage": "#a78bfa",
//   Maçon: "#f97316",
//   Photographe: "#e11d48",
//   Carreleur: "#84cc16",
//   "Garde d'enfants": "#f43f5e",
//   Informaticien: "#6366f1",
//   Coursier: "#14b8a6",
// };
// const METIER_ICONS = {
//   Électricien: "⚡",
//   Plombier: "🔧",
//   Menuisier: "🪚",
//   Peintre: "🎨",
//   Jardinier: "🌿",
//   Climatisation: "❄️",
//   "Femme de ménage": "🧹",
//   Maçon: "🧱",
//   Photographe: "📸",
//   Carreleur: "🔲",
//   "Garde d'enfants": "👶",
//   Informaticien: "💻",
//   Coursier: "🛵",
// };
// const getColor = (nom) => METIER_COLORS[nom] || "#c9a84c";
// const getIcon = (nom) => METIER_ICONS[nom] || "📍";

// const makeCircle = (lng, lat, radiusKm, steps = 64) => {
//   const R = 6371;
//   const coords = [];
//   for (let i = 0; i <= steps; i++) {
//     const angle = (i / steps) * (2 * Math.PI);
//     const dLat = (radiusKm / R) * (180 / Math.PI);
//     const dLng = dLat / Math.cos((lat * Math.PI) / 180);
//     coords.push([lng + dLng * Math.sin(angle), lat + dLat * Math.cos(angle)]);
//   }
//   return {
//     type: "Feature",
//     geometry: { type: "Polygon", coordinates: [coords] },
//   };
// };

// // ── Composant d'Effets Carte (Bâtiments 3D, Brouillard) ───────────────────────
// const MapEffects = ({ styleId }) => {
//   const { current: map } = useMap();
//   const applyEffects = useCallback(() => {
//     if (!map) return;
//     const gl = map.getMap();
//     const style = MAP_STYLES.find((s) => s.id === styleId);
//     if (style?.terrain) {
//       if (!gl.getSource("mapbox-dem")) {
//         gl.addSource("mapbox-dem", {
//           type: "raster-dem",
//           url: "mapbox://mapbox.mapbox-terrain-dem-v1",
//           tileSize: 512,
//           maxzoom: 14,
//         });
//       }
//       gl.setTerrain({ source: "mapbox-dem", exaggeration: 1.4 });
//     } else {
//       gl.setTerrain(null);
//     }
//     if (styleId !== "satellite" && !gl.getLayer("3d-buildings")) {
//       try {
//         gl.addLayer({
//           id: "3d-buildings",
//           source: "composite",
//           "source-layer": "building",
//           filter: ["==", "extrude", "true"],
//           type: "fill-extrusion",
//           minzoom: 14,
//           paint: {
//             "fill-extrusion-color": styleId === "nuit" ? "#1a1408" : "#d4c5a0",
//             "fill-extrusion-height": [
//               "interpolate",
//               ["linear"],
//               ["zoom"],
//               14,
//               0,
//               15,
//               ["get", "height"],
//             ],
//             "fill-extrusion-base": [
//               "interpolate",
//               ["linear"],
//               ["zoom"],
//               14,
//               0,
//               15,
//               ["get", "min_height"],
//             ],
//             "fill-extrusion-opacity": styleId === "nuit" ? 0.85 : 0.6,
//           },
//         });
//       } catch (_) {}
//     }
//     if (styleId === "nuit") {
//       gl.setFog({
//         color: "rgba(15,10,5,0.8)",
//         "high-color": "#0a0804",
//         "horizon-blend": 0.08,
//         "space-color": "#030201",
//         "star-intensity": 0.3,
//         range: [1, 4],
//       });
//     } else if (styleId === "satellite" || styleId === "relief") {
//       gl.setFog({
//         color: "rgba(180,210,240,0.6)",
//         "high-color": "#acd3f0",
//         "horizon-blend": 0.12,
//         "space-color": "#1a2a4a",
//         "star-intensity": 0.1,
//         range: [1, 5],
//       });
//     } else {
//       gl.setFog(null);
//     }
//   }, [map, styleId]);

//   useEffect(() => {
//     if (!map) return;
//     const gl = map.getMap();
//     if (gl.isStyleLoaded()) {
//       applyEffects();
//     } else {
//       gl.once("style.load", applyEffects);
//     }
//     return () => {
//       try {
//         gl.off("style.load", applyEffects);
//       } catch (_) {}
//     };
//   }, [map, styleId, applyEffects]);
//   return null;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // PublicMap Component
// // ─────────────────────────────────────────────────────────────────────────────
// const PublicMap = ({
//   centerPosition = null,
//   rayon = null,
//   activeLabel = null,
//   onRayonChange = null,
//   onSaveRayon = null,
//   rayonSaving = false,
//   savedLocations = [],
//   activeSource = "gps",
//   onSelectSource = null,
//   prestataires: prestatairesProps = null,
//   filtreMetier: filtreMetierProp = null,
//   onFiltreChange = null,
//   onCountChange = null,
// }) => {
//   const isUserMode = prestatairesProps !== null || onSelectSource !== null;

//   const [prestatairesLocal, setPrestatairesLocal] = useState([]);
//   const [filtreMetierLocal, setFiltreMetierLocal] = useState("Tous");
//   const filtreMetier =
//     filtreMetierProp !== null ? filtreMetierProp : filtreMetierLocal;
//   const setFiltreMetier = (v) => {
//     if (onFiltreChange) onFiltreChange(v);
//     else setFiltreMetierLocal(v);
//   };

//   const [selected, setSelected] = useState(null);
//   const [styleId, setStyleId] = useState("nuit");
//   const [showRayonCtrl, setShowRayonCtrl] = useState(false);
//   const [showSrcPicker, setShowSrcPicker] = useState(false);
//   const [rayonLocal, setRayonLocal] = useState(rayon != null ? rayon : 10);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
//   const [viewState, setViewState] = useState({
//     longitude: 166.458,
//     latitude: -22.272,
//     zoom: 11.5,
//     pitch: 45,
//     bearing: -10,
//   });

//   const mapRef = useRef(null);
//   const currentStyle = MAP_STYLES.find((s) => s.id === styleId);
//   const prestataires = isUserMode ? prestatairesProps || [] : prestatairesLocal;

//   // ── Font Injection (Login Style) ────────────────────────────────────────
//   useEffect(() => {
//     if (!document.getElementById("map-fonts")) {
//       const link = document.createElement("link");
//       link.id = "map-fonts";
//       link.rel = "stylesheet";
//       link.href = FONT_LINK;
//       document.head.appendChild(link);
//     }
//   }, []);

//   // Responsive
//   useEffect(() => {
//     const fn = () => setIsMobile(window.innerWidth < 640);
//     window.addEventListener("resize", fn);
//     return () => window.removeEventListener("resize", fn);
//   }, []);

//   // Sync rayon prop
//   useEffect(() => {
//     if (rayon != null) setRayonLocal(rayon);
//   }, [rayon]);

//   // Centrer carte sur la position active
//   useEffect(() => {
//     if (!centerPosition) return;
//     setViewState((v) => ({
//       ...v,
//       longitude: centerPosition.longitude,
//       latitude: centerPosition.latitude,
//       zoom: Math.max(v.zoom, 11),
//     }));
//   }, [centerPosition?.longitude, centerPosition?.latitude]);

//   // Fetch public (landing uniquement)
//   useEffect(() => {
//     if (isUserMode) return;
//     fetch(`${API_URL}/api/users/prestataires/positions/public`)
//       .then((r) => (r.ok ? r.json() : []))
//       .then((data) => {
//         setPrestatairesLocal(data);
//         onCountChange?.(data.length);
//       })
//       .catch((e) => console.error("PublicMap:", e.message));
//   }, []);

//   // Socket — via singleton
//   useEffect(() => {
//     if (isUserMode) return;
//     const socket = getSocket();
//     const onLocationUpdated = ({ userId, longitude, latitude }) => {
//       setPrestatairesLocal((prev) => {
//         const next = prev.map((p) =>
//           p._id !== userId
//             ? p
//             : {
//                 ...p,
//                 location: { ...p.location, coordinates: [longitude, latitude] },
//               },
//         );
//         onCountChange?.(next.length);
//         return next;
//       });
//     };
//     const onTrackingStopped = ({ userId }) => {
//       setPrestatairesLocal((prev) => {
//         const next = prev.filter((p) => p._id !== userId);
//         onCountChange?.(next.length);
//         return next;
//       });
//     };
//     socket.on("location_updated", onLocationUpdated);
//     socket.on("tracking_stopped", onTrackingStopped);
//     return () => {
//       socket.off("location_updated", onLocationUpdated);
//       socket.off("tracking_stopped", onTrackingStopped);
//     };
//   }, []);

//   const handleStyleChange = (newId) => {
//     const st = MAP_STYLES.find((m) => m.id === newId);
//     setStyleId(newId);
//     setSelected(null);
//     setViewState((v) => ({
//       ...v,
//       pitch: st.pitch,
//       bearing: newId === "satellite" ? -15 : -10,
//     }));
//   };

//   const recenter = () => {
//     const pos = centerPosition || { longitude: 166.458, latitude: -22.272 };
//     setViewState((v) => ({
//       ...v,
//       longitude: pos.longitude,
//       latitude: pos.latitude,
//       zoom: 12,
//       pitch: currentStyle.pitch,
//     }));
//   };

//   const metiersDispos = [
//     "Tous",
//     ...new Set(prestataires.map((p) => p.metiers?.[0]?.nom).filter(Boolean)),
//   ];
//   const filtres =
//     filtreMetier === "Tous"
//       ? prestataires
//       : prestataires.filter((p) => p.metiers?.[0]?.nom === filtreMetier);

//   const circleData =
//     centerPosition && rayonLocal
//       ? makeCircle(
//           centerPosition.longitude,
//           centerPosition.latitude,
//           rayonLocal,
//         )
//       : null;
//   const rayonPct = Math.round(((rayonLocal - 1) / 99) * 100);

//   return (
//     <div
//       style={s.wrapper}
//       onClick={() => {
//         setShowSrcPicker(false);
//         setShowRayonCtrl(false);
//       }}
//     >
//       {/* ══ BARRE DE CONTRÔLE (Style Login) ══ */}
//       <div style={s.filterBar}>
//         {/* 1. Sélecteur Source (Mode User) */}
//         {isUserMode && (
//           <div style={{ position: "relative", flexShrink: 0 }}>
//             <button
//               style={{
//                 ...s.controlBtn,
//                 ...(activeSource !== "gps" ? s.controlBtnInactive : {}),
//                 width: isMobile ? "auto" : "140px",
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setShowSrcPicker((x) => !x);
//                 setShowRayonCtrl(false);
//               }}
//             >
//               <span style={s.controlIcon}>📍</span>
//               <span style={{ marginLeft: 6 }}>{activeLabel || "Position"}</span>
//               <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>
//                 ▼
//               </span>
//             </button>

//             {showSrcPicker && (
//               <div style={s.dropdown}>
//                 <div style={s.dropdownTitle}>Source de recherche</div>
//                 <button
//                   style={{
//                     ...s.dropdownItem,
//                     ...(activeSource === "gps" ? s.dropdownItemActive : {}),
//                   }}
//                   onClick={() => {
//                     onSelectSource && onSelectSource("gps");
//                     setShowSrcPicker(false);
//                   }}
//                 >
//                   📍 Ma position GPS
//                 </button>
//                 {savedLocations.map((loc) => (
//                   <button
//                     key={loc._id}
//                     style={{
//                       ...s.dropdownItem,
//                       ...(activeSource === "saved:" + loc._id
//                         ? s.dropdownItemActive
//                         : {}),
//                     }}
//                     onClick={() => {
//                       onSelectSource && onSelectSource("saved:" + loc._id);
//                       setShowSrcPicker(false);
//                     }}
//                   >
//                     {loc.isDefault ? "★ " : "📍 "}
//                     {loc.label}
//                     {loc.adresse && (
//                       <span
//                         style={{ display: "block", fontSize: 10, opacity: 0.5 }}
//                       >
//                         {loc.adresse}
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* 2. LIVE COUNTER (Subtle) */}
//         <div style={s.liveChip}>
//           <span style={s.liveDot} />
//           <span style={{ fontWeight: 600, color: "#c9a84c" }}>
//             {prestataires.length}
//           </span>
//           <span style={{ marginLeft: 4 }}>en ligne</span>
//         </div>

//         {/* 3. FILTRE MÉTIER (Mobile First - Style Input Login) */}
//         <div style={s.inputGroup}>
//           <span style={s.inputIcon}>⚡</span>
//           <select
//             style={s.styledSelect}
//             value={filtreMetier}
//             onChange={(e) => {
//               setFiltreMetier(e.target.value);
//               setSelected(null);
//             }}
//           >
//             {metiersDispos.map((m) => (
//               <option key={m} value={m}>
//                 {m === "Tous" ? "Tous les métiers" : `${getIcon(m)} ${m}`}
//               </option>
//             ))}
//           </select>
//           {/* Flèche personnalisée */}
//           <span style={s.selectArrow}>▼</span>
//         </div>

//         {/* 4. BOUTON RAYON (Mode User) */}
//         {isUserMode && (
//           <button
//             style={{
//               ...s.controlBtn,
//               ...(showRayonCtrl ? s.controlBtnActive : {}),
//               minWidth: 60,
//               justifyContent: "center",
//             }}
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowRayonCtrl((x) => !x);
//               setShowSrcPicker(false);
//             }}
//           >
//             {rayonLocal} km
//           </button>
//         )}

//         {/* 5. SÉLECTEUR STYLE (Icônes seules sur mobile) */}
//         <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
//           {MAP_STYLES.map((ms) => (
//             <button
//               key={ms.id}
//               onClick={() => handleStyleChange(ms.id)}
//               style={{
//                 ...s.iconBtn,
//                 ...(styleId === ms.id ? s.iconBtnActive : {}),
//               }}
//               title={ms.label}
//             >
//               {ms.label.split(" ")[0]}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ══ PANNEAU RAYON (Style Login Panel) ══ */}
//       {isUserMode && showRayonCtrl && (
//         <div style={s.panel} onClick={(e) => e.stopPropagation()}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginBottom: 12,
//               alignItems: "center",
//             }}
//           >
//             <span
//               style={{
//                 fontSize: 11,
//                 color: "rgba(245,240,232,0.4)",
//                 textTransform: "uppercase",
//                 letterSpacing: 1.5,
//               }}
//             >
//               Rayon de recherche
//             </span>
//             <span
//               style={{
//                 fontSize: 18,
//                 fontWeight: 700,
//                 color: "#c9a84c",
//                 fontFamily: "'Cormorant Garamond', serif",
//               }}
//             >
//               {rayonLocal} km
//             </span>
//           </div>
//           <div style={{ position: "relative", marginBottom: 16 }}>
//             <input
//               type="range"
//               min={1}
//               max={100}
//               value={rayonLocal}
//               onChange={(e) => {
//                 const v = Number(e.target.value);
//                 setRayonLocal(v);
//                 onRayonChange && onRayonChange(v);
//               }}
//               style={s.rangeInput}
//             />
//             <div style={s.rangeTrack} />
//           </div>
//           <button
//             style={s.primaryBtn}
//             disabled={rayonSaving}
//             onClick={() => {
//               onSaveRayon && onSaveRayon();
//               setShowRayonCtrl(false);
//             }}
//           >
//             {rayonSaving ? "Enregistrement..." : "Sauvegarder ce rayon"}
//           </button>
//         </div>
//       )}

//       {/* ══ CARTE ══ */}
//       <div style={s.mapContainer}>
//         <Map
//           ref={mapRef}
//           id="publicMap"
//           {...viewState}
//           onMove={(e) => setViewState(e.viewState)}
//           style={{ width: "100%", height: "100%" }}
//           mapStyle={currentStyle.url}
//           mapboxAccessToken={MAPBOX_TOKEN}
//           onClick={() => setSelected(null)}
//           antialias
//           maxPitch={85}
//         >
//           <MapEffects styleId={styleId} />
//           <NavigationControl position="bottom-right" visualizePitch />

//           {/* Cercle rayon */}
//           {circleData && (
//             <>
//               <Source id="rayon-fill" type="geojson" data={circleData}>
//                 <Layer
//                   id="rayon-fill-layer"
//                   type="fill"
//                   paint={{ "fill-color": "#c9a84c", "fill-opacity": 0.06 }}
//                 />
//               </Source>
//               <Source id="rayon-border" type="geojson" data={circleData}>
//                 <Layer
//                   id="rayon-border-layer"
//                   type="line"
//                   paint={{
//                     "line-color": "#c9a84c",
//                     "line-width": 1.5,
//                     "line-opacity": 0.5,
//                     "line-dasharray": [4, 3],
//                   }}
//                 />
//               </Source>
//             </>
//           )}

//           {/* Marqueur position active */}
//           {centerPosition && (
//             <Marker
//               longitude={centerPosition.longitude}
//               latitude={centerPosition.latitude}
//               anchor="center"
//             >
//               <div
//                 style={{
//                   position: "relative",
//                   width: 20,
//                   height: 20,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 14,
//                     height: 14,
//                     borderRadius: "50%",
//                     background: "#3b82f6",
//                     border: "2px solid #fff",
//                     zIndex: 1,
//                   }}
//                 />
//                 <div
//                   style={{
//                     position: "absolute",
//                     inset: -6,
//                     borderRadius: "50%",
//                     border: "2px solid rgba(59,130,246,0.4)",
//                     animation: "pulse-ring 2.2s ease-out infinite",
//                   }}
//                 />
//               </div>
//             </Marker>
//           )}

//           {/* Marqueurs adresses enregistrées */}
//           {isUserMode &&
//             savedLocations.map((loc) => (
//               <Marker
//                 key={loc._id}
//                 longitude={loc.longitude}
//                 latitude={loc.latitude}
//                 anchor="center"
//               >
//                 <div
//                   style={{
//                     fontSize: 20,
//                     cursor: "pointer",
//                     opacity: activeSource === "saved:" + loc._id ? 1 : 0.45,
//                     transform:
//                       activeSource === "saved:" + loc._id
//                         ? "scale(1.15)"
//                         : "scale(1)",
//                     transition: "all 0.2s",
//                     filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
//                   }}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onSelectSource && onSelectSource("saved:" + loc._id);
//                   }}
//                 >
//                   📍
//                 </div>
//               </Marker>
//             ))}

//           {/* Marqueurs prestataires */}
//           {filtres.map((p) => {
//             const [lng, lat] = p.location?.coordinates || [];
//             if (!lng || !lat) return null;
//             const metierNom = p.metiers?.[0]?.nom || "Prestataire";
//             const color = getColor(metierNom);
//             const icon = getIcon(metierNom);
//             const isActive = selected?._id === p._id;
//             return (
//               <Marker
//                 key={p._id}
//                 longitude={lng}
//                 latitude={lat}
//                 anchor="center"
//                 onClick={(e) => {
//                   e.originalEvent.stopPropagation();
//                   setSelected(isActive ? null : p);
//                 }}
//               >
//                 <div
//                   style={{
//                     ...s.marker,
//                     background: color,
//                     boxShadow: isActive
//                       ? `0 0 0 3px ${color}88, 0 8px 24px ${color}66`
//                       : `0 4px 12px ${color}44`,
//                     transform: isActive ? "scale(1.2)" : "scale(1)",
//                     borderColor: isActive ? "#fff" : "rgba(255,255,255,0.3)",
//                   }}
//                   title={p.prenom + " " + p.nom + " — " + metierNom}
//                 >
//                   <span
//                     style={{
//                       fontSize: 16,
//                       filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
//                     }}
//                   >
//                     {icon}
//                   </span>
//                   <div style={{ ...s.pulse, borderColor: color + "55" }} />
//                 </div>
//               </Marker>
//             );
//           })}

//           {/* Popup (Style Carte de visite sombre) */}
//           {selected &&
//             (() => {
//               const metierNom = selected.metiers?.[0]?.nom || "Prestataire";
//               const color = getColor(metierNom);
//               return (
//                 <Popup
//                   longitude={selected.location.coordinates[0]}
//                   latitude={selected.location.coordinates[1]}
//                   anchor="bottom"
//                   offset={24}
//                   closeOnClick={false}
//                   onClose={() => setSelected(null)}
//                   style={{ padding: 0 }}
//                   className="hopela-popup"
//                 >
//                   <div style={s.popupCard}>
//                     <div
//                       style={{
//                         ...s.popupAvatar,
//                         background: color,
//                         boxShadow: `0 4px 12px ${color}55`,
//                       }}
//                     >
//                       {getIcon(metierNom)}
//                     </div>
//                     <div style={{ flex: 1 }}>
//                       <div style={s.popupName}>
//                         {selected.prenom} {selected.nom}
//                       </div>
//                       <div style={{ ...s.popupMetier, color }}>{metierNom}</div>
//                       {selected.ridet && (
//                         <div
//                           style={{
//                             fontSize: 10,
//                             color: "rgba(245,240,232,0.4)",
//                             marginTop: 2,
//                             fontFamily: "'DM Sans', sans-serif",
//                           }}
//                         >
//                           RIDET {selected.ridet}
//                         </div>
//                       )}
//                     </div>
//                     <div
//                       style={{
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 4,
//                         marginTop: 8,
//                         paddingTop: 8,
//                         borderTop: "1px solid rgba(255,255,255,0.1)",
//                       }}
//                     >
//                       {selected.telephoneContact && (
//                         <a
//                           href={"tel:" + selected.telephoneContact}
//                           style={s.popupLink}
//                         >
//                           📞 Appeler
//                         </a>
//                       )}
//                       {selected.emailContact && (
//                         <a
//                           href={"mailto:" + selected.emailContact}
//                           style={s.popupLink}
//                         >
//                           ✉️ Email
//                         </a>
//                       )}
//                     </div>
//                   </div>
//                 </Popup>
//               );
//             })()}
//         </Map>

//         <button onClick={recenter} style={s.recenterBtn}>
//           <span style={{ fontSize: 14 }}>🎯</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// // ── STYLES (Charte LoginScreen) ───────────────────────────────────────────────
// const s = {
//   // Layout & Backgrounds
//   wrapper: {
//     display: "flex",
//     flexDirection: "column",
//     width: "100%",
//     height: "100%",
//     background: "#0a0804",
//     fontFamily: "'DM Sans', sans-serif",
//     color: "#f5f0e8",
//   },

//   // Top Bar (Inputs style)
//   filterBar: {
//     display: "flex",
//     alignItems: "center",
//     gap: 12,
//     padding: "12px 16px",
//     background: "rgba(14,11,6,0.95)", // Login Panel BG
//     borderBottom: "1px solid rgba(201,168,76,0.12)", // Login Border
//     flexWrap: "nowrap",
//     overflowX: "auto",
//     backdropFilter: "blur(10px)",
//     zIndex: 10,
//   },

//   // Controls Buttons (Source, Radius, Style)
//   controlBtn: {
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "rgba(201,168,76,0.1)", // Active tab bg
//     border: "1px solid rgba(201,168,76,0.25)",
//     borderRadius: 8, // Slightly rounded like tabs
//     color: "#c9a84c",
//     fontFamily: "'DM Sans', sans-serif",
//     fontSize: 12,
//     fontWeight: 500,
//     padding: "8px 12px",
//     cursor: "pointer",
//     whiteSpace: "nowrap",
//     transition: "all 0.2s",
//   },
//   controlBtnActive: {
//     background: "rgba(201,168,76,0.2)",
//     borderColor: "rgba(201,168,76,0.5)",
//     boxShadow: "0 0 0 1px rgba(201,168,76,0.1)",
//   },
//   controlBtnInactive: {
//     background: "rgba(255,255,255,0.04)",
//     color: "rgba(245,240,232,0.6)",
//     borderColor: "rgba(255,255,255,0.08)",
//   },
//   controlIcon: { fontSize: 14, opacity: 0.8 },

//   // Icon Buttons (Map styles)
//   iconBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 8,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "rgba(255,255,255,0.04)",
//     border: "1px solid rgba(201,168,76,0.1)",
//     color: "rgba(245,240,232,0.5)",
//     fontSize: 16,
//     cursor: "pointer",
//     transition: "all 0.2s",
//     flexShrink: 0,
//   },
//   iconBtnActive: {
//     background: "rgba(201,168,76,0.15)",
//     borderColor: "rgba(201,168,76,0.4)",
//     color: "#c9a84c",
//     boxShadow: "0 0 10px rgba(201,168,76,0.1)",
//   },

//   // Live Chip
//   liveChip: {
//     display: "inline-flex",
//     alignItems: "center",
//     fontSize: 11,
//     color: "rgba(245,240,232,0.5)",
//     background: "rgba(255,255,255,0.03)",
//     padding: "4px 8px",
//     borderRadius: 6,
//     border: "1px solid rgba(255,255,255,0.05)",
//   },
//   liveDot: {
//     width: 6,
//     height: 6,
//     borderRadius: "50%",
//     background: "#4caf6e",
//     display: "inline-block",
//     marginRight: 6,
//     boxShadow: "0 0 6px #4caf6e",
//   },

//   // INPUT GROUP (Filtre Métier - Reprend le style Login Input)
//   inputGroup: {
//     position: "relative",
//     display: "flex",
//     alignItems: "center",
//     background: "rgba(255,255,255,0.04)",
//     border: "1px solid rgba(201,168,76,0.15)",
//     borderRadius: 10, // Same as login input
//     flex: 1,
//     maxWidth: 240,
//     minWidth: 140,
//     transition: "all 0.2s",
//   },
//   inputGroupFocus: {
//     borderColor: "rgba(201,168,76,0.5)",
//     background: "rgba(201,168,76,0.04)",
//     boxShadow: "0 0 0 3px rgba(201,168,76,0.08)",
//   },
//   inputIcon: {
//     position: "absolute",
//     left: 12,
//     top: "50%",
//     transform: "translateY(-50%)",
//     fontSize: 14,
//     pointerEvents: "none",
//     opacity: 0.7,
//     zIndex: 2,
//   },
//   styledSelect: {
//     width: "100%",
//     height: 38,
//     background: "transparent",
//     border: "none",
//     outline: "none",
//     color: "#f5f0e8",
//     fontFamily: "'DM Sans', sans-serif",
//     fontSize: 13,
//     padding: "0 36px 0 38px", // Left padding for icon, right for arrow
//     cursor: "pointer",
//     appearance: "none",
//     WebkitAppearance: "none",
//   },
//   selectArrow: {
//     position: "absolute",
//     right: 12,
//     top: "50%",
//     transform: "translateY(-50%)",
//     fontSize: 10,
//     color: "#c9a84c",
//     pointerEvents: "none",
//   },

//   // Dropdown
//   dropdown: {
//     position: "absolute",
//     top: "calc(100% + 8px)",
//     left: 0,
//     zIndex: 500,
//     background: "#0e0b06",
//     border: "1px solid rgba(201,168,76,0.2)",
//     borderRadius: 10,
//     padding: "6px",
//     minWidth: 200,
//     boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
//     backdropFilter: "blur(12px)",
//   },
//   dropdownTitle: {
//     fontSize: 10,
//     color: "rgba(245,240,232,0.3)",
//     letterSpacing: 1,
//     textTransform: "uppercase",
//     padding: "4px 8px 6px",
//     fontFamily: "'DM Sans', sans-serif",
//   },
//   dropdownItem: {
//     display: "block",
//     width: "100%",
//     textAlign: "left",
//     padding: "8px 10px",
//     borderRadius: 6,
//     border: "none",
//     background: "none",
//     fontFamily: "'DM Sans', sans-serif",
//     fontSize: 12,
//     color: "rgba(245,240,232,0.7)",
//     cursor: "pointer",
//     transition: "all 0.15s",
//   },
//   dropdownItemActive: { background: "rgba(201,168,76,0.1)", color: "#c9a84c" },

//   // Rayon Panel (Style Login Panel)
//   panel: {
//     padding: "20px 24px",
//     background: "rgba(14,11,6,0.98)",
//     borderBottom: "1px solid rgba(201,168,76,0.12)",
//     flexShrink: 0,
//     zIndex: 9,
//     boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
//   },
//   rangeInput: {
//     width: "100%",
//     height: 6,
//     borderRadius: 3,
//     outline: "none",
//     cursor: "pointer",
//     WebkitAppearance: "none",
//     appearance: "none",
//     background: "transparent",
//     zIndex: 2,
//     position: "relative",
//   },
//   rangeTrack: {
//     position: "absolute",
//     top: "50%",
//     left: 0,
//     width: "100%",
//     height: 4,
//     marginTop: -2,
//     borderRadius: 3,
//     background: "rgba(201,168,76,0.15)",
//     pointerEvents: "none",
//     zIndex: 1,
//   },
//   primaryBtn: {
//     width: "100%",
//     padding: "12px",
//     borderRadius: 10,
//     border: "none",
//     background: "linear-gradient(135deg, #c9a84c, #e8c97a)",
//     color: "#0a0804",
//     fontFamily: "'DM Sans', sans-serif",
//     fontSize: 12,
//     fontWeight: 700,
//     letterSpacing: 1,
//     textTransform: "uppercase",
//     cursor: "pointer",
//     transition: "all 0.2s",
//     boxShadow: "0 4px 15px rgba(201,168,76,0.25)",
//   },

//   // Map
//   mapContainer: { flex: 1, minHeight: 0, position: "relative", width: "100%" },
//   marker: {
//     width: 40,
//     height: 40,
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     cursor: "pointer",
//     position: "relative",
//     transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
//     userSelect: "none",
//     border: "2px solid rgba(255,255,255,0.4)",
//   },
//   pulse: {
//     position: "absolute",
//     inset: -8,
//     borderRadius: "50%",
//     border: "2px solid",
//     animation: "pulse-ring 2.2s ease-out infinite",
//     pointerEvents: "none",
//   },

//   // Popup (Dark Mode Card)
//   popupCard: {
//     background: "#1c1610",
//     border: "1px solid rgba(201,168,76,0.2)",
//     borderRadius: 12,
//     padding: 16,
//     minWidth: 220,
//     boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
//     display: "flex",
//     gap: 12,
//   },
//   popupAvatar: {
//     width: 44,
//     height: 44,
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 20,
//     flexShrink: 0,
//     color: "#fff",
//   },
//   popupName: {
//     fontWeight: 700,
//     fontSize: 15,
//     color: "#f5f0e8",
//     marginBottom: 2,
//     fontFamily: "'Cormorant Garamond', serif",
//   },
//   popupMetier: {
//     fontSize: 12,
//     fontWeight: 600,
//     marginBottom: 4,
//     fontFamily: "'DM Sans', sans-serif",
//   },
//   popupLink: {
//     display: "block",
//     fontSize: 11,
//     color: "rgba(245,240,232,0.6)",
//     textDecoration: "none",
//     transition: "color 0.2s",
//     fontFamily: "'DM Sans', sans-serif",
//   },
//   popupLinkHover: { color: "#c9a84c" },

//   recenterBtn: {
//     position: "absolute",
//     top: 12,
//     right: 12,
//     zIndex: 10,
//     width: 40,
//     height: 40,
//     borderRadius: 50,
//     background: "#0e0b06",
//     border: "1px solid rgba(201,168,76,0.3)",
//     color: "#c9a84c",
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
//     transition: "transform 0.2s",
//   },
// };

// // Global CSS Injection for custom range thumb and animations
// if (
//   typeof document !== "undefined" &&
//   !document.getElementById("map-login-styles")
// ) {
//   const el = document.createElement("style");
//   el.id = "map-login-styles";
//   el.textContent = `
//     @keyframes pulse-ring{0%{transform:scale(1);opacity:0.6}100%{transform:scale(2.2);opacity:0}}

//     /* Custom Range Slider Thumb */
//     input[type=range]::-webkit-slider-thumb {
//       -webkit-appearance: none;
//       height: 18px; width: 18px;
//       border-radius: 50%;
//       background: #c9a84c;
//       cursor: pointer;
//       margin-top: -7px;
//       box-shadow: 0 0 10px rgba(201,168,76,0.5);
//       border: 2px solid #fff;
//     }
//     input[type=range]::-moz-range-thumb {
//       height: 18px; width: 18px;
//       border-radius: 50%;
//       background: #c9a84c;
//       cursor: pointer;
//       box-shadow: 0 0 10px rgba(201,168,76,0.5);
//       border: 2px solid #fff;
//     }

//     /* Popup CSS overrides for Mapbox */
//     .mapboxgl-popup-content { padding: 0 !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }
//     .mapboxgl-popup-tip { display: none; }
//   `;
//   document.head.appendChild(el);
// }

/* eslint-disable react-hooks/exhaustive-deps */
// src/components/map/PublicMap.jsx
import { useEffect, useState, useRef, useCallback } from "react";
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

// ── Configuration & Assets ─────────────────────────────────────────────────────
const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const MAP_STYLES = [
  {
    id: "nuit",
    label: "🌙 Nuit",
    url: "mapbox://styles/mapbox/dark-v11",
    pitch: 45,
    terrain: false,
  },
  {
    id: "satellite",
    label: "🛰️ Satellite",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    pitch: 60,
    terrain: true,
  },
  {
    id: "plan",
    label: "🗺️ Plan",
    url: "mapbox://styles/mapbox/streets-v12",
    pitch: 0,
    terrain: false,
  },
  {
    id: "relief",
    label: "⛰️ Relief",
    url: "mapbox://styles/mapbox/outdoors-v12",
    pitch: 60,
    terrain: true,
  },
];

// Couleurs fonctionnelles pour les marqueurs (gardées pour la lisibilité de la carte)
// Palette cohérente avec la charte de l'app
const METIER_COLORS = {
  Électricien: "#00a6b2",
  Plombier: "#1a2d4a",
  Menuisier: "#145c45",
  Peintre: "#5fd9df",
  Jardinier: "#1e7a5c",
  Climatisation: "#007b87",
  "Femme de ménage": "#223a60",
  Maçon: "#385075",
  Photographe: "#102a43",
  Carreleur: "#2f4d7a",
  "Garde d'enfants": "#5b7083",
  Informaticien: "#00a6b2",
  Coursier: "#1e7a5c",
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
const getIcon = (nom) => METIER_ICONS[nom] || "📍";

const makeCircle = (lng, lat, radiusKm, steps = 64) => {
  const R = 6371;
  const coords = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * (2 * Math.PI);
    const dLat = (radiusKm / R) * (180 / Math.PI);
    const dLng = dLat / Math.cos((lat * Math.PI) / 180);
    coords.push([lng + dLng * Math.sin(angle), lat + dLat * Math.cos(angle)]);
  }
  return {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [coords] },
  };
};

// ── Composant d'Effets Carte (Bâtiments 3D, Brouillard) ───────────────────────
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
            "fill-extrusion-color": styleId === "nuit" ? "#1a1408" : "#d4c5a0",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              15,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              15,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": styleId === "nuit" ? 0.85 : 0.6,
          },
        });
      } catch (_) {}
    }
    if (styleId === "nuit") {
      gl.setFog({
        color: "rgba(15,10,5,0.8)",
        "high-color": "#0a0804",
        "horizon-blend": 0.08,
        "space-color": "#030201",
        "star-intensity": 0.3,
        range: [1, 4],
      });
    } else if (styleId === "satellite" || styleId === "relief") {
      gl.setFog({
        color: "rgba(180,210,240,0.6)",
        "high-color": "#acd3f0",
        "horizon-blend": 0.12,
        "space-color": "#1a2a4a",
        "star-intensity": 0.1,
        range: [1, 5],
      });
    } else {
      gl.setFog(null);
    }
  }, [map, styleId]);

  useEffect(() => {
    if (!map) return;
    const gl = map.getMap();
    if (gl.isStyleLoaded()) {
      applyEffects();
    } else {
      gl.once("style.load", applyEffects);
    }
    return () => {
      try {
        gl.off("style.load", applyEffects);
      } catch (_) {}
    };
  }, [map, styleId, applyEffects]);
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// PublicMap Component
// ─────────────────────────────────────────────────────────────────────────────
const PublicMap = ({
  centerPosition = null,
  rayon = null,
  activeLabel = null,
  onRayonChange = null,
  onSaveRayon = null,
  rayonSaving = false,
  savedLocations = [],
  activeSource = "gps",
  onSelectSource = null,
  prestataires: prestatairesProps = null,
  filtreMetier: filtreMetierProp = null,
  onFiltreChange = null,
  onCountChange = null,
}) => {
  const isUserMode = prestatairesProps !== null || onSelectSource !== null;

  const [prestatairesLocal, setPrestatairesLocal] = useState([]);
  const [filtreMetierLocal, setFiltreMetierLocal] = useState("Tous");
  const filtreMetier =
    filtreMetierProp !== null ? filtreMetierProp : filtreMetierLocal;
  const setFiltreMetier = (v) => {
    if (onFiltreChange) onFiltreChange(v);
    else setFiltreMetierLocal(v);
  };

  const [selected, setSelected] = useState(null);
  const [styleId, setStyleId] = useState("nuit");
  const [showRayonCtrl, setShowRayonCtrl] = useState(false);
  const [showSrcPicker, setShowSrcPicker] = useState(false);
  const [rayonLocal, setRayonLocal] = useState(rayon != null ? rayon : 10);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [viewState, setViewState] = useState({
    longitude: 166.458,
    latitude: -22.272,
    zoom: 11.5,
    pitch: 45,
    bearing: -10,
  });

  const mapRef = useRef(null);
  const currentStyle = MAP_STYLES.find((s) => s.id === styleId);
  const prestataires = isUserMode ? prestatairesProps || [] : prestatairesLocal;

  // ── Font Injection (Login Style) ────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById("map-fonts")) {
      const link = document.createElement("link");
      link.id = "map-fonts";
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
  }, []);

  // Responsive
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Sync rayon prop
  useEffect(() => {
    if (rayon != null) setRayonLocal(rayon);
  }, [rayon]);

  // Centrer carte sur la position active
  useEffect(() => {
    if (!centerPosition) return;
    setViewState((v) => ({
      ...v,
      longitude: centerPosition.longitude,
      latitude: centerPosition.latitude,
      zoom: Math.max(v.zoom, 11),
    }));
  }, [centerPosition?.longitude, centerPosition?.latitude]);

  // Fetch public (landing uniquement)
  useEffect(() => {
    if (isUserMode) return;
    fetch(`${API_URL}/api/users/prestataires/positions/public`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setPrestatairesLocal(data);
        onCountChange?.(data.length);
      })
      .catch((e) => console.error("PublicMap:", e.message));
  }, []);

  // Socket — via singleton
  useEffect(() => {
    if (isUserMode) return;
    const socket = getSocket();
    const onLocationUpdated = ({ userId, longitude, latitude }) => {
      setPrestatairesLocal((prev) => {
        const next = prev.map((p) =>
          p._id !== userId
            ? p
            : {
                ...p,
                location: { ...p.location, coordinates: [longitude, latitude] },
              },
        );
        onCountChange?.(next.length);
        return next;
      });
    };
    const onTrackingStopped = ({ userId }) => {
      setPrestatairesLocal((prev) => {
        const next = prev.filter((p) => p._id !== userId);
        onCountChange?.(next.length);
        return next;
      });
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
    setStyleId(newId);
    setSelected(null);
    setViewState((v) => ({
      ...v,
      pitch: st.pitch,
      bearing: newId === "satellite" ? -15 : -10,
    }));
  };

  const recenter = () => {
    const pos = centerPosition || { longitude: 166.458, latitude: -22.272 };
    setViewState((v) => ({
      ...v,
      longitude: pos.longitude,
      latitude: pos.latitude,
      zoom: 12,
      pitch: currentStyle.pitch,
    }));
  };

  const metiersDispos = [
    "Tous",
    ...new Set(prestataires.map((p) => p.metiers?.[0]?.nom).filter(Boolean)),
  ];
  const filtres =
    filtreMetier === "Tous"
      ? prestataires
      : prestataires.filter((p) => p.metiers?.[0]?.nom === filtreMetier);

  const circleData =
    centerPosition && rayonLocal
      ? makeCircle(
          centerPosition.longitude,
          centerPosition.latitude,
          rayonLocal,
        )
      : null;
  const rayonPct = Math.round(((rayonLocal - 1) / 99) * 100);

  return (
    <div
      style={s.wrapper}
      onClick={() => {
        setShowSrcPicker(false);
        setShowRayonCtrl(false);
      }}
    >
      {/* ══ BARRE DE CONTRÔLE (Style Login) ══ */}
      <div style={s.filterBar}>
        {/* 1. Sélecteur Source (Mode User) */}
        {isUserMode && (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <button
              style={{
                ...s.controlBtn,
                ...(activeSource !== "gps" ? s.controlBtnInactive : {}),
                width: isMobile ? "auto" : "140px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowSrcPicker((x) => !x);
                setShowRayonCtrl(false);
              }}
            >
              <span style={s.controlIcon}>📍</span>
              <span style={{ marginLeft: 6 }}>{activeLabel || "Position"}</span>
              <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.6 }}>
                ▼
              </span>
            </button>

            {showSrcPicker && (
              <div style={s.dropdown}>
                <div style={s.dropdownTitle}>Source de recherche</div>
                <button
                  style={{
                    ...s.dropdownItem,
                    ...(activeSource === "gps" ? s.dropdownItemActive : {}),
                  }}
                  onClick={() => {
                    onSelectSource && onSelectSource("gps");
                    setShowSrcPicker(false);
                  }}
                >
                  📍 Ma position GPS
                </button>
                {savedLocations.map((loc) => (
                  <button
                    key={loc._id}
                    style={{
                      ...s.dropdownItem,
                      ...(activeSource === "saved:" + loc._id
                        ? s.dropdownItemActive
                        : {}),
                    }}
                    onClick={() => {
                      onSelectSource && onSelectSource("saved:" + loc._id);
                      setShowSrcPicker(false);
                    }}
                  >
                    {loc.isDefault ? "★ " : "📍 "}
                    {loc.label}
                    {loc.adresse && (
                      <span
                        style={{ display: "block", fontSize: 10, opacity: 0.5 }}
                      >
                        {loc.adresse}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. LIVE COUNTER (Subtle) */}
        <div style={s.liveChip}>
          <span style={s.liveDot} />
          <span style={{ fontWeight: 600, color: "#c9a84c" }}>
            {prestataires.length}
          </span>
          <span style={{ marginLeft: 4 }}>en ligne</span>
        </div>

        {/* 3. FILTRE MÉTIER (Mobile First - Style Input Login) */}
        <div style={s.inputGroup}>
          <span style={s.inputIcon}>⚡</span>
          <select
            style={s.styledSelect}
            value={filtreMetier}
            onChange={(e) => {
              setFiltreMetier(e.target.value);
              setSelected(null);
            }}
          >
            {metiersDispos.map((m) => (
              <option key={m} value={m}>
                {m === "Tous" ? "Tous les métiers" : `${getIcon(m)} ${m}`}
              </option>
            ))}
          </select>
          {/* Flèche personnalisée */}
          <span style={s.selectArrow}>▼</span>
        </div>

        {/* 4. BOUTON RAYON (Mode User) */}
        {isUserMode && (
          <button
            style={{
              ...s.controlBtn,
              ...(showRayonCtrl ? s.controlBtnActive : {}),
              minWidth: 60,
              justifyContent: "center",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowRayonCtrl((x) => !x);
              setShowSrcPicker(false);
            }}
          >
            {rayonLocal} km
          </button>
        )}

        {/* 5. SÉLECTEUR STYLE (Icônes seules sur mobile) */}
        <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          {MAP_STYLES.map((ms) => (
            <button
              key={ms.id}
              onClick={() => handleStyleChange(ms.id)}
              style={{
                ...s.iconBtn,
                ...(styleId === ms.id ? s.iconBtnActive : {}),
              }}
              title={ms.label}
            >
              {ms.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ══ PANNEAU RAYON (Style Login Panel) ══ */}
      {isUserMode && showRayonCtrl && (
        <div style={s.panel} onClick={(e) => e.stopPropagation()}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "rgba(245,240,232,0.4)",
                textTransform: "uppercase",
                letterSpacing: 1.5,
              }}
            >
              Rayon de recherche
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#c9a84c",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {rayonLocal} km
            </span>
          </div>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <input
              type="range"
              min={1}
              max={100}
              value={rayonLocal}
              onChange={(e) => {
                const v = Number(e.target.value);
                setRayonLocal(v);
                onRayonChange && onRayonChange(v);
              }}
              style={s.rangeInput}
            />
            <div style={s.rangeTrack} />
          </div>
          <button
            style={s.primaryBtn}
            disabled={rayonSaving}
            onClick={() => {
              onSaveRayon && onSaveRayon();
              setShowRayonCtrl(false);
            }}
          >
            {rayonSaving ? "Enregistrement..." : "Sauvegarder ce rayon"}
          </button>
        </div>
      )}

      {/* ══ CARTE ══ */}
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
                <Layer
                  id="rayon-fill-layer"
                  type="fill"
                  paint={{ "fill-color": "#c9a84c", "fill-opacity": 0.06 }}
                />
              </Source>
              <Source id="rayon-border" type="geojson" data={circleData}>
                <Layer
                  id="rayon-border-layer"
                  type="line"
                  paint={{
                    "line-color": "#c9a84c",
                    "line-width": 1.5,
                    "line-opacity": 0.5,
                    "line-dasharray": [4, 3],
                  }}
                />
              </Source>
            </>
          )}

          {/* Marqueur position active */}
          {centerPosition && (
            <Marker
              longitude={centerPosition.longitude}
              latitude={centerPosition.latitude}
              anchor="center"
            >
              <div
                style={{
                  position: "relative",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#3b82f6",
                    border: "2px solid #fff",
                    zIndex: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: -6,
                    borderRadius: "50%",
                    border: "2px solid rgba(59,130,246,0.4)",
                    animation: "pulse-ring 2.2s ease-out infinite",
                  }}
                />
              </div>
            </Marker>
          )}

          {/* Marqueurs adresses enregistrées */}
          {isUserMode &&
            savedLocations.map((loc) => (
              <Marker
                key={loc._id}
                longitude={loc.longitude}
                latitude={loc.latitude}
                anchor="center"
              >
                <div
                  style={{
                    fontSize: 20,
                    cursor: "pointer",
                    opacity: activeSource === "saved:" + loc._id ? 1 : 0.45,
                    transform:
                      activeSource === "saved:" + loc._id
                        ? "scale(1.15)"
                        : "scale(1)",
                    transition: "all 0.2s",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSource && onSelectSource("saved:" + loc._id);
                  }}
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
            const color = getColor(metierNom);
            const icon = getIcon(metierNom);
            const isActive = selected?._id === p._id;
            return (
              <Marker
                key={p._id}
                longitude={lng}
                latitude={lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelected(isActive ? null : p);
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    transform: isActive
                      ? "scale(1.15) translateY(-4px)"
                      : "scale(1)",
                    transition:
                      "transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275)",
                    filter: isActive
                      ? `drop-shadow(0 6px 12px ${color}88)`
                      : `drop-shadow(0 3px 6px ${color}55)`,
                  }}
                  title={p.prenom + " " + p.nom + " — " + metierNom}
                >
                  {/* Tête de l'épingle */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: color,
                      border: "2.5px solid #ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      boxShadow: isActive
                        ? `0 0 0 3px ${color}44, 0 4px 16px ${color}66`
                        : `0 2px 8px ${color}44`,
                    }}
                  >
                    <span style={{ fontSize: 17, lineHeight: 1 }}>{icon}</span>
                    {/* Anneau pulsant */}
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          inset: -7,
                          borderRadius: "50%",
                          border: `2px solid ${color}`,
                          animation: "pulse-ring 1.8s ease-out infinite",
                          pointerEvents: "none",
                        }}
                      />
                    )}
                  </div>
                  {/* Pointe de l'épingle */}
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: `8px solid ${color}`,
                      marginTop: -1,
                      filter: `drop-shadow(0 2px 2px ${color}44)`,
                    }}
                  />
                </div>
              </Marker>
            );
          })}

          {/* Popup (Style Carte de visite sombre) */}
          {selected &&
            (() => {
              const metierNom = selected.metiers?.[0]?.nom || "Prestataire";
              const color = getColor(metierNom);
              return (
                <Popup
                  longitude={selected.location.coordinates[0]}
                  latitude={selected.location.coordinates[1]}
                  anchor="bottom"
                  offset={24}
                  closeOnClick={false}
                  onClose={() => setSelected(null)}
                  style={{ padding: 0 }}
                  className="hopela-popup"
                >
                  <div style={s.popupCard}>
                    <div
                      style={{
                        ...s.popupAvatar,
                        background: color,
                        boxShadow: `0 4px 12px ${color}55`,
                      }}
                    >
                      {getIcon(metierNom)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={s.popupName}>
                        {selected.prenom} {selected.nom}
                      </div>
                      <div style={{ ...s.popupMetier, color }}>{metierNom}</div>
                      {selected.ridet && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "rgba(245,240,232,0.4)",
                            marginTop: 2,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          RIDET {selected.ridet}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {selected.telephoneContact && (
                        <a
                          href={"tel:" + selected.telephoneContact}
                          style={s.popupLink}
                        >
                          📞 Appeler
                        </a>
                      )}
                      {selected.emailContact && (
                        <a
                          href={"mailto:" + selected.emailContact}
                          style={s.popupLink}
                        >
                          ✉️ Email
                        </a>
                      )}
                    </div>
                  </div>
                </Popup>
              );
            })()}
        </Map>

        <button onClick={recenter} style={s.recenterBtn}>
          <span style={{ fontSize: 14 }}>🎯</span>
        </button>
      </div>
    </div>
  );
};

// ── STYLES (Charte LoginScreen) ───────────────────────────────────────────────
const s = {
  // ── Couleurs landing light mode ──
  // primary teal : #00a6b2
  // text dark    : #102a43
  // text sub     : #5b7083
  // border       : rgba(16,42,67,0.08)
  // bg           : #f7faf9
  // bg card      : #ffffff

  wrapper: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    background: "#f7faf9",
    fontFamily: "'Inter', sans-serif",
    color: "#102a43",
  },

  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    background: "rgba(255,255,255,0.95)",
    borderBottom: "1px solid rgba(16,42,67,0.08)",
    flexWrap: "nowrap",
    overflowX: "auto",
    backdropFilter: "blur(12px)",
    zIndex: 10,
  },

  controlBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,166,178,0.08)",
    border: "1px solid rgba(0,166,178,0.2)",
    borderRadius: 8,
    color: "#00a6b2",
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: "7px 12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s",
  },
  controlBtnActive: {
    background: "rgba(0,166,178,0.15)",
    borderColor: "rgba(0,166,178,0.4)",
    boxShadow: "0 0 0 2px rgba(0,166,178,0.1)",
  },
  controlBtnInactive: {
    background: "rgba(16,42,67,0.04)",
    color: "#5b7083",
    borderColor: "rgba(16,42,67,0.1)",
  },
  controlIcon: { fontSize: 14, opacity: 0.8 },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "1px solid rgba(16,42,67,0.1)",
    color: "#5b7083",
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.2s",
    flexShrink: 0,
  },
  iconBtnActive: {
    background: "rgba(0,166,178,0.1)",
    borderColor: "rgba(0,166,178,0.35)",
    color: "#00a6b2",
    boxShadow: "0 0 8px rgba(0,166,178,0.12)",
  },

  liveChip: {
    display: "inline-flex",
    alignItems: "center",
    fontSize: 11,
    color: "#5b7083",
    background: "rgba(16,42,67,0.04)",
    padding: "4px 10px",
    borderRadius: 20,
    border: "1px solid rgba(16,42,67,0.08)",
    whiteSpace: "nowrap",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#00a6b2",
    display: "inline-block",
    marginRight: 6,
    boxShadow: "0 0 6px rgba(0,166,178,0.6)",
  },

  inputGroup: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid rgba(16,42,67,0.1)",
    borderRadius: 8,
    flex: 1,
    maxWidth: 240,
    minWidth: 140,
    transition: "all 0.2s",
  },
  inputGroupFocus: {
    borderColor: "rgba(0,166,178,0.4)",
    boxShadow: "0 0 0 3px rgba(0,166,178,0.08)",
  },
  inputIcon: {
    position: "absolute",
    left: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 14,
    pointerEvents: "none",
    opacity: 0.6,
    zIndex: 2,
  },
  styledSelect: {
    width: "100%",
    height: 36,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#102a43",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    padding: "0 32px 0 36px",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
  },
  selectArrow: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 9,
    color: "#00a6b2",
    pointerEvents: "none",
  },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    zIndex: 500,
    background: "#ffffff",
    border: "1px solid rgba(16,42,67,0.1)",
    borderRadius: 10,
    padding: "6px",
    minWidth: 200,
    boxShadow: "0 8px 30px rgba(16,42,67,0.12)",
    backdropFilter: "blur(12px)",
  },
  dropdownTitle: {
    fontSize: 10,
    color: "#5b7083",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    padding: "4px 8px 6px",
    fontFamily: "'Inter', sans-serif",
  },
  dropdownItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    borderRadius: 6,
    border: "none",
    background: "none",
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: "#102a43",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  dropdownItemActive: {
    background: "rgba(0,166,178,0.08)",
    color: "#00a6b2",
  },

  panel: {
    padding: "18px 20px",
    background: "rgba(255,255,255,0.98)",
    borderBottom: "1px solid rgba(16,42,67,0.08)",
    flexShrink: 0,
    zIndex: 9,
    boxShadow: "0 4px 16px rgba(16,42,67,0.06)",
  },
  rangeInput: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    outline: "none",
    cursor: "pointer",
    WebkitAppearance: "none",
    appearance: "none",
    background: "transparent",
    zIndex: 2,
    position: "relative",
  },
  rangeTrack: {
    position: "absolute",
    top: "50%",
    left: 0,
    width: "100%",
    height: 4,
    marginTop: -2,
    borderRadius: 3,
    background: "rgba(0,166,178,0.15)",
    pointerEvents: "none",
    zIndex: 1,
  },
  primaryBtn: {
    width: "100%",
    padding: "11px",
    borderRadius: 8,
    border: "none",
    background: "#00a6b2",
    color: "#ffffff",
    fontFamily: "'Inter', sans-serif",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 4px 14px rgba(0,166,178,0.25)",
  },

  mapContainer: { flex: 1, minHeight: 0, position: "relative", width: "100%" },
  marker: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    userSelect: "none",
    border: "2.5px solid rgba(255,255,255,0.9)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  pulse: {
    position: "absolute",
    inset: -8,
    borderRadius: "50%",
    border: "2px solid",
    animation: "pulse-ring 2.2s ease-out infinite",
    pointerEvents: "none",
  },

  popupCard: {
    background: "#ffffff",
    border: "1px solid rgba(16,42,67,0.1)",
    borderRadius: 12,
    padding: 16,
    minWidth: 220,
    boxShadow: "0 8px 30px rgba(16,42,67,0.12)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  popupAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
    color: "#fff",
  },
  popupName: {
    fontWeight: 700,
    fontSize: 15,
    color: "#102a43",
    marginBottom: 2,
    fontFamily: "'Inter', sans-serif",
  },
  popupMetier: {
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
    fontFamily: "'Inter', sans-serif",
  },
  popupLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#00a6b2",
    textDecoration: "none",
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    padding: "6px 12px",
    borderRadius: 6,
    background: "rgba(0,166,178,0.08)",
    transition: "background 0.2s",
  },
  popupLinkHover: { background: "rgba(0,166,178,0.15)" },

  recenterBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: "50%",
    background: "#ffffff",
    border: "1px solid rgba(16,42,67,0.1)",
    color: "#00a6b2",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 12px rgba(16,42,67,0.1)",
    transition: "transform 0.2s",
  },
};

// Global CSS Injection — light mode
if (
  typeof document !== "undefined" &&
  !document.getElementById("map-login-styles")
) {
  const el = document.createElement("style");
  el.id = "map-login-styles";
  el.textContent = `
    @keyframes pulse-ring{0%{transform:scale(1);opacity:0.5}100%{transform:scale(2.2);opacity:0}}

    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 18px; width: 18px;
      border-radius: 50%;
      background: #00a6b2;
      cursor: pointer;
      margin-top: -7px;
      box-shadow: 0 0 8px rgba(0,166,178,0.4);
      border: 2px solid #fff;
    }
    input[type=range]::-moz-range-thumb {
      height: 18px; width: 18px;
      border-radius: 50%;
      background: #00a6b2;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(0,166,178,0.4);
      border: 2px solid #fff;
    }

    .mapboxgl-popup-content { padding: 0 !important; background: transparent !important; box-shadow: none !important; border-radius: 0 !important; }
    .mapboxgl-popup-tip { display: none; }
  `;
  document.head.appendChild(el);
}

export default PublicMap;
