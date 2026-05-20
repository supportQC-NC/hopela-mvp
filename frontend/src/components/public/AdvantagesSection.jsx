import { AVANTAGES } from "./landingData";
import "./AdvantagesSection.scss";

const AdvantagesSection = () => (
  <section className="lp-avantages-section">
    <div className="lp-avantages-inner">
      <div className="lp-eyebrow">Avantages</div>
      <h2 className="lp-section-title">
        La différence <em>Hopela</em>
      </h2>

      <div className="lp-avantages-grid">
        {AVANTAGES.map((av) => {
          const Icon = av.icon;
          return (
            <article className="lp-av-card" key={av.titre}>
              <div className="lp-av-bar" style={{ background: av.accent }} />
              <Icon size={24} className="lp-av-icon" />
              <h3 className="lp-av-titre">{av.titre}</h3>
              <p className="lp-av-desc">{av.desc}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default AdvantagesSection;