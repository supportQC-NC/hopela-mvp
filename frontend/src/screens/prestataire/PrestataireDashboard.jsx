// src/screens/prestataire/PrestataireDashboard.jsx

import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../logo.png";

import { logoutUser, updateProfile, clearUpdateSuccess } from "../../slices/authSlice";
import { fetchCategories } from "../../slices/categorieSlice";
import { fetchMetiers } from "../../slices/metierSlice";
import useGeolocate from "../../hooks/UseGeoLocate";
import "./PrestataireDashboard.scss";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const RESEAUX = [
  { key: "facebook",  icon: "📘", label: "Facebook",   placeholder: "https://facebook.com/votrepage" },
  { key: "instagram", icon: "📸", label: "Instagram",  placeholder: "https://instagram.com/votreprofil" },
  { key: "twitter",   icon: "🐦", label: "Twitter / X",placeholder: "https://twitter.com/votreprofil" },
  { key: "tiktok",    icon: "🎵", label: "TikTok",     placeholder: "https://tiktok.com/@votreprofil" },
  { key: "linkedin",  icon: "💼", label: "LinkedIn",   placeholder: "https://linkedin.com/in/votreprofil" },
  { key: "youtube",   icon: "▶️", label: "YouTube",    placeholder: "https://youtube.com/@votrechaine" },
];

const TABS = [
  { key: "disponibilite", icon: "📍", label: "Disponibilité" },
  { key: "promotions",    icon: "🏷️", label: "Promotions" },
  { key: "profil",        icon: "✏️", label: "Mon profil" },
];

const BADGE_OPTIONS = [
  { value: "Tag",        icon: "🏷️", label: "Promotion" },
  { value: "Star",       icon: "⭐", label: "Offre spéciale" },
  { value: "Zap",        icon: "⚡", label: "Flash" },
  { value: "Gift",       icon: "🎁", label: "Cadeau" },
  { value: "Percent",    icon: "💯", label: "Réduction" },
  { value: "Flame",      icon: "🔥", label: "Populaire" },
  { value: "Clock",      icon: "⏰", label: "Limité" },
  { value: "BadgeCheck", icon: "✅", label: "Certifié" },
];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const getMetierCategorieId = (metier) => {
  if (!metier) return "";
  return getId(metier.categorieId) || getId(metier.categorie);
};

const DesktopTabs = ({ activeTab, setActiveTab }) => (
  <div className="pd-desktop-tabs">
    {TABS.map(({ key, icon, label }) => (
      <button
        key={key}
        type="button"
        className={`pd-desktop-tab${activeTab === key ? " active" : ""}`}
        onClick={() => setActiveTab(key)}
      >
        <span>{icon}</span>
        {label}
      </button>
    ))}
  </div>
);

const PrestataireDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector((s) => s.auth);
  const { categories, loading: catLoading } = useSelector((s) => s.categorie);
  const { metiers, loading: metLoading }    = useSelector((s) => s.metier);
  const { isSharing, startTracking, stopTracking } = useGeolocate();

  const [activeTab, setActiveTab]         = useState("disponibilite");
  const [geoError, setGeoError]           = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [selectedCategorieId, setSelectedCategorieId] = useState("");
  const [selectedMetierId, setSelectedMetierId]       = useState("");
  const [siteWeb, setSiteWeb]             = useState("");
  const [reseaux, setReseaux]             = useState({ facebook:"", instagram:"", twitter:"", tiktok:"", linkedin:"", youtube:"" });

  // ── Promotions state ──────────────────────────────────────────────────────
  const [promotions, setPromotions]       = useState([]);
  const [promoLoading, setPromoLoading]   = useState(false);
  const [promoForm, setPromoForm]         = useState(null); // null | "new" | promoId
  const [promoData, setPromoData]         = useState({ titre:"", description:"", badge:"Tag", dateDebut:"", dateFin:"" });
  const [promoSaving, setPromoSaving]     = useState(false);
  const [promoError, setPromoError]       = useState(null);
  const [promoImgLoading, setPromoImgLoading] = useState({});
  const [favoriCount, setFavoriCount]     = useState(0);

  // ── Fetch promotions ──────────────────────────────────────────────────────
  const fetchPromotions = useCallback(async () => {
    setPromoLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/promotions/mes-promotions`, { credentials: "include" });
      if (res.ok) setPromotions(await res.json());
    } catch(e) { console.error(e); }
    finally { setPromoLoading(false); }
  }, []);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMetiers());
    fetchPromotions();
    // Compteur favoris
    if (userInfo?._id) {
      fetch(`${API_URL}/api/favoris/count/${userInfo._id}`)
        .then(r => r.ok ? r.json() : { count: 0 })
        .then(d => setFavoriCount(d.count))
        .catch(() => {});
    }
  }, [dispatch, fetchPromotions, userInfo?._id]);

  useEffect(() => {
    if (!userInfo) return;
    const firstMetier = userInfo.metiers?.[0];
    setSelectedMetierId(getId(firstMetier));
    setSiteWeb(userInfo.siteWeb || "");
    if (userInfo.reseauxSociaux) setReseaux(prev => ({ ...prev, ...userInfo.reseauxSociaux }));
  }, [userInfo]);

  useEffect(() => {
    if (!selectedMetierId || metiers.length === 0) return;
    const metierComplet = metiers.find(m => m._id === selectedMetierId);
    const categorieId   = getMetierCategorieId(metierComplet);
    if (categorieId) setSelectedCategorieId(categorieId);
  }, [selectedMetierId, metiers]);

  useEffect(() => {
    if (!updateSuccess) return;
    const t = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
    return () => clearTimeout(t);
  }, [updateSuccess, dispatch]);

  const metiersFiltres = selectedCategorieId
    ? metiers.filter(m => { const cid = getMetierCategorieId(m); return m.isActive && cid === selectedCategorieId; })
    : [];
  const metierSelectionne = metiers.find(m => m._id === selectedMetierId);

  const handleCategorieChange = (e) => { setSelectedCategorieId(e.target.value); setSelectedMetierId(""); };

  const handleToggleTracking = async () => {
    setTrackingLoading(true);
    if (isSharing) { await stopTracking(); setGeoError(null); }
    else { const r = await startTracking(); if (!r.ok) setGeoError(r.reason); }
    setTrackingLoading(false);
  };

  const handleLogout = async () => {
    if (isSharing) stopTracking();
    await dispatch(logoutUser());
    navigate("/");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ metiers: selectedMetierId ? [selectedMetierId] : [], siteWeb, reseauxSociaux: reseaux }));
  };

  // ── Promotion handlers ──────────────────────────────────────────────────
  const openNewPromo = () => {
    setPromoData({ titre:"", description:"", badge:"Tag", dateDebut:"", dateFin:"" });
    setPromoError(null);
    setPromoForm("new");
  };

  const openEditPromo = (promo) => {
    setPromoData({
      titre:       promo.titre       || "",
      description: promo.description || "",
      badge:       promo.badge       || "Tag",
      dateDebut:   promo.dateDebut   ? promo.dateDebut.slice(0,10) : "",
      dateFin:     promo.dateFin     ? promo.dateFin.slice(0,10)   : "",
    });
    setPromoError(null);
    setPromoForm(promo._id);
  };

  const handleSavePromo = async () => {
    if (!promoData.titre.trim()) { setPromoError("Le titre est requis."); return; }
    setPromoSaving(true);
    setPromoError(null);
    try {
      const payload = {
        titre:       promoData.titre,
        description: promoData.description || null,
        badge:       promoData.badge,
        dateDebut:   promoData.dateDebut || null,
        dateFin:     promoData.dateFin   || null,
      };
      const url    = promoForm === "new" ? `${API_URL}/api/promotions` : `${API_URL}/api/promotions/${promoForm}`;
      const method = promoForm === "new" ? "POST" : "PUT";
      const res = await fetch(url, { method, headers: { "Content-Type":"application/json" }, credentials:"include", body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setPromoError(data.message || "Erreur"); return; }
      await fetchPromotions();
      setPromoForm(null);
    } catch(e) { setPromoError(e.message); }
    finally { setPromoSaving(false); }
  };

  const handleDeletePromo = async (id) => {
    if (!window.confirm("Supprimer cette promotion ?")) return;
    const res = await fetch(`${API_URL}/api/promotions/${id}`, { method:"DELETE", credentials:"include" });
    if (res.ok) setPromotions(prev => prev.filter(p => p._id !== id));
  };

  const handleAddImage = async (promoId, file) => {
    const fd = new FormData();
    fd.append("image", file);
    setPromoImgLoading(p => ({ ...p, [promoId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/promotions/${promoId}/images`, { method:"POST", credentials:"include", body: fd });
      if (res.ok) await fetchPromotions();
    } catch(e) { console.error(e); }
    finally { setPromoImgLoading(p => ({ ...p, [promoId]: false })); }
  };

  const handleDeleteImage = async (promoId, idx) => {
    const res = await fetch(`${API_URL}/api/promotions/${promoId}/images/${idx}`, { method:"DELETE", credentials:"include" });
    if (res.ok) await fetchPromotions();
  };

  return (
    <div className="pd-root">
      {geoError && (
        <div className="pd-geo-overlay" onClick={() => setGeoError(null)}>
          <div className="pd-geo-popup" onClick={(e) => e.stopPropagation()}>
            <div className="pd-geo-icon">📍</div>
            <div className="pd-geo-title">{geoError === "unsupported" ? "GPS non supporté" : "Géolocalisation désactivée"}</div>
            <div className="pd-geo-text">{geoError === "unsupported" ? "Votre navigateur ne supporte pas la géolocalisation." : "Autorisez l'accès à votre localisation pour apparaître sur la carte."}</div>
            {geoError === "denied" && (
              <div className="pd-geo-steps">
                {["Cliquez sur le cadenas dans la barre d'adresse","Sélectionnez les autorisations du site","Passez la localisation sur autoriser","Rechargez la page et réessayez"].map((s,i) => (
                  <div key={i} className="pd-geo-step"><span className="pd-geo-step-num">{i+1}.</span><span>{s}</span></div>
                ))}
              </div>
            )}
            <button type="button" className="pd-geo-btn-primary" onClick={() => { setGeoError(null); window.location.reload(); }}>Recharger la page</button>
            <button type="button" className="pd-geo-btn-secondary" onClick={() => setGeoError(null)}>Fermer</button>
          </div>
        </div>
      )}

      <header className="pd-header">
        <button className="pd-brand" type="button" onClick={() => navigate("/")}>
          <img src={logo} alt="Hopela" className="pd-logo-img" />
          <span className="pd-logo-name">Hopela</span>
          <span className="pd-badge-role">Pro</span>
        </button>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {favoriCount > 0 && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:9999, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#f87171", fontSize:13 }}>
              ❤️ <strong>{favoriCount}</strong>
            </div>
          )}
          <Link
            to={`/prestataire/${userInfo?._id}`}
            target="_blank"
            rel="noreferrer"
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:9999, background:"rgba(0,166,178,0.1)", border:"1px solid rgba(0,166,178,0.25)", color:"#00a6b2", fontSize:12, fontWeight:700, textDecoration:"none" }}
          >
            👤 Mon profil public
          </Link>
          <button type="button" className="pd-logout-btn" onClick={handleLogout}>
            <span className="pd-logout-full">Déconnexion</span>
            <span className="pd-logout-short">⎋</span>
          </button>
        </div>
      </header>

      <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pd-body">
        <h1 className="pd-welcome">Bonjour, <em>{userInfo?.prenom}</em> 👷</h1>
        <p className="pd-welcome-sub">
          {activeTab === "disponibilite" ? "Activez ou désactivez votre visibilité sur la carte."
           : activeTab === "promotions"  ? "Gérez vos offres et promotions."
           : "Complétez votre profil professionnel."}
        </p>

        {/* ── ONGLET DISPONIBILITÉ ── */}
        {activeTab === "disponibilite" && (
          <section className="pd-status-card">
            <div className={`pd-status-indicator ${isSharing ? "online" : "offline"}`}>{isSharing ? "📍" : "💤"}</div>
            <div className="pd-status-label">{isSharing ? "Vous êtes visible sur la carte" : "Vous êtes hors ligne"}</div>
            <p className="pd-status-sub">{isSharing ? "Votre position est actuellement partagée avec les clients autour de vous." : "Démarrez le partage pour apparaître sur la carte et recevoir des demandes."}</p>
            <button type="button" className={`pd-toggle-btn ${isSharing ? "stop" : "start"}`} onClick={handleToggleTracking} disabled={trackingLoading}>
              {trackingLoading ? (isSharing ? "⏳ Arrêt en cours..." : "⏳ Démarrage...") : (isSharing ? "⏹ Arrêter le partage" : "▶ Démarrer le partage")}
            </button>
          </section>
        )}

        {/* ── ONGLET PROMOTIONS ── */}
        {activeTab === "promotions" && (
          <section style={{ paddingTop: 8 }}>
            {/* En-tête section */}
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:24, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"#102a43" }}>Mes promotions & offres</div>
                <div style={{ fontSize:13, color:"#5b7083", marginTop:2 }}>{promotions.length} / 5 promotion{promotions.length !== 1 ? "s" : ""}</div>
              </div>
              {promotions.length < 5 && (
                <button type="button" onClick={openNewPromo} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:9999, border:"none", background:"#00a6b2", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                  + Nouvelle offre
                </button>
              )}
            </div>

            {promoError && (
              <div style={{ padding:"12px 16px", borderRadius:10, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#ef4444", fontSize:13, marginBottom:16 }}>
                ⚠️ {promoError}
              </div>
            )}

            {/* Formulaire */}
            {promoForm && (
              <div style={{ background:"#f7faf9", border:"1px solid rgba(0,166,178,0.18)", borderRadius:16, padding:24, marginBottom:24 }}>
                <div style={{ fontSize:16, fontWeight:700, color:"#102a43", marginBottom:20 }}>
                  {promoForm === "new" ? "Nouvelle promotion" : "Modifier la promotion"}
                </div>

                <div className="pd-field">
                  <label className="pd-label">Titre *</label>
                  <div className="pd-input-wrap">
                    <input className="pd-input" type="text" placeholder="Ex : -20% ce week-end" maxLength={80}
                      value={promoData.titre} onChange={e => setPromoData(p => ({ ...p, titre: e.target.value }))} />
                  </div>
                </div>

                <div className="pd-field">
                  <label className="pd-label">Description</label>
                  <div className="pd-input-wrap">
                    <textarea className="pd-input" placeholder="Détaillez votre offre..." maxLength={500} rows={3}
                      style={{ resize:"vertical", minHeight:80 }}
                      value={promoData.description} onChange={e => setPromoData(p => ({ ...p, description: e.target.value }))} />
                  </div>
                </div>

                <div className="pd-field">
                  <label className="pd-label">Badge</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:6 }}>
                    {BADGE_OPTIONS.map(b => (
                      <button key={b.value} type="button"
                        onClick={() => setPromoData(p => ({ ...p, badge: b.value }))}
                        style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:9999, cursor:"pointer",
                          border: promoData.badge === b.value ? "1px solid rgba(0,166,178,0.35)" : "1px solid rgba(16,42,67,0.12)",
                          background: promoData.badge === b.value ? "rgba(0,166,178,0.1)" : "#ffffff",
                          color: promoData.badge === b.value ? "#00a6b2" : "#5b7083", fontSize:12, fontWeight:600 }}>
                        {b.icon} {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div className="pd-field">
                    <label className="pd-label">Date de début</label>
                    <div className="pd-input-wrap">
                      <input className="pd-input" type="date" value={promoData.dateDebut}
                        onChange={e => setPromoData(p => ({ ...p, dateDebut: e.target.value }))} />
                    </div>
                  </div>
                  <div className="pd-field">
                    <label className="pd-label">Date de fin</label>
                    <div className="pd-input-wrap">
                      <input className="pd-input" type="date" value={promoData.dateFin}
                        onChange={e => setPromoData(p => ({ ...p, dateFin: e.target.value }))} />
                    </div>
                  </div>
                </div>

                <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:20, paddingTop:16, borderTop:"1px solid rgba(16,42,67,0.07)" }}>
                  <button type="button" onClick={() => setPromoForm(null)}
                    style={{ padding:"10px 20px", borderRadius:9999, border:"1px solid rgba(16,42,67,0.2)", background:"transparent", color:"#5b7083", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    Annuler
                  </button>
                  <button type="button" onClick={handleSavePromo} disabled={promoSaving || !promoData.titre.trim()}
                    style={{ padding:"10px 20px", borderRadius:9999, border:"none", background:"#00a6b2", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", opacity: (promoSaving || !promoData.titre.trim()) ? 0.5 : 1 }}>
                    {promoSaving ? "Enregistrement..." : "Sauvegarder"}
                  </button>
                </div>
              </div>
            )}

            {/* Liste promotions */}
            {promoLoading ? (
              <div style={{ textAlign:"center", padding:40, color:"#5b7083" }}>Chargement...</div>
            ) : promotions.length === 0 && !promoForm ? (
              <div style={{ textAlign:"center", padding:60, color:"#5b7083" }}>
                <div style={{ fontSize:48, marginBottom:12 }}>🏷️</div>
                <p style={{ marginBottom:4 }}>Aucune promotion pour l'instant.</p>
                <p>Créez votre première offre pour attirer des clients !</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {promotions.map(promo => {
                  const badge = BADGE_OPTIONS.find(b => b.value === promo.badge);
                  const isExpired = promo.dateFin && new Date(promo.dateFin) < new Date();
                  return (
                    <article key={promo._id} style={{ background:"#ffffff", border:"1px solid rgba(16,42,67,0.08)", borderRadius:14, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.04)", opacity: isExpired ? 0.65 : 1 }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:9999, background:"rgba(0,166,178,0.08)", border:"1px solid rgba(0,166,178,0.18)", color:"#00a6b2", fontSize:11, fontWeight:700 }}>
                            {badge?.icon} {badge?.label || promo.badge}
                          </span>
                          {isExpired && <span style={{ display:"inline-flex", padding:"4px 10px", borderRadius:9999, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.18)", color:"#ef4444", fontSize:11, fontWeight:700 }}>Expirée</span>}
                        </div>
                        <div style={{ display:"flex", gap:6 }}>
                          <button type="button" onClick={() => openEditPromo(promo)}
                            style={{ width:32, height:32, borderRadius:8, border:"none", background:"rgba(16,42,67,0.06)", cursor:"pointer", fontSize:14 }}>✏️</button>
                          <button type="button" onClick={() => handleDeletePromo(promo._id)}
                            style={{ width:32, height:32, borderRadius:8, border:"none", background:"rgba(239,68,68,0.08)", cursor:"pointer", fontSize:14 }}>🗑️</button>
                        </div>
                      </div>

                      <h4 style={{ fontSize:16, fontWeight:700, color:"#102a43", marginBottom:6 }}>{promo.titre}</h4>
                      {promo.description && <p style={{ fontSize:13, color:"#5b7083", lineHeight:1.6, marginBottom:8 }}>{promo.description}</p>}
                      {(promo.dateDebut || promo.dateFin) && (
                        <p style={{ fontSize:12, color:"#5b7083", marginBottom:12 }}>
                          ⏰{promo.dateDebut && ` Du ${new Date(promo.dateDebut).toLocaleDateString("fr-FR")}`}{promo.dateFin && ` au ${new Date(promo.dateFin).toLocaleDateString("fr-FR")}`}
                        </p>
                      )}

                      {/* Galerie images */}
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:12 }}>
                        {promo.images?.map((img, idx) => (
                          <div key={idx} style={{ position:"relative", width:90, height:68, borderRadius:8, overflow:"hidden" }}>
                            <img src={`${API_URL}${img}`} alt={`Vue ${idx+1}`} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                            <button type="button" onClick={() => handleDeleteImage(promo._id, idx)}
                              style={{ position:"absolute", top:3, right:3, width:20, height:20, borderRadius:"50%", background:"rgba(0,0,0,0.6)", color:"#fff", border:"none", fontSize:10, cursor:"pointer" }}>✕</button>
                          </div>
                        ))}
                        {(!promo.images || promo.images.length < 3) && (
                          <label style={{ display:"flex", alignItems:"center", justifyContent:"center", width:90, height:68, borderRadius:8, border:"2px dashed rgba(0,166,178,0.3)", background:"rgba(0,166,178,0.04)", color:"#00a6b2", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                            {promoImgLoading[promo._id] ? "⏳" : "+ Photo"}
                            <input type="file" accept="image/*" style={{ display:"none" }}
                              onChange={e => { if (e.target.files[0]) handleAddImage(promo._id, e.target.files[0]); }} />
                          </label>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── ONGLET PROFIL ── */}
        {activeTab === "profil" && (
          <form onSubmit={handleSaveProfile}>
            {updateSuccess && <div className="pd-alert success">✅ Profil mis à jour avec succès !</div>}
            {updateError   && <div className="pd-alert error">⚠️ {updateError}</div>}

            <section className="pd-form-section">
              <div className="pd-form-section-title">Votre métier</div>
              <div className="pd-form-section-sub">La catégorie sert uniquement à filtrer les métiers. Seul le métier est enregistré dans votre profil.</div>

              <div className="pd-field">
                <label className="pd-label">Catégorie</label>
                <div className="pd-input-wrap">
                  <span className="pd-input-icon">📂</span>
                  {catLoading ? <div className="pd-select-skeleton" /> : (
                    <select className="pd-select" value={selectedCategorieId} onChange={handleCategorieChange} required>
                      <option value="" disabled hidden>Choisir une catégorie</option>
                      {categories.filter(cat => cat.isActive).map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.nom}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {selectedCategorieId && (
                <div className="pd-field">
                  <label className="pd-label">Métier</label>
                  <div className="pd-input-wrap">
                    <span className="pd-input-icon">🔧</span>
                    {metLoading ? <div className="pd-select-skeleton" /> : metiersFiltres.length === 0 ? (
                      <span className="pd-no-metier">Aucun métier disponible pour cette catégorie.</span>
                    ) : (
                      <select className="pd-select" value={selectedMetierId} onChange={e => setSelectedMetierId(e.target.value)} required>
                        <option value="" disabled hidden>Choisir un métier</option>
                        {metiersFiltres.map(metier => (
                          <option key={metier._id} value={metier._id}>{metier.nom}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  {metierSelectionne && (
                    <div className="pd-metier-preview">
                      {metierSelectionne.icone && <span className="pd-metier-preview-icon">{metierSelectionne.icone}</span>}
                      <span className="pd-metier-preview-nom">{metierSelectionne.nom}</span>
                      {metierSelectionne.description && <p className="pd-metier-preview-desc">{metierSelectionne.description}</p>}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="pd-form-section">
              <div className="pd-form-section-title">Informations professionnelles</div>
              <div className="pd-form-section-sub">Ces informations apparaissent sur votre profil public.</div>
              <div className="pd-field">
                <label className="pd-label">Site web</label>
                <div className="pd-input-wrap">
                  <span className="pd-input-icon">🌐</span>
                  <input type="url" className="pd-input" placeholder="https://votre-site.com" value={siteWeb} onChange={e => setSiteWeb(e.target.value)} />
                </div>
              </div>
            </section>

            <section className="pd-form-section">
              <div className="pd-form-section-title">Réseaux sociaux</div>
              <div className="pd-form-section-sub">Ajoutez vos liens pour que les clients vous retrouvent.</div>
              <div className="pd-social-list">
                {RESEAUX.map(({ key, icon, label, placeholder }) => (
                  <div key={key} className="pd-field">
                    <label className="pd-label">{icon} {label}</label>
                    <div className="pd-input-wrap">
                      <span className="pd-input-icon">{icon}</span>
                      <input type="url" className="pd-input" placeholder={placeholder} value={reseaux[key]}
                        onChange={e => setReseaux(prev => ({ ...prev, [key]: e.target.value }))} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button type="submit" className="pd-save-btn" disabled={updateLoading || !selectedMetierId}>
              {updateLoading && <span className="pd-spinner" />}
              {updateLoading ? "Enregistrement..." : "💾 Sauvegarder le profil"}
            </button>
          </form>
        )}
      </main>

      <nav className="pd-bottom-nav">
        {TABS.map(({ key, icon, label }) => (
          <button key={key} type="button" className={`pd-nav-btn${activeTab === key ? " active" : ""}`} onClick={() => setActiveTab(key)}>
            <span className="pd-nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PrestataireDashboard;