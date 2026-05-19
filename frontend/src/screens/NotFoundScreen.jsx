// src/screens/NotFoundScreen.jsx
import { useNavigate } from "react-router-dom";
import logo from "../logo.png";
import "./NotFoundScreen.scss";

const NotFoundScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="nf-root">

      {/* ── Arrière-plan décoratif ── */}
      <div className="nf-bg">
        <div className="nf-bg__grid" />
        <div className="nf-bg__orb nf-bg__orb--one"  />
        <div className="nf-bg__orb nf-bg__orb--two"  />
        <div className="nf-bg__orb nf-bg__orb--three"/>
        <div className="nf-bg__bubble nf-bg__bubble--a"/>
        <div className="nf-bg__bubble nf-bg__bubble--b"/>
        <div className="nf-bg__bubble nf-bg__bubble--c"/>
        <div className="nf-bg__bubble nf-bg__bubble--d"/>
        <div className="nf-bg__dot nf-bg__dot--a"/>
        <div className="nf-bg__dot nf-bg__dot--b"/>
        <div className="nf-bg__dot nf-bg__dot--c"/>
      </div>

      {/* ── Logo Hopela ── */}
      <div className="nf-logo">
        <img src={logo} alt="Hopela" />
      </div>

      {/* ── Contenu ── */}
      <div className="nf-content">

        {/* Badge */}
        <div className="nf-badge">
          <span className="nf-badge__dot" />
          Erreur 404
        </div>

        {/* Gros 404 */}
        <div className="nf-number">404</div>

        {/* Divider animé */}
        <div className="nf-divider">
          <span className="nf-divider__line" />
          <span className="nf-divider__emoji">🚀</span>
          <span className="nf-divider__line" />
        </div>

        {/* Titre jeu de mots */}
        <h1 className="nf-title">
          <span className="nf-title__hop">Hop là&nbsp;!</span>
          {" "}Cette page s'est envolée
        </h1>

        {/* Description */}
        <p className="nf-sub">
          On dirait que cette page a décollé sans prévenir.
          Pas de panique — sur <strong>Hopela</strong>, on trouve
          toujours la bonne adresse.
        </p>

        {/* Info */}
        <div className="nf-info">
          <span className="nf-info__icon">💡</span>
          <span>
            L'URL saisie est incorrecte ou la page a été déplacée.
            Utilisez les boutons ci-dessous pour reprendre votre navigation.
          </span>
        </div>

        {/* Boutons */}
        <div className="nf-actions">
          <button
            className="nf-btn nf-btn--primary"
            onClick={() => navigate("/")}
          >
            🏠 Retour à l'accueil
          </button>
          <button
            className="nf-btn nf-btn--ghost"
            onClick={() => navigate(-1)}
          >
            ← Page précédente
          </button>
        </div>

        {/* Dots */}
        <div className="nf-dots">
          <span className="nf-dots__item nf-dots__item--active" />
          <span className="nf-dots__item nf-dots__item--md"     />
          <span className="nf-dots__item nf-dots__item--sm"     />
        </div>

      </div>
    </div>
  );
};

export default NotFoundScreen;
