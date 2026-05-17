import { STEPS } from "./landingData";
import "./HowItWorksSection.scss";

const HowItWorksSection = () => (
  <section className="lp-steps-section" id="comment-ca-marche">
    <div className="lp-section-head lp-section-head--center">
      <div className="lp-eyebrow">Processus</div>
      <h2 className="lp-section-title">
        Comment ça <em>marche</em> ?
      </h2>
    </div>

    <div className="lp-steps">
      {STEPS.map((step) => (
        <article key={step.num} className="lp-step">
          <span className="lp-step-num">{step.num}</span>
          <div className="lp-step-content">
            <h3>{step.titre}</h3>
            <p>{step.desc}</p>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default HowItWorksSection;
