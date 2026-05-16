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
} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import PublicMap from "../../components/map/PublicMap";
import "./LandingScreen.css";

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
    icon: "📍",
    titre: "Géolocalisation en temps réel",
    desc: "Visualisez les prestataires disponibles autour de vous maintenant, sur une carte interactive live.",
    accent: "#c9a84c",
  },
  {
    icon: "✅",
    titre: "Prestataires vérifiés",
    desc: "Chaque professionnel est validé par notre équipe : vérification du RIDET et identité contrôlée.",
    accent: "#4ade80",
  },
  {
    icon: "📞",
    titre: "Contact direct & sans frais",
    desc: "Appelez directement le prestataire. Aucune commission, aucun intermédiaire, aucun frais cachés.",
    accent: "#60a5fa",
  },
  {
    icon: "⚡",
    titre: "Disponibilité immédiate",
    desc: "Le prestataire partage sa position en direct. Vous savez en un coup d'œil s'il est disponible.",
    accent: "#f59e0b",
  },
  {
    icon: "🗺️",
    titre: "Couverture Grand Nouméa",
    desc: "Nouméa, Dumbéa, Paita, Mont-Dore — tous les prestataires de la zone sur une seule plateforme.",
    accent: "#a78bfa",
  },
  {
    icon: "🔒",
    titre: "Données protégées",
    desc: "Vos informations personnelles sont sécurisées et ne sont jamais partagées sans votre consentement.",
    accent: "#34d399",
  },
];

// ── Étapes ───────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: "01",
    icon: "🗺️",
    titre: "Consultez la carte",
    desc: "Visualisez en temps réel tous les prestataires disponibles autour de vous grâce à la géolocalisation.",
  },
  {
    num: "02",
    icon: "👆",
    titre: "Choisissez un profil",
    desc: "Consultez le métier et les services de chaque prestataire. Cliquez sur un marqueur pour les détails.",
  },
  {
    num: "03",
    icon: "✅",
    titre: "Contactez & confirmez",
    desc: "Prenez contact directement avec le prestataire et planifiez votre intervention en quelques secondes.",
  },
];

// ── Témoignages ──────────────────────────────────────────────────────────────
const TEMOIGNAGES = [
  {
    nom: "Marie K.",
    quartier: "Anse Vata",
    texte:
      "Électricien trouvé en 3 minutes, intervention le jour même. Incroyable !",
    note: 5,
  },
  {
    nom: "Samuel W.",
    quartier: "Dumbéa",
    texte:
      "Le plombier était professionnel et rapide. Je recommande Hopela à tous.",
    note: 5,
  },
  {
    nom: "Angélique T.",
    quartier: "Mont-Dore",
    texte:
      "La carte en temps réel c'est génial, on voit exactement où est le prestataire.",
    note: 5,
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
// Bloc Stats
// ─────────────────────────────────────────────────────────
const StatsBloc = ({ stats }) => {
  const items = [
    {
      value: stats ? `${stats.prestatairesActifs}+` : null,
      label: "Prestataires actifs",
      icon: "🛠️",
    },
    {
      value: stats ? `${stats.usersActifs}+` : null,
      label: "Utilisateurs inscrits",
      icon: "👥",
    },
    { value: "< 5min", label: "Temps de réponse moyen", icon: "⚡" },
  ];
  return (
    <div className="lp-stats-wrap">
      <div className="lp-stats">
        {items.map(({ value, label, icon }) => (
          <div key={label} className="lp-stat">
            <span className="lp-stat-icon">{icon}</span>
            <div className={`lp-stat-value${!value ? " lp-skeleton" : ""}`}>
              {value ?? "···"}
            </div>
            <div className="lp-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// Carrousel catégories
// ─────────────────────────────────────────────────────────
const CategoriesCarousel = () => {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((r) => r.json())
      .then((d) => {
        setCats(Array.isArray(d) ? d : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Mettre à jour les flèches selon la position du scroll
  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => el.removeEventListener("scroll", updateArrows);
  }, [cats, updateArrows]);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    // Largeur d'une card + gap
    const cardW = el.querySelector(".lp-cat-card")?.offsetWidth || 280;
    el.scrollBy({ left: dir * (cardW + 16), behavior: "smooth" });
  };

  // Skeleton cards
  const skeletons = [...Array(5)].map((_, i) => (
    <div key={i} className="lp-cat-card lp-cat-skeleton" />
  ));

  return (
    <section className="lp-section lp-carousel-section" id="categories">
      {/* Header */}
      <div className="lp-carousel-header">
        <div>
          <div className="lp-eyebrow">
            <div className="lp-eyebrow-line" />
            <span className="lp-eyebrow-text">Nos services</span>
          </div>
          <h2 className="lp-section-title">
            Nos <em>catégories</em>
          </h2>
          <p className="lp-section-sub">
            Des prestataires qualifiés dans tous les domaines, disponibles
            maintenant près de chez vous.
          </p>
        </div>

        {/* Flèches — desktop */}
        <div className="lp-carousel-arrows">
          <button
            className={`lp-arrow${canPrev ? "" : " lp-arrow--disabled"}`}
            onClick={() => scroll(-1)}
            aria-label="Précédent"
            disabled={!canPrev}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className={`lp-arrow${canNext ? "" : " lp-arrow--disabled"}`}
            onClick={() => scroll(1)}
            aria-label="Suivant"
            disabled={!canNext}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Track */}
      <div className="lp-carousel-track" ref={trackRef}>
        {loading
          ? skeletons
          : cats.map((cat) => (
              <div
                key={cat._id}
                className="lp-cat-card"
                onClick={() => navigate(`/services/categories/${cat._id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigate(`/services/categories/${cat._id}`)
                }
                aria-label={`Voir ${cat.nom}`}
              >
                {/* Icône */}
                <div className="lp-cat-icon">
                  <CatIcon icone={cat.icone} size={24} />
                </div>

                {/* Contenu */}
                <div className="lp-cat-nom">{cat.nom}</div>
                {cat.description && (
                  <div className="lp-cat-desc">{cat.description}</div>
                )}

                {/* Lien */}
                <div className="lp-cat-link">
                  Voir les métiers <span className="lp-cat-arrow">→</span>
                </div>
              </div>
            ))}
      </div>

      {/* Indicateur de scroll — mobile */}
      <div className="lp-carousel-hint">
        <span>Faites glisser pour voir plus</span>
        <ChevronRight size={13} />
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────
// Cards avantages
// ─────────────────────────────────────────────────────────
const AvantagesBloc = () => (
  <section className="lp-section lp-avantages-section" id="avantages">
    <div className="lp-eyebrow">
      <div className="lp-eyebrow-line" />
      <span className="lp-eyebrow-text">Pourquoi Hopela</span>
    </div>
    <h2 className="lp-section-title">
      Conçu pour <em>vous</em>
    </h2>
    <p className="lp-section-sub">
      Une plateforme pensée pour les habitants de Nouvelle-Calédonie, du
      particulier au professionnel.
    </p>
    <div className="lp-avantages-grid">
      {AVANTAGES.map(({ icon, titre, desc, accent }) => (
        <div className="lp-av-card" key={titre}>
          {/* Ligne de couleur en haut */}
          <div className="lp-av-bar" style={{ background: accent }} />
          <div className="lp-av-icon">{icon}</div>
          <div className="lp-av-titre">{titre}</div>
          <div className="lp-av-desc">{desc}</div>
        </div>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────────────────
// Témoignages
// ─────────────────────────────────────────────────────────
const TemoignagesBloc = () => {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const x0 = useRef(null);

  const goTo = (i) => {
    setActive(i);
    trackRef.current?.scrollTo({
      left: trackRef.current.offsetWidth * i,
      behavior: "smooth",
    });
  };
  const onTouchStart = (e) => {
    x0.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (x0.current === null) return;
    const dx = x0.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) < 40) return;
    if (dx > 0 && active < TEMOIGNAGES.length - 1) goTo(active + 1);
    if (dx < 0 && active > 0) goTo(active - 1);
    x0.current = null;
  };
  const onScroll = () => {
    if (!trackRef.current) return;
    setActive(
      Math.round(trackRef.current.scrollLeft / trackRef.current.offsetWidth),
    );
  };

  return (
    <section className="lp-section" id="avis">
      <div className="lp-eyebrow">
        <div className="lp-eyebrow-line" />
        <span className="lp-eyebrow-text">Ils nous font confiance</span>
      </div>
      <h2 className="lp-section-title">
        Ce qu'ils en <em>pensent</em>
      </h2>
      <p className="lp-section-sub">
        Des centaines de Calédoniens utilisent Hopela chaque jour.
      </p>
      <div
        className="lp-temoignages"
        ref={trackRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onScroll={onScroll}
      >
        {TEMOIGNAGES.map(({ nom, quartier, texte, note }) => (
          <article key={nom} className="lp-temoignage">
            <div className="lp-stars">{"★".repeat(note)}</div>
            <p className="lp-texte">{texte}</p>
            <div className="lp-author">
              <div className="lp-avatar">{nom[0]}</div>
              <div>
                <div className="lp-author-name">{nom}</div>
                <div className="lp-author-loc">📍 {quartier}</div>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="lp-dots">
        {TEMOIGNAGES.map((_, i) => (
          <button
            key={i}
            className={`lp-dot${i === active ? " lp-dot--on" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Avis ${i + 1}`}
          />
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
  const stats = usePublicStats();

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
    <div style={{ background: "#0a0804", minHeight: "100vh" }}>
      <Header />

      {/* ══ HERO ══ */}
      <section className="lp-hero" id="accueil">
        <div className="lp-hero-bg" />
        <div className="lp-hero-grid" />
        <div className="lp-hero-content">
          <div className="lp-eyebrow fade-up">
            <div className="lp-eyebrow-line" />
            <span className="lp-eyebrow-text">Nouvelle-Calédonie</span>
          </div>
          <h1 className="fade-up-1">
            Trouvez un
            <br />
            <em>prestataire</em>
            <br />
            en temps réel
          </h1>
          <p className="lp-hero-sub fade-up-2">
            Hopela connecte les particuliers aux prestataires de services locaux
            géolocalisés en direct. Disponibilité instantanée, partout en
            Calédonie.
          </p>
          <div className="lp-hero-actions fade-up-3">
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Trouver un prestataire
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/login")}
            >
              Devenir prestataire →
            </button>
          </div>
          <div className="lp-hero-badge fade-up-4">
            <span className="lp-live-dot" />
            {prestatairesEnLigne === null ? (
              <span>Prestataires disponibles en ce moment</span>
            ) : prestatairesEnLigne === 0 ? (
              <span>Aucun prestataire en ligne pour le moment</span>
            ) : (
              <span>
                <strong style={{ color: "#4caf6e", fontWeight: 700 }}>
                  {prestatairesEnLigne}
                </strong>{" "}
                prestataire{prestatairesEnLigne > 1 ? "s" : ""} disponible
                {prestatairesEnLigne > 1 ? "s" : ""} en ce moment
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ══ CARTE ══ */}
      <section className="lp-map-section" id="carte">
        <div className="lp-map-header">
          <div>
            <div className="lp-eyebrow" style={{ marginBottom: 10 }}>
              <div className="lp-eyebrow-line" />
              <span className="lp-eyebrow-text">
                Géolocalisation temps réel
              </span>
            </div>
            <h2 className="lp-map-title">
              Ils sont <em>près de vous</em>
            </h2>
          </div>
          <p className="lp-map-subtitle">
            Chaque point est un prestataire disponible maintenant
          </p>
        </div>
        <div className="lp-map-container">
          <PublicMap onCountChange={handleCount} />
        </div>
      </section>

      {/* ══ STATS ══ */}
      <StatsBloc stats={stats} />

      {/* ══ CARROUSEL CATÉGORIES ══ */}
      <CategoriesCarousel />

      {/* ══ COMMENT ÇA MARCHE ══ */}
      <section className="lp-section" id="comment-ca-marche">
        <div className="lp-eyebrow">
          <div className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">Simple & rapide</span>
        </div>
        <h2 className="lp-section-title">
          Comment ça <em>marche</em>
        </h2>
        <p className="lp-section-sub">Trois étapes, moins de 5 minutes.</p>
        <div className="lp-steps">
          {STEPS.map(({ num, icon, titre, desc }, i) => (
            <div key={num} className="lp-step">
              {i < STEPS.length - 1 && <div className="lp-step-connector" />}
              <div className="lp-step-head">
                <span className="lp-step-num">{num}</span>
                <span className="lp-step-icon">{icon}</span>
              </div>
              <h3 className="lp-step-title">{titre}</h3>
              <p className="lp-step-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ AVANTAGES ══ */}
      <AvantagesBloc />

      {/* ══ TÉMOIGNAGES ══ */}
      <TemoignagesBloc />

      {/* ══ CTA FINAL ══ */}
      <div className="lp-cta" id="contact">
        <div className="lp-cta-glow" />
        <h2>
          Prêt à trouver votre <em>prestataire</em> ?
        </h2>
        <p>
          Rejoignez des centaines d'utilisateurs qui font confiance à Hopela.
        </p>
        <div className="lp-cta-actions">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Trouver un prestataire
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/register?role=prestataire")}
          >
            Je suis prestataire →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingScreen;
