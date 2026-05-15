// src/screens/prestataire/PrestataireDashboard.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, updateProfile, clearUpdateSuccess } from "../../slices/authSlice";
import useGeolocate from "../../hooks/UseGeoLocate";

const CSS = `
  * { box-sizing: border-box; }

  .pd-root {
    min-height: 100vh;
    min-height: 100dvh;
    background: #0a0804;
    font-family: 'DM Sans', sans-serif;
    color: #f5f0e8;
    padding-bottom: 72px; /* espace pour bottom nav */
  }

  /* ══════════════════════════════
     HEADER — compact mobile
  ══════════════════════════════ */
  .pd-header {
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: rgba(14,11,6,0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(201,168,76,0.12);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .pd-logo { display: flex; align-items: center; gap: 8px; }
  .pd-logo-mark {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, #c9a84c, #8a6c28);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-weight: 700;
    font-size: 15px; color: #0a0804; flex-shrink: 0;
  }
  .pd-logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 700; font-size: 18px; color: #f5f0e8;
  }
  .pd-badge-role {
    background: rgba(201,168,76,0.1);
    border: 1px solid rgba(201,168,76,0.25);
    border-radius: 5px; padding: 2px 7px;
    font-size: 9px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: #c9a84c;
  }
  .pd-logout-btn {
    background: none;
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 8px; padding: 6px 12px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: rgba(245,240,232,0.5); transition: all 0.2s;
    white-space: nowrap;
  }
  .pd-logout-btn:hover,
  .pd-logout-btn:active { border-color: rgba(239,68,68,0.4); color: #fca5a5; }

  /* ══════════════════════════════
     BOTTOM NAV — mobile first
  ══════════════════════════════ */
  .pd-bottom-nav {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 64px;
    background: rgba(14,11,6,0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(201,168,76,0.12);
    display: flex;
    z-index: 100;
  }
  .pd-nav-btn {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 3px;
    border: none; background: none; cursor: pointer;
    color: rgba(245,240,232,0.35);
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 500;
    letter-spacing: 0.3px;
    transition: color 0.2s;
    -webkit-tap-highlight-color: transparent;
    padding: 8px 0;
  }
  .pd-nav-btn.active { color: #c9a84c; }
  .pd-nav-btn .pd-nav-icon { font-size: 20px; line-height: 1; }
  .pd-nav-btn.active .pd-nav-icon { filter: drop-shadow(0 0 6px rgba(201,168,76,0.5)); }

  /* ══════════════════════════════
     BODY
  ══════════════════════════════ */
  .pd-body {
    padding: 20px 16px;
    max-width: 600px;
    margin: 0 auto;
  }
  .pd-welcome {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px; font-weight: 700;
    color: #f5f0e8; letter-spacing: -0.3px;
    margin: 0 0 2px;
  }
  .pd-welcome em { font-style: italic; color: #c9a84c; }
  .pd-welcome-sub {
    font-size: 13px;
    color: rgba(245,240,232,0.4);
    margin: 0 0 20px;
    line-height: 1.4;
  }

  /* ══════════════════════════════
     CARTE STATUT TRACKING
  ══════════════════════════════ */
  .pd-status-card {
    background: #120e07;
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 18px;
    padding: 24px 20px;
    margin-bottom: 16px;
    text-align: center;
  }
  .pd-status-indicator {
    width: 68px; height: 68px; border-radius: 50%;
    margin: 0 auto 16px;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; transition: all 0.4s;
  }
  .pd-status-indicator.online {
    background: rgba(74,222,128,0.12);
    border: 2px solid rgba(74,222,128,0.4);
    animation: pulseGreen 2.5s ease-in-out infinite;
  }
  .pd-status-indicator.offline {
    background: rgba(245,240,232,0.06);
    border: 2px solid rgba(245,240,232,0.1);
  }
  @keyframes pulseGreen {
    0%,100% { box-shadow: 0 0 16px rgba(74,222,128,0.2); }
    50%      { box-shadow: 0 0 32px rgba(74,222,128,0.45); }
  }
  .pd-status-label {
    font-size: 16px; font-weight: 600;
    color: #f5f0e8; margin-bottom: 6px;
  }
  .pd-status-sub {
    font-size: 12px;
    color: rgba(245,240,232,0.4);
    margin-bottom: 20px;
    line-height: 1.5;
    max-width: 280px;
    margin-left: auto; margin-right: auto;
  }
  .pd-toggle-btn {
    width: 100%;
    padding: 15px 20px;
    border-radius: 12px; border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 1.2px; text-transform: uppercase;
    cursor: pointer; transition: all 0.25s;
    -webkit-tap-highlight-color: transparent;
  }
  .pd-toggle-btn.start {
    background: linear-gradient(135deg, #c9a84c, #e8c97a);
    color: #0a0804;
    box-shadow: 0 4px 20px rgba(201,168,76,0.3);
  }
  .pd-toggle-btn.start:active { opacity: 0.9; transform: scale(0.98); }
  .pd-toggle-btn.stop {
    background: rgba(239,68,68,0.1);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.3);
  }
  .pd-toggle-btn.stop:active { background: rgba(239,68,68,0.18); }
  .pd-toggle-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ══════════════════════════════
     INFOS RAPIDES — 2 colonnes
  ══════════════════════════════ */
  .pd-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .pd-info-card {
    background: #120e07;
    border: 1px solid rgba(201,168,76,0.12);
    border-radius: 14px;
    padding: 14px;
    display: flex; align-items: center; gap: 10px;
  }
  .pd-info-icon {
    width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .pd-info-label {
    font-size: 10px;
    color: rgba(245,240,232,0.35);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .pd-info-value {
    font-size: 13px; font-weight: 600; color: #f5f0e8;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .pd-info-value.gold { color: #c9a84c; }

  /* ══════════════════════════════
     FORMULAIRE PROFIL
  ══════════════════════════════ */
  .pd-form-section {
    background: #120e07;
    border: 1px solid rgba(201,168,76,0.12);
    border-radius: 18px;
    padding: 20px 16px;
    margin-bottom: 14px;
  }
  .pd-form-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-weight: 700; color: #f5f0e8;
    margin-bottom: 3px;
  }
  .pd-form-section-sub {
    font-size: 12px;
    color: rgba(245,240,232,0.35);
    margin-bottom: 18px;
    line-height: 1.4;
  }
  .pd-field { margin-bottom: 14px; }
  .pd-field:last-child { margin-bottom: 0; }
  .pd-label {
    display: block;
    font-size: 10px; font-weight: 600;
    letter-spacing: 1.2px; text-transform: uppercase;
    color: rgba(245,240,232,0.4); margin-bottom: 7px;
  }
  .pd-input-wrap { position: relative; }
  .pd-input-icon {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%);
    font-size: 14px; pointer-events: none;
  }
  .pd-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 10px;
    padding: 13px 12px 13px 38px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px; /* évite le zoom iOS */
    color: #f5f0e8;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    -webkit-appearance: none;
  }
  .pd-input::placeholder { color: rgba(245,240,232,0.2); }
  .pd-input:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.03);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
  }

  /* Réseaux : 1 colonne sur mobile */
  .pd-social-list { display: flex; flex-direction: column; gap: 12px; }

  /* ══════════════════════════════
     BOUTON SAVE
  ══════════════════════════════ */
  .pd-save-btn {
    width: 100%;
    background: linear-gradient(135deg, #c9a84c, #e8c97a);
    border: none; border-radius: 12px;
    padding: 15px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #0a0804; cursor: pointer; transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(201,168,76,0.25);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    -webkit-tap-highlight-color: transparent;
    margin-top: 4px;
  }
  .pd-save-btn:active { opacity: 0.9; transform: scale(0.98); }
  .pd-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ══════════════════════════════
     ALERTES
  ══════════════════════════════ */
  .pd-alert {
    border-radius: 10px; padding: 12px 14px;
    font-size: 13px; margin-bottom: 16px;
    display: flex; align-items: flex-start; gap: 8px;
    line-height: 1.4;
  }
  .pd-alert.success {
    background: rgba(74,222,128,0.08);
    border: 1px solid rgba(74,222,128,0.25);
    color: #86efac;
  }
  .pd-alert.error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    color: #fca5a5;
  }

  /* ══════════════════════════════
     SPINNER
  ══════════════════════════════ */
  @keyframes spin { to { transform: rotate(360deg); } }
  .pd-spinner {
    width: 14px; height: 14px; flex-shrink: 0;
    border: 2px solid rgba(10,8,4,0.3);
    border-top-color: #0a0804;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* ══════════════════════════════
     POPUP GÉO
  ══════════════════════════════ */
  .pd-geo-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    display: flex; align-items: flex-end;
    z-index: 200;
  }
  .pd-geo-popup {
    background: #1a1409;
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 20px 20px 0 0;
    padding: 28px 20px 36px;
    width: 100%;
    text-align: center;
  }
  .pd-geo-icon { font-size: 40px; margin-bottom: 12px; }
  .pd-geo-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 700;
    color: #f5f0e8; margin-bottom: 10px;
  }
  .pd-geo-text {
    font-size: 13px; color: rgba(245,240,232,0.5);
    margin-bottom: 20px; line-height: 1.5;
  }
  .pd-geo-steps {
    background: rgba(201,168,76,0.06);
    border: 1px solid rgba(201,168,76,0.12);
    border-radius: 12px; padding: 14px 16px;
    margin-bottom: 20px; text-align: left;
  }
  .pd-geo-step {
    display: flex; gap: 10px; padding: 5px 0;
    font-size: 13px; color: rgba(245,240,232,0.6);
    line-height: 1.4;
  }
  .pd-geo-step-num { color: #c9a84c; font-weight: 700; flex-shrink: 0; }
  .pd-geo-btn-primary {
    width: 100%; padding: 14px;
    background: linear-gradient(135deg, #c9a84c, #e8c97a);
    border: none; border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    color: #0a0804; cursor: pointer; margin-bottom: 10px;
  }
  .pd-geo-btn-secondary {
    width: 100%; padding: 12px;
    background: none;
    border: 1px solid rgba(245,240,232,0.1);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px; color: rgba(245,240,232,0.4); cursor: pointer;
  }

  /* ══════════════════════════════
     DESKTOP — à partir de 640px
  ══════════════════════════════ */
  @media (min-width: 640px) {
    .pd-root { padding-bottom: 0; }
    .pd-header { height: 64px; padding: 0 32px; }
    .pd-logo-mark { width: 34px; height: 34px; font-size: 17px; }
    .pd-logo-name { font-size: 20px; }

    /* Tabs horizontaux en haut plutôt que bottom nav */
    .pd-bottom-nav { display: none; }
    .pd-desktop-tabs {
      display: flex !important;
      border-bottom: 1px solid rgba(201,168,76,0.1);
      padding: 0 32px;
      background: rgba(14,11,6,0.5);
    }

    .pd-body { padding: 32px; max-width: 860px; }
    .pd-welcome { font-size: 36px; }
    .pd-welcome-sub { font-size: 14px; margin-bottom: 28px; }

    .pd-status-card { padding: 32px; }
    .pd-status-indicator { width: 80px; height: 80px; font-size: 32px; }
    .pd-status-label { font-size: 18px; }
    .pd-toggle-btn { width: auto; padding: 14px 48px; }

    .pd-info-card { padding: 20px 24px; gap: 14px; }
    .pd-info-icon { width: 42px; height: 42px; font-size: 18px; }
    .pd-info-label { font-size: 11px; }
    .pd-info-value { font-size: 15px; }

    .pd-form-section { padding: 32px; }
    .pd-form-section-title { font-size: 20px; }
    .pd-social-list {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .pd-save-btn { width: auto; padding: 14px 36px; }
    .pd-geo-overlay { align-items: center; }
    .pd-geo-popup { border-radius: 20px; max-width: 480px; margin: 0 auto; }
  }
`;

/* Tabs desktop (cachés sur mobile) */
const DesktopTabs = ({ activeTab, setActiveTab }) => (
  <div className="pd-desktop-tabs" style={{ display: "none" }}>
    {[
      { key: "disponibilite", icon: "📍", label: "Disponibilité" },
      { key: "profil",        icon: "✏️", label: "Mon profil" },
    ].map(({ key, icon, label }) => (
      <button
        key={key}
        style={{
          padding: "16px 20px", border: "none", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500,
          color: activeTab === key ? "#c9a84c" : "rgba(245,240,232,0.4)",
          background: "none",
          borderBottom: activeTab === key ? "2px solid #c9a84c" : "2px solid transparent",
          marginBottom: "-1px", transition: "all 0.2s",
          display: "flex", alignItems: "center", gap: "8px",
        }}
        onClick={() => setActiveTab(key)}
      >
        <span>{icon}</span>{label}
      </button>
    ))}
  </div>
);

const RESEAUX = [
  { key: "facebook",  icon: "📘", label: "Facebook",  placeholder: "https://facebook.com/votrepage" },
  { key: "instagram", icon: "📸", label: "Instagram", placeholder: "https://instagram.com/votreprofil" },
  { key: "twitter",   icon: "🐦", label: "Twitter / X", placeholder: "https://twitter.com/votreprofil" },
  { key: "tiktok",    icon: "🎵", label: "TikTok",    placeholder: "https://tiktok.com/@votreprofil" },
  { key: "linkedin",  icon: "💼", label: "LinkedIn",  placeholder: "https://linkedin.com/in/votreprofil" },
  { key: "youtube",   icon: "▶️", label: "YouTube",   placeholder: "https://youtube.com/@votrechaine" },
];

const PrestataireDashboard = () => {
  const { userInfo, updateLoading, updateError, updateSuccess } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSharing, startTracking, stopTracking } = useGeolocate();

  const [activeTab,       setActiveTab]       = useState("disponibilite");
  const [geoError,        setGeoError]        = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // ── Champs profil ──
  const [metier,  setMetier]  = useState(userInfo?.metier  || "");
  const [siteWeb, setSiteWeb] = useState(userInfo?.siteWeb || "");
  const [reseaux, setReseaux] = useState({
    facebook:  userInfo?.reseauxSociaux?.facebook  || "",
    instagram: userInfo?.reseauxSociaux?.instagram || "",
    twitter:   userInfo?.reseauxSociaux?.twitter   || "",
    tiktok:    userInfo?.reseauxSociaux?.tiktok    || "",
    linkedin:  userInfo?.reseauxSociaux?.linkedin  || "",
    youtube:   userInfo?.reseauxSociaux?.youtube   || "",
  });

  // Injecter CSS
  useEffect(() => {
    if (!document.getElementById("pd-css")) {
      const s = document.createElement("style");
      s.id = "pd-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  // Reset success après 3s
  useEffect(() => {
    if (updateSuccess) {
      const t = setTimeout(() => dispatch(clearUpdateSuccess()), 3000);
      return () => clearTimeout(t);
    }
  }, [updateSuccess, dispatch]);

  const handleToggleTracking = async () => {
    setTrackingLoading(true);
    if (isSharing) {
      await stopTracking();
      setGeoError(null);
    } else {
      const result = await startTracking();
      if (!result.ok) setGeoError(result.reason);
    }
    setTrackingLoading(false);
  };

  const handleLogout = async () => {
    if (isSharing) stopTracking();
    await dispatch(logoutUser());
    navigate("/");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ metier, siteWeb, reseauxSociaux: reseaux }));
  };

  const renderStars = (note) =>
    note ? "★".repeat(Math.floor(note)) + (note % 1 >= 0.5 ? "½" : "") : "—";

  return (
    <div className="pd-root">

      {/* ── Popup géolocalisation refusée (bottom sheet mobile) ── */}
      {geoError && (
        <div className="pd-geo-overlay" onClick={() => setGeoError(null)}>
          <div className="pd-geo-popup" onClick={(e) => e.stopPropagation()}>
            <div className="pd-geo-icon">📍</div>
            <div className="pd-geo-title">
              {geoError === "unsupported" ? "GPS non supporté" : "Géolocalisation désactivée"}
            </div>
            <div className="pd-geo-text">
              {geoError === "unsupported"
                ? "Votre navigateur ne supporte pas la géolocalisation."
                : "Autorisez l'accès à votre localisation pour apparaître sur la carte."}
            </div>
            {geoError === "denied" && (
              <div className="pd-geo-steps">
                <div className="pd-geo-step"><span className="pd-geo-step-num">1.</span><span>Cliquez sur le cadenas 🔒 dans la barre d'adresse</span></div>
                <div className="pd-geo-step"><span className="pd-geo-step-num">2.</span><span>Sélectionnez <strong style={{color:"#c9a84c"}}>Autorisations du site</strong></span></div>
                <div className="pd-geo-step"><span className="pd-geo-step-num">3.</span><span>Passez <strong style={{color:"#c9a84c"}}>Localisation</strong> sur <strong style={{color:"#c9a84c"}}>Autoriser</strong></span></div>
                <div className="pd-geo-step"><span className="pd-geo-step-num">4.</span><span>Rechargez la page et réessayez</span></div>
              </div>
            )}
            <button className="pd-geo-btn-primary" onClick={() => { setGeoError(null); window.location.reload(); }}>
              Recharger la page
            </button>
            <button className="pd-geo-btn-secondary" onClick={() => setGeoError(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="pd-header">
        <div className="pd-logo">
          <div className="pd-logo-mark">H</div>
          <span className="pd-logo-name">Hopela</span>
          <span className="pd-badge-role">Pro</span>
        </div>
        <button className="pd-logout-btn" onClick={handleLogout}>Déconnexion</button>
      </header>

      {/* ── Tabs desktop (masqués sur mobile) ── */}
      <DesktopTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Contenu ── */}
      <div className="pd-body">
        <h1 className="pd-welcome">Bonjour, <em>{userInfo?.prenom}</em> 👷</h1>
        <p className="pd-welcome-sub">
          {activeTab === "disponibilite"
            ? "Gérez votre disponibilité en temps réel"
            : "Complétez votre profil pour attirer plus de clients"}
        </p>

        {/* ══════════ ONGLET DISPONIBILITÉ ══════════ */}
        {activeTab === "disponibilite" && (
          <>
            <div className="pd-status-card">
              <div className={`pd-status-indicator ${isSharing ? "online" : "offline"}`}>
                {isSharing ? "📍" : "💤"}
              </div>
              <div className="pd-status-label">
                {isSharing ? "Vous êtes visible sur la carte" : "Vous êtes hors ligne"}
              </div>
              <p className="pd-status-sub">
                {isSharing
                  ? "Votre position est partagée en temps réel. Les clients peuvent vous voir."
                  : "Activez le partage pour apparaître sur la carte et recevoir des demandes."}
              </p>
              <button
                className={`pd-toggle-btn ${isSharing ? "stop" : "start"}`}
                onClick={handleToggleTracking}
                disabled={trackingLoading}
              >
                {trackingLoading
                  ? (isSharing ? "⏳ Arrêt en cours..." : "⏳ Démarrage...")
                  : (isSharing ? "⏹ Arrêter le partage" : "▶ Démarrer le partage")}
              </button>
            </div>

            <div className="pd-info-grid">
              <div className="pd-info-card">
                <div className="pd-info-icon">👤</div>
                <div style={{minWidth:0}}>
                  <div className="pd-info-label">Identité</div>
                  <div className="pd-info-value">{userInfo?.prenom} {userInfo?.nom}</div>
                </div>
              </div>
              <div className="pd-info-card">
                <div className="pd-info-icon">🔧</div>
                <div style={{minWidth:0}}>
                  <div className="pd-info-label">Métier</div>
                  <div className="pd-info-value gold">{userInfo?.metier || "Non renseigné"}</div>
                </div>
              </div>
              <div className="pd-info-card">
                <div className="pd-info-icon">⭐</div>
                <div style={{minWidth:0}}>
                  <div className="pd-info-label">Note</div>
                  <div className="pd-info-value gold">
                    {renderStars(userInfo?.note)}{userInfo?.note ? ` (${userInfo.note}/5)` : " —"}
                  </div>
                </div>
              </div>
              <div className="pd-info-card">
                <div className="pd-info-icon">💬</div>
                <div style={{minWidth:0}}>
                  <div className="pd-info-label">Avis</div>
                  <div className="pd-info-value">{userInfo?.nbAvis || 0} avis</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ══════════ ONGLET PROFIL ══════════ */}
        {activeTab === "profil" && (
          <form onSubmit={handleSaveProfile}>

            {updateSuccess && (
              <div className="pd-alert success">✅ Profil mis à jour avec succès !</div>
            )}
            {updateError && (
              <div className="pd-alert error">⚠️ {updateError}</div>
            )}

            {/* Infos pro */}
            <div className="pd-form-section">
              <div className="pd-form-section-title">Informations professionnelles</div>
              <div className="pd-form-section-sub">Ces informations apparaissent sur votre profil public</div>

              <div className="pd-field">
                <label className="pd-label">Métier / Spécialité</label>
                <div className="pd-input-wrap">
                  <span className="pd-input-icon">🔧</span>
                  <input
                    type="text" className="pd-input"
                    placeholder="Ex: Électricien, Plombier, Jardinier..."
                    value={metier}
                    onChange={(e) => setMetier(e.target.value)}
                  />
                </div>
              </div>

              <div className="pd-field">
                <label className="pd-label">Site web</label>
                <div className="pd-input-wrap">
                  <span className="pd-input-icon">🌐</span>
                  <input
                    type="url" className="pd-input"
                    placeholder="https://votre-site.com"
                    value={siteWeb}
                    onChange={(e) => setSiteWeb(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="pd-form-section">
              <div className="pd-form-section-title">Réseaux sociaux</div>
              <div className="pd-form-section-sub">Ajoutez vos liens pour que les clients vous retrouvent</div>

              <div className="pd-social-list">
                {RESEAUX.map(({ key, icon, label, placeholder }) => (
                  <div key={key} className="pd-field" style={{ marginBottom: 0 }}>
                    <label className="pd-label">{icon} {label}</label>
                    <div className="pd-input-wrap">
                      <span className="pd-input-icon">{icon}</span>
                      <input
                        type="url" className="pd-input"
                        placeholder={placeholder}
                        value={reseaux[key]}
                        onChange={(e) => setReseaux((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="pd-save-btn" disabled={updateLoading}>
              {updateLoading && <span className="pd-spinner" />}
              {updateLoading ? "Enregistrement..." : "💾 Sauvegarder le profil"}
            </button>

          </form>
        )}
      </div>

      {/* ── Bottom nav mobile ── */}
      <nav className="pd-bottom-nav">
        {[
          { key: "disponibilite", icon: "📍", label: "Disponibilité" },
          { key: "profil",        icon: "✏️", label: "Mon profil" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            className={`pd-nav-btn${activeTab === key ? " active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <span className="pd-nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
};

export default PrestataireDashboard;