// src/screens/prestataire/PrestataireDashboard.jsx
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../slices/authSlice";
import useGeolocate from "../../hooks/UseGeoLocate";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CSS = `
  .pd-root {
    min-height: 100vh; background: #0a0804;
    font-family: 'DM Sans', sans-serif; color: #f5f0e8;
  }
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
  .pd-body { padding: 32px; max-width: 900px; margin: 0 auto; }
  .pd-welcome {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 3vw, 40px); font-weight: 700;
    color: #f5f0e8; letter-spacing: -0.3px; margin-bottom: 4px;
  }
  .pd-welcome em { font-style: italic; color: #c9a84c; }
  .pd-welcome-sub { font-size: 14px; color: rgba(245,240,232,0.4); margin-bottom: 36px; }

  /* ── Carte statut ── */
  .pd-status-card {
    background: #120e07; border: 1px solid rgba(201,168,76,0.15);
    border-radius: 20px; padding: 32px;
    margin-bottom: 24px; text-align: center;
  }
  .pd-status-indicator {
    width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px;
    display: flex; align-items: center; justify-content: center;
    font-size: 32px; position: relative; transition: all 0.4s;
  }
  .pd-status-indicator.online {
    background: rgba(74,222,128,0.12);
    border: 2px solid rgba(74,222,128,0.4);
    box-shadow: 0 0 32px rgba(74,222,128,0.2);
  }
  .pd-status-indicator.offline {
    background: rgba(245,240,232,0.06);
    border: 2px solid rgba(245,240,232,0.1);
  }
  @keyframes pulse-green {
    0%,100% { box-shadow: 0 0 20px rgba(74,222,128,0.2); }
    50%      { box-shadow: 0 0 40px rgba(74,222,128,0.4); }
  }
  .pd-status-indicator.online { animation: pulse-green 2.5s ease-in-out infinite; }
  .pd-status-label {
    font-size: 18px; font-weight: 600; color: #f5f0e8; margin-bottom: 6px;
  }
  .pd-status-sub { font-size: 13px; color: rgba(245,240,232,0.4); margin-bottom: 28px; }
  .pd-toggle-btn {
    padding: 14px 40px; border-radius: 10px; border: none;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase; cursor: pointer;
    transition: all 0.25s;
  }
  .pd-toggle-btn.start {
    background: linear-gradient(135deg, #c9a84c, #e8c97a);
    color: #0a0804; box-shadow: 0 4px 20px rgba(201,168,76,0.3);
  }
  .pd-toggle-btn.start:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,168,76,0.45); }
  .pd-toggle-btn.stop {
    background: rgba(239,68,68,0.12); color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.3);
  }
  .pd-toggle-btn.stop:hover { background: rgba(239,68,68,0.2); }

  /* ── Infos profil ── */
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
`;

const PrestataireDashboard = () => {
  const { userInfo } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isSharing, startTracking, stopTracking } = useGeolocate();

  const handleLogout = async () => {
    if (isSharing) stopTracking();
    await fetch(`${API_URL}/api/users/logout`, { method: "POST", credentials: "include" });
    dispatch(logout());
    navigate("/");
  };

  if (!document.getElementById("pd-css")) {
    const s = document.createElement("style"); s.id = "pd-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }

  const renderStars = (note) => note ? "★".repeat(Math.floor(note)) + (note % 1 >= 0.5 ? "½" : "") : "—";

  return (
    <div className="pd-root">
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

      <div className="pd-body">
        <h1 className="pd-welcome">Bonjour, <em>{userInfo?.prenom}</em> 👷</h1>
        <p className="pd-welcome-sub">Gérez votre disponibilité et votre position en temps réel</p>

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

        {/* Infos profil */}
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
      </div>
    </div>
  );
};

export default PrestataireDashboard;