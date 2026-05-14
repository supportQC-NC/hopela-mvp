// src/screens/public/ForgotPasswordScreen.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, clearResetSuccess, clearError } from "../../slices/authSlice";

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const CSS = `
  .fp-root {
    min-height: 100vh; display: flex;
    background: #0a0804; font-family: 'DM Sans', sans-serif;
  }

  /* Panneau visuel gauche */
  .fp-visual {
    flex: 1; position: relative; overflow: hidden;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 48px;
    background: linear-gradient(160deg, #0f0b05 0%, #1a1208 50%, #0f0b05 100%);
  }
  .fp-visual-bg {
    position: absolute; inset: 0; z-index: 0;
    background:
      radial-gradient(ellipse 70% 60% at 30% 40%, rgba(201,168,76,0.1) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(201,168,76,0.05) 0%, transparent 60%);
  }
  .fp-visual-grid {
    position: absolute; inset: 0; z-index: 0; opacity: 0.04;
    background-image:
      linear-gradient(rgba(201,168,76,0.8) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.8) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .fp-visual-orb {
    position: absolute; z-index: 0;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
    top: 10%; left: 10%;
    animation: fpOrbFloat 8s ease-in-out infinite;
  }
  @keyframes fpOrbFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    33%      { transform: translate(40px,-30px) scale(1.05); }
    66%      { transform: translate(-20px,20px) scale(0.95); }
  }
  .fp-visual-logo {
    position: absolute; top: 48px; left: 48px; z-index: 1;
    display: flex; align-items: center; gap: 12px; text-decoration: none;
  }
  .fp-visual-logo-mark {
    width: 40px; height: 40px; border-radius: 50%;
    background: linear-gradient(135deg, #c9a84c, #8a6c28);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 20px;
    color: #0a0804;
    box-shadow: 0 0 0 1px rgba(201,168,76,0.4), 0 4px 16px rgba(201,168,76,0.2);
  }
  .fp-visual-logo-name {
    font-family: 'Cormorant Garamond', serif; font-weight: 700; font-size: 24px;
    color: #f5f0e8;
  }
  .fp-visual-content { position: relative; z-index: 1; }
  .fp-visual-quote {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(32px, 3.5vw, 52px); font-weight: 700;
    color: #f5f0e8; line-height: 1.15; letter-spacing: -0.5px; margin-bottom: 20px;
  }
  .fp-visual-quote em { font-style: italic; color: #c9a84c; }
  .fp-visual-sub {
    font-size: 14px; color: rgba(245,240,232,0.45); font-weight: 300; line-height: 1.7;
  }

  /* Panneau formulaire */
  .fp-panel {
    width: 480px; flex-shrink: 0; background: #0e0b06;
    border-left: 1px solid rgba(201,168,76,0.12);
    display: flex; flex-direction: column; justify-content: center;
    padding: 60px 48px; position: relative; overflow: hidden;
  }
  .fp-panel::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent); opacity: 0.6;
  }

  .fp-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; color: rgba(245,240,232,0.35); text-decoration: none;
    margin-bottom: 36px; transition: color 0.2s; letter-spacing: 0.3px;
  }
  .fp-back:hover { color: #c9a84c; }

  .fp-icon {
    width: 64px; height: 64px; border-radius: 16px; margin-bottom: 28px;
    background: rgba(201,168,76,0.08); border: 1px solid rgba(201,168,76,0.2);
    display: flex; align-items: center; justify-content: center; font-size: 28px;
  }
  .fp-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px; font-weight: 700; color: #f5f0e8;
    letter-spacing: -0.3px; margin-bottom: 8px;
  }
  .fp-sub {
    font-size: 13px; color: rgba(245,240,232,0.4); font-weight: 300;
    line-height: 1.6; margin-bottom: 36px;
  }

  .fp-field { margin-bottom: 20px; }
  .fp-label {
    display: block; font-size: 11px; font-weight: 600;
    letter-spacing: 1.5px; text-transform: uppercase;
    color: rgba(245,240,232,0.45); margin-bottom: 8px;
  }
  .fp-input-wrap { position: relative; }
  .fp-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    font-size: 15px; pointer-events: none;
  }
  .fp-input {
    width: 100%; background: rgba(255,255,255,0.04);
    border: 1px solid rgba(201,168,76,0.15); border-radius: 10px;
    padding: 13px 14px 13px 42px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    color: #f5f0e8; outline: none; transition: all 0.2s; -webkit-appearance: none;
    box-sizing: border-box;
  }
  .fp-input::placeholder { color: rgba(245,240,232,0.2); }
  .fp-input:focus {
    border-color: rgba(201,168,76,0.5); background: rgba(201,168,76,0.04);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.08);
  }

  .fp-error {
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
    border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #fca5a5;
    margin-bottom: 18px; display: flex; align-items: center; gap: 8px;
  }
  .fp-success {
    background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.25);
    border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;
  }
  .fp-success-icon { font-size: 36px; margin-bottom: 12px; }
  .fp-success-title {
    font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700;
    color: #f5f0e8; margin-bottom: 8px;
  }
  .fp-success-text { font-size: 13px; color: rgba(245,240,232,0.5); line-height: 1.6; }

  .fp-btn {
    width: 100%; background: linear-gradient(135deg, #c9a84c, #e8c97a);
    border: none; border-radius: 10px; padding: 15px;
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #0a0804; cursor: pointer; transition: all 0.25s;
    box-shadow: 0 4px 20px rgba(201,168,76,0.25); margin-top: 4px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .fp-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(201,168,76,0.4); }
  .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .fp-spinner {
    width: 16px; height: 16px; border: 2px solid rgba(10,8,4,0.3);
    border-top-color: #0a0804; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  .fp-login-link {
    text-align: center; margin-top: 24px;
    font-size: 13px; color: rgba(245,240,232,0.35);
  }
  .fp-login-link a {
    color: #c9a84c; text-decoration: none; font-weight: 500; margin-left: 4px;
  }
  .fp-login-link a:hover { text-decoration: underline; }

  @media (max-width: 900px) {
    .fp-visual { display: none; }
    .fp-panel { width: 100%; border-left: none; padding: 48px 24px; }
  }
`;

const ForgotPasswordScreen = () => {
  const dispatch = useDispatch();
  const { loading, error, forgotSuccess } = useSelector((s) => s.auth);
  const [email, setEmail] = useState("");

  // Injecter fonts + CSS
  useEffect(() => {
    if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Cormorant"]')) {
      const link = document.createElement("link");
      link.rel  = "stylesheet"; link.href = FONT_LINK;
      document.head.appendChild(link);
    }
    if (!document.getElementById("fp-css")) {
      const s = document.createElement("style");
      s.id = "fp-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
    return () => {
      dispatch(clearError());
      dispatch(clearResetSuccess());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    dispatch(forgotPassword(email.trim().toLowerCase()));
  };

  return (
    <div className="fp-root">

      {/* Panneau visuel */}
      <div className="fp-visual">
        <div className="fp-visual-bg" />
        <div className="fp-visual-grid" />
        <div className="fp-visual-orb" />
        <Link to="/" className="fp-visual-logo">
          <div className="fp-visual-logo-mark">H</div>
          <span className="fp-visual-logo-name">Hopela</span>
        </Link>
        <div className="fp-visual-content">
          <div className="fp-visual-quote">
            Retrouvez votre<br/><em>accès</em> en quelques<br/>secondes.
          </div>
          <div className="fp-visual-sub">
            Saisissez votre adresse email et nous vous enverrons<br/>
            un lien pour créer un nouveau mot de passe.
          </div>
        </div>
      </div>

      {/* Panneau formulaire */}
      <div className="fp-panel">
        <Link to="/login" className="fp-back">
          ← Retour à la connexion
        </Link>

        <div className="fp-icon">🔐</div>
        <div className="fp-title">Mot de passe<br/>oublié ?</div>
        <div className="fp-sub">
          Pas de panique. Renseignez l'email associé à votre compte
          et nous vous enverrons un lien de réinitialisation.
        </div>

        {forgotSuccess ? (
          <div className="fp-success">
            <div className="fp-success-icon">✉️</div>
            <div className="fp-success-title">Email envoyé !</div>
            <div className="fp-success-text">
              Si un compte existe avec cette adresse, vous recevrez un email
              contenant un lien valable 30 minutes. Pensez à vérifier vos
              spams si vous ne le voyez pas.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="fp-error">⚠️ {error}</div>
            )}

            <div className="fp-field">
              <label className="fp-label">Adresse email</label>
              <div className="fp-input-wrap">
                <span className="fp-input-icon">✉️</span>
                <input
                  type="email"
                  className="fp-input"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button className="fp-btn" type="submit" disabled={loading || !email.trim()}>
              {loading ? <span className="fp-spinner" /> : null}
              {loading ? "Envoi en cours…" : "Envoyer le lien →"}
            </button>
          </form>
        )}

        <div className="fp-login-link">
          Vous vous en souvenez ?
          <Link to="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;