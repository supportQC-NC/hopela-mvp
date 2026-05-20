// src/components/Utils/CookieBanner.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./CookieBanner.scss";

const STORAGE_KEY = "hopela_cookie_consent";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Petit délai pour ne pas bloquer le rendu initial
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (choice) => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, choice);
      setVisible(false);
      setClosing(false);
    }, 380);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`cb-overlay ${closing ? "cb-overlay--out" : "cb-overlay--in"}`}
        onClick={() => dismiss("refused")}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={`cb-modal ${closing ? "cb-modal--out" : "cb-modal--in"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cb-title"
      >
        {/* Image cookie */}
        <div className="cb-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=160&h=160&fit=crop&crop=center&q=80"
            alt="Un vrai cookie — délicieux"
            className="cb-cookie-img"
          />
          <div className="cb-cookie-glow" />
        </div>

        {/* Texte */}
        <div className="cb-content">
          <p className="cb-tag">🍪 Alerte cookies</p>

          <h2 id="cb-title" className="cb-title">
            Hopela, nous sommes les cookies.
          </h2>

          <p className="cb-desc">
            Oui, nous aussi on s'incruste sans prévenir. Mais contrairement au cousin
            qui arrive à l'improviste, on est vraiment utiles.{" "}
            <strong>Un seul cookie technique</strong> — celui qui garde votre
            session ouverte. Pas de pub. Pas de traçage. Pas de revente à des
            inconnus en cravate.
          </p>

          <p className="cb-desc cb-desc--small">
            Pour les curieux (on vous aime) :{" "}
            <Link to="/cookies" className="cb-link" onClick={() => dismiss("accepted")}>
              politique de cookies
            </Link>{" "}
            et{" "}
            <Link to="/confidentialite" className="cb-link" onClick={() => dismiss("accepted")}>
              confidentialité
            </Link>
            .
          </p>
        </div>

        {/* Actions */}
        <div className="cb-actions">
          <button
            className="cb-btn cb-btn--ghost"
            onClick={() => dismiss("refused")}
          >
            Refuser les non-essentiels
          </button>
          <button
            className="cb-btn cb-btn--primary"
            onClick={() => dismiss("accepted")}
          >
            Tout accepter 🍪
          </button>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;