// src/screens/public/LoginScreen.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../../slices/authSlice";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const CSS = `
  .login-root {
    min-height: 100vh;
    display: flex;
    background: #0a0804;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Panneau gauche (visuel) ── */
  .login-visual {
    flex: 1;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 48px;
    background: linear-gradient(160deg, #0f0b05 0%, #1a1208 50%, #0f0b05 100%);
  }
  .login-visual-bg {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 70% 60% at 30% 40%, rgba(201,168,76,0.1) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(201,168,76,0.05) 0%, transparent 60%);
  }
  .login-visual-grid {
    position: absolute; inset: 0; z-index: 0; opacity: 0.04;
    background-image:
      linear-gradient(rgba(201,168,76,0.8) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.8) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .login-visual-orb {
    position: absolute; z-index: 0;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
    top: 10%; left: 10%;
    animation: orbFloat 8s ease-in-out infinite;
  }
  @keyframes orbFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(40px,-30px) scale(1.05); }
    66%      { transform: translate(-20px,20px) scale(0.95); }
  }
  .login-visual-content { position: relative; z-index: 1; }
  .login-visual-logo {
    position: absolute; top: 48px; left: 48px; z-index: 1;
    display: flex; align-items: center; gap: 12px; text-decoration: none;
  }
  .login-visual-logo-mark {
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, #c9a84c, #8a6c28);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 20px;
    color: #0a0804;
    box-shadow: 0 0 0 1px rgba(201,168,76,0.4), 0 4px 16px rgba(201,168,76,0.2);
  }
  .login-visual-logo-name {
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 24px;
    color: #f5f0e8;
  }
  .login-visual-quote {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(32px, 3.5vw, 52px); font-weight: 700;
    color: #f5f0e8; line-height: 1.15; letter-spacing: -0.5px;
    margin-bottom: 20px;
  }
  .login-visual-quote em { font-style: italic; color: #c9a84c; }
  .login-visual-sub {
    font-size: 14px; color: rgba(245,240,232,0.45);
    font-weight: 300; line-height: 1.7; max-width: 380px;
  }
  .login-visual-dots {
    display: flex; gap: 8px; margin-top: 32px;
  }
  .login-visual-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(201,168,76,0.25);
  }
  .login-visual-dot.active { background: #c9a84c; }

  /* ── Panneau droit (formulaire) ── */
  .login-panel {
    width: 480px; flex-shrink: 0;
    background: #0e0b06;
    border-left: 1px solid rgba(201,168,76,0.12);
    display: flex; flex-direction: column;
    justify-content: center; padding: 60px 48px;
    position: relative; overflow: hidden;
  }
  .login-panel::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    opacity: 0.6;
  }

  /* ── Tabs ── */
  .login-tabs {
    display: flex; gap: 0;
    background: rgba(255,255,255,0.04);
    border-radius: 10px; padding: 4px;
    margin-bottom: 36px;
    border: 1px solid rgba(201,168,76,0.1);
  }
  .login-tab {
    flex: 1; padding: 10px;
    border: none; cursor: pointer; border-radius: 7px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    transition: all 0.2s; background: transparent;
    color: rgba(245,240,232,0.4); letter-spacing: 0.3px;
  }
  .login-tab.active {
    background: rgba(201,168,76,0.15);
    color: #c9a84c;
    border: 1px solid rgba(201,168,76,0.25);
  }

  /* ── Titre form ── */
  .login-form-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; font-weight: 700; color: #f5f0e8;
    letter-spacing: -0.3px; margin-bottom: 6px;
  }
  .login-form-sub {
    font-size: 13px; color: rgba(245,240,232,0.4);
    font-weight: 300; margin-bottom: 32px;
  }

  /* ── Champs ── */
  .login-field { margin-bottom: 18px; }
  .login-label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(245,240,232,0.45); margin-bottom: 8px;
  }
  .login-input-wrap { position: relative; }
  .login-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 15px; pointer-events: none;
  }
  .login-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 10px;
    padding: 13px 14px 13px 42px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #f5f0e8; outline: none;
    transition: all 0.2s;
    -webkit-appearance: none;
  }
  .login-input::placeholder { color: rgba(245,240,232,0.2); }
  .login-input:focus {
    border-color: rgba(201,168,76,0.5);
    background: rgba(201,168,76,0.04);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
  }
  .login-input.error { border-color: rgba(239,68,68,0.5); }

  /* ── Select role ── */
  .login-select {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.15);
    border-radius: 10px;
    padding: 13px 14px 13px 42px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #f5f0e8; outline: none; cursor: pointer;
    transition: all 0.2s;
    -webkit-appearance: none; appearance: none;
  }
  .login-select option { background: #1c1610; color: #f5f0e8; }
  .login-select:focus {
    border-color: rgba(201,168,76,0.5);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
  }

  /* ── Row 2 colonnes ── */
  .login-row { display: flex; gap: 12px; }
  .login-row .login-field { flex: 1; }

  /* ── Erreur ── */
  .login-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 10px; padding: 12px 14px;
    font-size: 13px; color: #fca5a5;
    margin-bottom: 18px;
    display: flex; align-items: center; gap: 8px;
  }

  /* ── Bouton submit ── */
  .login-btn {
    width: 100%;
    background: linear-gradient(135deg, #c9a84c, #e8c97a);
    border: none; border-radius: 10px;
    padding: 15px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #0a0804; cursor: pointer;
    transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(201,168,76,0.25);
    margin-top: 8px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .login-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(201,168,76,0.4); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* ── Lien mot de passe ── */
  .login-forgot {
    text-align: right; margin-bottom: 6px;
  }
  .login-forgot a {
    font-size: 12px; color: rgba(201,168,76,0.6);
    text-decoration: none; transition: color 0.2s;
  }
  .login-forgot a:hover { color: #c9a84c; }

  /* ── Spinner ── */
  @keyframes spin { to { transform: rotate(360deg); } }
  .login-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(10,8,4,0.3);
    border-top-color: #0a0804;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .login-visual { display: none; }
    .login-panel { width: 100%; border-left: none; padding: 48px 24px; }
  }
`;

// ── Redirect selon le rôle ─────────────────────────────────────────────────
const getRedirectPath = (role) => {
  if (role === "admin")       return "/admin/dashboard";
  if (role === "prestataire") return "/prestataire/dashboard";
  return "/dashboard";
};

const LoginScreen = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [tab,      setTab]      = useState("login");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Login
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // Register
  const [nom,      setNom]      = useState("");
  const [prenom,   setPrenom]   = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass,  setRegPass]  = useState("");
  const [role,     setRole]     = useState("user");

  // Redirect si déjà connecté
  useEffect(() => {
    if (userInfo) navigate(getRedirectPath(userInfo.role), { replace: true });
  }, [userInfo, navigate]);

  // Injecter fonts + CSS
  useEffect(() => {
    if (!document.getElementById("login-fonts")) {
      const link = document.createElement("link");
      link.id = "login-fonts"; link.rel = "stylesheet"; link.href = FONT_LINK;
      document.head.appendChild(link);
    }
    if (!document.getElementById("login-css")) {
      const s = document.createElement("style");
      s.id = "login-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  // ── Connexion ──────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      navigate(getRedirectPath(result.payload.role), { replace: true });
    } else {
      setError(result.payload || "Erreur de connexion");
    }
    setLoading(false);
  };

  // ── Inscription ────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const result = await dispatch(registerUser({
      nom, prenom, email: regEmail, password: regPass, role,
    }));
    if (registerUser.fulfilled.match(result)) {
      navigate(getRedirectPath(result.payload.role), { replace: true });
    } else {
      setError(result.payload || "Erreur lors de la création du compte");
    }
    setLoading(false);
  };

  return (
    <div className="login-root">

      {/* ══════════ PANNEAU VISUEL ══════════ */}
      <div className="login-visual">
        <div className="login-visual-bg" />
        <div className="login-visual-grid" />
        <div className="login-visual-orb" />

        <a href="/" className="login-visual-logo">
          <div className="login-visual-logo-mark">H</div>
          <span className="login-visual-logo-name">Hopela</span>
        </a>

        <div className="login-visual-content">
          <p className="login-visual-quote">
            Des prestataires<br />
            <em>près de vous</em>,<br />
            en temps réel.
          </p>
          <p className="login-visual-sub">
            Trouvez un électricien, un plombier, un jardinier ou tout autre
            professionnel disponible maintenant, géolocalisé sur la carte.
          </p>
          <div className="login-visual-dots">
            <div className={`login-visual-dot${tab === "login" ? " active" : ""}`} />
            <div className={`login-visual-dot${tab === "register" ? " active" : ""}`} />
          </div>
        </div>
      </div>

      {/* ══════════ PANNEAU FORMULAIRE ══════════ */}
      <div className="login-panel">

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab${tab === "login" ? " active" : ""}`}
            onClick={() => { setTab("login"); setError(""); }}
          >Connexion</button>
          <button
            className={`login-tab${tab === "register" ? " active" : ""}`}
            onClick={() => { setTab("register"); setError(""); }}
          >Créer un compte</button>
        </div>

        {/* ── CONNEXION ── */}
        {tab === "login" && (
          <>
            <h1 className="login-form-title">Bon retour 👋</h1>
            <p className="login-form-sub">Connectez-vous à votre espace Hopela</p>

            {error && (
              <div className="login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="login-field">
                <label className="login-label">Adresse email</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">✉️</span>
                  <input
                    type="email" className={`login-input${error ? " error" : ""}`}
                    placeholder="vous@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required autoComplete="email"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Mot de passe</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">🔑</span>
                  <input
                    type="password" className={`login-input${error ? " error" : ""}`}
                    placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    required autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="login-forgot">
                <a href="/forgot-password">Mot de passe oublié ?</a>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : null}
                {loading ? "Connexion..." : "Se connecter →"}
              </button>
            </form>
          </>
        )}

        {/* ── INSCRIPTION ── */}
        {tab === "register" && (
          <>
            <h1 className="login-form-title">Créer un compte</h1>
            <p className="login-form-sub">Rejoignez Hopela en quelques secondes</p>

            {error && (
              <div className="login-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="login-row">
                <div className="login-field">
                  <label className="login-label">Prénom</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">👤</span>
                    <input
                      type="text" className="login-input"
                      placeholder="Jean"
                      value={prenom} onChange={(e) => setPrenom(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="login-field">
                  <label className="login-label">Nom</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">👤</span>
                    <input
                      type="text" className="login-input"
                      placeholder="Dupont"
                      value={nom} onChange={(e) => setNom(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Adresse email</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">✉️</span>
                  <input
                    type="email" className="login-input"
                    placeholder="vous@example.com"
                    value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                    required autoComplete="email"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Mot de passe</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">🔑</span>
                  <input
                    type="password" className="login-input"
                    placeholder="Min. 6 caractères"
                    value={regPass} onChange={(e) => setRegPass(e.target.value)}
                    required minLength={6} autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label">Je suis</label>
                <div className="login-input-wrap">
                  <span className="login-input-icon">🛡️</span>
                  <select
                    className="login-select"
                    value={role} onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">Particulier — je cherche un prestataire</option>
                    <option value="prestataire">Prestataire — je propose mes services</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <span className="login-spinner" /> : null}
                {loading ? "Création..." : "Créer mon compte →"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;