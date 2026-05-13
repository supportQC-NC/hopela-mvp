// src/screens/public/PrivacyPolicyScreen.jsx

import { useEffect } from "react";

import "./ConfidentialiteScreen.css";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const SECTIONS = [
  {
    number: "01",
    title: "Collecte des informations",
    text: `Nous collectons certaines données nécessaires au bon fonctionnement
    de la plateforme Hopela : informations de compte, données de connexion,
    géolocalisation des prestataires, ainsi que les informations nécessaires
    à la mise en relation entre utilisateurs et professionnels.`,
  },
  {
    number: "02",
    title: "Utilisation des données",
    text: `Les données collectées permettent d'assurer la sécurité de la plateforme,
    d'améliorer nos services, d'afficher les prestataires à proximité et de
    garantir une expérience utilisateur fluide et personnalisée.`,
  },
  {
    number: "03",
    title: "Protection des données",
    text: `Hopela applique des mesures techniques et organisationnelles afin
    de protéger les informations personnelles contre tout accès non autorisé,
    perte, altération ou divulgation.`,
  },
  {
    number: "04",
    title: "Partage des informations",
    text: `Nous ne vendons jamais vos données personnelles. Certaines informations
    peuvent être partagées uniquement dans le cadre du fonctionnement normal
    du service ou lorsque la loi l'exige.`,
  },
  {
    number: "05",
    title: "Cookies & technologies",
    text: `Des cookies et technologies similaires peuvent être utilisés afin
    d'améliorer les performances, mémoriser vos préférences et analyser
    l'utilisation de la plateforme.`,
  },
  {
    number: "06",
    title: "Vos droits",
    text: `Vous pouvez demander l'accès, la modification ou la suppression
    de vos données personnelles conformément à la réglementation applicable.`,
  },
];

const ConfidentialiteScreen = () => {
  useEffect(() => {
    if (!document.getElementById("hopela-fonts")) {
      const link = document.createElement("link");
      link.id = "hopela-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="privacy-page">

      <Header/>

      {/* ═════ HERO ═════ */}
      <section className="privacy-hero">

        <div className="privacy-hero-bg" />
        <div className="privacy-hero-grid" />

        <div className="privacy-hero-content">

          <div className="privacy-eyebrow fade-up">
            <div className="privacy-eyebrow-line" />
            <span className="privacy-eyebrow-text">
              Confidentialité & sécurité
            </span>
          </div>

          <h1 className="fade-up-1">
            Politique de <br />
            <em>confidentialité</em>
          </h1>

          <p className="privacy-hero-sub fade-up-2">
            Chez Hopela, la protection de vos données personnelles est une
            priorité. Cette politique explique quelles informations sont
            collectées, comment elles sont utilisées et vos droits concernant
            vos données.
          </p>

          <div className="privacy-badge fade-up-3">
            <span className="privacy-live-dot" />
            <span>Mise à jour : Mai 2026</span>
          </div>

        </div>
      </section>

      {/* ═════ CONTENT ═════ */}
      <section className="privacy-content">

        <div className="privacy-intro">
          <h2>
            Transparence, sécurité <em>& confiance</em>
          </h2>

          <p>
            Nous nous engageons à protéger les informations personnelles
            de nos utilisateurs et à maintenir une expérience fiable,
            sécurisée et conforme aux bonnes pratiques numériques.
          </p>
        </div>

        <div className="privacy-grid">
          {SECTIONS.map(({ number, title, text }) => (
            <div key={number} className="privacy-card">

              <div className="privacy-card-number">
                {number}
              </div>

              <h3>{title}</h3>

              <p>{text}</p>

            </div>
          ))}
        </div>

      </section>

      {/* ═════ CTA ═════ */}
      <section className="privacy-cta">

        <div className="privacy-cta-bg" />

        <h2>
          Une plateforme pensée pour la <em>confiance</em>
        </h2>

        <p>
          Nous améliorons continuellement nos pratiques afin de protéger
          vos informations et garantir une utilisation sécurisée de Hopela.
        </p>

        <button className="privacy-btn">
          Nous contacter
        </button>

      </section>

      <Footer/>

    </div>
  );
};

export default ConfidentialiteScreen;