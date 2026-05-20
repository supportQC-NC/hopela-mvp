import { useNavigate } from "react-router-dom";
import "./ForPros.scss";

const STEPS_PRO = [
  {
    icon: "◎",
    titre: "Hopela capte votre présence.",
    desc: "Votre position géographique devient un signal actif dans votre zone.",
  },
  {
    icon: "◈",
    titre: "Hopela envoie le signal.",
    desc: "Les personnes autour de vous voient que vous êtes déjà là. En temps réel.",
  },
  {
    icon: "◆",
    titre: "L'opportunité se crée.",
    desc: "Chaque trajet devient une opportunité. Chaque zone traversée, un territoire visible.",
  },
];

const ForPros = () => {
  const navigate = useNavigate();

  return (
    <section className="fp-section" id="pour-les-professionnels">
      {/* Fond sombre contrasté */}
      <div className="fp-bg" aria-hidden="true" />

      <div className="fp-inner">

        {/* Colonne gauche — steps visuels */}
        <div className="fp-col-steps">
          <div className="fp-steps-track">
            {STEPS_PRO.map((step, i) => (
              <div key={step.titre} className="fp-step" style={{ "--i": i }}>
                <div className="fp-step-connector">
                  <div className="fp-step-icon">{step.icon}</div>
                  {i < STEPS_PRO.length - 1 && (
                    <div className="fp-step-line" />
                  )}
                </div>
                <div className="fp-step-body">
                  <h4>{step.titre}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite — contenu éditorial */}
        <div className="fp-col-content">
          <div className="fp-eyebrow">Pour les professionnels</div>

          <h2 className="fp-title">
            Vous êtes dans la zone.{" "}
            <em>C'est suffisant.</em>
          </h2>

          <div className="fp-body">
            <p>Pas besoin de publier. Pas besoin d'attendre.</p>
            <p>Pas besoin de dire :</p>
          </div>

          <blockquote className="fp-quote fp-quote--muted">
            "Disponible aujourd'hui de 14h à 17h."
          </blockquote>

          <p className="fp-transition">Vous dites simplement :</p>

          <blockquote className="fp-quote fp-quote--bold">
            « Je suis là. »
          </blockquote>

          <div className="fp-actions">
            <button
              className="fp-btn fp-btn--primary"
              onClick={() => navigate("/login")}
            >
              → Signaler ma présence
            </button>
            <button
              className="fp-btn fp-btn--ghost"
              onClick={() => navigate("/comment-ca-marche")}
            >
              Comment ça marche
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ForPros;