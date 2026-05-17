import { TEMOIGNAGES } from "./landingData";
import "./TestimonialsSection.scss";

const TestimonialsSection = () => (
  <section className="lp-testimonials-section" id="avis">
    <div className="lp-eyebrow">Avis clients</div>
    <h2 className="lp-section-title">
      Ils nous font <em>confiance</em>
    </h2>

    <div className="lp-temoignages">
      {TEMOIGNAGES.map((t) => (
        <article key={`${t.nom}-${t.quartier}`} className="lp-temoignage">
          <div className="lp-stars">{"★".repeat(t.note)}</div>
          <p className="lp-texte">“{t.texte}”</p>
          <div className="lp-author">
            <div className="lp-avatar">{t.nom[0]}</div>
            <div>
              <div className="lp-author-name">{t.nom}</div>
              <div className="lp-author-area">{t.quartier}</div>
            </div>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default TestimonialsSection;
