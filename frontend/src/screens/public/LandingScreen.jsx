// src/screens/public/LandingScreen.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Home,
  Sparkles,
  HeartPulse,
  Accessibility,
  Car,
  BookOpen,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  Zap,
  Shield,
  Users,
} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import PublicMap from "../../components/map/PublicMap";
import "./LandingScreen.scss";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Mapping icône Lucide ─────────────────────────────────────────────────────
const LUCIDE_MAP = {
  wrench: Wrench,
  home: Home,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  accessibility: Accessibility,
  car: Car,
  "book-open": BookOpen,
};

const CatIcon = ({ icone, size = 26 }) => {
  const Icon = LUCIDE_MAP[icone] || FolderOpen;
  return <Icon size={size} strokeWidth={1.5} />;
};

// ── Cards avantages (codées en dur) ─────────────────────────────────────────
const AVANTAGES = [
  {
    icon: <Zap size={24} className="text-yellow-400" />,
    titre: "Disponibilité immédiate",
    desc: "Trouvez un prestataire disponible maintenant grâce à la géolocalisation en direct.",
    accent: "#145C45",
  },
  {
    icon: <Shield size={24} className="text-blue-400" />,
    titre: "Prestataires vérifiés",
    desc: "Identité et qualifications contrôlées pour une tranquillité d'esprit totale.",
    accent: "#1A2D4A",
  },
  {
    icon: <Users size={24} className="text-green-400" />,
    titre: "Communauté locale",
    desc: "Soutenez l'économie locale en faisant appel à des talents de Nouvelle-Calédonie.",
    accent: "#145C45",
  },
];

// ── Étapes ───────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    titre: "Localisez",
    desc: "Ouvrez la carte et voyez qui est disponible autour de vous en temps réel.",
  },
  {
    num: "02",
    titre: "Choisissez",
    desc: "Filtrer par métier, consultez les profils et les avis des autres utilisateurs.",
  },
  {
    num: "03",
    titre: "Contactez",
    desc: "Appelez ou messagez directement le prestataire pour fixer un rendez-vous.",
  },
];

// ── Témoignages ──────────────────────────────────────────────────────────────
const TEMOIGNAGES = [
  {
    nom: "Marie K.",
    quartier: "Nouméa",
    texte:
      "J'ai trouvé un plombier en 5 minutes, intervention dans l'heure. Super service !",
    note: 5,
  },
  {
    nom: "Jean-Louis M.",
    quartier: "Dumbéa",
    texte:
      "Très pratique pour voir qui est disponible sans avoir à appeler 10 personnes.",
    note: 5,
  },
  {
    nom: "Sophie T.",
    quartier: "Mont-Dore",
    texte:
      "L'interface est fluide et les prestataires sont vraiment qualifiés.",
    note: 5,
  },
];

// ── Plans Tarifaires ─────────────────────────────────────────────────────────
const PRICING_PLANS = [
  {
    id: "monthly",
    name: "Mensuel",
    price: 3600,
    period: "/ mois",
    desc: "Flexibilité totale",
    features: [
      "Accès illimité à la carte",
      "Profils vérifiés",
      "Support par email",
      "Sans engagement",
    ],
    featured: false,
  },
  {
    id: "annual",
    name: "Annuel",
    price: 3600,
    period: "/ mois",
    desc: "Engagement 12 mois (3 mois offerts)",
    features: [
      "Tout le plan Mensuel",
      "3 mois OFFERTS (payez 9 mois)",
      "Priorité au support",
      "Badge 'Premium' sur votre profil",
    ],
    featured: true,
  },
  {
    id: "quarterly",
    name: "Trimestriel",
    price: 3600,
    period: "/ mois",
    desc: "Engagement 3 mois",
    features: [
      "Accès illimité à la carte",
      "Profils vérifiés",
      "Support prioritaire",
      "Facturation tous les 3 mois",
    ],
    featured: false,
  },
];

// ── Stats publiques ──────────────────────────────────────────────────────────
const usePublicStats = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/api/users/stats/public`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);
  return stats;
};

// ─────────────────────────────────────────────────────────
// Bloc Stats (CORRIGÉ)
// ─────────────────────────────────────────────────────────
// const StatsBloc = () => {
//   const stats = usePublicStats();

//   // Données par défaut au cas où l'API ne renvoie pas un tableau ou ne répond pas
//   const defaultStats = [
//     { label: "Prestataires", value: "120+" },
//     { label: "Interventions", value: "3.5k" },
//     { label: "Satisfaits", value: "98%" },
//   ];

//   // FIX : On vérifie explicitement que stats est un tableau
//   const displayStats = Array.isArray(stats) ? stats : defaultStats;

//   return (
//     <section className="lp-stats-wrap">
//       <div className="lp-stats">
//         {displayStats.map((s, i) => (
//           <div key={i} className="lp-stat">
//             <div className="lp-stat-value">{stats ? s.value : "..."}</div>
//             <div className="lp-stat-label">{s.label}</div>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// ─────────────────────────────────────────────────────────
// Carrousel catégories (Avec Auto-scroll)
// ─────────────────────────────────────────────────────────
const CategoriesCarousel = () => {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Auto Scroll Logic
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => r.json())
      .then((d) => {
        setCats(Array.isArray(d) ? d : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const checkScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 10);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      checkScroll(); // Init check
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [cats, checkScroll]);

  // Défilement automatique
  useEffect(() => {
    if (isPaused || loading) return;

    const interval = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;

      // Si on est tout à droite, on revient au début
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 300, behavior: "smooth" });
      }
    }, 1500); // Défile toutes les 1.5 secondes

    return () => clearInterval(interval);
  }, [isPaused, loading]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (loading)
    return (
      <section className="lp-section">
        <div className="lp-stats">
          <div className="lp-stat">Chargement...</div>
        </div>
      </section>
    );

  return (
    <section className="lp-section lp-carousel-section" id="categories">
      <div className="lp-carousel-header">
        <div style={{ maxWidth: 600 }}>
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-text">Nos services</span>
          </div>
          <h2 className="lp-section-title">
            Explorez nos <em>catégories</em>
          </h2>
          <p className="lp-section-sub">
            Un large éventail de métiers disponibles pour répondre à tous vos
            besoins au quotidien.
          </p>
        </div>
        <div className="lp-carousel-arrows">
          <button
            className={`lp-arrow${!canScrollLeft ? " lp-arrow--disabled" : ""}`}
            onClick={() => scroll(-1)}
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className={`lp-arrow${!canScrollRight ? " lp-arrow--disabled" : ""}`}
            onClick={() => scroll(1)}
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        className="lp-carousel-track"
        ref={trackRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {cats.map((cat) => (
          <div
            key={cat._id}
            className="lp-cat-card"
            onClick={() => navigate(`/services/categories/${cat._id}`)}
            role="button"
            tabIndex={0}
          >
            <div className="lp-cat-icon">
              <CatIcon icone={cat.icone} size={28} />
            </div>
            <div className="lp-cat-nom">{cat.nom}</div>
            {cat.description && (
              <div className="lp-cat-desc">{cat.description}</div>
            )}
            <div className="lp-cat-link">
              Découvrir <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────
// Bloc Pricing
// ─────────────────────────────────────────────────────────
const PricingBloc = () => {
  return (
    <section className="lp-pricing-section" id="tarifs">
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div className="lp-eyebrow">
          <span className="lp-eyebrow-text">Tarification</span>
        </div>
        <h2 className="lp-section-title">
          Choisissez votre <em>abonnement</em>
        </h2>
        <p className="lp-section-sub" style={{ margin: "0 auto" }}>
          Des offres simples et transparentes pour les particuliers comme pour
          les professionnels.
        </p>
      </div>

      <div className="lp-pricing-grid">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`lp-price-card ${plan.featured ? "lp-price-card--featured" : ""}`}
          >
            {plan.featured && <div className="lp-badge">Le plus populaire</div>}

            <div className="lp-plan-name">{plan.name}</div>

            <div className="lp-price-wrapper">
              <span className="lp-price-currency">XPF</span>
              <span className="lp-price-amount">
                {plan.price.toLocaleString()}
              </span>
              <span className="lp-price-period">{plan.period}</span>
            </div>

            <div className="lp-price-desc">{plan.desc}</div>

            <ul className="lp-features-list">
              {plan.features.map((feat, i) => (
                <li key={i}>
                  <Check size={16} strokeWidth={3} />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              className={`lp-price-btn ${plan.featured ? "btn-primary" : ""}`}
            >
              {plan.featured ? "Commencer maintenant" : "Choisir cette offre"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────
const LandingScreen = () => {
  const navigate = useNavigate();
  const [prestatairesEnLigne, setPrestatairesEnLigne] = useState(null);
  const handleCount = useCallback((n) => setPrestatairesEnLigne(n), []);

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
    <div style={{ background: "var(--dark)", minHeight: "100vh" }}>
      <Header />

      {/* ══ HERO ══ */}
      <section className="lp-hero" id="accueil">
        <div className="lp-hero-bg" />
        <div className="lp-hero-content">
          <div className="lp-eyebrow fade-up">
            <span className="lp-eyebrow-text">Nouvelle-Calédonie</span>
          </div>
          <h1 className="fade-up-1">
            Trouvez votre
            <br />
            <em>prestataire</em> idéal
          </h1>
          <p className="lp-hero-sub fade-up-2">
            La première plateforme de mise en relation géolocalisée en temps
            réel. Simple, rapide et sécurisé pour tous vos besoins.
          </p>
          <div className="lp-hero-actions fade-up-3">
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Trouver un prestataire
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/login")}
            >
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

      {/* ══ CARTE ══ */}
      <section className="lp-map-section" id="carte">
        <div className="lp-map-header">
          <div>
            <div className="lp-eyebrow">
              <span className="lp-eyebrow-text">Carte interactive</span>
            </div>
            <h2 className="lp-map-title">
              Ils sont <em>près de chez vous</em>
            </h2>
          </div>
          <p className="lp-map-subtitle">
            Visualisez les disponibilités en temps réel
          </p>
        </div>
        <div className="lp-map-container">
          <PublicMap onCountChange={handleCount} />
        </div>
      </section>

      {/* ══ STATS ══ */}
      {/* <StatsBloc /> */}

      {/* ══ CARROUSEL CATÉGORIES ══ */}
      <CategoriesCarousel />

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section className="lp-section" id="comment-ca-marche">
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-text">Processus</span>
          </div>
          <h2 className="lp-section-title">
            Comment ça <em>marche</em> ?
          </h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((step, i) => (
            <div key={i} className="lp-step">
              <span className="lp-step-num">{step.num}</span>
              <div className="lp-step-content">
                <h3>{step.titre}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AVANTAGES ══ */}
      <section className="lp-section lp-avantages-section">
        <div className="lp-eyebrow">
          <span className="lp-eyebrow-text">Avantages</span>
        </div>
        <h2 className="lp-section-title">
          Pourquoi <em>Hopela</em> ?
        </h2>
        <div className="lp-avantages-grid">
          {AVANTAGES.map((av, i) => (
            <div className="lp-av-card" key={i}>
              <div
                className="lp-av-bar"
                style={{ background: av.accent }}
              ></div>
              {av.icon}
              <div className="lp-av-titre">{av.titre}</div>
              <div className="lp-av-desc">{av.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <PricingBloc />

      {/* ══ TÉMOIGNAGES ══ */}
      <section className="lp-section" id="avis">
        <div className="lp-eyebrow">
          <span className="lp-eyebrow-text">Avis clients</span>
        </div>
        <h2 className="lp-section-title">
          Ils nous font <em>confiance</em>
        </h2>
        <div className="lp-temoignages">
          {TEMOIGNAGES.map((t, i) => (
            <article key={i} className="lp-temoignage">
              <div className="lp-stars">{"★".repeat(t.note)}</div>
              <p className="lp-texte">"{t.texte}"</p>
              <div className="lp-author">
                <div className="lp-avatar">{t.nom[0]}</div>
                <div>
                  <div className="lp-author-name">{t.nom}</div>
                  <div style={{ fontSize: 12, color: "var(--cream-dim)" }}>
                    {t.quartier}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <div className="lp-cta" id="contact">
        <div className="lp-cta-glow" />
        <h2 style={{ position: "relative", zIndex: 2, marginBottom: 20 }}>
          Prêt à démarrer ?
        </h2>
        <p
          style={{
            position: "relative",
            zIndex: 2,
            marginBottom: 40,
            maxWidth: 500,
            margin: "0 auto 40px",
          }}
        >
          Rejoignez la communauté Hopela et simplifiez votre quotidien.
        </p>
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            gap: 16,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Trouver un prestataire
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/register?role=prestataire")}
          >
            S'inscrire comme pro
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingScreen;
