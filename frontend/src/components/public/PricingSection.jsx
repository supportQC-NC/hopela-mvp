import { Check } from "lucide-react";
import { PRICING_PLANS } from "./landingData";
import "./PricingSection.scss";

const PricingSection = () => (
  <section className="lp-pricing-section" id="tarifs">
    <div className="lp-pricing-head">
      <div className="lp-eyebrow">Tarification</div>
      <h2 className="lp-section-title">
        Choisissez votre <em>abonnement</em>
      </h2>
      <p className="lp-section-sub">
        Des offres simples et transparentes pour les particuliers comme pour les professionnels.
      </p>
    </div>

    <div className="lp-pricing-grid">
      {PRICING_PLANS.map((plan) => (
        <article
          key={plan.id}
          className={`lp-price-card${plan.featured ? " lp-price-card--featured" : ""}`}
        >
          {plan.featured && <div className="lp-badge">Le plus populaire</div>}

          <div className="lp-plan-name">{plan.name}</div>

          <div className="lp-price-wrapper">
            <span className="lp-price-currency">XPF</span>
            <span className="lp-price-amount">{plan.price.toLocaleString()}</span>
            <span className="lp-price-period">{plan.period}</span>
          </div>

          <div className="lp-price-desc">{plan.desc}</div>

          <ul className="lp-features-list">
            {plan.features.map((feat) => (
              <li key={feat}>
                <Check size={16} strokeWidth={3} />
                {feat}
              </li>
            ))}
          </ul>

          <button type="button" className="lp-price-btn">
            {plan.featured ? "Commencer maintenant" : "Choisir cette offre"}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default PricingSection;
