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

// ── CSS inline (Adapté à la nouvelle charte Vert/Sombre) ─────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

  /* Palette de couleurs utilisée */
  :root {
    --bg-main: #0A0D12;
    --bg-card: #111620;
    --primary: #145C45;
    --primary-hover: #1E7A5C;
    --text-main: #F0F2F5;
    --text-secondary: #B0B8C8;
    --border-color: #1d2430;
  }

  .sv-root { min-height:100vh; background:var(--bg-main); color:var(--text-main); font-family:'DM Sans',sans-serif; }

  /* ── Hero ── */
  .sv-hero { padding:120px 24px 80px; text-align:center; background:linear-gradient(180deg,#0F1219,var(--bg-main)); }
  .sv-hero-eyebrow { font-size:10px; letter-spacing:4px; text-transform:uppercase; color:var(--primary-hover); margin-bottom:20px; font-weight:700; }
  .sv-hero h1 { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,6vw,72px); font-weight:700; color:var(--text-main); line-height:1.1; margin-bottom:20px; }
  .sv-hero h1 em { font-style:italic; color:var(--primary); }
  .sv-hero p { font-size:16px; color:var(--text-secondary); max-width:560px; margin:0 auto 40px; line-height:1.7; font-weight:300; }
  
  .sv-cta { 
    display:inline-block; 
    background:linear-gradient(135deg,var(--primary),var(--primary-hover)); 
    color:#ffffff; /* Blanc pour lisibilité */
    text-decoration:none; 
    font-weight:700; 
    font-size:13px; 
    letter-spacing:2px; 
    text-transform:uppercase; 
    padding:16px 40px; 
    border-radius:8px; /* Coins plus arrondis */
    transition:all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 4px 15px rgba(20, 92, 69, 0.3);
  }
  .sv-cta:hover { transform:translateY(-2px); box-shadow: 0 8px 25px rgba(20, 92, 69, 0.5); filter: brightness(1.1); }

  /* ── Sections ── */
  .sv-section { padding:80px 24px; max-width:1100px; margin:0 auto; }
  .sv-section-title { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,4vw,48px); font-weight:700; color:var(--text-main); text-align:center; margin-bottom:12px; }
  .sv-section-title em { font-style:italic; color:var(--primary); }
  .sv-section-sub { text-align:center; font-size:14px; color:var(--text-secondary); margin-bottom:56px; font-weight:300; }

  /* ── Grille catégories ── */
  .sv-cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }

  /* ── Card catégorie ── */
  .sv-cat-card {
    background:var(--bg-card);
    border:1px solid var(--border-color);
    border-radius:18px;
    padding:32px 24px;
    cursor:pointer;
    text-decoration:none;
    display:flex;
    flex-direction:column;
    gap:16px;
    transition:all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
    position:relative;
    overflow:hidden;
  }
  .sv-cat-card::before {
    content:'';
    position:absolute;
    inset:0;
    background:linear-gradient(135deg, rgba(20, 92, 69, 0.08) 0%, transparent 65%);
    opacity:0;
    transition:opacity 0.3s;
  }
  .sv-cat-card:hover { 
    border-color:var(--primary); 
    transform:translateY(-6px); 
    box-shadow:0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(20, 92, 69, 0.3); 
    background: rgba(17, 22, 32, 0.8);
  }
  .sv-cat-card:hover::before { opacity:1; }

  /* Header de la card : icône + compteur */
  .sv-cat-card-head { display:flex; align-items:center; justify-content:space-between; }
  .sv-cat-icon-wrap {
    width:56px; height:56px;
    border-radius:14px;
    background:rgba(20, 92, 69, 0.1);
    border:1px solid rgba(20, 92, 69, 0.2);
    display:flex; align-items:center; justify-content:center;
    color:var(--primary-hover);
    flex-shrink:0;
    transition:background 0.3s, color 0.3s;
  }
  .sv-cat-card:hover .sv-cat-icon-wrap { background:rgba(20, 92, 69, 0.2); color: #ffffff; }

  .sv-cat-count-badge {
    font-size:11px; font-weight:600;
    color:var(--primary-hover);
    background:rgba(20, 92, 69, 0.1);
    border:1px solid rgba(20, 92, 69, 0.2);
    border-radius:20px;
    padding:4px 12px;
    white-space:nowrap;
    transition: all 0.3s;
  }
  .sv-cat-card:hover .sv-cat-count-badge {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  /* Corps de la card */
  .sv-cat-nom {
    font-family:'Cormorant Garamond',serif;
    font-size:24px; font-weight:700; color:var(--text-main);
    line-height:1.2;
  }
  .sv-cat-desc {
    font-size:13px; color:var(--text-secondary); line-height:1.65;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
    font-weight:300;
  }

  /* Footer de la card */
  .sv-cat-card-foot {
    display:flex; align-items:center; justify-content:space-between;
    padding-top:16px;
    border-top:1px solid rgba(255,255,255,0.06);
    margin-top:auto;
  }
  .sv-cat-voir {
    font-size:11px; font-weight:600; letter-spacing:1px; text-transform:uppercase;
    color:var(--text-secondary);
    transition:color 0.2s;
  }
  .sv-cat-card:hover .sv-cat-voir { color:var(--primary-hover); }
  .sv-cat-arrow {
    width:28px; height:28px; border-radius:50%;
    border:1px solid rgba(20, 92, 69, 0.3);
    display:flex; align-items:center; justify-content:center;
    font-size:12px; color:var(--primary);
    transition:all 0.2s;
  }
  .sv-cat-card:hover .sv-cat-arrow {
    background:var(--primary);
    border-color:var(--primary);
    color:#ffffff;
    transform:translateX(4px);
  }

  /* ── Skeleton loader ── */
  .sv-skeleton-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }
  .sv-skeleton-card {
    background:var(--bg-card); 
    border:1px solid var(--border-color);
    border-radius:18px; padding:32px 24px; height:220px;
    /* Shimmer adapté aux couleurs sombres/bleutées */
    background: linear-gradient(90deg,var(--bg-card) 25%, #1A2D4A 50%,var(--bg-card) 75%);
    background-size:400% 100%;
    animation:sv-shimmer 1.6s infinite;
  }
  @keyframes sv-shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }

  /* ── Avantages ── */
  .sv-avantages { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:20px; }
  .sv-av-card { background:var(--bg-card); border:1px solid var(--border-color); border-radius:16px; padding:24px; display:flex; gap:16px; transition: transform 0.2s; }
  .sv-av-card:hover { transform: translateY(-2px); border-color: rgba(20, 92, 69, 0.3); }
  .sv-av-icon { font-size:28px; flex-shrink:0; }
  .sv-av-title { font-size:16px; font-weight:600; color:var(--text-main); margin-bottom:6px; }
  .sv-av-text { font-size:13px; color:var(--text-secondary); line-height:1.6; font-weight:300; }

  /* ── Divider / CTA ── */
  .sv-divider { height:1px; background:var(--border-color); max-width:1100px; margin:0 auto; }
  .sv-cta-section { padding:100px 24px; text-align:center; position:relative; overflow:hidden; }
  /* Halo de fond pour le CTA */
  .sv-cta-section::before {
    content: '';
    position:absolute;
    top:50%; left:50%; transform:translate(-50%, -50%);
    width:400px; height:400px;
    background:radial-gradient(circle, rgba(20, 92, 69, 0.15), transparent 70%);
    z-index:0;
    pointer-events:none;
  }
  
  .sv-cta-section h2 { font-family:'Cormorant Garamond',serif; font-size:clamp(28px,4vw,48px); font-weight:700; color:var(--text-main); margin-bottom:16px; position:relative; z-index:1; }
  .sv-cta-section h2 em { font-style:italic; color:var(--primary); }
  .sv-cta-section p { font-size:15px; color:var(--text-secondary); margin-bottom:32px; max-width:500px; margin-left:auto; margin-right:auto; position:relative; z-index:1; font-weight:300; }
  
  .sv-cta-row { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; position:relative; z-index:1; }
  .sv-btn-ghost { 
    border:1px solid var(--border-color); 
    color:var(--text-main); 
    background:rgba(255,255,255,0.03); 
    padding:14px 32px; 
    border-radius:8px; 
    font-family:'DM Sans',sans-serif; 
    font-size:12px; 
    font-weight:600; 
    letter-spacing:1px; 
    text-transform:uppercase; 
    cursor:pointer; 
    text-decoration:none; 
    transition:all 0.2s; 
    display:inline-block; 
  }
  .sv-btn-ghost:hover { 
    border-color:var(--primary); 
    color:var(--primary); 
    background:rgba(20, 92, 69, 0.05); 
    transform: translateY(-1px);
  }

  @media (max-width:640px) {
    .sv-cat-grid, .sv-skeleton-grid { grid-template-columns:1fr; }
    .sv-hero { padding: 100px 20px 60px; }
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
                      {nbMetiers} métier{nbMetiers > 1 ? "s" : ""}
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
