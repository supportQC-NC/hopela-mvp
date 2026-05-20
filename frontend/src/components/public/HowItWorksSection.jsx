import { STEPS } from "./landingData";
import "./HowItWorksSection.scss";

const HowItWorksSection = () => (
  <section className="lp-steps-section" id="comment-ca-marche">

    <div className="lp-steps-header">
      <div className="lp-eyebrow">Processus</div>
      <h2 className="lp-section-title">
        Trois étapes. <em>Zéro friction.</em>
      </h2>
      <p className="lp-steps-intro">
        Du signal à l'opportunité — en quelques secondes.
      </p>
    </div>

    <div className="lp-steps-track">
      <div className="lp-steps-line" aria-hidden="true" />

      {STEPS.map((step, index) => (
        <article
          key={step.num}
          className={`lp-step lp-step--${index % 2 === 0 ? "left" : "right"}`}
          style={{ "--step-index": index }}
        >
          <div className="lp-step-node">
            <span className="lp-step-node-inner" />
          </div>

          <div className="lp-step-card">
            <span className="lp-step-ghost-num" aria-hidden="true">
              {step.num}
            </span>
            <div className="lp-step-badge">{step.num}</div>
            <div className="lp-step-content">
              <h3>{step.titre}</h3>
              <p>{step.desc}</p>
            </div>
            <div className="lp-step-card-border" aria-hidden="true" />
          </div>
        </article>
      ))}
    </div>

  </section>
);

export default HowItWorksSection;