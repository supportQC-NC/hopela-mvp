// src/screens/public/CommentCaMarcheScreen.jsx

import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "./commentCaMarcheScreen.scss";

const STEPS_USER = [
  {
    num: "01",
    icon: "👤",
    title: "Créez votre compte gratuit",
    text: "Inscription en 30 secondes. Renseignez votre nom, email et mot de passe. Aucune carte bancaire requise.",
    badge: "Gratuit & sans engagement",
  },
  {
    num: "02",
    icon: "📍",
    title: "Activez votre position",
    text: "Autorisez la géolocalisation pour voir les prestataires disponibles près de vous sur la carte en temps réel.",
    badge: "Position GPS en temps réel",
  },
  {
    num: "03",
    icon: "🗺️",
    title: "Explorez la carte",
    text: "Voyez en un coup d'œil tous les prestataires disponibles dans votre rayon. Filtrez par métier, ajustez le rayon de recherche.",
    badge: "Filtre par métier & rayon",
  },
  {
    num: "04",
    icon: "📞",
    title: "Contactez directement",
    text: "Appelez directement le prestataire depuis la carte ou depuis le tableau de résultats. Aucun intermédiaire, aucune commission.",
    badge: "Contact direct garanti",
  },
];

const STEPS_PRESTA = [
  {
    num: "01",
    icon: "📝",
    title: "Inscrivez votre entreprise",
    text: "Créez votre profil prestataire avec votre RIDET et votre numéro de téléphone. Notre équipe valide votre compte sous 24h.",
    badge: "Validation sous 24h",
  },
  {
    num: "02",
    icon: "✅",
    title: "Validation par notre équipe",
    text: "Nous vérifions vos informations pour garantir la qualité de la plateforme. Vous recevez un email de confirmation.",
    badge: "Compte certifié",
  },
  {
    num: "03",
    icon: "📍",
    title: "Partagez votre position",
    text: "Activez le partage depuis votre tableau de bord. Votre marqueur apparaît en temps réel sur la carte pour tous les utilisateurs près de vous.",
    badge: "Visibilité immédiate",
  },
  {
    num: "04",
    icon: "📱",
    title: "Recevez des appels",
    text: "Les clients vous contactent directement. Gérez votre disponibilité en un tap — arrêtez le partage quand vous n'êtes plus disponible.",
    badge: "Disponibilité flexible",
  },
];

const FAQ = [
  {
    q: "Hopela est-il gratuit ?",
    a: "Hopela propose un accès gratuit aux particuliers pour consulter la carte et contacter directement un prestataire. Pour accéder aux fonctionnalités avancées, un abonnement est disponible. Les prestataires s’abonnent à Hopela pour signaler leur présence et capter des opportunités dans leur zone.",
  },
  {
    q: "Comment mes données de localisation sont-elles gérées ?",
    a: "Votre position n’est jamais partagée sans votre accord. Pour les prestataires, elle est visible uniquement lorsque le signal est activé. Vous restez maître de votre présence — vous allumez, vous éteignez.",
  },
  {
    q: "Puis-je utiliser Hopela sans créer de compte ?",
    a: "Oui. Vous pouvez consulter la carte, voir les prestataires déjà dans votre zone et les contacter directement — sans créer de compte. Un compte gratuit est requis uniquement pour sauvegarder des favoris ou signaler votre besoin.",
  },
  {
    q: "Comment devenir prestataire sur Hopela ?",
    a: "Créez votre compte prestataire avec votre numéro RIDET et votre téléphone professionnel. Notre équipe valide votre inscription sous 24 heures. Une fois validé, votre signal est actif — vous apparaissez sur la carte dès que vous signalez votre présence.",
  },
  {
    q: "Hopela couvre-t-il toute la Nouvelle-Calédonie ?",
    a: "Hopela est actuellement optimisé pour le Grand Nouméa — Nouméa, Dumbéa, Païta et Mont-Dore. L’extension vers d’autres zones est prévue en fonction de la croissance de la plateforme.",
  },
];

const CommentCaMarcheScreen = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="ccm-root">
      <Header />

      <section className="ccm-hero">
        <div className="ccm-hero-inner">
          <div className="ccm-eyebrow">Guide d'utilisation</div>
          <h1>
            Comment ça
            <br />
            <em>marche ?</em>
          </h1>
          <p>
            Hopela est simple, rapide et gratuit. Voici comment trouver un
            prestataire ou proposer vos services en quelques étapes.
          </p>
        </div>
      </section>

      <section className="ccm-section">
        <div className="ccm-section-head">
          <div className="ccm-eyebrow">Particuliers</div>
          <h2>
            Trouver un prestataire <em>disponible</em>
          </h2>
          <p>Un parcours simple pour passer du besoin au contact direct.</p>
        </div>

        <div className="ccm-steps">
          {STEPS_USER.map((s) => (
            <article className="ccm-step" key={s.num}>
              <div className="ccm-step-num">{s.num}</div>
              <div className="ccm-step-content">
                <div className="ccm-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span>{s.badge}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ccm-section">
        <div className="ccm-section-head">
          <div className="ccm-eyebrow">Prestataires</div>
          <h2>
            Être visible en <em>temps réel</em>
          </h2>
          <p>Activez votre disponibilité et recevez des appels directement.</p>
        </div>

        <div className="ccm-steps">
          {STEPS_PRESTA.map((s) => (
            <article className="ccm-step" key={s.num}>
              <div className="ccm-step-num">{s.num}</div>
              <div className="ccm-step-content">
                <div className="ccm-step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <span>{s.badge}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ccm-section">
        <div className="ccm-section-head">
          <div className="ccm-eyebrow">Profils</div>
          <h2>
            Ce que vous <em>obtenez</em>
          </h2>
          <p>Une expérience adaptée selon votre usage.</p>
        </div>

        <div className="ccm-two-col">
          <article className="ccm-col-card">
            <h3>
              Particulier <em>👤</em>
            </h3>
            <ul>
              <li>🗺️ Carte en temps réel — prestataires déjà dans votre zone</li>
              <li>📍  Géolocalisation immédiate</li>
              <li>📞 Contact direct sans intermédiaire</li>
              <li>🔍 Filtrage par métier</li>
              <li>🔍 Position enregistrée</li>
              <li>🔍 Rayon de recherche personnalisable</li>
              <li>🔍  Favoris — sauvegardez vos prestataires</li>
              <li>🔍 Message de besoin — 144 caractères pour signaler votre demande aux prestataires de votre zone</li>
              <li>🆓 Accès gratuit</li>
            </ul>
          </article>

          <article className="ccm-col-card">
            <h3>
              Prestataire <em>🔧</em>
            </h3>
            <ul>
              <li>📍 Visibilité sur la carte</li>
              <li>⚡ Partage de position activable / désactivable </li>
              <li>✅ Profil certifié avec RIDET vérifié</li>
              <li>⚡Affichage métier et coordonnées</li>
              <li>🔧 Dashboard mobile-first</li>
              <li>Message publicitaire 144 caractères — promotion, offre du moment, produit à liquider — visible par tous les clients de votre zone</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="ccm-section">
        <div className="ccm-section-head">
          <div className="ccm-eyebrow">FAQ</div>
          <h2>
            Questions <em>fréquentes</em>
          </h2>
          <p>Tout ce que vous devez savoir avant de commencer.</p>
        </div>

        <div className="ccm-faq">
          {FAQ.map((f, i) => (
            <article className="ccm-faq-item" key={f.q}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{f.q}</span>
                <strong>{openFaq === i ? "−" : "+"}</strong>
              </button>
              {openFaq === i && <p>{f.a}</p>}
            </article>
          ))}
        </div>
      </section>

      <section className="ccm-cta">
        <h2>
          Prêt à <em>commencer</em> ?
        </h2>
        <p>
          Rejoignez Hopela gratuitement et trouvez les prestataires disponibles
          près de vous.
        </p>
        <div className="ccm-cta-row">
          <Link to="/login" className="ccm-btn-primary">
            Créer un compte →
          </Link>
          <Link to="/services" className="ccm-btn-secondary">
            Voir les services
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CommentCaMarcheScreen;
