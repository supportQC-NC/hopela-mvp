import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingHero.scss";

const heroSlides = [
  {
    title: (
   <>
  Hop là ! prestataire <br />
  <em> déjà là</em>
</>
    ),
    subtitle:
      "La plateforme géolocalisée qui connecte vos besoins aux bons professionnels autour de vous.",
  },
  {
    title: (
      <>
        Un service <br />
        <em>proche de vous pour vous</em>
      </>
    ),
    subtitle:
      "Localisez rapidement les prestataires disponibles en Nouvelle-Calédonie, en temps réel.",
  },
  {
    title: (
      <>
        Booster <br />
        <em>d'opportunités</em>
      </>
    ),
    subtitle:
      "Rejoignez une communauté de prestataires locaux et accédez à une clientèle engagée en Nouvelle-Calédonie.",
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
            Trouver un prestataire
          </button>

          <button className="btn-secondary" onClick={() => navigate("/login")}>
            Devenir prestataire
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
