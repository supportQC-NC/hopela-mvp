import { useNavigate } from "react-router-dom";
import "./FinalCta.scss";

const FinalCta = () => {
  const navigate = useNavigate();

  return (
    <section className="lp-cta" id="contact">
      <div className="lp-cta-glow" />
      <h2>Prêt à démarrer ?</h2>
      <p>Rejoignez la communauté Hopela et simplifiez votre quotidien.</p>

      <div className="lp-cta-actions">
        <button type="button" className="btn-primary" onClick={() => navigate("/login")}>
          Trouver un prestataire
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate("/register?role=prestataire")}
        >
          S'inscrire comme pro
        </button>
      </div>
    </section>
  );
};

export default FinalCta;
