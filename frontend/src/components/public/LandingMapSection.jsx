import { useCallback, useState } from "react";
import PublicMap from "../../components/map/PublicMap";
import "./LandingMapSection.scss";

const LandingMapSection = () => {
  const [, setPrestatairesEnLigne] = useState(null);
  const handleCount = useCallback((n) => setPrestatairesEnLigne(n), []);

  return (
    <section className="lp-map-section" id="carte">
      <div className="lp-map-header">
        <div>
          <div className="lp-eyebrow">Carte interactive</div>
          <h2 className="lp-map-title">
            Ils sont <em>près de chez vous</em>
          </h2>
        </div>
        <p className="lp-map-subtitle">
          Visualisez les disponibilités en temps réel
        </p>
      </div>

      <div className="lp-map-container">
        <PublicMap onCountChange={handleCount} />
      </div>
    </section>
  );
};

export default LandingMapSection;
