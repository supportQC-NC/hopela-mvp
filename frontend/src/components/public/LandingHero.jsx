
// export default LandingHero;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingHero.scss";

const heroSlides = [
  {
    title: (
      <>
        Hopela. <br />
        <em>Déjà là.</em>
      </>
    ),
    subtitle:
      "Hopela capte l'offre et la demande du marché de la prestation mobile.",
  },
  {
    title: (
      <>
        Vous êtes dans la zone — <br />
        <em>signalez votre présence.</em>
      </>
    ),
    subtitle:
      "Vous cherchez quelqu'un — trouvez qui est déjà là.",
  },
  {
    title: (
      <>
        Pas une publication. <br />
        <em>Un signal. Une opportunité.</em>
      </>
    ),
    subtitle:
      "Pas une attente. Un signal. Une opportunité.",
  },
];

const LandingHero = ({ prestatairesEnLigne = null }) => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentSlide = heroSlides[activeSlide];

  return (
    <section className="lp-hero" id="accueil">
      <div className="lp-hero-bg" />

      <div className="lp-hero-content">
        <div className="lp-eyebrow fade-up">
          <span className="lp-eyebrow-text">Nouvelle-Calédonie</span>
        </div>

        <div key={activeSlide} className="lp-hero-dynamic">
          <h1>{currentSlide.title}</h1>

          <p className="lp-hero-sub">{currentSlide.subtitle}</p>
        </div>

        <div className="lp-hero-actions fade-up-3">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            → Trouver autour de moi
          </button>

          <button className="btn-secondary" onClick={() => navigate("/login")}>
            → Signaler ma présence
          </button>
        </div>

        {prestatairesEnLigne !== null && (
          <div className="lp-hero-badge fade-up-4">
            <span className="lp-live-dot" />
            <span>
              <strong>{prestatairesEnLigne}</strong> prestataire
              {prestatairesEnLigne > 1 && "s"} connecté
              {prestatairesEnLigne > 1 && "s"}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingHero;