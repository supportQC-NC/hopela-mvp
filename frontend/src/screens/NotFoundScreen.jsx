// src/screens/NotFoundScreen.jsx
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CSS = `
  .nf-root {
    min-height: 100vh;
    background: #0a0804;
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative; overflow: hidden;
  }
  .nf-bg {
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%);
  }
  .nf-grid {
    position: absolute; inset: 0; opacity: 0.03;
    background-image:
      linear-gradient(rgba(201,168,76,0.8) 1px, transparent 1px),
      linear-gradient(90deg, rgba(201,168,76,0.8) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .nf-content {
    position: relative; z-index: 1;
    text-align: center; padding: 48px 24px;
  }
  .nf-404 {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(100px, 20vw, 180px);
    font-weight: 700; line-height: 1;
    background: linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.4));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
    animation: nfFloat 4s ease-in-out infinite;
  }
  @keyframes nfFloat {
    0%,100% { transform: translateY(0); }
    50%      { transform: translateY(-12px); }
  }
  .nf-emoji { font-size: 48px; margin-bottom: 24px; display: block; }
  .nf-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(24px, 4vw, 40px); font-weight: 700;
    color: #f5f0e8; letter-spacing: -0.3px; margin-bottom: 12px;
  }
  .nf-title em { font-style: italic; color: #c9a84c; }
  .nf-sub {
    font-size: 15px; color: rgba(245,240,232,0.4);
    font-weight: 300; line-height: 1.7;
    max-width: 380px; margin: 0 auto 40px;
  }
  .nf-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .nf-btn-primary {
    font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    color: #0a0804; background: linear-gradient(135deg, #c9a84c, #e8c97a);
    border: none; cursor: pointer; padding: 14px 32px; border-radius: 8px;
    transition: all 0.25s; box-shadow: 0 4px 20px rgba(201,168,76,0.25);
  }
  .nf-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(201,168,76,0.4); }
  .nf-btn-ghost {
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    color: rgba(245,240,232,0.5); background: none;
    border: 1px solid rgba(201,168,76,0.15); cursor: pointer;
    padding: 14px 28px; border-radius: 8px; transition: all 0.25s;
  }
  .nf-btn-ghost:hover { border-color: rgba(201,168,76,0.4); color: #f5f0e8; }
`;

const NotFoundScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!document.getElementById("nf-css")) {
      const s = document.createElement("style"); s.id = "nf-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div className="nf-root">
      <div className="nf-bg" />
      <div className="nf-grid" />
      <div className="nf-content">
        <div className="nf-404">404</div>
        <span className="nf-emoji">🗺️</span>
        <h1 className="nf-title">Page <em>introuvable</em></h1>
        <p className="nf-sub">
          Cette page n'existe pas ou a été déplacée.
          Retournez à l'accueil pour trouver votre prestataire.
        </p>
        <div className="nf-actions">
          <button className="nf-btn-primary" onClick={() => navigate("/")}>
            Retour à l'accueil
          </button>
          <button className="nf-btn-ghost" onClick={() => navigate(-1)}>
            ← Page précédente
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundScreen;