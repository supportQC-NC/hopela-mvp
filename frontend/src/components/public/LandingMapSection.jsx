// src/components/public/LandingMapSection.jsx
import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PublicMap from "../../components/map/PublicMap";
import "./LandingMapSection.scss";

const LandingMapSection = () => {
  const [, setPrestatairesEnLigne] = useState(null);
  const handleCount = useCallback((n) => setPrestatairesEnLigne(n), []);
  const { userInfo } = useSelector((state) => state.auth);

  // Lien carte adapté selon le rôle
  const getCartePath = () => {
    if (userInfo?.role === "prestataire") return "/prestataire/carte";
    if (userInfo?.role === "user")        return "/dashboard/carte";
    return "/carte";
  };

  return (
    <section className="lp-map-section" id="carte">
      <div className="lp-map-header">
        <div>
          <div className="lp-eyebrow">Carte interactive</div>
          <h2 className="lp-map-title">
            Ils sont <em>déjà là</em>
          </h2>
        </div>
        <p className="lp-map-subtitle">
          Visualisez leurs présences en temps réel.
        </p>
      </div>

      <div className="lp-map-container">
        <PublicMap onCountChange={handleCount} />

        {/* Bouton plein écran */}
        <Link
          to={getCartePath()}
          className="lp-map-fullscreen-btn"
          title="Voir la carte en plein écran"
        >
          <span className="lp-map-fullscreen-icon">⛶</span>
          <span>Plein écran</span>
        </Link>
      </div>
    </section>
  );
};

export default LandingMapSection;