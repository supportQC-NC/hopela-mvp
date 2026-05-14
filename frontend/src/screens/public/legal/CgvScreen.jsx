// src/screens/public/CGVScreen.jsx

import { useEffect } from "react";

import "./CgvScreen.css";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const SECTIONS = [
  {
    number: "01",
    title: "Objet des conditions",
    text: `Les présentes Conditions Générales de Vente définissent les modalités
    d'utilisation des services proposés sur la plateforme ainsi que les droits
    et obligations des utilisateurs et de la société exploitante.`,
  },
  {
    number: "02",
    title: "Accès à la plateforme",
    text: `L'accès à certains services nécessite la création d'un compte utilisateur.
    Chaque utilisateur s'engage à fournir des informations exactes et à garantir
    la confidentialité de ses identifiants de connexion.`,
  },
  {
    number: "03",
    title: "Services & prestations",
    text: `La plateforme permet la mise en relation entre utilisateurs et
    professionnels. Les prestations proposées restent sous la responsabilité
    des prestataires concernés.`,
  },
  {
    number: "04",
    title: "Paiements",
    text: `Les paiements effectués sur la plateforme sont sécurisés. Les tarifs,
    commissions et modalités de facturation sont affichés avant toute validation
    de commande ou réservation.`,
  },
  {
    number: "05",
    title: "Responsabilités",
    text: `La plateforme ne pourra être tenue responsable des dommages indirects,
    interruptions temporaires de service ou litiges entre utilisateurs et
    prestataires.`,
  },
  {
    number: "06",
    title: "Annulation & remboursement",
    text: `Les demandes d'annulation ou de remboursement sont soumises aux
    conditions spécifiques du service réservé et peuvent varier selon le
    prestataire concerné.`,
  },
  {
    number: "07",
    title: "Propriété intellectuelle",
    text: `L'ensemble des contenus, éléments graphiques, logos et fonctionnalités
    présents sur la plateforme sont protégés par les lois relatives à la
    propriété intellectuelle.`,
  },
  {
    number: "08",
    title: "Modification des conditions",
    text: `Nous nous réservons le droit de modifier les présentes Conditions
    Générales de Vente à tout moment afin de garantir leur conformité et
    l'évolution des services proposés.`,
  },
];

const CGVScreen = () => {
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
    <div className="cgv-page">

      <Header />

      {/* ═════ HERO ═════ */}
      <section className="cgv-hero">

        <div className="cgv-hero-bg" />
        <div className="cgv-hero-grid" />

        <div className="cgv-hero-content">

          <div className="cgv-eyebrow fade-up">
            <div className="cgv-eyebrow-line" />

            <span className="cgv-eyebrow-text">
              Conditions générales
            </span>
          </div>

          <h1 className="fade-up-1">
            Conditions <br />
            <em>Générales de Vente</em>
          </h1>

          <p className="cgv-hero-sub fade-up-2">
            Les présentes Conditions Générales de Vente encadrent
            l'utilisation de la plateforme, les prestations proposées
            ainsi que les obligations des utilisateurs et professionnels.
          </p>

          <div className="cgv-badge fade-up-3">
            <span className="cgv-live-dot" />
            <span>Mise à jour : Mai 2026</span>
          </div>

        </div>
      </section>

      {/* ═════ CONTENT ═════ */}
      <section className="cgv-content">

        <div className="cgv-intro">

          <h2>
            Transparence, engagement <em>& conformité</em>
          </h2>

          <p>
            Notre objectif est de garantir une expérience fiable,
            sécurisée et transparente pour l'ensemble des utilisateurs
            et partenaires de la plateforme.
          </p>

        </div>

        <div className="cgv-grid">
          {SECTIONS.map(({ number, title, text }) => (
            <div key={number} className="cgv-card">

              <div className="cgv-card-number">
                {number}
              </div>

              <h3>{title}</h3>

              <p>{text}</p>

            </div>
          ))}
        </div>

      </section>

      {/* ═════ CTA ═════ */}
      <section className="cgv-cta">

        <div className="cgv-cta-bg" />

        <h2>
          Une relation basée sur la <em>confiance</em>
        </h2>

        <p>
          Nous mettons continuellement à jour nos conditions afin
          d'assurer la transparence, la sécurité et la qualité
          des services proposés sur la plateforme.
        </p>

        <button className="cgv-btn">
          Nous contacter
        </button>

      </section>

      <Footer />

    </div>
  );
};

export default CGVScreen;