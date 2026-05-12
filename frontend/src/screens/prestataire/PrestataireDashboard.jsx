// src/screens/prestataire/PrestataireDashboard.jsx
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser, updateProfile, clearUpdateSuccess } from "../../slices/authSlice";
import useGeolocate from "../../hooks/UseGeoLocate";

const CSS = `
  .pd-root {
    min-height: 100vh; background: #0a0804;
    font-family: 'DM Sans', sans-serif; color: #f5f0e8;
  }

  /* ── Header ── */
  .pd-header {
    height: 64px; display: flex; align-items: center;
    justify-content: space-between; padding: 0 32px;
    background: rgba(14,11,6,0.9); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(201,168,76,0.12);
    position: sticky; top: 0; z-index: 100;
  }
  .pd-logo { display: flex; align-items: center; gap: 10px; }
  .pd-logo-mark {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #c9a84c, #8a6c28);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-weight: 700;
    font-size: 17px; color: #0a0804;
  }
  .pd-logo-name {
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 20px; color: #f5f0e8;
  }
  .pd-badge-role {
    background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.25);
    border-radius: 6px; padding: 4px 10px;
    font-size: 10px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: #c9a84c;
  }
  .pd-header-right { display: flex; align-items: center; gap: 12px; }
  .pd-logout-btn {
    background: none; border: 1px solid rgba(201,168,76,0.2);
    border-radius: 8px; padding: 7px 14px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: rgba(245,240,232,0.5); transition: all 0.2s;
  }
  .pd-logout-btn:hover { border-color: rgba(239,68,68,0.4); color: #fca5a5; }

  /* ── Tabs nav ── */
  .pd-tabs {
    display: flex; gap: 0;
    border-bottom: 1px solid rgba(201,168,76,0.1);
    padding: 0 32px;
    background: rgba(14,11,6,0.5);
  }
  .pd-tab {
    padding: 16px 20px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    color: rgba(245,240,232,0.4); background: none;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    transition: all 0.2s; display: flex; align-items: center; gap: 8px;
  }
  .pd-tab:hover { color: rgba(245,240,232,0.7); }
  .pd-tab.active { color: #c9a84c; border-bottom-color: #c9a84c; }

  /* ── Body ── */
  .pd-body { padding: 32px; max-width: 860px; margin: 0 auto; }
  .pd-welcome {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 3vw, 40px); font-weight: 700;
    color: #f5f0e8; letter-spacing: -0.3px; margin-bottom: 4px;
  }
  .pd-welcome em { font-style: italic; color: #c9a84c; }
  .pd-welcome-sub { font-size: 14px; color: rgba(245,240,232,0.4); margin-bottom: 28px; }

  /* ── Carte statut tracking ── */
  .pd-status-card {
    background: #120e07; border: 1px solid rgba(201,168,76,0.15);
    border-radius: 20px; padding: 32px; margin-bottom: 24px; text-align: center;
  }
  .pd-status-indicator {
    width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; transition: all 0.4s;
  }
  .pd-status-indicator.online {
    background: rgba(74,222,128,0.12); border: 2px solid rgba(74,222,128,0.4);
    animation: pulseGreen 2.5s ease-in-out infinite;
  }
  .pd-status-indicator.offline {
    background: rgba(245,240,232,0.06); border: 2px solid rgba(245,240,232,0.1);
  }
  @keyframes pulseGreen {
    0%,100% { box-shadow: 0 0 20px rgba(74,222,128,0.2); }
    50%      { box-shadow: 0 0 40px rgba(74,222,128,0.4); }
  }
  .pd-status-label { font-size: 18px; font-weight: 600; color: #f5f0e8; margin-bottom: 6px; }
  .pd-status-sub { font-size: 13px; color: rgba(245,240,232,0.4); margin-bottom: 28px; }
  .pd-toggle-btn {
    padding: 14px 40px; border-radius: 10px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer; transition: all 0.25s;
  }
  .pd-toggle-btn.start {
    background: linear-gradient(135deg, #c9a84c, #e8c97a); color: #0a0804;
    box-shadow: 0 4px 20px rgba(201,168,76,0.3);
  }
  .pd-toggle-btn.start:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,168,76,0.45); }
  .pd-toggle-btn.stop {
    background: rgba(239,68,68,0.12); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3);
  }
  .pd-toggle-btn.stop:hover { background: rgba(239,68,68,0.2); }

  /* ── Infos rapides ── */
  .pd-info-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
  .pd-info-card {
    background: #120e07; border: 1px solid rgba(201,168,76,0.12);
    border-radius: 14px; padding: 20px 24px;
    display: flex; align-items: center; gap: 14px;
  }
  .pd-info-icon {
    width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
    background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.15);
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }
  .pd-info-label { font-size: 11px; color: rgba(245,240,232,0.35); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
  .pd-info-value { font-size: 15px; font-weight: 600; color: #f5f0e8; }
  .pd-info-value.gold { color: #c9a84c; }

  /* ── Formulaire profil ── */
  .pd-form-section {
    background: #120e07; border: 1px solid rgba(201,168,76,0.12);
    border-radius: 20px; padding: 32px; margin-bottom: 20px;
  }
  .pd-form-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 700; color: #f5f0e8;
    margin-bottom: 4px;
  }
  .pd-form-section-sub {
    font-size: 13px; color: rgba(245,240,232,0.35); margin-bottom: 24px;
  }
  .pd-field { margin-bottom: 18px; }
  .pd-label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(245,240,232,0.4); margin-bottom: 8px;
  }
  .pd-input-wrap { position: relative; }
  .pd-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 15px; pointer-events: none;
  }
  .pd-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 10px;
    padding: 13px 14px 13px 42px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #f5f0e8; outline: none; transition: all 0.2s;
  }
  .pd-input::placeholder { color: rgba(245,240,232,0.2); }
  .pd-input:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.04);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
  }
  .pd-row { display: flex; gap: 14px; }
  .pd-row .pd-field { flex: 1; }
  .pd-social-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; }

  /* ── Séparateur ── */
  .pd-divider {
    height: 1px; background: rgba(201,168,76,0.1); margin: 28px 0;
  }

  /* ── Bouton save ── */
  .pd-save-btn {
    background: linear-gradient(135deg, #c9a84c, #e8c97a);
    border: none; border-radius: 10px; padding: 14px 36px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #0a0804; cursor: pointer; transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(201,168,76,0.25);
    display: flex; align-items: center; gap: 8px;
  }
  .pd-save-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(201,168,76,0.4); }
  .pd-save-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── Alertes ── */
  .pd-alert {
    border-radius: 10px; padding: 12px 16px;
    font-size: 13px; margin-bottom: 20px;
    display: flex; align-items: center; gap: 8px;
  }
  .pd-alert.success {
    background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.25); color: #86efac;
  }
  .pd-alert.error {
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5;
  }

  /* ── Spinner ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .pd-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(10,8,4,0.3); border-top-color: #0a0804;
    border-radius: 50%; animation: spin 0.7s linear infinite;
  }
`;

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

  const [activeTab, setActiveTab] = useState("disponibilite");

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
      const s = document.createElement("style"); s.id = "pd-css"; s.textContent = CSS;
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

  const handleLogout = async () => {
    if (isSharing) stopTracking();
    await dispatch(logoutUser());
    navigate("/");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(updateProfile({
      metier,
      siteWeb,
      reseauxSociaux: reseaux,
    }));
  };

  const renderStars = (note) =>
    note ? "★".repeat(Math.floor(note)) + (note % 1 >= 0.5 ? "½" : "") : "—";

  return (
    <div className="pd-root">

      {/* ── Header ── */}
      <header className="pd-header">
        <div className="pd-logo">
          <div className="pd-logo-mark">H</div>
          <span className="pd-logo-name">Hopela</span>
          <span className="pd-badge-role">Prestataire</span>
        </div>
        <div className="pd-header-right">
          <button className="pd-logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="pd-tabs">
        {[
          { key: "disponibilite", icon: "📍", label: "Disponibilité" },
          { key: "profil",        icon: "✏️", label: "Mon profil" },
        ].map(({ key, icon, label }) => (
          <button
            key={key}
            className={`pd-tab${activeTab === key ? " active" : ""}`}
            onClick={() => setActiveTab(key)}
          >
            <span>{icon}</span>{label}
          </button>
        ))}
      </div>

      <div className="pd-body">
        <h1 className="pd-welcome">Bonjour, <em>{userInfo?.prenom}</em> 👷</h1>
        <p className="pd-welcome-sub">
          {activeTab === "disponibilite"
            ? "Gérez votre disponibilité et votre position en temps réel"
            : "Complétez votre profil pour attirer plus de clients"}
        </p>

        {/* ══════════ ONGLET DISPONIBILITÉ ══════════ */}
        {activeTab === "disponibilite" && (
          <>
            {/* Statut tracking */}
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
                onClick={isSharing ? stopTracking : startTracking}
              >
                {isSharing ? "⏹ Arrêter le partage" : "▶ Démarrer le partage"}
              </button>
            </div>

            {/* Infos rapides */}
            <div className="pd-info-grid">
              <div className="pd-info-card">
                <div className="pd-info-icon">👤</div>
                <div>
                  <div className="pd-info-label">Identité</div>
                  <div className="pd-info-value">{userInfo?.prenom} {userInfo?.nom}</div>
                </div>
              </div>
              <div className="pd-info-card">
                <div className="pd-info-icon">🔧</div>
                <div>
                  <div className="pd-info-label">Métier</div>
                  <div className="pd-info-value gold">{userInfo?.metier || "Non renseigné"}</div>
                </div>
              </div>
              <div className="pd-info-card">
                <div className="pd-info-icon">⭐</div>
                <div>
                  <div className="pd-info-label">Note</div>
                  <div className="pd-info-value gold">
                    {renderStars(userInfo?.note)} {userInfo?.note ? `(${userInfo.note}/5)` : "—"}
                  </div>
                </div>
              </div>
              <div className="pd-info-card">
                <div className="pd-info-icon">💬</div>
                <div>
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

            {/* ── Infos pro ── */}
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

            {/* ── Réseaux sociaux ── */}
            <div className="pd-form-section">
              <div className="pd-form-section-title">Réseaux sociaux</div>
              <div className="pd-form-section-sub">Ajoutez vos liens pour que les clients vous retrouvent</div>

              <div className="pd-social-grid">
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

            {/* ── Submit ── */}
            <button type="submit" className="pd-save-btn" disabled={updateLoading}>
              {updateLoading ? <span className="pd-spinner" /> : null}
              {updateLoading ? "Enregistrement..." : "💾 Sauvegarder le profil"}
            </button>

          </form>
        )}
      </div>
    </div>
  );
};

export default PrestataireDashboard;