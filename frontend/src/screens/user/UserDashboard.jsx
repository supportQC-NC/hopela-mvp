// src/screens/user/UserDashboard.jsx
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../slices/authSlice";
import PublicMap from "../../components/map/PublicMap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CSS = `
  .ud-root {
    min-height: 100vh; background: #0a0804;
    font-family: 'DM Sans', sans-serif; color: #f5f0e8;
  }
  .ud-header {
    height: 64px; display: flex; align-items: center;
    justify-content: space-between; padding: 0 32px;
    background: rgba(14,11,6,0.9); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(201,168,76,0.12);
    position: sticky; top: 0; z-index: 100;
  }
  .ud-logo {
    display: flex; align-items: center; gap: 10px;
  }
  .ud-logo-mark {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #c9a84c, #8a6c28);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-weight: 700;
    font-size: 17px; color: #0a0804;
  }
  .ud-logo-name {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 700; font-size: 20px; color: #f5f0e8;
  }
  .ud-header-right { display: flex; align-items: center; gap: 16px; }
  .ud-user-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.18);
    border-radius: 8px; padding: 6px 12px;
  }
  .ud-user-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, #c9a84c, #8a6c28);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: #0a0804;
    font-family: 'Cormorant Garamond', serif;
  }
  .ud-user-name { font-size: 13px; font-weight: 500; color: #f5f0e8; }
  .ud-logout-btn {
    background: none; border: 1px solid rgba(201,168,76,0.2);
    border-radius: 8px; padding: 7px 14px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 12px;
    color: rgba(245,240,232,0.5); transition: all 0.2s;
  }
  .ud-logout-btn:hover { border-color: rgba(239,68,68,0.4); color: #fca5a5; }
  .ud-body { padding: 32px; }
  .ud-welcome {
    margin-bottom: 28px;
  }
  .ud-welcome h1 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 3vw, 42px); font-weight: 700;
    color: #f5f0e8; letter-spacing: -0.3px; margin-bottom: 6px;
  }
  .ud-welcome h1 em { font-style: italic; color: #c9a84c; }
  .ud-welcome p { font-size: 14px; color: rgba(245,240,232,0.45); font-weight: 300; }
  .ud-map-wrap {
    height: 480px; border-radius: 16px; overflow: hidden;
    border: 1px solid rgba(201,168,76,0.15);
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }
`;

const UserDashboard = () => {
  const { userInfo } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/users/logout`, { method: "POST", credentials: "include" });
    dispatch(logout());
    navigate("/");
  };

  if (!document.getElementById("ud-css")) {
    const s = document.createElement("style"); s.id = "ud-css"; s.textContent = CSS;
    document.head.appendChild(s);
  }

  return (
    <div className="ud-root">
      <header className="ud-header">
        <div className="ud-logo">
          <div className="ud-logo-mark">H</div>
          <span className="ud-logo-name">Hopela</span>
        </div>
        <div className="ud-header-right">
          <div className="ud-user-badge">
            <div className="ud-user-avatar">{userInfo?.prenom?.[0]}{userInfo?.nom?.[0]}</div>
            <span className="ud-user-name">{userInfo?.prenom} {userInfo?.nom}</span>
          </div>
          <button className="ud-logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      <div className="ud-body">
        <div className="ud-welcome">
          <h1>Bonjour, <em>{userInfo?.prenom}</em> 👋</h1>
          <p>Trouvez un prestataire disponible près de vous en temps réel</p>
        </div>
        <div className="ud-map-wrap">
          <PublicMap />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;