import { useNavigate } from "react-router-dom";
import "./FinalCta.scss";

const FinalCta = () => {
  const navigate = useNavigate();

  return (
    <section className="lp-cta" id="contact">
      <div className="lp-cta-glow" />
      <h2>
        Vous êtes déjà dans la zone.<br />
        <em>Votre présence est une opportunité.</em>
      </h2>
      <p>Hopela envoie le signal. Les opportunités ne sont pas loin. Elles sont déjà autour de vous.</p>

      <div className="lp-cta-actions">
        <button type="button" className="btn-primary" onClick={() => navigate("/login")}>
          → Trouver autour de moi
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/register?role=prestataire")}
        >
          → Signaler ma présence
        </button>
      </div>
    </section>
  );
};

export default FinalCta;