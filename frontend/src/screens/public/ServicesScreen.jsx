// src/screens/public/ServicesScreen.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrench,
  Home,
  Sparkles,
  HeartPulse,
  Accessibility,
  Car,
  BookOpen,
  FolderOpen,
} from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// ── Mapping icône Lucide ─────────────────────────────────────────────────────
const LUCIDE_CAT = {
  wrench: Wrench,
  home: Home,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  accessibility: Accessibility,
  car: Car,
  "book-open": BookOpen,
};

const CatIcon = ({ icone, size = 32 }) => {
  const Icon = LUCIDE_CAT[icone] || FolderOpen;
  return <Icon size={size} strokeWidth={1.5} />;
};

// ── Avantages (statique) ─────────────────────────────────────────────────────
const AVANTAGES = [
  {
    icon: "📍",
    title: "Géolocalisation en temps réel",
    text: "Trouvez les prestataires disponibles autour de vous maintenant, pas dans 3 heures.",
  },
  {
    icon: "✅",
    title: "Prestataires vérifiés",
    text: "Chaque prestataire est validé par notre équipe avec vérification du RIDET.",
  },
  {
    icon: "📞",
    title: "Contact direct",
    text: "Appelez directement le prestataire sans intermédiaire ni commission cachée.",
  },
  {
    icon: "🔒",
    title: "Inscription sécurisée",
    text: "Vos données sont protégées. Aucune information partagée sans votre accord.",
  },
  {
    icon: "🗺️",
    title: "Couverture Grand Nouméa",
    text: "Nouméa, Dumbéa, Paita, Mont-Dore — tous les prestataires de la zone.",
  },
  {
    icon: "⚡",
    title: "Disponibilité immédiate",
    text: "Le prestataire partage sa position en direct — vous savez s'il est disponible maintenant.",
  },
];

// ── CSS inline (charte light cohérente avec LandingScreen.scss) ─────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');

  :root {
    --sv-bg: #f7faf9;
    --sv-bg-alt: #f0f4f7;
    --sv-card: #ffffff;
    --sv-primary: #00a6b2;
    --sv-primary-soft: rgba(0, 166, 178, 0.08);
    --sv-primary-border: rgba(0, 166, 178, 0.22);
    --sv-accent: #5fd9df;
    --sv-text: #102a43;
    --sv-text-sub: #5b7083;
    --sv-border: rgba(16, 42, 67, 0.08);
    --sv-border-md: rgba(16, 42, 67, 0.14);
    --sv-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    --sv-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.10);
    --sv-radius-md: 12px;
    --sv-radius-lg: 18px;
    --sv-radius-xl: 24px;
    --sv-max: 1180px;
  }

  @keyframes svFadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes svFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  @keyframes svPulseDot {
    0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(0, 166, 178, 0.5); }
    50% { transform: scale(1.2); opacity: 0.8; box-shadow: 0 0 0 7px rgba(0, 166, 178, 0); }
  }

  .sv-root {
    min-height: 100vh;
    background: var(--sv-bg);
    color: var(--sv-text);
    font-family: 'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow-x: hidden;
  }

  .sv-root * { box-sizing: border-box; }

  .sv-hero {
    position: relative;
    min-height: 78vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 150px 24px 90px;
    text-align: center;
    overflow: hidden;
    background: var(--sv-bg);
  }

  .sv-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 60% at 5% 50%, rgba(0, 166, 178, 0.07) 0%, transparent 62%),
      radial-gradient(ellipse 50% 70% at 95% 25%, rgba(95, 217, 223, 0.08) 0%, transparent 60%);
    pointer-events: none;
  }

  .sv-hero::after {
    content: '';
    position: absolute;
    top: -20%;
    right: -5%;
    width: 50%;
    height: 130%;
    background: linear-gradient(135deg, transparent 45%, rgba(0, 166, 178, 0.035) 45%, rgba(0, 166, 178, 0.035) 55%, transparent 55%);
    transform: skewX(-6deg);
    pointer-events: none;
  }

  .sv-hero > * { position: relative; z-index: 1; }

  .sv-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 22px;
    padding: 7px 15px;
    background: var(--sv-primary-soft);
    border: 1px solid var(--sv-primary-border);
    border-radius: 999px;
    color: var(--sv-primary);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    animation: svFadeUp 0.7s ease forwards;
  }

  .sv-hero-eyebrow::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--sv-primary);
    animation: svPulseDot 2s ease-in-out infinite;
  }

  .sv-hero h1 {
    max-width: 860px;
    margin: 0 0 24px;
    color: var(--sv-text);
    font-size: clamp(42px, 6vw, 78px);
    font-weight: 900;
    line-height: 1.03;
    letter-spacing: -0.04em;
    animation: svFadeUp 0.7s ease 0.08s forwards;
    opacity: 0;
  }

  .sv-hero h1 em,
  .sv-section-title em,
  .sv-cta-section h2 em {
    position: relative;
    color: var(--sv-primary);
    font-style: italic;
    white-space: nowrap;
  }

  .sv-hero h1 em::after,
  .sv-section-title em::after,
  .sv-cta-section h2 em::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 4px;
    width: 100%;
    height: 10px;
    background: rgba(0, 166, 178, 0.14);
    border-radius: 4px;
    transform: skewX(-10deg);
    z-index: -1;
  }

  .sv-hero p {
    max-width: 620px;
    margin: 0 auto 38px;
    padding-left: 22px;
    border-left: 3px solid var(--sv-primary);
    color: var(--sv-text-sub);
    font-size: 19px;
    line-height: 1.75;
    text-align: left;
    animation: svFadeUp 0.7s ease 0.16s forwards;
    opacity: 0;
  }

  .sv-cta,
  .sv-btn-ghost {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px;
    padding: 16px 32px;
    border-radius: var(--sv-radius-md);
    font-family: inherit;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.7px;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.28s ease;
  }

  .sv-cta {
    border: 1px solid var(--sv-primary);
    background: var(--sv-primary);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(0, 166, 178, 0.25);
  }

  .sv-cta:hover {
    background: #008b95;
    border-color: #008b95;
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(0, 166, 178, 0.34);
  }

  .sv-section {
    max-width: var(--sv-max);
    margin: 0 auto;
    padding: 92px 24px;
  }

  .sv-section-title {
    margin: 0 0 14px;
    text-align: center;
    color: var(--sv-text);
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 900;
    line-height: 1.08;
    letter-spacing: -0.025em;
  }

  .sv-section-sub {
    max-width: 640px;
    margin: 0 auto 54px;
    text-align: center;
    color: var(--sv-text-sub);
    font-size: 17px;
    line-height: 1.7;
    font-weight: 400;
  }

  .sv-cat-grid,
  .sv-skeleton-grid,
  .sv-avantages {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }

  .sv-cat-card {
    position: relative;
    overflow: hidden;
    display: flex;
    min-height: 270px;
    flex-direction: column;
    gap: 20px;
    padding: 30px;
    border: 1px solid var(--sv-border);
    border-radius: var(--sv-radius-xl);
    background: var(--sv-card);
    box-shadow: var(--sv-shadow);
    cursor: pointer;
    text-decoration: none;
    transition: all 0.32s ease;
  }

  .sv-cat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at top right, rgba(0, 166, 178, 0.11), transparent 46%);
    opacity: 0;
    transition: opacity 0.32s ease;
    pointer-events: none;
  }

  .sv-cat-card:hover {
    border-color: var(--sv-primary);
    transform: translateY(-5px);
    box-shadow: var(--sv-shadow-hover);
  }

  .sv-cat-card:hover::before { opacity: 1; }

  .sv-cat-card-head,
  .sv-cat-card-foot {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .sv-cat-icon-wrap {
    width: 58px;
    height: 58px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--sv-primary-soft);
    border: 1px solid var(--sv-primary-border);
    color: var(--sv-primary);
    transition: all 0.28s ease;
  }

  .sv-cat-card:hover .sv-cat-icon-wrap {
    background: var(--sv-primary);
    color: #ffffff;
    transform: rotate(-3deg) scale(1.04);
  }

  .sv-cat-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid var(--sv-primary-border);
    background: var(--sv-primary-soft);
    color: var(--sv-primary);
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
  }

  .sv-cat-nom {
    position: relative;
    z-index: 1;
    color: var(--sv-text);
    font-size: 25px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .sv-cat-desc {
    position: relative;
    z-index: 1;
    color: var(--sv-text-sub);
    font-size: 15px;
    line-height: 1.7;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .sv-cat-card-foot {
    margin-top: auto;
    padding-top: 18px;
    border-top: 1px solid var(--sv-border);
  }

  .sv-cat-voir {
    color: var(--sv-primary);
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .sv-cat-arrow {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--sv-border-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--sv-text);
    transition: all 0.28s ease;
  }

  .sv-cat-card:hover .sv-cat-arrow {
    border-color: var(--sv-primary);
    background: var(--sv-primary);
    color: #ffffff;
    transform: translateX(4px);
  }

  .sv-skeleton-card {
    min-height: 270px;
    border-radius: var(--sv-radius-xl);
    border: 1px solid var(--sv-border);
    background: linear-gradient(90deg, #ffffff 25%, #eef5f6 50%, #ffffff 75%);
    background-size: 400% 100%;
    box-shadow: var(--sv-shadow);
    animation: svShimmer 1.4s infinite;
  }

  @keyframes svShimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }

  .sv-divider {
    height: 1px;
    max-width: var(--sv-max);
    margin: 0 auto;
    background: var(--sv-border);
  }

  .sv-section:nth-of-type(4) {
    max-width: none;
    background: var(--sv-bg-alt);
  }

  .sv-section:nth-of-type(4) > .sv-section-title,
  .sv-section:nth-of-type(4) > .sv-section-sub,
  .sv-section:nth-of-type(4) > .sv-avantages {
    max-width: var(--sv-max);
    margin-left: auto;
    margin-right: auto;
  }

  .sv-av-card {
    display: flex;
    gap: 18px;
    padding: 26px;
    border: 1px solid var(--sv-border);
    border-radius: var(--sv-radius-xl);
    background: var(--sv-card);
    box-shadow: var(--sv-shadow);
    transition: all 0.28s ease;
  }

  .sv-av-card:hover {
    border-color: var(--sv-primary);
    transform: translateY(-3px);
    box-shadow: var(--sv-shadow-hover);
  }

  .sv-av-icon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: var(--sv-primary-soft);
    border: 1px solid var(--sv-primary-border);
    font-size: 24px;
  }

  .sv-av-title {
    margin-bottom: 8px;
    color: var(--sv-text);
    font-size: 18px;
    font-weight: 800;
  }

  .sv-av-text {
    color: var(--sv-text-sub);
    font-size: 15px;
    line-height: 1.7;
  }

  .sv-cta-section {
    position: relative;
    overflow: hidden;
    max-width: calc(var(--sv-max) - 40px);
    margin: 92px auto;
    padding: 86px 24px;
    border-radius: 32px;
    background: var(--sv-text);
    text-align: center;
  }

  .sv-cta-section::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background: var(--sv-primary);
    filter: blur(140px);
    opacity: 0.16;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .sv-cta-section h2,
  .sv-cta-section p,
  .sv-cta-row { position: relative; z-index: 1; }

  .sv-cta-section h2 {
    margin: 0 0 20px;
    color: #ffffff;
    font-size: clamp(30px, 4vw, 50px);
    font-weight: 900;
    line-height: 1.12;
    letter-spacing: -0.025em;
  }

  .sv-cta-section p {
    max-width: 560px;
    margin: 0 auto 34px;
    color: rgba(255, 255, 255, 0.68);
    font-size: 17px;
    line-height: 1.7;
  }

  .sv-cta-row {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .sv-btn-ghost {
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.04);
    color: #ffffff;
  }

  .sv-btn-ghost:hover {
    border-color: var(--sv-accent);
    color: var(--sv-accent);
    background: rgba(95, 217, 223, 0.08);
    transform: translateY(-2px);
  }

  @media (max-width: 720px) {
    .sv-hero { min-height: auto; padding: 118px 20px 70px; }
    .sv-hero p { text-align: center; border-left: 0; padding-left: 0; font-size: 16px; }
    .sv-section { padding: 70px 20px; }
    .sv-cat-grid, .sv-skeleton-grid, .sv-avantages { grid-template-columns: 1fr; }
    .sv-cat-card { min-height: auto; padding: 24px; }
    .sv-cta-section { margin: 70px 20px; padding: 66px 20px; border-radius: 24px; }
  }
`;

// ─────────────────────────────────────────────────────────
const ServicesScreen = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [prestataires, setPrestataires] = useState([]);
  const [metiers, setMetiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Injection CSS (une seule fois)
    if (!document.getElementById("sv-css")) {
      const s = document.createElement("style");
      s.id = "sv-css";
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    // Fetches en parallèle
    Promise.all([
      fetch(`${API_URL}/api/categories`).then((r) => r.json()),
      fetch(`${API_URL}/api/metiers`).then((r) => r.json()),
      fetch(`${API_URL}/api/users/prestataires/positions/public`).then((r) =>
        r.json(),
      ),
    ])
      .then(([cats, mets, prestas]) => {
        setCategories(Array.isArray(cats) ? cats : []);
        setMetiers(Array.isArray(mets) ? mets : []);
        setPrestataires(Array.isArray(prestas) ? prestas : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Compte de métiers par catégorie (côté client)
  const metiersByCategorie = (catId) =>
    metiers.filter((m) => (m.categorie?._id || m.categorie) === catId).length;

  // Compte de prestataires actifs par catégorie
  const prestaByCategorie = (catId) =>
    prestataires.filter((p) =>
      p.metiers?.some((m) => (m.categorie?._id || m.categorie) === catId),
    ).length;

  return (
    <div className="sv-root">
      <Header />

      {/* ── Hero ── */}
      <div className="sv-hero">
        <div className="sv-hero-eyebrow">Hopela — Services disponibles</div>
        <h1>
          Les meilleurs professionnels
          <br />
          <em>près de chez vous</em>
        </h1>
        <p>
          Trouvez instantanément un prestataire qualifié disponible maintenant,
          géolocalisé sur la carte en temps réel.
        </p>
        <Link to="/login" className="sv-cta">
          Trouver un prestataire →
        </Link>
      </div>

      {/* ── Grille catégories ── */}
      <div className="sv-section">
        <div className="sv-section-title">
          Nos <em>catégories</em> de services
        </div>
        <div className="sv-section-sub">
          {loading
            ? "Chargement des catégories…"
            : `${categories.length} catégorie${categories.length > 1 ? "s" : ""} de services disponibles sur la plateforme`}
        </div>

        {loading ? (
          /* Skeleton */
          <div className="sv-skeleton-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="sv-skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="sv-cat-grid">
            {categories.map((cat) => {
              const nbMetiers = metiersByCategorie(cat._id);
              const nbPrestas = prestaByCategorie(cat._id);

              return (
                <div
                  key={cat._id}
                  className="sv-cat-card"
                  onClick={() => navigate(`/services/categories/${cat._id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    navigate(`/services/categories/${cat._id}`)
                  }
                  aria-label={`Voir la catégorie ${cat.nom}`}
                >
                  {/* Head */}
                  <div className="sv-cat-card-head">
                    <div className="sv-cat-icon-wrap">
                      <CatIcon icone={cat.icone} size={28} />
                    </div>
                    <span className="sv-cat-count-badge">
                      {nbMetiers} métier{nbMetiers > 1 ? "s" : ""} · {nbPrestas}{" "}
                      pro{nbPrestas > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Nom + description */}
                  <div className="sv-cat-nom">{cat.nom}</div>
                  {cat.description && (
                    <div className="sv-cat-desc">{cat.description}</div>
                  )}

                  {/* Foot */}
                  <div className="sv-cat-card-foot">
                    <span className="sv-cat-voir">Voir les métiers</span>
                    <div className="sv-cat-arrow">→</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sv-divider" />

      {/* ── Avantages ── */}
      <div className="sv-section">
        <div className="sv-section-title">
          Pourquoi choisir <em>Hopela</em>
        </div>
        <div className="sv-section-sub">
          La plateforme pensée pour les habitants de Nouvelle-Calédonie
        </div>
        <div className="sv-avantages">
          {AVANTAGES.map((a) => (
            <div className="sv-av-card" key={a.title}>
              <div className="sv-av-icon">{a.icon}</div>
              <div>
                <div className="sv-av-title">{a.title}</div>
                <div className="sv-av-text">{a.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sv-divider" />

      {/* ── CTA final ── */}
      <div className="sv-cta-section">
        <h2>
          Prêt à trouver votre
          <br />
          <em>prestataire</em> ?
        </h2>
        <p>
          Créez votre compte gratuitement et accédez à tous les prestataires
          disponibles près de vous.
        </p>
        <div className="sv-cta-row">
          <Link to="/login" className="sv-cta">
            Créer un compte gratuit
          </Link>
          <Link to="/comment-ca-marche" className="sv-btn-ghost">
            Comment ça marche ?
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServicesScreen;
